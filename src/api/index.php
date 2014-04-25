<?php
/*
 * -------------------------------------------------------------------
 *   DEFINE MAIN
 * -------------------------------------------------------------------
 */
define('START_TIMESTAMP', gettimeofday(true));

define('DS', '/');
define('SD', '\\');

define("SERVER_DIR", str_replace(SD, DS, __DIR__));
define("VAR_DIR", SERVER_DIR.DS."var");
define("CACHE_DIR", realpath(SERVER_DIR.DS.'..').DS."private.cache");
define("SESSION_DIR", CACHE_DIR.DS."session");

define("INDEX_DIR_NAME", array_pop(explode(DS, SERVER_DIR)));
define('API_ROOT_URL', pathinfo(str_replace(SD, DS, $_SERVER['SCRIPT_NAME']), PATHINFO_DIRNAME));
define('ENVIRONMENT',  'development'); /* development, testing, production */

$apiAvl = ENVIRONMENT === "development" || ENVIRONMENT === "testing";
define('_API_TESTING_MODE_', $apiAvl && !empty($_GET['_testing']));
define('_API_DEBUG_MODE_', _API_TESTING_MODE_ || ($apiAvl && !empty($_GET['_debug'])));

define('OPT_DIR', realpath('..'.DS.'opt'));

//
///*
// * -------------------------------------------------------------------
// *   X-DEBUG SETTINGS
// * -------------------------------------------------------------------
// */
//ini_set('xdebug.overload_var_dump', '0');
//ini_set('xdebug.auto_trace', 'On');
//ini_set('xdebug.show_local_vars', 'On');
//ini_set('xdebug.var_display_max_depth', '15');
//ini_set('xdebug.dump_globals', 'On');
//ini_set('xdebug.collect_params', '4');
//ini_set('xdebug.dump_once', 'Off');
//ini_set('xdebug.cli_color', 'Off');
//ini_set('xdebug.show_exception_trace', 'On');




/*
 * -------------------------------------------------------------------
 *   CLASS AUTO-LOADER
 * -------------------------------------------------------------------
 */
$_CLASS_MAP = include(VAR_DIR.'/classes.php');
spl_autoload_register(function ($className) {
    global $_CLASS_MAP;
    if (isset($_CLASS_MAP[$className])) {
        require_once(SERVER_DIR.DS.'..'.DS.$_CLASS_MAP[$className]);
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
	FS_makeFile(CACHE_DIR.DS.'.gitkeep');
	FS_makeFile(SESSION_DIR.DS.'.gitkeep');

	FS_makeFile(CACHE_DIR.DS.'.htaccess');
	FS_makeFile(SESSION_DIR.DS.'.htaccess');
	file_put_contents(CACHE_DIR.DS.'.htaccess', 'DENY from all');
	file_put_contents(SESSION_DIR.DS.'.htaccess', 'DENY from all');
}

/*
 * -------------------------------------------------------------------
 *   PUT-INPUT ARGS DATA
 * -------------------------------------------------------------------
 */
define("INPUT_DATA", file_get_contents("php://input"));



/*
 * -------------------------------------------------------------------
 *  SESSION
 * -------------------------------------------------------------------
 */
$user_inactive_time = 0;
ini_set("session.name",  "api");
ini_set("session.gc_maxlifetime",  (string) 86400);
ini_set("session.cookie_lifetime", (string) $user_inactive_time);
ini_set('session.save_path', SESSION_DIR);
session_start();
if ($user_inactive_time) {
    $time = time();
    if (($time - (isset($_SESSION['session_time_idle']) ? $_SESSION['session_time_idle'] : 0)) > $user_inactive_time) {
        session_destroy();
        session_start();
    }
    $_SESSION['session_time_idle'] = $time;
}


/*
 *---------------------------------------------------------------
 * ERROR REPORTING
 *---------------------------------------------------------------
 *
 * Different environments will require different levels of error reporting.
 * By default development will show errors but testing and live will hide them.
 */
if (defined('ENVIRONMENT'))
{
	switch (ENVIRONMENT)
	{
		case 'development':
			error_reporting(E_ALL);
            ini_set('display_errors', 1);
		break;
	
		case 'testing':
		case 'production':
			error_reporting(0);
            ini_set('display_errors', 0);
		break;

		default:
			exit('The application environment is not set correctly.');
	}
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
 *  MODELS
 * -------------------------------------------------------------------
 */
require_once(OPT_DIR.DS.'ci_active_record'.DS.'ci_active_record.init.php');



/*
 * -------------------------------------------------------------------
 *  CONTROLLER
 * -------------------------------------------------------------------
 */
$controllerClass = $routeResult['class'];
$controller = new $controllerClass();
$method = !empty($routeResult['action']) ? $routeResult['action'] : str_replace('Controller', '', get_class($controller));


/*
 * -------------------------------------------------------------------
 *  API
 * -------------------------------------------------------------------
 */

$url = str_replace(API_ROOT_URL, '', $_SERVER['REQUEST_URI']);
$api = new Api($_SERVER["REQUEST_METHOD"], $url, array(
	'input/body' => INPUT_DATA,
	'input/args' => $routeResult['params'],
	'input/query' => $_GET,
	'input/headers' => getallheaders()
));
$api->launch($controller, $method);



/*
 * -------------------------------------------------------------------
 *  RESPONSE
 * -------------------------------------------------------------------
 */
$api->send(true);
