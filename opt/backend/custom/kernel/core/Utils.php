<?php

class Utils {

	static function get ($obj, $param, $default = null) {
		if (!is_array($obj)) {
			return $default;
		}
		return isset($obj[$param]) ? $obj[$param] : $default;
	}

}