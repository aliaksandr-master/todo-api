<?php

class Filterer {

	private $controller = null;
	private $api = null;

	public function __construct (&$controller, &$api) {
		$this->controller = $controller;
		$this->api = $api;
	}

	public function apply ($value, $filterName, array $params = array()) {
		return $this->{'filter__'.$filterName}($value, $params);
	}

	public function filter__to_type ($value, $params) {
		$type = $params[0];
		switch ($type) {
			case 'decimal':
			case 'integer':
				return intval(trim((string) $value));
			case 'float':
				return floatval(trim((string) $value));
			case 'boolean':
				return (bool) $value;
		}
		return trim((string) $value); // default type = string
	}

	protected function filter__parse_xml ($string, array $params = array()) {
		return $string ? (array) simplexml_load_string($string, 'SimpleXMLElement', LIBXML_NOCDATA) : array();
	}

	protected function filter__parse_csv ($string, array $params = array()) {
		$data = array();
		// Splits
		$rows = explode("\n", trim($string));
		$headings = explode(',', array_shift($rows));
		foreach ($rows as $row) {
			// The substr removes " from start and end
			$data_fields = explode('","', trim(substr($row, 1, -1)));

			if (count($data_fields) == count($headings)) {
				$data[] = array_combine($headings, $data_fields);
			}
		}
		return $data;
	}

	protected function filter__parse_form ($string, array $params = array()) {
		$data = array();
		parse_str($string, $_body);
		return $data;
	}

	private function filter__to_json ($data, array $params = array()) {
		return json_encode($data);
	}

	private function filter__to_jsonp ($data, array $params = array()) {
		return $params[0].'('.$this->filter__to_json($data).');';
	}

	private function filter__parse_json ($string, array $params = array()) {
		return json_decode(trim($string), true);
	}

	private function filter__parse_serialized ($string, array $params = array()) {
		return unserialize(trim($string));
	}

	function filter__xss ($value, array $params = array()) {
		return $value;
	}

	function filter__trim ($value, array $params = array()) {
		return trim((string)$value);
	}

	function filter__to_int ($value, array $params = array()) {
		return (int) $value;
	}

	function filter__default ($value, array $params = array()) {
		$default = $params[0];
		return is_null($value) ? $default : 0;
	}

	function filter__abs ($value, array $params = array()) {
		return abs($value);
	}

	function filter__to_bool ($value, array $params = array()) {
		return (bool) $value;
	}

	function filter__to_float ($value, array $params = array()) {
		return (float) $value;
	}

}