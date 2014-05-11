<!DOCTYPE html>
<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

define('ROOT', __DIR__);
define('MY_ROOT_URL', "/api-test/");
define('ROOT_URL', "/api/");
?>
<html>
<head>
    <title>API TESTER</title>
    <link rel="stylesheet" href="vendor/bootstrap/custom/css/bootstrap.css"/>
    <link rel="stylesheet" href="static/styles/main.css"/>
    <script type="text/javascript">
        window.MY_ROOT  = '<?php echo(MY_ROOT_URL); ?>';
        window.API_ROOT = '<?php echo(ROOT_URL); ?>';
        window.API_JSON = <?php echo(file_get_contents('var/specs.json')); ?>;
        window.API_ROUTES_JSON = <?php echo(file_get_contents('var/routes.json')); ?>;
    </script>
    <script type="text/plain" id="template-main"><?php include('static/templates/main.hbs'); ?></script>
    <script type="text/plain" id="template-menu"><?php include('static/templates/menu.hbs'); ?></script>
    <script type="text/plain" id="template-panel"><?php include('static/templates/panel.hbs'); ?></script>
    <script type="text/plain" id="template-form-cover"><?php include('static/templates/form/cover.hbs'); ?></script>
    <script type="text/plain" id="template-form-field"><?php include('static/templates/form/field.hbs'); ?></script>
    <script type="text/plain" id="template-form-select"><?php include('static/templates/form/select.hbs'); ?></script>
    <script type="text/plain" id="template-form-text"><?php include('static/templates/form/text.hbs'); ?></script>
    <script type="text/plain" id="template-form-toggle"><?php include('static/templates/form/toggle.hbs'); ?></script>
	<script src="vendor/lodash/lodash.js"></script>
	<script src="vendor/jquery/jquery.js"></script>
	<script src="vendor/handlebars/handlebars.js"></script>
	<script src="vendor/bootstrap/custom/js/bootstrap.js"></script>

	<script src="static/js/utils.js"></script>
	<script src="static/js/tester.js"></script>
</head>
<body>

</body>
</html>