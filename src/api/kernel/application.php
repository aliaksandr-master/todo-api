<?php



/**
 * Class Application
 *
 * @field string $max_debug_level
 * @field string $debugMode
 * @field number $debugLevel
 */
class Application extends KernelApplication {

	const DEBUG_GET_PARAM = '_debug';

	protected $_CFG = /*#:injectData("@DEV/api/configs/api.json")*/ array() /*injectData#*/;

	protected $_CLASS_MAP = /*#:injectData("@VAR/classes/api.json")*/ array() /*injectData#*/;

	public function run () {

	}

}