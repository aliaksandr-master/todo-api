<?php
error_reporting(E_ALL);
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
    <link rel="stylesheet" href="/server/test/assets/form-tests.css"/>
    <script src="/server/test/assets/jquery/jquery.js"></script>
    <script src="/server/test/assets/bootstrap/custom/js/bootstrap.js"></script>
    <script src="/server/test/assets/form-tests.js"></script>
</head>
<body>
<div style="margin: 10px;" id="headMenus">
    <?php
        $testGroups = array();
        $activeGroupName = "";
        $activeFileUrl = "";
        $rootDirPath = "/server/test";
        $testDirName = "form-tests";
        $filePath = realpath("./".$testDirName);
        $fs = getFileSystem($filePath);
        foreach($fs["children"]["dirs"] as $cat){
            $groupName = ucfirst($cat["name"]);
            foreach($cat["children"]["files"] as $file){
                $name = explode(".", $file["name"]);
                array_pop($name);
                $name = implode(".", $name);
                $path = $testDirName."/".$cat["name"]."/".$name;
                $testGroups[$groupName][$name] = $rootDirPath."/".$path;
                if(!$activeGroupName && $uri == $path){
                    $activeGroupName = "$groupName";
                    $activeFileUrl = $testGroups[$groupName][$name];
                }
            }
            asort($testGroups[$groupName]);
        }
        foreach($fs["children"]["files"] as $file){
            $groupName = "Other";
            $name = explode(".", $file["name"]);
            array_pop($name);
            $name = implode(".", $name);
            $path = $testDirName."/".$name;
            $testGroups[$groupName][$name] = $rootDirPath."/".$path;
            if(!$activeGroupName && $uri == $path){
                $activeGroupName = $groupName;
                $activeFileUrl = $testGroups[$groupName][$name];
            }
            asort($testGroups[$groupName]);
        }
    ?>
    <?php foreach($testGroups as $groupName => $files){ ?>
        <div class="btn-group">
            <button type="button" class="btn btn-default dropdown-toggle <?php if($groupName == $activeGroupName) echo("btn-primary")?>" data-toggle="dropdown">
                <?php echo($groupName)?>
                <span class="caret"></span>
            </button>
            <ul class="dropdown-menu" role="menu">
                <?php
                    foreach($files as $fileName => $url){
                        echo('<li class="'.($activeFileUrl == $url ? "active": "").'"><a href="'.$url.'">'.$fileName.'</a></li>');
                    }
                ?>
            </ul>
        </div>
    <?php } ?>
    <h1 id="mainHeader"><?php
        $header = str_replace("form-tests/", "", $uri);
        $header = preg_replace("/\//", ":&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; ", $header);
        $header = preg_replace("/[-\.]+/", " ", $header);
        $header = ucwords($header);
        echo($header);
    ?></h1>
</div>
<div style="margin: 10px;">
    <div class="clearfix">
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
                        <?php
                        if(is_file(realpath("./".$uri.".html"))) {
                            include(realpath("./".$uri.".html"));
                        } else {
                            echo('<div class="alert alert-danger"><h2>404 undefined FORM</h2></div>');
                        }
                        ?>
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