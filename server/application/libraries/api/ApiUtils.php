<?php


class ApiUtils {


    /**
     * @var ApiShuttle
     */
    private $_shuttle;

    function __construct(ApiShuttle $shuttle){
        $this->_shuttle = $shuttle;
    }

    public function toType ($var, $type) {
        switch ($type) {
            case Api::TYPE_NUMBER:
            case Api::TYPE_INTEGER:
                return intval(trim((string) $var));
            case Api::TYPE_FLOAT:
                return floatval(trim((string) $var));
            case Api::TYPE_BOOL:
            case Api::TYPE_BOOLEAN:
                return (bool) $var;
        }
        return trim((string) $var); // default type = string
    }

}