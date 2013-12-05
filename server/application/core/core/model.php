<?php

interface MY_CrudInterface {

    const RESULT_ARRAY = "array";
    const RESULT_OBJECT = "object";
    const RESULT_ACTIVE_RECORD = "active record";

    function getTableName();

    function getTableFields();

    function read (array $where, $resultAs = self::RESULT_ARRAY, $select);
    function create (array $data);
    function update (array $data, array $where);
    function delete (array $where);
}

abstract class MY_Model extends CI_Model implements MY_CrudInterface {

    function __construct(){
        $this->load->database();
    }

    /**
     * @return CI_Loader
     */
    protected function loader(){
        return $this->load;
    }

    /**
     * @return CI_DB_active_record
     */
    protected function get_db(){
        return $this->db;
    }

    public function read(array $where = null, $resultAs = self::RESULT_ARRAY, $select = null){

        if(!is_null($select)){
            throw new Exception("incorrect selected format, must be array!");
        }

        $this->get_db()
            ->select($this->getTableFields(), true)
            ->from($this->getTableName());

        if($where){
            $this->get_db()
                ->where($where);
        }

        if($resultAs == self::RESULT_ACTIVE_RECORD){
            return $this->get_db();
        }elseif($resultAs == self::RESULT_OBJECT){
            return $this->get_db()
                ->get();
        }

        return $this->get_db()
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
