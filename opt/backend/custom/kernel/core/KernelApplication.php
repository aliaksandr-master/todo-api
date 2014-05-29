<?php

abstract class KernelApplication {

	protected $_CFG = array();
	protected $_CLASS_MAP = array();

	protected $_debugMode = null;
	protected $_debugLevel = null;

	function __construct () {
		$this->_initDebug();
	}

	function __get ($name) {
		if (!isset($this->_CFG[$name])) {
			$varName = '_'.$name;
			if (isset($this->$varName)) {
				return $this->$varName;
			}
			trigger_error('undefined config key "'.$name.'"', E_USER_ERROR);
		}
		return $this->_CFG[$name];
	}


	function loadClass ($name) {
		$path = Utils::get($this->_CLASS_MAP, $name);
		if (isset($path)) {
			require_once(DIR.DS.'..'.DS.$path);
		}
	}

	protected function _initDebug () {
		$modeFromGet = Utils::get($_GET, $this->debug_get_param, $this->default_debug_level);
		$this->_debugMode = in_array($modeFromGet, $this->debug_levels) ? $modeFromGet : $this->debug_levels[$this->default_debug_level];
		$levels = array_flip($this->debug_levels);
		$this->_debugLevel = Utils::get($levels, $this->_debugMode, $this->default_debug_level);
		$this->_debugLevel = $this->max_debug_level < $this->_debugLevel ? $this->max_debug_level : $this->_debugLevel;
		$this->_debugMode = $this->debug_levels[$this->_debugLevel];


		if ($this->_debugLevel > 1) {
			ini_set('xdebug.overload_var_dump', '0');
			ini_set('xdebug.auto_trace', 'On');
			ini_set('xdebug.show_local_vars', 'On');
			ini_set('xdebug.var_display_max_depth', '15');
			ini_set('xdebug.dump_globals', 'On');
			ini_set('xdebug.collect_params', '4');
			ini_set('xdebug.dump_once', 'Off');
			ini_set('xdebug.cli_color', 'Off');
			ini_set('xdebug.show_exception_trace', 'On');
		}
	}

	abstract public function run ();

}