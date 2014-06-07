<?php

abstract class TestDbModel extends BaseCrudModel  {

	function getDbName () {
		return 'default';
	}

	function getDbScheme () {
		return /*#:injectData("@VAR/database/scheme/test.json")*/array()/*injectData#*/;
	}

	function getConnectDbParams () {
		return /*#:injectData(".developer/database/configs/test.json")*/array()/*injectData#*/;
	}

}