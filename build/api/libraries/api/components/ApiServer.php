<?php

class ApiServer extends ApiComponent {

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

	const DEFAULT_INPUT_FORMAT = 'form';

	protected $_formats = array(
        'xml'  => array(
            'inputMimes' => array(
                'xml',
                'application/xml',
                'text/xml'
            ),
            'outputMime' => 'application/xml'
        ),
        'json' => array(
            'inputMimes' => array(
                'json',
                'application/json'
            ),
            'outputMime' => 'application/json'
        ),
        'jsonp' => array(
            'inputMimes' => array(
                'jsonp',
                'application/javascript'
            ),
            'outputMime' => 'application/javascript'
        ),
        'form' => array(
            'inputMimes' => array(
                'application/x-www-form-urlencoded'
            ),
            'outputMime' => 'application/x-www-form-urlencoded'
        )
    );

    function __construct (Api &$api) {
		parent::__construct ($api);

		$this->headers = $this->api->getLaunchParam('input/headers');

        $this->_initHeaders();
        $this->_initInputFormat();
        $this->_initOutputFormat();

        $this->_initBody();
        $this->_initQuery();
        $this->_initUrlArguments();
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
					$this->body = array();
					parse_str($body, $this->body);
					break;
				case 'json':
					$this->body = json_decode(INPUT_DATA, true);
					break;
				default:
					$this->api->error('unsupported input format. must be ['.implode(',', array_keys($this->_formats)).']');
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

    function _initOutputFormat () {
        $format = ApiUtils::getFormatByHeadersAccept($this->accept, $this->_formats, self::DEFAULT_OUTPUT_FORMAT);
        $format = ApiUtils::getFileFormatByFileExt($this->pathname, $this->_formats, $format);
		if (is_null($format)) {
			$this->error('Unsupported format "'.$this->pathname.'"', 400, true);
		}

        $this->outputFormat = $format;
        $this->outputMime = $this->_formats[$format]['outputMime'];
    }

    private function _initHeaders () {
        $this->accept      = ApiUtils::parseQualityString(ApiUtils::get($this->headers, 'Accept'));
        $this->language    = ApiUtils::parseQualityString(ApiUtils::get($this->headers, 'Accept-Language'));
        $this->encoding    = ApiUtils::parseQualityString(ApiUtils::get($this->headers, 'Accept-Encoding'));

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

    private function _initInputFormat () {

        $format = null;

        $contentType = ApiUtils::get($this->headers, 'Content-Type');
        $contentType = trim($contentType);
        $contentType = preg_replace('/;.+/', '', $contentType);

        if ($contentType) {
            foreach ($this->_formats as $_format => $data) {

                $mimes = $data['inputMimes'];

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
}