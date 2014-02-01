<?php
/**
 * Class DbTable
 *
 * @method DbTable where
 * @method DbTable where_in
 *
 */
abstract class DbTable extends DbTableAbstract{

    private $_tableName;
    private $_fieldPref;
    private $_keyField;

    function __construct(){
        parent::__construct();
        $this->_tableName = $this->_makeNameByClass();

        $this->_fieldPref = $this->_makePrefByTableName($this->_tableName);

        $this->makePrimaryField();

        $this->build();
    }

    function getFieldDbNamePref(){
        return $this->_fieldPref;
    }

    function _makePrefByTableName($tableName){
        return preg_replace("/(s$)/", "", $tableName)."_";
    }

    function _makeNameByClass(){
        $tableName = get_class($this);
        $tableName = preg_replace("/DbTable/", " ", $tableName);
        $tableName = preg_replace("/[_]+/", " ", $tableName);
        $tableName = preg_replace("/([A-Z])/", " $1", $tableName);
        $tableName = trim($tableName);
        $tableName = preg_replace("/[ _]+/", "_", $tableName);
        $tableName = strtolower($tableName);
        return $tableName;
    }

    final public function checkDb(){
        $tableName = $this->_tableName;

        if($this->db->simple_query("SELECT * FROM `".$tableName."` WHERE 0")){

            $tmpFields = $this->db->query("SHOW COLUMNS FROM ".$tableName);

            $tableFields = array();
            foreach($tmpFields->result_array() as $f){
                $tableFields[$f["Field"]] = $f;
            }

            foreach($this->_tableFieldsDb as $field){
                $query = $field->_updateQuery($tableFields);
                if($query){
                    dump($query);
                    $this->db->query($query);
                }
            }
            dump($tableFields);
        }else{
            $fields = array();
            $primaryList = array();
            $indexList = array();
            $uniqueList = array();
            $fulltextList = array();

            foreach($this->_tableFields as $field){
                $fields[]= $field->_buildQuery();

                if($field->getPrimary()) {
                    $primaryList[] = $field->getDbName();
                }
                if($field->getIndex()) {
                    $indexList[$field->getIndex()][] = $field->getDbName();
                }
                if($field->getUnique()) {
                    $uniqueList[] = $field->getDbName();
                }
                if($field->getFullText()) {
                    $fulltextList[] = $field->getDbName();
                }
            }

            $query =
                "CREATE TABLE IF NOT EXISTS ".$tableName
                ." (\n".implode(",\n",$fields)
                .(count($primaryList) ? ",\n PRIMARY KEY (`" . implode('`, `', $primaryList) . '`)' : "")
                .(isset($index)?",\n {$index}":'')
                .(isset($unique)?",\n {$unique}":'')
                .(isset($fulltext)?",\n {$fulltext}":'')
                ."\n)"
                ." ENGINE=".$this->_tableEngine
                ." DEFAULT CHARSET=".$this->_tableCharset
                ." AUTO_INCREMENT=1;";

            $this->db->query($query);

            dump($query);
        }
    }

    abstract function build();

    /**
     * @return DbTableField
     */
    function getKeyField(){
        return $this->_keyField;
    }

    /**
     * @return mixed
     */
    function getFieldPref(){
        return $this->_fieldPref;
    }

    function _regField(DbTableField &$field){
        $this->_tableFieldsDb[$field->getDbName()] = $this->_tableFields[$field->getAliasName()] = $field;
        return $field;
    }

    function makeField($aliasName, $dbName = null){

        if(is_null($dbName)){
            $dbName = $this->getFieldDbNamePref().$aliasName;
        }

        $field = new DbTableField($this);

        $field->setDbName($dbName);
        $field->setAliasName($aliasName);

        $this->_regField($field);

        return $field;
    }


