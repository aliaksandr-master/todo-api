<!DOCTYPE html>
<?php
error_reporting(E_ALL);

define('ROOT', __DIR__);
define('MY_ROOT_URL', "/test/api/");
define('API_ROOT_URL', "/server/");
define('API_SOURCE_JSON_FILE', "/server/_generated_/api.source.json");
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
</head>
<body>

</body>
</html>