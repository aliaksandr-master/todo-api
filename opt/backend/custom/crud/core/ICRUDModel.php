<?php



interface ICRUDModel {

	const RESULT_ARRAY = "array";

	const RESULT_OBJECT = "object";

	const RESULT_ACTIVE_RECORD = "active record";


	function read ($whereOrId, array $options = array(), $resultAs = self::RESULT_ARRAY);


	function create (array $data);


	function update (array $data, $whereOrId);


	function delete ($whereOrId);
}