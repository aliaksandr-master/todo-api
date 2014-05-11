<?php



class FsHelper {


	const FILES = "files";

	const DIRS = "dirs";

	const ABS_FILES_LIST = "abs_files_list";

	const REL_FILES_LIST = "rel_files_list";


	static function mkDir ($dirPath, $permissions = 0777) {
		!is_dir($dirPath) && mkdir($dirPath, $permissions, true);

		return $dirPath;
	}


	static function mkFile ($filePath, $defPerm = "x") {
		!is_file($filePath) && fclose(fopen($filePath, $defPerm));

		return $filePath;
	}


	static function normalizePath ($dirPath, $slashStr = DIRECTORY_SEPARATOR) {
		$result = trim($dirPath);
		$result = preg_replace("/[\/\\\]+$/", "", $result);
		$result = $slashStr.$result;
		$result = preg_replace("/^[\/\\\]*([a-zA-Z]+\:)/", "$1", $result);
		$result = preg_replace("/[\/\\\]+/", $slashStr, $result);

		return $result;
	}


	static function array2path ($array, $slash = DIRECTORY_SEPARATOR) {
		return self::normalizePath(implode($slash, $array), $slash);
	}


	static function path2array ($path, $filterExp = "/^\s+|\s+$/") {
		$split = preg_split("/[\/\\\]+/", $path);
		$result = array();

		foreach ($split as $s) {
			if ($filterExp) {
				$s = preg_replace($filterExp, "", $s);
			}
			if (strlen($s)) {
				$result[] = $s;
			}
		}

		return $result;
	}


	static function absPath ($path, $slash = DIRECTORY_SEPARATOR, $absolute = DIR) {
		return str_replace(self::normalizePath($absolute, $slash), "", self::normalizePath($path, $slash));
	}


	static function sPathFromAbsolute ($path, $slash = DIRECTORY_SEPARATOR, $absolute = DIR) {
		$absolute = self::normalizePath($absolute, $slash);

		return $absolute.str_replace($absolute, "", self::normalizePath($path, $slash));
	}


	static function mapFilesResult (array $resultArr, $as = self::REL_FILES_LIST, $slash = DIRECTORY_SEPARATOR) {
		$dir = '';
		$arr = array();
		foreach ($resultArr as $resKey => $resVal) {
			if ($resKey === '.') {
				continue;
			}
			if (is_array($resVal)) {
				$dir = $slash.$resKey;
				$map = self::mapFilesResult($resVal, $as, $slash);
				foreach ($map as $file) {
					if ($as === self::REL_FILES_LIST) {
						$arr[] = self::normalizePath($dir.$slash.$file, $slash);
					} else {
						$arr[] = self::normalizePath($file, $slash);
					}
				}
			} else {
				if ($as === self::REL_FILES_LIST) {
					$arr[] = self::normalizePath($dir.$slash.$resKey, $slash);
				} else {
					$arr[] = self::normalizePath($resVal, $slash);
				}
			}
		}
		return $arr;
	}

	static function expandResult (array $results, $as = self::FILES, $dirPath = true) {

		$result = array();

		$as = strtolower(trim($as));

		if ($as == self::FILES) {
			if (isset($results["files"])) {
				foreach ($results["files"] as $file) {
					$result[$file["name"]] = $file["path"];
				}
			}
			if (isset($results["dirs"])) {
				foreach ($results["dirs"] as $dir) {
					$result[$dir["name"]] = self::expandResult($dir, $as, $dirPath);
					if ($dirPath) {
						$result[$dir["name"]]["."] = $dir["path"];
					}
				}
			}
		} else if ($as == self::DIRS) {
			if (isset($results["dirs"])) {
				foreach ($results["dirs"] as $dir) {
					$result[$dir["name"]] = self::expandResult($dir, $as);
					if ($dirPath) {
						$result[$dir["name"]]["."] = $dir["path"];
					}
				}
			}
		}

		return $result;
	}


	private static $_aFsMem = array();


	static function expand ($dir, $deep = null, $cache = false) {

		$dir = self::normalizePath($dir);

		if ($cache) {
			if (empty(self::$_aFsMem[$dir])) {
				$cacheDir = CACHE_DIR."/H/aFs";
				$cacheFile = "/".preg_replace("/[\/\\\]/", "$", preg_replace("/[^0-9a-z_\-\.\/\\\]/i", "_%_", $dir)).".cache.txt";
				if (is_file($cacheDir.$cacheFile)) {
					self::$_aFsMem[$dir] = unserialize(file_get_contents($cacheDir.$cacheFile));
				} else {
					self::$_aFsMem[$dir] = self::expand($dir, $deep, false);
					self::mkDir($cacheDir);
					self::mkFile($cacheDir.$cacheFile);
					file_put_contents($cacheDir.$cacheFile, serialize(self::$_aFsMem[$dir]));
				}
			}

			return self::$_aFsMem[$dir];
		}

		$result = array("files" => array(), "dirs" => array());

		if (is_dir($dir)) {
			if ($handle = opendir($dir)) {
				while (false !== ($entry = readdir($handle))) {
					if ($entry != "." && $entry != "..") {
						$path = $dir.DIRECTORY_SEPARATOR.$entry;
						if (is_file($path)) {
							$result["files"][] = array("path" => $path, "name" => $entry,);
						} else if (!preg_match("/^\./", $entry)) {
							$arr = array("name" => $entry, "path" => $path);
							if (is_null($deep)) {
								$arr = self::expand($path, null, $cache);
							} else if ($deep) {
								if ($deep - 1) {
									$arr = self::expand($path, $deep - 1, $cache);
								}
							}
							$result["dirs"][] = $arr;
						}
					}
				}
				closedir($handle);
			}
		} else {
			throw new Exception("invalid DIRECTORY PATH ! '".$dir."'");
		}
		$result = array("name" => str_replace(preg_replace("/([^\/\\\]+)$/", "", $dir), "", $dir), "path" => $dir, "files" => $result["files"], "dirs" => $result["dirs"]);

		return $result;
	}
}