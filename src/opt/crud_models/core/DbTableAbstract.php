<?php

abstract class DbTableAbstract{

    /**
     * @var array:DbTableField
     */
    protected $_tableFields = array();
    protected $_tableFieldsDb = array();

    public $_tableCharset = "utf8";
    public $_tableEngine  = "InnoDb";
    public $_fieldCharset = 'utf8_unicode_ci';

    /**
     * @var CI_Controller
     */
    public $ci;

    /**
     * @var CI_DB_driver $db
     */
    public $db;

    function __construct(){
        $this->ci = &get_instance();

        $this->ci->load->database();

        $this->db = &$this->ci->db;
    }
}