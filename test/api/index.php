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
    <link rel="stylesheet" href="assets/api-tests.css"/>
    <script type="text/javascript">
        window.MY_ROOT  = '<?php echo(MY_ROOT_URL); ?>';
        window.API_ROOT = '<?php echo(API_ROOT_URL); ?>';
        window.API_JSON = '<?php echo(API_SOURCE_JSON_FILE); ?>';
    </script>
    <script src="assets/underscore/underscore.js"></script>
    <script src="assets/jquery/jquery.js"></script>
    <script src="assets/handlebars/handlebars.js"></script>
    <script src="assets/bootstrap/custom/js/bootstrap.js"></script>

    <script src="assets/api-gen.js"></script>
    <script src="assets/api-tests.js"></script>
</head>
<body>
<div style="margin: 10px;" id="headMenus">
    <div class="btn-group">
        <button id="generatedBtn" type="button" class="btn btn-default btn-primary dropdown-toggle" data-toggle="dropdown">
            <b>Generated</b>
            <span class="caret"></span>
        </button>
        <ul class="dropdown-menu" role="menu"></ul>
    </div>
    <h1 id="mainHeader"></h1>
</div>
<div style="margin: 10px;">
    <div class="clearfix">
        <div id="left-menu"></div>
        <div class="requestParams-panel-wr">
            <div class="panel panel-info">
                <div class="panel-heading">Request <b>Data (formatted)</b></div>
                <div class="panel-body" style="white-space: pre; overflow-x: auto;" id="requestParams"></div>
            </div>
            <div class="panel panel-info">
                <div class="panel-heading">Request <b>Data</b></div>
                <div class="panel-body" style="white-space: pre; overflow-x: auto;" id="requestDataNonFormat"></div>
            </div>
            <div class="panel panel-success">
                <div class="panel-heading">Response <b>Headers</b></div>
                <div class="panel-body" style="white-space: pre; overflow-x: auto;" id="responseHeadersNonFormat"></div>
            </div>
        </div>
        <div class="form-panel-wr">
            <div class="panel panel-default panel-primary form-panel">
                <div class="panel-heading clearfix" style="background: #ccc;">
                    <div class="pull-right" style="margin-left: 10px;">
                        <label>METHOD</label>
                        <select id="_METHOD_" class="form-control" style="width: 110px;">
                            <option value="GET">GET</option>
                            <option value="PUT">PUT</option>
                            <option value="POST">POST</option>
                            <option value="DELETE">DELETE</option>
                            <option value="PATCH">PATCH</option>
                            <option value="PATCH">OPTION</option>
                            <option value="PATCH">HEAD</option>
                        </select>
                    </div>
                    <div class="pull-right" style="margin-left: 10px;">
                        <label>SEND FORMAT</label>
                        <select id="_FORMAT_" class="form-control" style="width: 110px;">
                            <option value="json">JSON</option>
                            <option value="params">Params</option>
                        </select>
                    </div>
                    <div style="overflow: hidden;">
                        <label>URL</label>
                        <input type="text" id="_URL_" value="" class="form-control"/>
                    </div>
                </div>
                <div class="panel-body" id="formS" style="border: 3px solid #ccc; box-shadow: none;">
                    <div class="form-in">
                        <form id="genForm" action="<?php echo(API_ROOT_URL);?>"></form>
                    </div>
                    <div class="form-submit">
                        <div class="pull-right" style="display: none;">
                            <select id="_USER_SESSION_" class="form-control">
                                <option value="">Empty SESSION</option>
                                <option value="1">Test User</option>
                            </select>
                        </div>
                        <input id="form-submit" type="submit" class="btn btn-success"/>
                    </div>
                </div>
            </div>
            <div id="errors"></div>
            <div class="panel panel-success">
                <div class="panel-heading">Respoonse <b>JSON</b></div>
                <div class="panel-body" style="white-space: pre; overflow-x: auto;" id="responseJSON"></div>
            </div>
            <div class="panel panel-success">
                <div class="panel-heading">Respoonse <b>HTML</b></div>
                <div class="panel-body" id="responseHTML"></div>
            </div>
            <div class="panel panel-success">
                <div class="panel-heading">Respoonse</div>
                <div class="panel-body" style="white-space: pre; overflow-x: auto;" id="response"></div>
            </div>
        </div>
    </div>
</div>
</body>
</html>