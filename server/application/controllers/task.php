<?php

class Task extends MY_Controller {

    public function __construct() {
        parent::__construct();
        $this->loader()->model('Task_model');
    }

    public function create() {

        if (!empty($_POST['name'])) {

            $task = new Task_model();
            $data = $task->read();

            dump($task);

//            $data = array();


//            $data['name'] = $_POST['name'];
//            $data['name'] = $_POST['name'];

        }
    }


}