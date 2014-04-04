<?php

class ApiUtils {

    static function get ($obj, $param, $default = null) {
        return isset($obj[$param]) ? $obj[$param] : $default;
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

}