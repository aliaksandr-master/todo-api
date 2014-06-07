<?php



/**
 * Interface ICRUDModel
 */
interface ICRUDModel {

	const RESULT_ARRAY = "array";

	const RESULT_OBJECT = "object";

	const RESULT_ACTIVE_RECORD = "active record";

	/**
	 * @param integer|array $whereOrId
	 * @param array $options
	 * @param string $resultAs
	 *
	 * @return mixed
	 */
	function read ($whereOrId, array $options = array(), $resultAs = self::RESULT_ARRAY);


	/**
	 * @param array $data
	 *
	 * @return mixed
	 */
	function create (array $data);


	/**
	 * @param array $data
	 * @param       $whereOrId
	 *
	 * @return mixed
	 */
	function update (array $data, $whereOrId);


	/**
	 * @param $whereOrId
	 *
	 * @return mixed
	 */
	function delete ($whereOrId);
}