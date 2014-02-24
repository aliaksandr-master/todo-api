<?php

class ApiUtils {

    static function get ($obj, $param, $default = null) {
        return isset($obj[$param]) ? $obj[$param] : $default;
    }

}