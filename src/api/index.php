<?php

// start
define('START_TIMESTAMP', gettimeofday(true));


// CONST
define('DS', '/');
define('SD', '\\');

// DIR PATHS
define('DIR', str_replace(SD, DS, __DIR__));
define('VAR_DIR', DIR.DS.'var');
define('CACHE_DIR', realpath(DIR.DS.'..').DS.'private.cache');
define('SESSION_DIR', CACHE_DIR.DS.'session');
define('OPT_DIR', realpath('..'.DS.'opt'));


define('ROOT_URI', str_replace(SD, DS, pathinfo($_SERVER['SCRIPT_NAME'], PATHINFO_DIRNAME)));


// DEBUG LEVELS
define('PROD', 0);
define('TEST', 1);
define('DEV',  2);
$DEBUG_LEVELS = array(PROD, TEST, DEV);

$ALLOW_DEBUG_LEVEL = DEV;
$_DEBUG_LEVEL = isset($_GET['_mode']) && in_array($_GET['_mode'], $DEBUG_LEVELS) ? $_GET['_mode'] : PROD;
$_DEBUG_LEVEL = $ALLOW_DEBUG_LEVEL < $_DEBUG_LEVEL ? $ALLOW_DEBUG_LEVEL : $_DEBUG_LEVEL;
define('MODE', $_DEBUG_LEVEL);
define('DB_DEBUG', MODE > PROD);


if (MODE > PROD) {
	error_reporting(E_ALL);
	ini_set('display_errors', 1);
} else {
	error_reporting(0);
	ini_set('display_errors', 0);
}

if (MODE > TEST) {
	ini_set('xdebug.overload_var_dump', '0');
	ini_set('xdebug.auto_trace', 'On');
	ini_set('xdebug.show_local_vars', 'On');
	ini_set('xdebug.var_display_max_depth', '15');
	ini_set('xdebug.dump_globals', 'On');
	ini_set('xdebug.collect_params', '4');
	ini_set('xdebug.dump_once', 'Off');
	ini_set('xdebug.cli_color', 'Off');
	ini_set('xdebug.show_exception_trace', 'On');
}

/*
 * -------------------------------------------------------------------
 *   CLASS AUTO-LOADER
 * -------------------------------------------------------------------
 */
$_CLASS_MAP = include(VAR_DIR.DS.'classes.php');
spl_autoload_register(function ($className) {
	global $_CLASS_MAP;
	if (isset($_CLASS_MAP[$className])) {
		require_once(DIR.DS.'..'.DS.$_CLASS_MAP[$className]);
	}
});

/*
 * -------------------------------------------------------------------
 *   HELPERS
 * -------------------------------------------------------------------
 */
require_once(OPT_DIR.DS.'helpers'.DS.'dump.php');
require_once(OPT_DIR.DS.'helpers'.DS.'FsHelper.php');

/*
 * -------------------------------------------------------------------
 *   CACHE FS
 * -------------------------------------------------------------------
 */
if (!is_dir(SESSION_DIR)) {
	FsHelper::mkDir(CACHE_DIR, 0770);
	FsHelper::mkDir(SESSION_DIR, 0770);
	FsHelper::mkFile(CACHE_DIR.DS.'.htaccess');
	FsHelper::mkFile(SESSION_DIR.DS.'.htaccess');
	file_put_contents(CACHE_DIR.DS.'.htaccess', 'DENY from all');
	file_put_contents(SESSION_DIR.DS.'.htaccess', 'DENY from all');
}

/*
 * -------------------------------------------------------------------
 *  SESSION
 * -------------------------------------------------------------------
 */
$SESSION_USER_INACTIVE_TIME = 0;
ini_set('session.name', 'apisessid');
ini_set('session.gc_maxlifetime', (string) 86400);
ini_set('session.cookie_lifetime', (string) $SESSION_USER_INACTIVE_TIME);
ini_set('session.save_path', SESSION_DIR);
session_start();
if ($SESSION_USER_INACTIVE_TIME > 0) {
	$time = time();
	if (($time - (isset($_SESSION['session_time_idle']) ? $_SESSION['session_time_idle'] : 0)) > $SESSION_USER_INACTIVE_TIME) {
		session_destroy();
		session_start();
	}
	$_SESSION['session_time_idle'] = $time;
}

$url = str_replace(ROOT_URI, '', $_SERVER['REQUEST_URI']);
/*
 * -------------------------------------------------------------------
 *  ROUTER
 * -------------------------------------------------------------------
 */
$router = new Router(/*#:injectData("@VAR/api/router/routes.json")#*/);
$routeResult = $router->match($_SERVER['REQUEST_METHOD'], $url, array('name' => null, 'params' => array()));


/*
 * -------------------------------------------------------------------
 *  API
 * -------------------------------------------------------------------
 */

$api = new Api(MODE, $routeResult['name'], $_SERVER['REQUEST_METHOD'], $url, array(
	'input/body'    => file_get_contents('php://input'),
	'input/params'  => $routeResult['params'],
	'input/query'   => $_GET,
	'input/headers' => getallheaders()
));
$api->launch();

/*
 * -------------------------------------------------------------------
 *  RESPONSE
 * -------------------------------------------------------------------
 */
$api->send(true);
