<?php


namespace Intercessor;

/**
 * Interface IResourceController
 * @package Intercessor
 */
interface IResourceController {

	/**
	 * @param Environment $environment
	 * @param Request     $request
	 * @param Response    $response
	 */
	public function __construct (Environment &$environment, Request &$request, Response &$response);


	/**
	 * @return mixed|void
	 */
	public function intercessorResource ();


	/**
	 * @param mixed  $value
	 * @param string $filterName
	 * @param array  $params
	 *
	 * @return mixed
	 */
	public function intercessorFilterData ($value, $filterName, array $params = array());


	/**
	 * @param mixed  $value
	 * @param string $ruleName
	 * @param array  $params
	 * @param null   $name
	 *
	 * @return boolean
	 */
	public function intercessorVerifyData ($value, $ruleName, array $params = array(), $name = null);


	/**
	 * @param Request  $request
	 * @param Response $response
	 *
	 * @return void
	 */
	public function intercessorPrepareSuccess (Request &$request, Response &$response);


	/**
	 * @param Request  $request
	 * @param Response $response
	 *
	 * @return void
	 */
	public function intercessorPrepareError (Request &$request, Response &$response);


	/**
	 * @param array $output
	 * @param       $debugMode
	 *
	 * @return mixed
	 */
	public function intercessorPrepareOutput (array $output, $debugMode);
}