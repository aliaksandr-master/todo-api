<?php

class DbTableFieldId extends DbTableField {

    function __construct(DbTable &$table){
        parent::__construct($table);

        $this->int(11);
        $this->unsigned();
        $this->primary();
        $this->autoIncrement();
    }

}