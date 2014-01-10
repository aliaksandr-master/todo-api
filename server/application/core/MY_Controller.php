<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');

class MY_Controller extends CI_Controller {

    /**
     * @var DataTransfer
     */
    private $_dataTransfer = null;

    /**
     * @return CI_Loader
     */
    protected function loader(){
        return $this->load;
    }

    public function __construct(){
        parent::__construct();
    }

    /**
     * @var array|string $dataName [optional]
     * @var mixed $dataValue [optional]
     * @return DataTransfer
     */
    public function transfer($dataName = null, $dataValue = null){
        if(is_null($this->_dataTransfer)){
            require_once(APPPATH.'/libraries/data_transfer/DataTransfer.php');

            $this->_dataTransfer = new DataTransfer($this);
        }
        if(!is_null($dataName)){
            if(is_null($dataValue)){
                $this->_dataTransfer->data($dataName);
            }else{
                $this->_dataTransfer->data($dataName, $dataValue);
            }
        }
        return $this->_dataTransfer;
    }

    public function sendResponse(){
        $this->transfer()->sendRestControllerResponse();
        exit();
    }


    /**
     * @return CI_Output
     */
    protected function output(){
        return $this->output;
    }

    protected function checkTableField($name, $value){
        $userObject = new User_model();
        $user = $userObject->read(array($name => $value));
        return (!empty($user)) ? true : false;
    }
}

