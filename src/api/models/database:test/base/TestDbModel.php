<?php

abstract class TestDbModel extends BaseCrudModel  {

	function getDbName () {
		return 'default';
	}

	function getDbScheme () {
		return /*#:injectData("@VAR/database/scheme/test.json")*/array()/*injectData#*/;
	}

	function getConnectDbParams () {
		return /*#:injectData(".developer/configs/database/test.json")*/array()/*injectData#*/;
	}

}