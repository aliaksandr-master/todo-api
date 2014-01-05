<?php


require_once("../application/helpers/dump_helper.php");
require_once("../application/helpers/fs_helper.php");

$uri = $_SERVER["REQUEST_URI"];

$uri = str_replace("/server/test/", "", $uri);
$uriParts = explode("/", $uri);

?>
<!DOCTYPE html>
<html>
<head>
    <title></title>
    <link rel="stylesheet" href="/server/test/assets/bootstrap/custom/css/bootstrap.css"/>
    <link rel="stylesheet" href="/server/test/assets/json-formatter/json-formatter.css"/>
    <script src="/server/test/assets/jquery/jquery.js"></script>
    <script src="/server/test/assets/bootstrap/custom/js/bootstrap.js"></script>
    <script src="/server/test/assets/json-formatter/json-formatter.js"></script>
    <style>
        /*SOME GLOBAL STYLES FOR TESTS*/

    </style>
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
    <div style="margin: 10px 0 10px;">
        <h1><?php echo($uri)?></h1>
    </div>
    <div class="panel panel-default" style="margin-bottom: 20px;">
        <div class="panel-heading">FORM</div>
        <div class="panel-body" id="formS">
            <?php

            $filePath = realpath("./".$uri.".html");
            is_file($filePath) && include($filePath);

            ?>
            <div style="padding-top: 20px;">
                <input type="submit" class="btn btn-success" onclick="$(this).parent().parent().find('form').eq(0).submit()"/>
            </div>
        </div>
    </div>
    <div style="margin: 10px 0 50px;">
        <div class="panel panel-default" style="margin-bottom: 20px;">
            <div class="panel-heading">Reqquest Params</div>
            <div class="panel-body" id="jsonParamWr"></div>
        </div>
        <div id="errorWr" style="margin-bottom: 20px;"></div>
        <div class="panel panel-default" style="margin-bottom: 20px;">
            <div class="panel-heading">Respoonse JSON</div>
            <div class="panel-body" id="jsonWr"></div>
        </div>
        <div class="panel panel-default">
            <div class="panel-heading">Respoonse HTML</div>
            <div class="panel-body" id="respHtml"></div>
        </div>
        <div class="panel panel-default">
            <div class="panel-heading">Respoonse</div>
            <div class="panel-body" id="jsonP"></div>
        </div>
    </div>
</div>
<script>
    $(function(){
        $(document.body).find("[name]:not([placeholder])").each(function(){
            $(this).attr("placeholder", $(this).attr("name"))
        });
        $(document.body).on("submit", "form", function(){
            var pararms = {
                type: $(this).attr("method"),
                url: $(this).attr("action"),
                data: $(this).serializeArray()
            };
            $("#jsonParamWr").html("");
            JSONFormatter.format(pararms, {
                collapse: false, // Setting to 'true' this will format the JSON into a collapsable/expandable tree
                appendTo: '#jsonParamWr', // A string of the id, class or element name to append the formatted json
                list_id: 'jsonParam' // The name of the id at the root ul of the formatted JSON
            });
            $.ajax($.extend(pararms,{
                data: $(this).serialize(),
                success: function(response){
                    $("#errorWr").hide();
                    $("#jsonWr").html("");
                    if($.isPlainObject(response)){
                        JSONFormatter.format(response, {
                            collapse: false, // Setting to 'true' this will format the JSON into a collapsable/expandable tree
                            appendTo: '#jsonWr', // A string of the id, class or element name to append the formatted json
                            list_id: 'json' // The name of the id at the root ul of the formatted JSON
                        });
                        $("#jsonP").text(JSON.stringify(response));
                    }else{
                        $("#jsonP").text(response);
                        $("#respHtml").html(response);
                    }
                },
                error: function(){
                    $("#errorWr").show().html(
                        '<div class="alert alert-danger">Ajax Error</div>'
                    );
                }
            }));
            return false;
        });
    });
</script>
</body>
</html>