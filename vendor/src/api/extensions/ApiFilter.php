<?php

class ApiFilter extends ApiComponent {

    public function apply ($value, $filterName, array $params = array(), $contextName = null, $strictObj = 'filter', $strictMessage = 'Undefined filter', $strictCode = 500) {
		$result = null;

		if (!empty($this->api->context)) {
			$result = $this->api->context->applyFilter ($value, $filterName, $params, $contextName);
		}

        if (is_null($result)) {
			$method = 'filter__'.$filterName;
			if (method_exists($this, $method)) {
				return $this->$method($value, $params, $contextName);
			}
			$this->api->$strictObj->error($strictMessage, $strictCode);
        }

        return $result;
    }

    function applyFilters ($value, $filters, $contextName = null) {
        if ($filters) {
            foreach ($filters as $filter) {
                $filterName = key($filter);
                $filterParams = $filter[$filterName];
                $value = $this->apply($value, $filterName, $filterParams, $contextName);
            }
        }
        return $value;
    }

	protected function filter__parse_xml ($string) {
		return $string ? (array) simplexml_load_string($string, 'SimpleXMLElement', LIBXML_NOCDATA) : array();
	}

	protected function filter__parse_csv ($string) {
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

	protected function filter__parse_form ($string) {
		$data = array();
		parse_str($string, $_body);
		return $data;
	}

	private function filter__to_json ($data, array $params = array(), $contextName = null) {
		return json_encode($data);
	}

	private function filter__to_jsonp ($data, array $params = array(), $contextName = null) {
		return $params[0].'('.$this->filter__to_json($data).');';
	}

	private function filter__parse_json ($string) {
		return json_decode(trim($string), true);
	}

	private function filter__parse_serialized ($string) {
		return unserialize(trim($string));
	}

    function filter__xss ($value, $params = array(), $name) {
        return $value;
    }

    function filter__trim ($value, $params = array(), $name) {
        return trim((string)$value);
    }

    function filter__to_int ($value, $params = array(), $name) {
        return (int) $value;
    }

    function filter__default ($value, $params = array(), $name) {
		$default = $params[0];
        return is_null($value) ? $default : 0;
    }

    function filter__abs ($value, $params = array(), $name) {
        return abs($value);
    }

    function filter__to_bool ($value, $params = array(), $name) {
        return (bool) $value;
    }

    function filter__to_float ($value, $params = array(), $name) {
        return (float) $value;
    }

}