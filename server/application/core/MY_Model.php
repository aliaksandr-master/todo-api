<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');

abstract class MY_Model extends CI_Model implements MY_CrudInterface {

    /**
     * @return CI_Loader
     */
    protected function load(){
        return $this->load;
    }

    /**
     * @return CI_DB_active_record
     */
    protected function db(){
        return $this->db;
    }

    public function read(array $where = null, $resultAs = self::RESULT_ARRAY, $select = null){

        var_dump('11111');

        if(!is_null($select)){
            throw new Exception("incorrect selected format, must be array!");
        }

        $this->db()
            ->select($this->setTableFields(), true)
            ->from($this->setTableName());

        if($where){
            $this->db()
                ->where($where);
        }

        if($resultAs == self::RESULT_ACTIVE_RECORD){
            return $this->db();
        }elseif($resultAs == self::RESULT_OBJECT){
            return $this->db()
                ->get();
        }

        return $this->db()
            ->get()
            ->result_array();
    }

    public function create(array $data){
    }

    public function update(array $data, array $where){
    }

    public function delete(array $where){
    }

}


interface MY_CrudInterface {

    const RESULT_ARRAY = "array";
    const RESULT_OBJECT = "object";
    const RESULT_ACTIVE_RECORD = "active record";

    function setTableName();
    function setTableFields();

    function read (array $where, $resultAs = self::RESULT_ARRAY, $select);
    function create (array $data);
    function update (array $data, array $where);
    function delete (array $where);
}
