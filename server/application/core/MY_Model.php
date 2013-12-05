<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');

abstract class MY_Model extends CI_Model implements MY_Crud_Interface {

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

    public function read(array $where, $resultAs = self::RESULT_ARRAY, $select = null){

        if(!is_null($select)){
            throw new Exception("incorrect selected format, must be array!");
        }

        $this->db()
            ->select($this->setTableFields())
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

        $tableFields = $this->setTableFields();

        foreach ($data as $key => $value){
            if(in_array($key, $tableFields)) {
                $this->db()->set($key, $value);
            } else {
                throw new Exception('undefined key "'.$key.'" must be in array ['.implode(',', $tableFields).']');
            }
        }
        $this->db()->update();

        return $this->db()->result_id;

//       TODO return ID


    }

    public function update(array $data, array $where){

        
    }

    public function delete(array $where){
    }

}


interface MY_Crud_Interface {

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
