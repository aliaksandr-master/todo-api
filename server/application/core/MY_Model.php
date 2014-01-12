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
        parent::__construct();
        $this->loader()->database();
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
    protected function getDb(){
        return $this->db;
    }

    public function read(array $where = null, $resultAs = self::RESULT_ARRAY, $select = null){

        if(is_null($select)){
            $select = $this->getTableFields();
        }else{
            if(!is_array($select)){
                $select = array($select);
            }
            $tableFields = $this->getTableFields();
            foreach($select as $field){
                if(!in_array($field, $tableFields)){
                    trigger_error('CRUD: SELECT has invalid field of "'.$this->getTableName().'" ['.implode(",", $select).'] ', E_USER_WARNING);
                    die();
                }
            }
        }

        if(is_null($where)){
            $where = array();
        }

        if(!is_array($where)){
            trigger_error("CRUD: WHERE is invalid (must be array!)", E_USER_WARNING);
            die();
        }

        $this->getDb()->select($select, true)->where($where)->from($this->getTableName());

        if($resultAs == self::RESULT_ACTIVE_RECORD){
            return $this->getDb();
        }

        $result = $this->getDb()->get();

        if($resultAs == self::RESULT_OBJECT){
            return $result;
        }

        return $result->result_array();
    }

    public function create(array $data){

        $tableFields = $this->getTableFields();

        foreach ($data as $key => $value){
            if(in_array($key, $tableFields)) {
                $this->getDb()->set($key, $value);
            } else {
                trigger_error('undefined key "'.$key.'" must be in array ['.implode(',', $tableFields).']', E_USER_WARNING);
                die();
            }
        }
        $this->getDb()
            ->from($this->getTableName())
            ->insert();

        return $this->getDb()->insert_id();


    }

    public function update(array $data, array $where){

        $tableFields = $this->getTableFields();

        foreach ($data as $key => $value){
            if(in_array($key, $tableFields)) {
                $this->getDb()->set($key, $value);
            } else {
                trigger_error('undefined key "'.$key.'" must be in array ['.implode(',', $tableFields).']', E_USER_WARNING);
                die();
            }
        }
        $this->getDb()
            ->from($this->getTableName())
            ->where($where)
            ->update();

        return $this->getDb()->result_id;
    }

    public function delete(array $where){
        $this->getDb()
            ->from($this->getTableName())
            ->where($where)
            ->delete();
        // TODO return boolean
        return true;
    }

}
