<?php

class MVar {

    private static $_register = array();

    static function get ($name) {

        if (!isset(self::$_register[$name])) {
            self::$_register[$name] = json_decode(file_get_contents(VAR_DIR.DS.$name.'.json'), true);
        }

        return self::$_register[$name];
    }

}