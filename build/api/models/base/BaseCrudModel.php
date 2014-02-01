<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');


abstract class BaseCrudModel implements ICrudMoldel {

    private static $_instances = array();

    private static $_dbConnection = array();
    private static $_dbSchemes = array();

    /**
     * @var CI_DB_active_record $db
     */
    protected $db;
    private $_dbScheme = array();
    protected $_tableName = null;
    private $_tableFields = array();
    private $_tableFieldsWithAttr = array();

    function getDbName () {
        return 'default';
    }

    final function getTableName () {
        return $this->_tableName;
    }

    final function getTableFields ($withAttributes = false) {
        return $withAttributes ? $this->_tableFieldsWithAttr : $this->_tableFields;
    }

    function checkApiInput(array $nameFieldToInputMap = array()){
        $api = &get_instance()->api;
        /* @var Api $api  */
        $input = $api->input->get();
        $status = true;
        $fields = $this->getTableFields(true);
        foreach($input as $key => $value){
            $name = $key;
            if(isset($nameFieldToInputMap[$name])){
                $name = $nameFieldToInputMap[$name];
            }
            $value = $api->input->get($name);
            if (is_bool($value)) {
                $value = 1 * $value;
            }
            if (isset($value) && $fields[$name]['length'] && strlen((string)$value) > $fields[$name]['length']){
                $api->input->error($name, "max_length", array($fields[$name]['length']), 400);
                $status = false;
            }
        }
        if ($api->hasError()){
            $api->output->send();
        }
        return $status;
    }

    public function idAttribute(){
        return "id";
    }

    public static function instance () {
        $className = get_called_class();
        if(empty(self::$_instances[$className])){
            self::$_instances[$className] = new $className();
        }
        return self::$_instances[$className];
    }

    private function __construct () {
        $dbName = $this->getDbName();
        if (!isset(self::$_dbConnection[$dbName])) {
            self::$_dbConnection[$dbName] = get_instance()->load->database($dbName, true);
        }
        if (!isset(self::$_dbSchemes[$dbName])) {
            self::$_dbSchemes[$dbName] = MVar::get('db.'.$dbName.'.scheme.parsed');
        }

        $this->_dbScheme = self::$_dbSchemes[$dbName];
        $this->db = self::$_dbConnection[$dbName];

        if (is_null($this->_tableName)) {
            $this->_tableName = Utils::underscoreCase(get_class($this));
            $this->_tableName = preg_replace('/[_]*model(.*)$/i', '', $this->_tableName);
        }

        $this->_tableFieldsWithAttr = $this->_dbScheme[$this->getTableName()];
        $this->_tableFields         = array_keys($this->_tableFieldsWithAttr);
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
