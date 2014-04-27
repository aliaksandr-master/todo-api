<?php



/**
 * Class BaseCrudModel
 */
abstract class BaseCrudModel extends DbTableModel implements ICrudMoldel {


	/**
	 * @var BaseCrudModel[] $_instances
	 */
	private static $_instances = array();


	/**
	 * @return BaseCrudModel
	 */
	public static function instance () {
		$className = get_called_class();
		if (empty(self::$_instances[$className])) {
			self::$_instances[$className] = new $className();
		}

		return self::$_instances[$className];
	}


	/**
	 * @param array $data
	 *
	 * @return mixed
	 */
	public function create (array $data) {
		$tableFields = $this->getTableFields();

		foreach ($data as $key => $value) {
			if (in_array($key, $tableFields)) {
				$this->db->set($key, $value);
			} else {
				trigger_error('undefined key "'.$key.'" must be in array ['.implode(',', $tableFields).']', E_USER_WARNING);
				die();
			}
		}

		$this->db->from($this->getDbTableName())->insert();

		return $this->db->insert_id();
	}


	/**
	 * @param null   $whereOrId
	 * @param string $resultAs
	 * @param null   $select
	 *
	 * @return CI_DB_active_record|object
	 */
	public function read ($whereOrId = null, $resultAs = self::RESULT_ARRAY, $select = null) {

		// CHECK SELECT DATA
		if (is_null($select)) {
			$select = $this->getTableFields();
		} else {
			if (!is_array($select)) {
				$select = array($select);
			}
			$tableFields = $this->getTableFields();
			foreach ($select as $field) {
				if (!in_array($field, $tableFields)) {
					trigger_error('CRUD: SELECT has invalid field of "'.$this->getDbTableName().'" ['.implode(",", $select).'] ', E_USER_WARNING);
					die();
				}
			}
		}

		// CHECK WHERE
		if (is_null($whereOrId)) {
			$whereOrId = array();
		} else {
			if (!is_array($whereOrId)) {
				$whereOrId = array($this->idAttribute() => $whereOrId);
			}
		}
		if (!is_array($whereOrId)) {
			trigger_error("CRUD: WHERE is invalid (must be array!)", E_USER_ERROR);
			die();
		}

		// EXECUTE
		$this->db->select($select, true)->where($whereOrId)->from($this->getDbTableName());

		if ($resultAs == self::RESULT_ACTIVE_RECORD) {
			return $this->db;
		}

		$result = $this->db->get();

		if ($resultAs == self::RESULT_OBJECT) {
			return $result;
		}

		return $result->result_array();
	}


	/**
	 * @param array $data
	 * @param       $whereOrId
	 *
	 * @return bool
	 */
	public function update (array $data, $whereOrId) {
		if (!is_array($whereOrId)) {
			$whereOrId = array($this->idAttribute() => $whereOrId);
		}

		$tableFields = $this->getTableFields();

		foreach ($data as $key => $value) {
			if (in_array($key, $tableFields)) {
				$this->db->set($key, $value);
			} else {
				trigger_error('undefined key "'.$key.'" must be in array ['.implode(',', $tableFields).']', E_USER_WARNING);
				die();
			}
		}
		$this->db->from($this->getDbTableName())->where($whereOrId)->update();

		return $this->db->result_id;
	}


	/**
	 * @param $whereOrId
	 *
	 * @return bool
	 */
	public function delete ($whereOrId) {

		if (!is_array($whereOrId)) {
			$whereOrId = array($this->idAttribute() => $whereOrId);
		}

		$this->db->from($this->getDbTableName())->where($whereOrId)->delete();

		// TODO return boolean
		return true;
	}
}
