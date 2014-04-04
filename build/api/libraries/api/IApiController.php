<?php

interface IApiController {

	public function compileMethodName ($action, $method, $methodAliasesMap, $responseType);

	public function callMethod ($actionName);

	public function hasAccess ($method, $controllerName, $actionName);

	public function prepareStatusByMethod ($status, $response, $method);

	public function hasAuth ();

	public function applyValidationRule ($value, $ruleName, $params, $contextName);

	public function applyFilter ($value, $filterName, $params, $contextName);

	public function toType ($value, $type, $param = null);

}