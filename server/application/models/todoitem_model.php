<?php

class TodoItem_model extends BaseCrudModel {

    public function getTableName() {
        return 'todo_item';
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