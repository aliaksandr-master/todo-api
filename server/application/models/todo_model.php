<?php

class Todo_model extends MY_Model {

    public function getTableName() {
        return array('task');
    }

    public function getTableFields() {
        return array('type_id', 'name', 'date_creation', 'parent_id', 'sort_order');
    }
}