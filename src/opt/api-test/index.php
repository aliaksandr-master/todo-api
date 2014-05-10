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
    <link rel="stylesheet" href="assets/tester.css"/>
    <script type="text/javascript">
        window.MY_ROOT  = '<?php echo(MY_ROOT_URL); ?>';
        window.API_ROOT = '<?php echo(ROOT_URL); ?>';
        window.API_JSON = <?php echo(file_get_contents('var/specs.json')); ?>;
        window.API_ROUTES_JSON = <?php echo(file_get_contents('var/routes.json')); ?>;
    </script>
    <script type="text/plain" id="template-main"><?php include('templates/main.hbs'); ?></script>
    <script type="text/plain" id="template-menu"><?php include('templates/menu.hbs'); ?></script>
    <script type="text/plain" id="template-panel"><?php include('templates/panel.hbs'); ?></script>
    <script type="text/plain" id="template-form-cover"><?php include('templates/form/cover.hbs'); ?></script>
    <script type="text/plain" id="template-form-field"><?php include('templates/form/field.hbs'); ?></script>
    <script type="text/plain" id="template-form-select"><?php include('templates/form/select.hbs'); ?></script>
    <script type="text/plain" id="template-form-text"><?php include('templates/form/text.hbs'); ?></script>
    <script type="text/plain" id="template-form-toggle"><?php include('templates/form/toggle.hbs'); ?></script>
	<script src="vendor/lodash/lodash.js"></script>
	<script src="vendor/jquery/jquery.js"></script>
	<script src="vendor/handlebars/handlebars.js"></script>
	<script src="vendor/bootstrap/custom/js/bootstrap.js"></script>

	<script src="assets/utils.js"></script>
	<script src="assets/tester.js"></script>
</head>
<body>

</body>
</html>