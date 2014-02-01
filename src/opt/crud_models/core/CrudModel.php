<?php

class CrudModel {

    private static $_wasInitiated = false;
    private static $_instances = array();

    static function initAllTables($TablesDir){
        if(!self::$_wasInitiated){

            require_once($TablesDir.'/../default.init.php');

            $fs = self::getFileSystem($TablesDir);

            if(!empty($fs["children"]["files"])){
                foreach($fs["children"]["files"] as $table){
                    if(preg_match("/^[^a-zA-Z]/", $table["name"]) || !preg_match("/\.php$/", $table["name"])){
                        continue;
                    }
                    $_tableName = pathinfo($table["name"], PATHINFO_FILENAME);

                    require_once($table["path"]);

                    $_tableClassName = self::convertToCamelCase($_tableName);

                    if(preg_match("/^rel_/",$_tableName)){
                        $_tableClassName = preg_replace("/Rel/","Rel_",$_tableClassName);
                    }else{
                        $_tableClassName = "DbTable_".$_tableClassName;
                    }


                    dump($_tableName);

                    self::$_instances[$_tableName] = new $_tableClassName();
                    self::$_instances[$_tableName]->checkDb();
                }
            }

            self::$_wasInitiated = true;
        }
    }

    static function convertToCamelCase($str)
    {
        $strArray = explode('_', $str);
        $strArray = array_map('ucfirst', $strArray);
        $str = implode('', $strArray);

        return $str;
    }

    static function getFileSystem($dir, $deep=null){
        $result = array(
            "files" => array(),
            "dirs"  => array()
        );

        $dir = self::makeValidPath($dir);

        if (is_dir($dir)) {
            if ($handle = opendir($dir)) {
                while (false !== ($entry = readdir($handle))) {
                    if ($entry != "." && $entry != "..") {
                        $path = $dir.DIRECTORY_SEPARATOR.$entry;
                        if(is_file($path)){
                            $result["files"][] = array(
                                "path"=>$path,
                                "name"=>$entry,
                            );
                        }else if(!preg_match("/^\./",$entry)){
                            $arr = array(
                                "name" => $entry,
                                "path" => $path
                            );
                            if(is_null($deep)){
                                $arr = self::getFileSystem($path, null);
                            }else if($deep){
                                if($deep-1){
                                    $arr = self::getFileSystem($path, $deep-1);
                                }
                            }

                            $result["dirs"][] = $arr;
                        }
                    }
                }
                closedir($handle);
            }
        }else{
            trigger_error("invalid DIRECTORY PATH !", E_USER_ERROR);
            exit;
        }
        $result = array(
            "name"      => str_replace(preg_replace("/([^\/\\\]+)$/", "", $dir), "", $dir),
            "path"      => $dir,
            "children"  => $result
        );
        return $result;
    }

    static function makeValidPath($dirPath, $slashStr = DIRECTORY_SEPARATOR)
    {
        $result = trim($dirPath);
        $result = preg_replace("/[\/\\\]+$/", "", $result);
        $result = $slashStr . $result;
        $result = preg_replace("/^[\/\\\]*([a-zA-Z]+\:)/", "$1", $result);
        $result = preg_replace("/[\/\\\]+/", $slashStr, $result);
        return $result;
    }

}