<?php



/**
 * Interface IApiController
 */
interface IApiController {


	/**
	 * @param string $action
	 * @param string $method
	 * @param string $responseType
	 * @param array  $methodAliasesMap
	 *
	 * @return string
	 */
	public function compileMethodName ($action, $method, $responseType, array $methodAliasesMap);


	/**
	 * @param string   $actionName
	 * @param string   $method
	 * @param string   $actionMethodName
	 * @param ApiRequest $input
	 *
	 * @return array
	 */
	public function getActionArgs ($actionName, $method, $actionMethodName, ApiRequest &$input);


	/**
	 * @param ApiComponent $apiAccess
	 * @param array        $accessSpec
	 * @param string       $method
	 * @param string       $actionName
	 * @param string       $methodName
	 *
	 * @return boolean
	 */
	public function hasAccess (ApiComponent &$apiAccess, array $accessSpec, $method, $actionName, $methodName);


	/**
	 * @param $status
	 * @param $response
	 * @param $method
	 *
	 * @return number|null
	 */
	public function prepareResponseStatusByMethod ($status, $response, $method);


	/**
	 * @param $value
	 * @param $ruleName
	 * @param $params
	 * @param $contextName
	 *
	 * @return null|boolean
	 */
	public function applyValidationRule ($value, $ruleName, $params, $contextName);


	/**
	 * @param $value
	 * @param $filterName
	 * @param $params
	 * @param $contextName
	 *
	 * @return null|mixed
	 */
	public function applyFilter ($value, $filterName, $params, $contextName);


	/**
	 * @param mixed  $value
	 * @param string $type
	 *
	 * @return mixed
	 */
	public function toType ($value, $type);
}