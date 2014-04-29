<?php

// start
define('START_TIMESTAMP', gettimeofday(true));

// CONST
define('DS', '/');
define('SD', '\\');

define('PROD', 0);
define('DEV',  1);
define('TEST', 2);

// DIR PATHS
define('DIR', str_replace(SD, DS, __DIR__));
define('VAR_DIR', DIR.DS.'var');
define('CACHE_DIR', realpath(DIR.DS.'..').DS.'private.cache');
define('SESSION_DIR', CACHE_DIR.DS.'session');
define('OPT_DIR', realpath('..'.DS.'opt'));

define('ROOT_URI', str_replace(SD, DS, pathinfo($_SERVER['SCRIPT_NAME'], PATHINFO_DIRNAME)));

$ENV = DEV;

define('MODE', $ENV > PROD && isset($_GET['environment']) && ($_GET['environment'] === DEV || $_GET['environment'] === TEST) ? $_GET['environment'] : PROD);
define('DB_DEBUG', MODE > PROD);

if (MODE === PROD) {
	error_reporting(0);
	ini_set('display_errors', 0);
} else {
	error_reporting(E_ALL);
	ini_set('display_errors', 1);

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
require_once(OPT_DIR.DS.'helpers'.DS.'fs.php');

/*
 * -------------------------------------------------------------------
 *   CACHE FS
 * -------------------------------------------------------------------
 */
if (!is_dir(SESSION_DIR)) {
	FS_makeDir(CACHE_DIR, 0770);
	FS_makeDir(SESSION_DIR, 0770);
	FS_makeFile(CACHE_DIR.DS.'.htaccess');
	FS_makeFile(SESSION_DIR.DS.'.htaccess');
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

/*
 * -------------------------------------------------------------------
 *  ROUTER
 * -------------------------------------------------------------------
 */
$router = new Router(include(VAR_DIR.DS.'routes.php'));
$routeResult = $router->match($_SERVER['REQUEST_METHOD'], $_SERVER['REQUEST_URI']);


/*
 * -------------------------------------------------------------------
 *  API
 * -------------------------------------------------------------------
 */

$url = str_replace(ROOT_URI, '', $_SERVER['REQUEST_URI']);
$api = new Api($routeResult['name'], $_SERVER['REQUEST_METHOD'], $url, array(
	'input/body'    => file_get_contents('php://input'),
	'input/args'    => $routeResult['params'],
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
