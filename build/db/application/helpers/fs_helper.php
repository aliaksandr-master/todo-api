<?php

/**
 * @param string $dirPath
 * @param string $slashStr
 * @return string valid path
 */
function makeValidPath($dirPath, $slashStr = DIRECTORY_SEPARATOR)
{
    $result = trim($dirPath);
    $result = preg_replace("/[\/\\\]+$/", "", $result);
    $result = $slashStr . $result;
    $result = preg_replace("/^[\/\\\]*([a-zA-Z]+\:)/", "$1", $result);
    $result = preg_replace("/[\/\\\]+/", $slashStr, $result);
    return $result;
}


/**
 * @param string $dir
 * @param null|int $deep
 * @return array file system array
 * @throws Exception
 */
function getFileSystem($dir, $deep = null)
{
    $result = array(
        "files" => array(),
        "dirs" => array()
    );

    $dir = makeValidPath($dir);

    if (is_dir($dir)) {
        if ($handle = opendir($dir)) {
            while (false !== ($entry = readdir($handle))) {
                if (substr($entry, 0, 1) != '.') {
                    $path = $dir . DIRECTORY_SEPARATOR . $entry;
                    if (is_file($path)) {
                        $result["files"][] = array(
                            "path" => $path,
                            "name" => $entry,
                        );
                    } else if (!preg_match("/^\./", $entry)) {
                        $arr = array(
                            "name" => $entry,
                            "path" => $path
                        );
                        if (is_null($deep)) {
                            $arr = getFileSystem($path, null);
                        } else if ($deep) {
                            if ($deep - 1) {
                                $arr = getFileSystem($path, $deep - 1);
                            }
                        }

                        $result["dirs"][] = $arr;
                    }
                }
            }
            closedir($handle);
        }
    } else {
        $result = array();
    }
    $result = array(
        "name" => str_replace(preg_replace("/([^\/\\\]+)$/", "", $dir), "", $dir),
        "path" => $dir,
        "children" => $result
    );
    return $result;
}