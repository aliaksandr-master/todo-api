<?php

require_once(APPPATH.'/libraries/REST_Controller.php');

abstract class API_Controller extends REST_Controller {

    protected function _fire_method($call, $arguments){
        $controllerName = get_class($call[0]);
        $methodName = $call[1];

        $accessName = "mdl:".strtolower($controllerName)."->".strtolower($methodName);

        // TODO: must use ACCESS MODEL and USER MODEL to create Access-array
        $accesses = array();

        if (isset($accesses[$accessName]) && !$accesses[$accessName]) {
            $this->transfer()->code(403);
        }else{
            parent::_fire_method($call, $arguments);
        }
        $this->transfer()->sendRestControllerResponse();
        exit("");
    }

}