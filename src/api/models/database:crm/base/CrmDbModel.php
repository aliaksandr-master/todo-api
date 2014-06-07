<?php

abstract class CrmDbModel extends BaseCrudModel  {

	function getDbScheme () {
		return /*#:injectData("@VAR/database/scheme/crm.json")*/array()/*injectData#*/;
	}

	function getConnectDbParams () {
		return /*#:injectData(".developer/database/configs/crm.json")*/ array() /*injectData#*/;
	}

	function compileDbTableName () {
		$table = parent::compileDbTableName();
		$table = preg_replace('/^crm_*/', '', $table);
		return $table;
	}

}