<?php



/**
 * Class Verifier
 */
class Verifier {

	/**
	 * @var BaseController
	 */
	private $controller = null;

	/**
	 * @var Intercessor
	 */
	private $api = null;

	public function __construct (&$controller, Intercessor &$api) {
		$this->controller = $controller;
		$this->api = $api;
	}

	public function apply ($value, $ruleName, array $params = array(), $contextName = null) {
		return $this->{'rule_'.$ruleName}($value, $params, $contextName);
	}

	/*---------------------------------------------- VALIDATION RULES ----------------------------*/

	private function rule_valid_ip ($value, array $params = array(), $name = null) {
		$which = strtolower(isset ($params[0]) ? $params[0] : '');
		$flag = ($which == 'ipv4' ? FILTER_FLAG_IPV4 : ($which == 'ipv6' ? FILTER_FLAG_IPV6 : ''));
		return (bool) filter_var($value, FILTER_VALIDATE_IP, $flag);
	}

	private function rule_required ($value, array $params = array(), $name = null) {
		return isset($value) && strlen((string) $value);
	}

	private function rule_need ($value, array $params = array(), $name = null) {
		$existFiled = $params[0];
		return $this->rule_required($this->api->request->get($existFiled), array($existFiled), $name);
	}

	private function rule_matches ($value, array $params = array(), $name = null) {
		$matchFieldName = $params[0];
		return (bool) ($value === $this->api->request->get($matchFieldName, null));
	}

	private function rule_min_length ($value, array $params = array(), $name = null) {
		$length = $params[0];
		if (preg_match("/[^0-9]/", $length)){
			return false;
		}
		if (function_exists('mb_strlen')) {
			return !(mb_strlen($value) < $length);
		}
		return !(strlen($value) < $length);
	}

	private function rule_max_length ($value, array $params = array(), $name = null) {
		$length = $params[0];
		if (preg_match("/[^0-9]/", $length)){
			return false;
		}
		if (function_exists('mb_strlen')){
			return !(mb_strlen($value) > $length);
		}
		return !(strlen($value) > $length);
	}

	private function rule_exact_length ($value, array $params = array(), $name = null) {
		$length = $params[0];
		if (preg_match("/[^0-9]/", $length)){
			return false;
		}
		if (function_exists('mb_strlen')){
			return (bool) (mb_strlen($value) == $length);
		}
		return (bool) (strlen($value) == $length);
	}

	private function rule_valid_email ($value, array $params = array(), $name = null) {
		return (bool) preg_match("/^([a-z0-9\+_\-]+)(\.[a-z0-9\+_\-]+)*@([a-z0-9\-]+\.)+[a-z]{2,6}$/ix", $value);
	}

	private function rule_alpha ($value, array $params = array(), $name = null) {
		return (bool) preg_match("/^([a-z])+$/i", $value);
	}

	private function rule_alpha_numeric ($value, array $params = array(), $name = null) {
		return (bool) preg_match("/^([a-z0-9])+$/i", $value);
	}

	private function rule_alpha_dash ($value, array $params = array(), $name = null) {
		return (bool) preg_match("/^([-a-z0-9_-])+$/i", $value);
	}

	private function rule_numeric ($value, array $params = array(), $name = null) {
		return (bool) preg_match('/^[\-+]?\d*\.?\d+$/', $value);
	}

	private function rule_integer ($value, array $params = array(), $name = null) {
		return (bool) preg_match('/^[\-+]?\d+$/', $value);
	}

	private function rule_decimal ($value, array $params = array(), $name = null) {
		return (bool) preg_match('/^\d+$/', $value);
	}

	private function rule_is_natural ($value, array $params = array(), $name = null) {
		return (bool) preg_match( '/^[0-9]+$/', $value);
	}

	private function rule_float ($value, array $params = array(), $name = null) {
		return (bool) preg_match('/^[\-+]?[0-9]+(\.[0-9]+)?([eE][\-+]?[0-9]+)?$/', $value);
	}

	private function rule_is_natural_no_zero ($value, array $params = array(), $name = null) {
		return (bool) (preg_match( '/^[0-9]+$/', $value) && $value != 0);
	}

	private function rule_valid_base64 ($value, array $params = array(), $name = null) {
		return (bool) ! preg_match('/[^a-zA-Z0-9\/\+=]/', $value);
	}

	private function rule_valid_url ($value, array $params = array(), $name = null) {
		return filter_var($value, FILTER_VALIDATE_URL);
	}

	private function rule_valid_date ($value, array $params = array(), $name = null) {
		$stamp = strtotime($value);
		if (is_numeric($stamp)) {
			return (bool) checkdate(date( 'm', $stamp ), date( 'd', $stamp ), date( 'Y', $stamp ));
		}
		return false;
	}


}