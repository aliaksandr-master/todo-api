<?php



/*
 * -------------------------------------------------------------------
 *   START
 * -------------------------------------------------------------------
 */
define('START_TIMESTAMP', gettimeofday(true));
define('START_MEMORY', memory_get_usage(true));

if(in_array($_SERVER['REMOTE_ADDR'], array('127.0.0.1', '::1'))){
	error_reporting(E_ALL);
	ini_set('display_errors', 1);
}

/*
 * -------------------------------------------------------------------
 *   CONST
 * -------------------------------------------------------------------
 */
define('DS', '/');
define('SD', '\\');

define('DIR', str_replace(SD, DS, __DIR__));
define('VAR_DIR', DIR.'/var');
define('CACHE_DIR', realpath(DIR.'/..').'/private.cache');
define('SESSION_DIR', CACHE_DIR.'/session');
define('OPT_DIR', '../opt/backend');



/*
 * -------------------------------------------------------------------
 *   HELPERS
 * -------------------------------------------------------------------
 */
require_once(OPT_DIR.'/custom/helpers/dump.php');
require_once(OPT_DIR.'/custom/helpers/FsHelper.php');

/*
 * -------------------------------------------------------------------
 *   CORE
 * -------------------------------------------------------------------
 */
require_once(OPT_DIR.'/custom/kernel/load.php');

require_once(OPT_DIR.'/custom/intercessor/load.php');
require_once(OPT_DIR.'/custom/router/load.php');
require_once(DIR.'/extensions/application.php');




/*
 * -------------------------------------------------------------------
 *   APPLICATION
 * -------------------------------------------------------------------
 */
$app = new Application();
spl_autoload_register(array($app, 'loadClass'));


/*
 * -------------------------------------------------------------------
 *   DEBUG LEVELS
 * -------------------------------------------------------------------
 */
define('DB_DEBUG', $app->debugLevel > 0);
if ($app->debugLevel > 0) {
	error_reporting(E_ALL);
	ini_set('display_errors', 1);
} else {
	error_reporting(0);
	ini_set('display_errors', 0);
}




/*
 * -------------------------------------------------------------------
 *   CLASS AUTO-LOADER
 * -------------------------------------------------------------------
 */



/*
 * -------------------------------------------------------------------
 *   CACHE FS
 * -------------------------------------------------------------------
 */
if (!is_dir(SESSION_DIR)) {
	FsHelper::mkDir(CACHE_DIR, 0770);
	FsHelper::mkDir(SESSION_DIR, 0770);
	FsHelper::mkFile(CACHE_DIR.'/.htaccess');
	FsHelper::mkFile(SESSION_DIR.'/.htaccess');
	file_put_contents(CACHE_DIR.'/.htaccess', 'DENY from all');
	file_put_contents(SESSION_DIR.'/.htaccess', 'DENY from all');
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

$url = str_replace('/api', '', $_SERVER['REQUEST_URI']);

$router = new Router(/*#:injectData("@VAR/api/router/routes.json")*/ array() /*injectData#*/);
$routeResult = $router->match($_SERVER['REQUEST_METHOD'], $url, array('name' => null, 'params' => array()));

/*
 * -------------------------------------------------------------------
 *  LAUNCH
 * -------------------------------------------------------------------
 */
$intercessor = new Intercessor\Environment();
$intercessor->debug = $app->debugLevel >= 3;
$intercessor->mimes = /*#:injectData("@VAR/api/spec-options.json", "mimes")*/ array() /*injectData#*/;
$intercessor->statuses = /*#:injectData("@VAR/api/spec-options.json", "statuses")*/ array() /*injectData#*/;

$request = $intercessor->request($routeResult['name'], $_SERVER['REQUEST_METHOD'], $url)
	->inputBody(file_get_contents('php://input'))
	->inputParams($routeResult['params'])
	->inputQuery($_GET)
	->inputHeaders(getallheaders());

$_GET = array();
$_POST = array();

$response = $request->run();

$response->sendHeaders();
$output = $response->toString();

$compressing = true;
if ($compressing) {
	$zlibOc = @ini_get('zlib.output_compression');
	$compressing = !$zlibOc && extension_loaded('zlib') && preg_match('/gzip/', $_SERVER['HTTP_ACCEPT_ENCODING']);

	if (!$zlibOc && !$compressing) {
		header('Content-Length: '.strlen($output));
	} else {
		if ($compressing) {
			ob_start('ob_gzhandler');
		}
	}
} else {
	header('Content-Length: '.strlen($output));
}

exit($output);