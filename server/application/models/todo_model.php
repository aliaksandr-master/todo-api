<?php

class Todo_model extends BaseCrudModel {

    public function getTableName() {
        return 'todo';
    }

    public function getTableFields() {
        return array(
            'id',
            'name',
            "is_shared",
            'date_create',
            'sort_order',
            'link'
        );
    }
}