<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');


/**
 * Class MY_Model
 * @var CI_DB_active_record db
 * @var CI_Loader load
 *
 */
abstract class BaseCrudModel extends CI_Model implements ICrudMoldel {

    function __construct () {
        parent::__construct();
        $this->load->database();
    }

    function defaults(){
        return array();
    }

    function safeFieldsMap($withoutKeys = array()){
        if (!$withoutKeys) {
            $withoutKeys = array();
        }
        $withoutKeys = array_merge($withoutKeys, array($this->idAttribute()), $this->getPrimaryKeys());
        return $this->fieldsMap($withoutKeys);
    }

    function fieldsMap ($withoutKeys = array()) {
        if (!$withoutKeys) {
            $withoutKeys = array();
        }
        $fieldData = array();
        $fields = $this->getTableFields();
        $defaults = $this->defaults();
        foreach ($fields as $f) {
            if (empty($withoutKeys[$f])) {
                if (isset($defaults[$f])) {
                    $fieldData[$f] = $defaults[$f];
                } else {
                    $fieldData[$f] = null;
                }
            }
        }
        return $fieldData;
    }

    public function read($whereOrId = null, $resultAs = self::RESULT_ARRAY, $select = null){

        // CHECK SELECT DATA
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

        // CHECK WHERE
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

        // EXECUTE
        $this->db
            ->select($select, true)
            ->where($whereOrId)
            ->from($this->getTableName());

        if($resultAs == self::RESULT_ACTIVE_RECORD){
            return $this->db;
        }

        $result = $this->db->get();

        if($resultAs == self::RESULT_OBJECT){
            return $result;
        }

        return $result->result_array();
    }

    public function create(array $data){

        $tableFields = $this->getTableFields();

        foreach ($data as $key => $value){
            if(in_array($key, $tableFields)) {
                $this->db->set($key, $value);
            } else {
                trigger_error('undefined key "'.$key.'" must be in array ['.implode(',', $tableFields).']', E_USER_WARNING);
                die();
            }
        }
        $this->db
            ->from($this->getTableName())
            ->insert();

        return $this->db->insert_id();
    }

    public function idAttribute(){
        return "id";
    }

    public function getPrimaryKeys(){
        return array();
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
                $this->db->set($key, $value);
            } else {
                trigger_error('undefined key "'.$key.'" must be in array ['.implode(',', $tableFields).']', E_USER_WARNING);
                die();
            }
        }
        $this->db
            ->from($this->getTableName())
            ->where($whereOrId)
            ->update();

        return $this->db->result_id;
    }

    public function delete($whereOrId){

        if(!is_array($whereOrId)){
            $whereOrId = array(
                $this->idAttribute() => $whereOrId
            );
        }

        $this->db
            ->from($this->getTableName())
            ->where($whereOrId)
            ->delete();

        // TODO return boolean
        return true;
    }


}
