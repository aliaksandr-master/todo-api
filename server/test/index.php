<?php
require_once("../application/helpers/dump_helper.php");
require_once("../application/helpers/fs_helper.php");
$uri = str_replace("/server/test/", "", makeValidPath($_SERVER["REQUEST_URI"], "/"));
$uriParts = explode("/", $uri);
?>
<!DOCTYPE html>
<html>
<head>
    <title></title>
    <link rel="stylesheet" href="/server/test/assets/bootstrap/custom/css/bootstrap.css"/>
    <link rel="stylesheet" href="/server/test/assets/json-formatter/json-formatter.css"/>
    <link rel="stylesheet" href="/server/test/assets/style.css"/>
    <script src="/server/test/assets/jquery/jquery.js"></script>
    <script src="/server/test/assets/bootstrap/custom/js/bootstrap.js"></script>
    <script src="/server/test/assets/json-formatter/json-formatter.js"></script>
    <script src="/server/test/assets/script.js"></script>
</head>
<body>
<div style="margin: 10px;">
    <div class="btn-group">
        <button type="button" class="btn btn-default dropdown-toggle" data-toggle="dropdown">
            Test Form
            <span class="caret"></span>
        </button>
        <ul class="dropdown-menu" role="menu">
            <?php
                $filePath = realpath("./form");
                $fs = getFileSystem($filePath);
                foreach($fs["children"]["files"] as $file){
                    $name = explode(".", $file["name"]);
                    array_pop($name);
                    $name = implode(".", $name);
                    echo('<li><a href="/server/test/form/'.$name.'">'.$name.'</a></li>');
                }
            ?>
        </ul>
    </div>
</div>
<div style="margin: 10px;">
    <h1><?php echo($uri)?></h1>
    <div class="clearfix">
        <div class="requestParams-panel-wr">
            <div class="panel panel-default">
                <div class="panel-heading">Request Data (formatted)</div>
                <div class="panel-body" id="requestParams"></div>
            </div>
            <div class="panel panel-default">
                <div class="panel-heading">Request Data</div>
                <div class="panel-body" id="requestDataNonFormat"></div>
            </div>
        </div>
        <div class="form-panel-wr">
            <div class="panel panel-default form-panel">
                <div class="panel-heading clearfix" style="background: #ccc;">
                    <div class="pull-right" style="margin-left: 10px;">
                        <label>METHOD</label>
                        <select id="_METHOD_" class="form-control" style="width: 110px;">
                            <option value="GET">GET</option>
                            <option value="PUT">PUT</option>
                            <option value="POST">POST</option>
                            <option value="DELETE">DELETE</option>
                            <option value="PATCH">PATCH</option>
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
                        <?php

                        $filePath = realpath("./".$uri.".html");
                        is_file($filePath) && include($filePath);

                        ?>
                    </div>
                    <div class="form-submit">
                        <div class="pull-right">
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
            <div class="panel panel-default">
                <div class="panel-heading">Respoonse JSON</div>
                <div class="panel-body" id="responseJSON"></div>
            </div>
            <div class="panel panel-default">
                <div class="panel-heading">Respoonse HTML</div>
                <div class="panel-body" id="responseHTML"></div>
            </div>
            <div class="panel panel-default">
                <div class="panel-heading">Respoonse (Without Format)</div>
                <div class="panel-body" id="response"></div>
            </div>
        </div>
    </div>
</div>
</body>
</html>