<?php


class DbTable_Users extends DbTable {

    function build(){

        $this->makeField("name")->varchar(255);
        $this->makeField("email")->varchar(255);
        $this->makeField("password")->varchar(255);

        $this->makeRelationWith("user_types");
        $this->makeRelationWith("user_statuses");
        $this->makeRelationWith("user_profiles");
        $this->makeRelationWith("user_accesses");

    }

}