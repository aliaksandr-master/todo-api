<?php

abstract class DefaultDbModel extends BaseCrudModel  {

	function getDbName () {
		return 'default';
	}

	function getDbScheme () {
		return
			//#:injectData("tmp/database/default.scheme.json")
			array()
			//injectData#
			;
	}

	function getConnectDbParams () {
		return
			//#:injectData("_local/configs/database/default.json")
			array()
			//injectData#
			;
	}

}