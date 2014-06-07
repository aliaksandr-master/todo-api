<?php

abstract class DefaultDbModel extends BaseCrudModel  {

	function getDbScheme () {
		return /*#:injectData("@VAR/database/scheme/default.json")*/array()/*injectData#*/;
	}

	function getConnectDbParams () {
		return /*#:injectData(".developer/database/configs/default.json")*/ array() /*injectData#*/;
	}

}