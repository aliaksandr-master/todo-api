<?php

class ApiFormat extends ApiComponent {

	const TYPE_TEXT = 'text';
	const TYPE_DECIMAL = 'decimal';
	const TYPE_STRING = 'string';
	const TYPE_INTEGER = 'integer';
	const TYPE_FLOAT = 'float';
	const TYPE_BOOLEAN = 'boolean';

    public function applyFormat ($value, $formatName, array $params = array(), $contextName = null) {
        $method = '_format__'.$formatName;
        if (method_exists($this->api->context, $method)) {
            return $this->api->context->$method($value, $params, $contextName);
        }
        return $this->$method($value, $params, $contextName);
    }

    public function applyParse ($value, $parserName, array $params = array(), $contextName = null) {
        $method = '_parse__'.$parserName;
        if (method_exists($this->api->context, $method)) {
            return $this->api->context->$method($value, $params, $contextName);
        }
        return $this->$method($value, $params, $contextName);
    }

    public function toType ($var, $type, $param = null) {
        switch ($type) {
            case ApiFormat::TYPE_DECIMAL:
            case ApiFormat::TYPE_INTEGER:
                return intval(trim((string) $var));
            case ApiFormat::TYPE_FLOAT:
                return floatval(trim((string) $var));
            case ApiFormat::TYPE_BOOLEAN:
                return (bool) $var;
        }
        return trim((string) $var); // default type = string
    }


    /*---------------------------------------------- PARSE FORMAT ----------------------------*/

    protected function _parse__xml ($string) {
        return $string ? (array) simplexml_load_string($string, 'SimpleXMLElement', LIBXML_NOCDATA) : array();
    }

    protected function _parse__csv ($string) {
        $data = array();
        // Splits
        $rows = explode("\n", trim($string));
        $headings = explode(',', array_shift($rows));
        foreach ($rows as $row) {
            // The substr removes " from start and end
            $data_fields = explode('","', trim(substr($row, 1, -1)));

            if (count($data_fields) == count($headings))
            {
                $data[] = array_combine($headings, $data_fields);
            }
        }
        return $data;
    }

    private function _parse__json($string) {
        return json_decode(trim($string));
    }

    private function _parse__serialize($string){
        return unserialize(trim($string));
    }

    /*---------------------------------------------- FORMAT ----------------------------*/

    private function _format__xml ($data, array $params = array(), $contextName = null) {

    }

    private function _format__json ($data, array $params = array(), $contextName = null) {
        return json_encode($data);
    }

    private function _format__cvs () {

    }

    private function _format__txt () {

    }

    private function _format__jsonp ($data, array $params = array(), $contextName = null) {
        return $params[0].'('.json_encode($data).')';
    }

}