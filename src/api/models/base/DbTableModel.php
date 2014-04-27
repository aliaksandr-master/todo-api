<?php



abstract class DbTableModel extends DbModel {

	private $_dbTableName = null;

	private $_dbTableFields = array();

	private $_dbTableScheme = array();


	function defaults () {
		return array();
	}


	function safeFieldsMap ($withoutKeys = array()) {
		if (!$withoutKeys) {
			$withoutKeys = array();
		}
		$withoutKeys = array_merge($withoutKeys, array($this->idAttribute()), $this->getPrimaryKeys());

		return $this->fieldsMap($withoutKeys);
	}


	function fieldsMap ($withoutKeys = array()) {
		if (!$withoutKeys) {
			$withoutKeys = array();
		}
		$fieldData = array();
		$fields = $this->getTableFields();
		$defaults = $this->defaults();
		foreach ($fields as $f) {
			if (empty($withoutKeys[$f])) {
				if (isset($defaults[$f])) {
					$fieldData[$f] = $defaults[$f];
				} else {
					$fieldData[$f] = null;
				}
			}
		}

		return $fieldData;
	}


	public function getPrimaryKeys () {
		return array();
	}

	final function getDbTableName () {
		if (empty($this->_dbTableName)) {
			$_tableName = ApiUtils::underscoreCase(get_class($this));
			$_tableName = preg_replace('/_*model.*$/i', '', $_tableName);
			$this->_dbTableName = $_tableName;
		}

		return $this->_dbTableName;
	}


	final function getDbTableScheme () {
		if (empty($this->_dbTableScheme)) {
			$dbScheme = $this->getDbScheme();
			$dbTableName = $this->getDbTableName();
			if (!isset($dbScheme[$dbTableName])) {
				trigger_error('Undefined table "'.$dbTableName.'" in db "'.$this->getDbName().'"', E_USER_ERROR);
			}
			$this->_dbTableScheme = $dbScheme[$dbTableName];
		}

		return $this->_dbTableScheme;
	}


	final function getTableFields () {
		if (empty($this->_dbTableFields)) {
			$this->_dbTableFields = array_keys($this->getDbTableScheme());
		}

		return $this->_dbTableFields;
	}


	public function idAttribute () {
		return "id";
	}
}