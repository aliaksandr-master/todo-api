<?php

class ApiServer extends ApiComponent {

    public $ip;
    public $method;
    public $ssl;

    public $pathname;
    public $path;
    public $search;
    public $host;
    public $hostname;
    public $port;
    public $scheme;
    public $protocol;

    public $accept;
    public $language;
    public $encoding;
    public $userAgent;
    public $inputFormat;
    public $outputFormat;
    public $outputMime;

    public $body;
    public $query;
    public $url;
    public $headers;

    public $zlib_oc;

    const DEFAULT_OUTPUT_FORMAT = 'json';
    const DEFAULT_INPUT_FORMAT  = 'form';

    protected $_formats = array(
        'xml'  => array(
            'mimes' => array(
                'xml',
                'application/xml',
                'text/xml'
            ),
            'outputMime' => 'application/xml'
        ),
        'json' => array(
            'mimes' => array(
                'json',
                'application/json'
            ),
            'outputMime' => 'application/json'
        ),
        'jsonp' => array(
            'mimes' => array(
                'jsonp',
                'application/javascript'
            ),
            'outputMime' => 'application/javascript'
        ),
        'form' => array(
            'mimes' => array(
                'application/x-www-form-urlencoded'
            ),
            'outputMime' => 'application/x-www-form-urlencoded'
        )
    );

    function construct () {

		$this->headers = $this->api->getLaunchParam('input/headers');

        $this->_initHttps();
        $this->_initHeaders();
        $this->_initIp();
        $this->_initMethod();
        $this->_initInputFormat();
        $this->_initOutputFormat();

        $this->_initBody();
        $this->_initQuery();
        $this->_initUrlArguments();
    }

    function get ($name, $default = null) {
        return ApiUtils::get($_SERVER, $name, $default);
    }

    function _initBody () {
		$body = $this->api->getLaunchParam('input/body');
		if (is_array($body)) {
			$this->body = $body;
			return;
		}

		if (is_string($body)) {
			switch ($this->inputFormat) {
				case 'form':
					$this->body = $this->parseFormUriEncodedParams($body);
					break;
				case 'json':
					$this->body = json_decode(INPUT_DATA, true);
					break;
				default:
				$this->body = array();
			}
		} else {
			$this->body = array();
		}

    }

    function _initQuery(){

		$search = array();
		parse_str($this->search, $search);

        $this->query = array_replace_recursive($search, $this->api->getLaunchParam('input/query'));
    }

    function _initUrlArguments () {
        $this->url = $this->api->getLaunchParam('input/args');
    }

    private function parseFormUriEncodedParams ($input) {
        $a_data = array();

        // grab multipart boundary from content type header
        preg_match('/boundary=(.*)$/u', ApiUtils::get($this->headers, 'Content-Type'), $matches);

        // content type is probably regular form-encoded
        if (!count($matches)) {
            // we expect regular puts to containt a query string containing data
            parse_str(urldecode($input), $a_data);
            return $a_data;
        }

        $boundary = $matches[1];

        // split content by boundary and get rid of last -- element
        $a_blocks = preg_split("/-+$boundary/u", $input);
        array_pop($a_blocks);


        // loop data blocks
        foreach ($a_blocks as $id => $block) {

            if (empty($block)) {
                continue;
            }

            // you'll have to var_dump $block to understand this and maybe replace \n or \r with a visibile char

            // parse uploaded files
            if (strpos($block, 'application/octet-stream') !== FALSE) {
                // match "name", then everything after "stream" (optional) except for prepending newlines
                preg_match("/name=\"([^\"]*)\".*stream[\n|\r]+([^\n\r].*)?$/us", $block, $matches);
                $a_data['files'][$matches[1]] = $matches[2];
            }
            // parse all other fields
            else {
                // match "name" and optional value in between newline sequences
                preg_match('/name=\"([^\"]*)\"[\n|\r]+([^\n\r].*)?\r$/us', $block, $matches);
                $a_data[$matches[1]] = $matches[2];
            }
        }
        return $a_data;
    }

    function _initOutputFormat () {
        $format = $this->_getOutputFormatByHeadersAccept($this->accept, $this->_formats, self::DEFAULT_OUTPUT_FORMAT);
        $format = $this->_getOutputFormatByFileExt ($this->pathname, $this->_formats, $format);
        $this->outputFormat = $format;
        $this->outputMime = $this->_formats[$format]['outputMime'];
    }

