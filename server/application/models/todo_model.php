<?php

class Todo_model extends MY_Model {

    public function getTableName() {
        return array('todo');
    }

    public function getTableFields() {
        return array('name', 'date_create', 'sort_order', 'link');
    }
}