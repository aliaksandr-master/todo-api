<?php


abstract class DbTable_Statuses extends DbTable {

    function build(){

        $this->makeField("name")->varchar(255);
        $this->makeField("as_default")->bool()->setDefault(0);

    }

}