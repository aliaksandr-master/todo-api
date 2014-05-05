<?php


require_once(OPT_DIR.DS.'ci_active_record'.DS.'ci_active_record.init.php');



/**
 * Class DbModel
 */
abstract class DbModel {

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
	abstract protected function getDbName ();


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
		$this->db = $this->connection();
	}


	/**
	 * @return mixed
	 */
	protected function &connection () {
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