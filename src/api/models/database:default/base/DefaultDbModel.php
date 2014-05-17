<?php

abstract class DefaultDbModel extends BaseCrudModel  {

	function getDbName () {
		return 'default';
	}

	function getDbScheme () {
		return
			//#:injectData("@VAR/database/default.scheme.json")
			array()
			//injectData#
			;
	}

	function getConnectDbParams () {
		return
			//#:injectData(".developer/configs/database/default.json")
			array()
			//injectData#
			;
	}

}