    public function makePrimaryField(){


        if(!empty($this->_keyField)){
            trigger_error("primary key is was set!", E_USER_WARNING);
            exit;
        }

        $field = new DbTableFieldId($this);
        $field->setAliasName("id");
        $field->setDbName($this->getFieldDbNamePref()."id");

        $this->_keyField = &$this->_regField($field);
    }

    public function makeRelationWith($tableName, $asName = null){

        $fieldName = is_null($asName) ? $this->_makePrefByTableName($tableName)."id" : $asName;

        $field = new DbTableField($this);
        $field->setDbName($fieldName);
        $field->setAliasName($fieldName);
        $field->int(11);
        $field->unsigned();

        $this->_regField($field);

        return $field;
    }

    /**
     * @param $name
     *
     * @return DbTableField
     * @throws Exception
     */
    function getField($name){
        if(empty($this->_tableFields[$name])){
            trigger_error("table field '".$name."' is not defined in table declaration (build)");
            exit;
        }
        return $this->_tableFields[$name];
    }

    /**
     * @return array:DbTableField
     * @throws Exception
     */
    function getFields(){
        return $this->_tableFields;
    }

    function getName(){
        return $this->_tableName;
    }

    /**
     * @param null $fields
     * @return $this
     */
    function select($fields = null){

        if(is_null($fields)){
            $fields = array();
            foreach($fields as $field){
                $fieldObj = $this->getField($field);
                $_fields[$field] = $fieldObj->getDbParam("name");
            }
        }

        if(!is_array($fields)){
            $fields = array($fields);
        }

        $fields[$this->getKey()->getName()] = $this->getKey()->getDbName();

        $_fields = array();
        foreach($fields as $field){
            $fieldObj = $this->getField($field);
            $_fields[$field] = $fieldObj->getDbParam("name");
        }

        $this->db->select($_fields);
        return $this;
    }

    /**
     * @param string $returnFunc
     * @return mixed
     */
    function getResult($returnFunc = "result_array"){
        return $this->db->get($this->_tableName)->$returnFunc();
    }

    /**
     * @param $fieldName
     * @param $value
     * @return $this
     */
    function setValue($fieldName, $value){
        $field = $this->getField($fieldName);
        $fieldName = $field->getDbName();
        $this->db->set($fieldName, $field->prepareValue($value));
        return $this;
    }

    /**
     * @param string|array $val
     * @param $id
     * @return $this
     */
    function set($val, $id = null){

        if(!is_array($val)){
            $val = array($val);
        }

        foreach($val as $field => $value){
            $this->setValue($field, $value);
        }

        if(is_null($id)){
            $this->db->where($this->getKey()->getDbName(), $id);
            $this->db->update($this->_tableName);
        }else{
            $this->db->insert($this->_tableName);
        }

        return $this;
    }

    function remove($id){

        if(empty($id)){
            return $this;
        }

        if(!is_array($id)){
            $id = array($id);
        }

        $this->db->where_in($this->getKey()->getDbName(), $id);
        $this->db->delete($this->_tableName);

        return $this;
    }

    function __call($_funcName, $args = array()){
        if(method_exists($this->db, $_funcName)){
            call_user_func_array(array($this->db, $_funcName),$args);
            return $this;
        }
        $funcName = preg_replace("/^(get|set)/", "", $_funcName);
        $funcName = preg_replace("/([A-Z_])/", " $1", $funcName);
        $funcName = trim($funcName);
        $funcName = strtolower($funcName);
        $fieldName = preg_replace("/[ ]+/", "_", $funcName);

        if(!$fieldName){
            trigger_error("call method exception: field name is empty!");
            exit;
        }

        if(preg_match("/^get/", $_funcName)){

            $this->select($fieldName);
            return $this->getResult(empty($args[0]) ? "result_array" : $args[0]);

        }else if(preg_match("/^set/", $_funcName)){

            return $this->setValue($fieldName, empty($args[0]) ? null : $args[0]);

        }

        trigger_error("call method exception: invalid call format , you must use 'get' OR 'set' method names");
        exit;
    }

}