<?php



/**
 * Interface IApiController
 */
interface IApiResourceController {

	public function resource ($action);


	public function filterData ($value, $filter, array $params = array());


	public function verifyData ($value, $rule, array $params = array(), $name = null);


	public function beforeAction ($action);


	public function prepareSuccess ();


	public function prepareError ();


	public function statistic ();
}