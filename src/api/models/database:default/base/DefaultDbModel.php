<?php

abstract class DefaultDbModel extends BaseCrudModel  {

	function getDbName () {
		return 'default';
	}

	function getDbScheme () {
		return
			//#:injectData("build/compiled.temp/database/default.scheme.json")
			array()
			//injectData#
			;
	}

	function getConnectDbParams () {
		return
			//#:injectData("_local/database.json", "default")
			array()
			//injectData#
			;
	}

}