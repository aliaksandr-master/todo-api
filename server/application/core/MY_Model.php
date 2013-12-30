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

        if(!is_null($select)){
            throw new Exception("incorrect selected format, must be array!");
        }

        $this->getDb()
            ->select($this->getTableFields(), true)
            ->from($this->getTableName());

        if($where){
            $this->getDb()
                ->where($where);
        }

        if($resultAs == self::RESULT_ACTIVE_RECORD){
            return $this->getDb();
        }elseif($resultAs == self::RESULT_OBJECT){
            return $this->getDb()
                ->get();
        }

        return $this->getDb()
            ->get()
            ->result_array();
    }

    public function create(array $data){

        $tableFields = $this->getTableFields();

        foreach ($data as $key => $value){
            if(in_array($key, $tableFields)) {
                $this->getDb()->set($key, $value);
            } else {
                throw new Exception('undefined key "'.$key.'" must be in array ['.implode(',', $tableFields).']');
            }
        }
        $this->getDb()
            ->from($this->getTableName())
            ->insert();

        return $this->getDb()->insert_id();


    }

    public function update(array $data, array $where){
    }

    public function delete(array $where){
    }

}
