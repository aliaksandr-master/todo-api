<!DOCTYPE html>
<?php

error_reporting(E_ALL);
ini_set('display_errors', 1);

define('DS', '/');
define('SD', '\\');

define('DIR', str_replace(SD, DS, __DIR__));
define('VAR_DIR', DIR.DS.'var');
define('OPT_DIR', realpath('..'.DS.'opt'.DS.'backend'));


require_once(OPT_DIR.DS.'custom'.DS.'helpers'.DS.'dump.php');
require_once(OPT_DIR.DS.'custom'.DS.'helpers'.DS.'FsHelper.php');


define('ROOT', FsHelper::normalizePath(__DIR__));
define('MY_ROOT_URL', "/api-test/");
define('ROOT_URL', "/api/");

$templatesDir = ROOT.DS.'static'.DS.'templates';
$expand = FsHelper::expand($templatesDir);

$files = FsHelper::expandResult($expand);

$files = FsHelper::mapFilesResult($files, FsHelper::REL_FILES_LIST, DS);

?>
<html>
<head>
    <title>API TESTER</title>
    <link rel="stylesheet" href="/opt/frontend/vendor/bootstrap/custom/css/bootstrap.min.css"/>
    <link rel="stylesheet" href="static/styles/main.css"/>
    <script type="text/javascript">
        window.MY_ROOT  = '<?php echo(MY_ROOT_URL); ?>';
        window.API_ROOT = '<?php echo(ROOT_URL); ?>';
        window.API_JSON = <?php echo(file_get_contents('var/specs.json')); ?>;
        window.API_ROUTES_JSON = <?php echo(file_get_contents('var/routes.json')); ?>;
    </script>
	<?php foreach ($files as $fileSrc) {
		$content = file_get_contents($templatesDir.$fileSrc);
		?><script type="text/x-handlebars-template" data-src="<?php echo($fileSrc); ?>"><?php echo($content); ?></script><?php
	}?>

	<script src="/opt/frontend/bower/lodash/dist/lodash.js"></script>
	<script src="/opt/frontend/bower/jquery/jquery.js"></script>
	<script src="/opt/frontend/vendor/handlebars/handlebars.js"></script>
	<script src="/opt/frontend/vendor/bootstrap/custom/js/bootstrap.js"></script>

	<script src="static/js/utils.js"></script>
	<script src="static/js/tester.js"></script>
</head>
<body></body>
</html>