    function _getOutputFormatByHeadersAccept ($headersAccept, array $supportedFormats, $defaultFormat) {

        if (empty($supportedFormats[$defaultFormat])) {
            throw new Exception('unsupported default output format');
        }

        $headersAcceptStr = implode(',', $headersAccept);

        foreach ($supportedFormats as $format => $data) {
            $mimes = $data['mimes'];
            $mimes = is_array($mimes) ? $mimes : array($mimes);
            foreach ($mimes as $mime) {
//                $altMime1 = preg_replace('#^([^/]+)/.+#', '$1/*', $mime);
                if (isset($headersAccept[$mime])/* || isset($headersAccept[$altMime1])*/) {
                    if ($format == 'html' || $format == 'xml') {
                        if ($format == 'html' && strpos($headersAcceptStr, 'xml') === false) {
                            return $format; // true HTML, it wont want any XML
                        } elseif ($format == 'xml' && strpos($headersAcceptStr, 'html') === false) {
                            return $format; // true XML, it wont want any HTML
                        }
                    } else {
                        return $format;
                    }
                }
            }
        }

        return $defaultFormat;
    }

    function _getOutputFormatByFileExt ($path, array $supportedFormats, $defaultFormat) {

        $path = preg_replace('/\?.+$/', '', $path);

        if (preg_match('/\.([a-z]+)$/i', $path, $format)) {
            $supported = array_keys($supportedFormats);
            if (!in_array($format[1], $supported)) {
                $this->error('Unsupported output format "'.$format[1].'"', 400, true);
            }
            return $format[1];
        }

        return $defaultFormat;

    }

    private function _initHeaders () {
        $this->accept      = $this->_detectSomeByQualityString(ApiUtils::get($this->headers, 'Accept'));
        $this->language    = $this->_detectSomeByQualityString(ApiUtils::get($this->headers, 'Accept-Language'));
        $this->encoding    = $this->_detectSomeByQualityString(ApiUtils::get($this->headers, 'Accept-Encoding'));

        $this->userAgent   = ApiUtils::get($this->headers, 'User-Agent');

        preg_match('/^([^\?]*)$/i', $this->api->getLaunchParam('uri'), $match);

        $this->pathname = preg_replace('#^/*(.+)$#', '/$1', $match[1]);
        $this->pathname = str_replace('\\', '/', $this->pathname);
        $this->search = $this->api->getLaunchParam('search');
        $this->path = $this->pathname.($this->search ? '?'.$this->search : '');
        $this->hostname = $this->api->getLaunchParam('host');
        $this->port = $this->api->getLaunchParam('port');
        $this->host = $this->hostname.':'.$this->port;
        $this->scheme = $this->api->getLaunchParam('scheme');
        $this->protocol = $this->scheme.':';
    }

    private function _detectSomeByQualityString ($str) {
        $some = array();
        foreach (preg_split('/\s*,\s*/', $str) as $segment) {
            preg_match('/^\s*([^\;]+)\s*;?\s*/', $segment, $matchName);
            preg_match('/q\s*=\s*([\d\.]+)\s*/', $segment, $matchQ);
            $some[ApiUtils::get($matchName, 1)] = (float)ApiUtils::get($matchQ, 1, 1);
        }
        return $some;
    }

    public function getBestMatchLanguage ($default, $langs) {
//      http://habrahabr.ru/post/159129/
//      $langs = array(
//          'ru' => array('ru', 'be', 'uk', 'ky', 'ab', 'mo', 'et', 'lv'),
//          'de' => 'de'
//      );

        $languages = array();

        foreach ($langs as $lang => $alias) {
            if (is_array($alias)) {
                foreach ($alias as $alias_lang) {
                    $languages[strtolower($alias_lang)] = strtolower($lang);
                }
            } else {
                $languages[strtolower($alias)] = strtolower($lang);
            }
        }

        foreach ($this->language as $l => $v) {
            $s = strtok($l, '-'); // убираем то что идет после тире в языках вида "en-us, ru-ru"
            if (isset($languages[$s])) {
                return $languages[$s];
            }
        }

        return $default;
    }

    private function _initInputFormat () {

        $format = null;

        $contentType = ApiUtils::get($this->headers, 'Content-Type');
        $contentType = trim($contentType);
        $contentType = preg_replace('/;.+/', '', $contentType);

        if ($contentType) {
            foreach ($this->_formats as $_format => $data) {

                $mimes = $data['mimes'];

                if ($format) {
                    break;
                }

                $mimes = is_array($mimes) ? $mimes : array($mimes);

                foreach ($mimes as $mime) {
                    if ($contentType === $mime) {
                        $format = $_format;
                        break;
                    }
                }
            }
        }

        $this->inputFormat = $format ? $format : self::DEFAULT_INPUT_FORMAT;
    }

    private function _initHttps () {
        $this->ssl = $this->api->getLaunchParam('ssl');
    }

    private function _initMethod () {
        $this->method = $this->api->getLaunchParam('method');
    }

    private function _initIp () {
        $ip = $this->api->getLaunchParam('ip');
        $this->ip = $this->api->validation->applyRule($ip, 'valid_ip') ? $ip : $this->ip;
    }
}