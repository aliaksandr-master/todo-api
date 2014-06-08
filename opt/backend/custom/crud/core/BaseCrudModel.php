<?php



/**
 * Class BaseCrudModel
 */
abstract class BaseCrudModel extends DbTableModel implements ICRUDModel, IModelPromoter {


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

		$db = $this->connection();

		foreach ($data as $key => $value) {
			if (in_array($key, $tableFields)) {
				$db->set($key, $value);
			} else {
				trigger_error('undefined key "'.$key.'" must be in array ['.implode(',', $tableFields).']', E_USER_WARNING);
				die();
			}
		}

		$this->publish('dbQuery:create');
		$db->from($this->getDbTableName())->insert();
		return $db->insert_id();
	}

	public function &promoter ($name = 'get') {
		$criteria = new BaseCrudModelPromoter($this, $name);
		return $criteria;
	}

	public function count (array $where = array(), array $options = array()) {
		$this->publish('dbQuery:count');
		return $this->connection()
			->where($where)
			->count_all($this->getDbTableName());
	}

	/**
	 * @param null   $whereOrId
	 * @param array  $options
	 * @param string $resultAs
	 *
	 * @return CI_DB_active_record|object
	 */
	public function read ($whereOrId = null, array $options = array(), $resultAs = self::RESULT_ARRAY) {
		$select = isset($options['select']) ? $options['select'] : null;
		$limit  = isset($options['limit']) ? $options['limit'] : null;
		$offset = isset($options['offset']) ? $options['offset'] : null;


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
		$db = $this->connection()
			->select($select, true)
			->where($whereOrId)
			->from($this->getDbTableName());

		/** @var CI_DB_active_record $db */

		if (!is_null($limit)) {
			if (is_null($offset)) {
				$db->limit($limit);
			} else {
				$db->limit($limit, $offset);
			}
		}

		$this->publish('dbQuery:read');

		if ($resultAs == self::RESULT_ACTIVE_RECORD) {
			return $db;
		}

		$result = $db->get();

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

		$db = $this->connection();

		foreach ($data as $key => $value) {
			if (in_array($key, $tableFields)) {
				$db->set($key, $value);
			} else {
				trigger_error('undefined key "'.$key.'" must be in array ['.implode(',', $tableFields).']', E_USER_WARNING);
				die();
			}
		}
		$this->publish('dbQuery:update');
		$result = $db
			->where($whereOrId)
			->update($this->getDbTableName());
		return $result;
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

		$this->publish('dbQuery:delete');
		$this->connection()->from($this->getDbTableName())->where($whereOrId)->delete();

		// TODO return boolean
		return true;
	}
}
