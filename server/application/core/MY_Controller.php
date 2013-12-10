<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');

class MY_Controller extends CI_Controller {

    /**
     * @return CI_Loader
     */
    protected function loader(){
        return $this->load;
    }
}

