<?php

interface MY_CrudInterface {

    const RESULT_ARRAY = "array";
    const RESULT_OBJECT = "object";
    const RESULT_ACTIVE_RECORD = "active record";

    function getTableName();
    function getTableFields();

    function read ($whereOrId, $resultAs = self::RESULT_ARRAY, $select);
    function create (array $data);
    function update (array $data, $whereOrId);
    function delete ($whereOrId);
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

    public function read($whereOrId = null, $resultAs = self::RESULT_ARRAY, $select = null){

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

        if(is_null($whereOrId)){
            $whereOrId = array();
        } else if(!is_array($whereOrId)){
            $whereOrId = array(
                $this->idAttribute() => $whereOrId
            );
        }

        if(!is_array($whereOrId)){
            trigger_error("CRUD: WHERE is invalid (must be array!)", E_USER_ERROR);
            die();
        }

        $this->getDb()->select($select, true)->where($whereOrId)->from($this->getTableName());

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

    public function idAttribute(){
        return "id";
    }

    public function update(array $data, $whereOrId){

        if(!is_array($whereOrId)){
            $whereOrId = array(
                $this->idAttribute() => $whereOrId
            );
        }

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
            ->where($whereOrId)
            ->update();

        return $this->getDb()->result_id;
    }

    public function delete($whereOrId){

        if(!is_array($whereOrId)){
            $whereOrId = array(
                $this->idAttribute() => $whereOrId
            );
        }

        $this->getDb()
            ->from($this->getTableName())
            ->where($whereOrId)
            ->delete();
        // TODO return boolean
        return true;
    }

}
