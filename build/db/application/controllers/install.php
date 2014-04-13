<?php


require_once(SRC_DIR.'/opt/crud_models/crud_models.init.php');
class Install extends CI_Controller {

    function index (){
        echo('<a href="/db/install/confirm">Install -></a>');
        exit();
    }

    function confirm (){
        CrudModel::initAllTables(SRC_DIR.'/database/default/tables');
    }

}