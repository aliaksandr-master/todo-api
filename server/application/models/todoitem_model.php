<?php

class TodoItem_model extends MY_Model {

    public function getTableName() {
        return array('todo_item');
    }

    public function getTableFields() {
        return array(
            'id',
            'todo_id',
            'name',
            'is_active',
            'date_create',
            'sort_order'
        );
    }
}