<?php

abstract class DbTable_Tree extends DbTable{

    protected function buildInstance(array $materialTables){

        $this->makeField("nl", "nl")->int(11);        // left
        $this->makeField("nr", "nr")->int(11);        // right
        $this->makeField("nd", "nr")->int(11);        // deep
        $this->makeField("nc", "nc")->varchar(255);   // code

        foreach($materialTables as $tableName){
            $this->makeRelationWith($tableName);
        }

    }

    protected function _path2array($path){
        return preg_split("/[\/\\\]+/",$path);
    }

    function getAllNodesByPath($path, $rel = true){

        $arr = $this->_path2array($path);

        //$p;

    }

    function getChildrenByPath($path, $rel = true){

    }

    function getNodeByPath($path, $rel = true){

    }

    function get(){

    }
}