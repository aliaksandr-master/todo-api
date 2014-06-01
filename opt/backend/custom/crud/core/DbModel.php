<?php


require_once(OPT_DIR.DS.'vendor'.DS.'ci_active_record'.DS.'ci_active_record.init.php');



/**
 * Class DbModel
 */
abstract class DbModel extends Model {

	/**
	 * @var CI_DB_active_record $db
	 */
	protected $db;

	/**
	 * @var CI_DB_active_record[]
	 */
	private static $_dbConnection = array();


	/**
	 * @return string
	 */
	protected function getDbName () {
		$connection = $this->getConnectDbParams();
		return $connection['database'];
	}


	/**
	 * @return CI_DB_active_record
	 */
	protected function connection () {
		if (is_null($this->db)) {
			$this->db = $this->connect();
		}
		return $this->db;
	}


	/**
	 * @return array
	 */
	abstract protected function getConnectDbParams ();


	/**
	 * @return array
	 */
	abstract protected function getDbScheme ();


	/**
	 *
	 */
	protected function __construct () {

	}


	/**
	 * @return mixed
	 */
	protected function &connect () {
		$dbName = $this->getDbName();

		$params = $this->getConnectDbParams();

		if (empty(self::$_dbConnection[$dbName])) {
			self::$_dbConnection[$dbName] = CI_ActiveRecord::connect($params);
		}

		return self::$_dbConnection[$dbName];
	}

	public static function getAllDbConnections () {
		return self::$_dbConnection;
	}
}