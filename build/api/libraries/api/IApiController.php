<?php

interface IApiController {

	public function compileMethodName ($action, $method, $methodAliasesMap, $responseType);

	public function callMethod ($actionName);

	public function hasAccess ($method, $controllerName, $actionName);

	public function prepareStatusByMethod ($status, $response, $method);

}