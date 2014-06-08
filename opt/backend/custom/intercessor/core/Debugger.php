<?php

namespace Intercessor;

class Debugger {

	private static $_debug = false;

	private static $_initCounter = 0;

	private static $_dumps = array();

	private static $_logs = array();

	private static $_timers = array();

	public static function init ($debug) {
		if (self::$_initCounter++) {
			return self::$_initCounter;
		}
		self::$_debug = (bool) $debug;
		self::startTimer('application');
		self::log('init');
		return self::$_initCounter;
	}

	public static function startTimer ($name) {
		self::$_timers[self::$_initCounter][$name]['start'][] = gettimeofday(true);
	}

	public static function stopTimer ($name) {
		self::$_timers[self::$_initCounter][$name]['stop'][] = gettimeofday(true);
	}

	public static function addTimer ($name, $start, $stop = null) {
		self::$_timers[self::$_initCounter][$name]['start'][] = $start;
		self::$_timers[self::$_initCounter][$name]['stop'][] = is_null($stop) ? gettimeofday(true) : $stop;
	}

	static function log () {
		$args = func_get_args();
		$log['name'] = $args[0];
		unset($args[0]);
		$log['time'] = gettimeofday(true);
		if (sizeof($args) && !empty($args[1])) {
			$log['args'] = $args;
		}
		self::$_logs[self::$_initCounter][] = $log;
	}

	static function dump ($var) {
		self::$_dumps[self::$_initCounter][] = $var;
	}

	static function flush () {
		self::log('flush');
		self::stopTimer('application');
		$number = self::$_initCounter--;

		$dumps  = isset(self::$_dumps[$number]) ? self::$_dumps[$number] : array();
		$timers = isset(self::$_timers[$number]) ? self::$_timers[$number] : array();
		$logs   = isset(self::$_logs[$number]) ? self::$_logs[$number] : array();

		self::$_logs[$number]   = array();
		self::$_timers[$number] = array();
		self::$_dumps[$number]  = array();

		return array(
			'dump' => $dumps,
			'timers' => $timers,
			'logs' => $logs,
		);
	}

}