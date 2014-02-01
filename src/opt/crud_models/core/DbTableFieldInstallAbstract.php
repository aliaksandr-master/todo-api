<?php

class DbTableFieldInstallAbstract extends DbTableFieldPropsAbstract {

    public function _buildQuery(){
        $query = "".$this->getDbName()." ".$this->_getTypeQ();

        $query.= $this->getUnsigned() ? " UNSIGNED" : "";

        if($this->isText() || $this->isVarchar()){
            $query .=" CHARACTER SET ".$this->getTable()->_tableCharset." COLLATE ".$this->getTable()->_fieldCharset;
        }

        $query .= !is_null($this->getDefault()) ? " DEFAULT ".$this->getDefault()."" : "";
        $query .= $this->getAutoIncrement() ? " AUTO_INCREMENT" : "";

        $query .= $this->getNull() ? " NULL" : "";
        $query .= $this->getNotNull() ? " NOT NULL" : "";

        return " ".$query."";
    }

    private function _getTypeQ(){

        $query = $this->getDbType();

        $len = $this->getDbLength();

        $query.= $len ? "(".$len.")" : "";

        return $query;
    }

    public function _updateQuery($tableFields){
        $tableName = $this->getTable()->getName();

        if(isset($tableFields[$this->getDbName()])){

            $type =
                $this->getDbType()
                .(!is_null($this->getDbLength())?"(".$this->getDbLength().")":"")
                .($this->getUnsigned() ? " unsigned" : "");

            if(strtoupper($tableFields[$this->getDbName()]["Type"]) == strtoupper($type)){
                return "";
            }

            $query = 'ALTER TABLE '.$tableName.' CHANGE '.$this->_buildQuery();
        }else{
            $query = 'ALTER TABLE '.$tableName.' ADD  '.$this->_buildQuery();
        }

        dump($query);
        return $query;
    }


}