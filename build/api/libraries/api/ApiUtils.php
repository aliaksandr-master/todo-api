<?php

class ApiUtils {

    static function get ($obj, $param, $default = null) {
        return isset($obj[$param]) ? $obj[$param] : $default;
    }

    static function getArr ($obj, $param = null, $default = null) {
        return is_null($param) ? $obj : (isset($obj[$param]) ? $obj[$param] : $default);
    }

	static function getMessageByCode ($code) {
		$_messageByCodeMap = array (
			100 => 'Continue',
			101 => 'Switching Protocols',
			200 => 'OK',
			201 => 'Created',
			202 => 'Accepted',
			203 => 'Non-Authoritative Information',
			204 => 'No Content',
			205 => 'Reset Content',
			206 => 'Partial Content',
			300 => 'Multiple Choices',
			301 => 'Moved Permanently',
			302 => 'Moved Temporarily',
			303 => 'See Other',
			304 => 'Not Modified',
			305 => 'Use Proxy',
			400 => 'Bad Request',
			401 => 'Unauthorized',
			402 => 'Payment Required',
			403 => 'Forbidden',
			404 => 'Not Found',
			405 => 'Method Not Allowed',
			406 => 'Not Acceptable',
			407 => 'Proxy Authentication Required',
			408 => 'Request Time-out',
			409 => 'Conflict',
			410 => 'Gone',
			411 => 'Length Required',
			412 => 'Precondition Failed',
			413 => 'Request Entity Too Large',
			414 => 'Request-URI Too Large',
			415 => 'Unsupported Media Type',
			500 => 'Internal Server Error',
			501 => 'Not Implemented',
			502 => 'Bad Gateway',
			503 => 'Service Unavailable',
			504 => 'Gateway Time-out',
			505 => 'HTTP Version not supported',
		);

		return ApiUtils::get($_messageByCodeMap, $code, null);
	}

	static function camelCase($str, $ucFirst = false){
		$str = preg_replace("/[^a-zA-Z0-9]/", " ", (string)$str);
		$str = preg_replace_callback("/(?<=[^a-zA-Z])[a-z]/", "self::_camelCaseCallback", trim($str));
		$str = preg_replace("/[^\d\w]+/", "", $str);
		$str = $ucFirst ? ucfirst($str) : $str;
		return $str;
	}

	private static function _camelCaseCallback($str){
		return strtoupper($str[0]);
	}

	static function underscoreCase($str){
		$str = preg_replace("/[^a-zA-Z0-9]+/", " ", (string)$str);
		$str = preg_replace("/([A-Z])/", " $1", $str);
		$str = preg_replace("/\s+/", "_", trim($str));
		$str = strtolower($str);
		return $str;
	}

	static function parseQualityString ($str) {
		$some = array();
		foreach (preg_split('/\s*,\s*/', $str) as $segment) {
			preg_match('/^\s*([^\;]+)\s*;?\s*/', $segment, $matchName);
			preg_match('/q\s*=\s*([\d\.]+)\s*/', $segment, $matchQ);
			$some[ApiUtils::get($matchName, 1)] = (float)ApiUtils::get($matchQ, 1, 1);
		}
		return $some;
	}

	static function getFileFormatByFileExt ($path, array $supportedFormats, $defaultFormat) {
		$path = preg_replace('/\?.+$/', '', $path);
		if (preg_match('/\.([a-z]+)$/i', $path, $format)) {
			$supported = array_keys($supportedFormats);
			if (!in_array($format[1], $supported)) {
				return null;
			}
			return $format[1];
		}
		return $defaultFormat;
	}


	static function getFormatByHeadersAccept ($headersAccept, array $supportedFormats, $defaultFormat) {

		if (empty($supportedFormats[$defaultFormat])) {
			throw new Exception('unsupported default output format');
		}

		$headersAcceptStr = implode(',', $headersAccept);

		foreach ($supportedFormats as $format => $data) {
			$mimes = $data['inputMimes'];
			$mimes = is_array($mimes) ? $mimes : array($mimes);
			foreach ($mimes as $mime) {
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


	static function parseFormUriEncodedParams ($input, $headers = array()) {
		$a_data = array();

		// grab multipart boundary from content type header
		preg_match('/boundary=(.*)$/u', ApiUtils::get($headers, 'Content-Type'), $matches);

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


	public static function getBestMatchQualityValue (array $qualityValues, $defaultValue, array $aliasValues) {
//		http://habrahabr.ru/post/159129/
//		$aliasValues = array(
//			'ru' => array('ru', 'be', 'uk', 'ky', 'ab', 'mo', 'et', 'lv'),
//			'de' => 'de'
//		);

		$values = array();

		if (!isset($aliasValues[$defaultValue])) {
			$aliasValues[$defaultValue] = $defaultValue;
		}

		foreach ($aliasValues as $alias => $aliasVal) {
			if (is_array($aliasVal)) {
				foreach ($aliasVal as $_aliasVal) {
					$values[strtolower($_aliasVal)] = strtolower($alias);
				}
			} else {
				$values[strtolower($aliasVal)] = strtolower($alias);
			}
		}

		foreach ($qualityValues as $l => $v) {
			$s = strtok($l, '-'); // убираем то что идет после тире в языках вида "en-us, ru-ru"
			if (isset($values[$s])) {
				return $values[$s];
			}
		}

		return $defaultValue;
	}


	/**
	 * Converts bytes into readable format ex. 4534344 bytes => 4.2 M
	 *
	 * @param $bytes
	 * @param int $precision
	 * @return string
	 */
	static function formatBytes ($bytes, $precision = 2) {
		$units = array('B', 'KB', 'MB', 'GB', 'TB');

		$bytes = max($bytes, 0);
		$pow = floor(($bytes ? log($bytes) : 0) / log(1024));
		$pow = min($pow, count($units) - 1);

		$bytes /= pow(1024, $pow);

		return round($bytes, $precision) . ' ' . $units[$pow];
	}


}