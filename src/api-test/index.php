<!DOCTYPE html>
<?php
error_reporting(E_ALL);

define('ROOT', __DIR__);
define('MY_ROOT_URL', "/api-test/");
define('API_ROOT_URL', "/api/");
define('API_SOURCE_JSON_FILE', "/api-test/var/api.source.json");
?>
<html>
<head>
    <title>Api tests</title>
    <link rel="stylesheet" href="assets/bootstrap/custom/css/bootstrap.css"/>
    <link rel="stylesheet" href="assets/api.css"/>
    <script type="text/javascript">
        window.MY_ROOT  = '<?php echo(MY_ROOT_URL); ?>';
        window.API_ROOT = '<?php echo(API_ROOT_URL); ?>';
        window.API_JSON = '<?php echo(API_SOURCE_JSON_FILE); ?>';
    </script>
    <script src="assets/underscore/underscore.js"></script>
    <script src="assets/jquery/jquery.js"></script>
    <script src="assets/handlebars/handlebars.js"></script>
    <script src="assets/bootstrap/custom/js/bootstrap.js"></script>

    <script src="assets/api-utils.js"></script>
    <script src="assets/api.js"></script>
    <script type="text/plain" id="template-main"><?php include('templates/main.hbs'); ?></script>
    <script type="text/plain" id="template-menu"><?php include('templates/menu.hbs'); ?></script>
    <script type="text/plain" id="template-panel"><?php include('templates/panel.hbs'); ?></script>
    <script type="text/plain" id="template-form-cover"><?php include('templates/form/cover.hbs'); ?></script>
    <script type="text/plain" id="template-form-field"><?php include('templates/form/field.hbs'); ?></script>
    <script type="text/plain" id="template-form-select"><?php include('templates/form/select.hbs'); ?></script>
    <script type="text/plain" id="template-form-text"><?php include('templates/form/text.hbs'); ?></script>
    <script type="text/plain" id="template-form-toggle"><?php include('templates/form/toggle.hbs'); ?></script>
</head>
<body></body>
</html>