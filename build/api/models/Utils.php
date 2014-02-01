<?php

class Utils {

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