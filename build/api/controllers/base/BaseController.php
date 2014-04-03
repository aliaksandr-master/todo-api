<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');

class BaseController extends ApiController {

    /** @var CI_Loader */
    public $load;

	private static $instance;

	public function __construct () {
		parent::__construct();
		// base constructor
		$this->user = UserModel::instance();
	}

	public static function &get_instance () {
		return self::$instance;
	}

}

