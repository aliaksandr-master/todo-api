<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');

interface ICrudMoldel {

    const RESULT_ARRAY = "array";
    const RESULT_OBJECT = "object";
    const RESULT_ACTIVE_RECORD = "active record";

    function read ($whereOrId, $resultAs = self::RESULT_ARRAY, $select);
    function create (array $data);
    function update (array $data, $whereOrId);
    function delete ($whereOrId);
}