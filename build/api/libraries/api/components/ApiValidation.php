<?php

class ApiValidation extends ApiComponentAbstract {

    public function applyRule ($value, $ruleName, array $params = array(), $contextName = null) {
        $method = '_rule__'.$ruleName;

        if (method_exists($this->api->context, $method)) {
            return $this->api->context->$method($value, $params, $contextName);
        }

        return $this->$method($value, $params, $contextName);
    }

    function ruleError ($inputParamName, $ruleName, array $ruleParams = array(), $statusCode = 400) {
        $this->_errors[$inputParamName][$ruleName] = $ruleParams;
        $this->api->output->status($statusCode);
        return $this;
    }

    function validate ($fieldName, $value, array $validation, $setError = false) {
        $error = false;

        $rules = $validation['rules'];
        $required = !empty($validation["required"]);

        if($required && !$this->api->validation->applyRule($value, 'required')){
            if ($setError) {
                $this->ruleError($fieldName, 'required', array(), 400);
            }
            $error = true;
        }

        if (!$error && isset($value) && (strlen((string)$value) || $value === false)) {
            foreach ($rules as $rule) {
                $ruleName = key($rule);
                $ruleParams = $rule[$ruleName];
                if (!$this->api->validation->applyRule($value, $ruleName, $ruleParams, $fieldName)) {
                    if ($setError) {
                        $this->ruleError($fieldName, $ruleName, $ruleParams, 400);
                    }
                    $error = true;
                    break;
                }
            }
        }
        return !$error;
    }

    /*---------------------------------------------- VALIDATION RULES ----------------------------*/

    private function _rule__valid_ip ($value, array $params = array(), $name = null) {
        $which = strtolower(isset ($params[0]) ? $params[0] : '');
        $flag = ($which == 'ipv4' ? FILTER_FLAG_IPV4 : ($which == 'ipv6' ? FILTER_FLAG_IPV6 : ''));
        return (bool) filter_var($value, FILTER_VALIDATE_IP, $flag);
    }

    private function _rule__required ($value, array $params = array(), $name = null) {
        return isset($value) && strlen((string) $value);
    }

    private function _rule__need ($value, array $params = array(), $name = null) {
        $existFiled = $params[0];
        return $this->_rule__required($this->api->input->get($existFiled), array($existFiled), $name);
    }

    private function _rule__matches ($value, array $params = array(), $name = null) {
        $matchFieldName = $params[0];
        return (bool) ($value === $this->api->input->get($matchFieldName, null));
    }

    private function _rule__min_length ($value, array $params = array(), $name = null) {
        $length = $params[0];
        if (preg_match("/[^0-9]/", $length)){
            return false;
        }
        if (function_exists('mb_strlen')) {
            return !(mb_strlen($value) < $length);
        }
        return !(strlen($value) < $length);
    }

    private function _rule__max_length ($value, array $params = array(), $name = null) {
        $length = $params[0];
        if (preg_match("/[^0-9]/", $length)){
            return false;
        }
        if (function_exists('mb_strlen')){
            return !(mb_strlen($value) > $length);
        }
        return !(strlen($value) > $length);
    }

    private function _rule__exact_length ($value, array $params = array(), $name = null) {
        $length = $params[0];
        if (preg_match("/[^0-9]/", $length)){
            return false;
        }
        if (function_exists('mb_strlen')){
            return (bool) (mb_strlen($value) == $length);
        }
        return (bool) (strlen($value) == $length);
    }

    private function _rule__valid_email ($value, array $params = array(), $name = null) {
        return (bool) preg_match("/^([a-z0-9\+_\-]+)(\.[a-z0-9\+_\-]+)*@([a-z0-9\-]+\.)+[a-z]{2,6}$/ix", $value);
    }

    private function _rule__alpha ($value, array $params = array(), $name = null) {
        return (bool) preg_match("/^([a-z])+$/i", $value);
    }

    private function _rule__alpha_numeric ($value, array $params = array(), $name = null) {
        return (bool) preg_match("/^([a-z0-9])+$/i", $value);
    }

    private function _rule__alpha_dash ($value, array $params = array(), $name = null) {
        return (bool) preg_match("/^([-a-z0-9_-])+$/i", $value);
    }

    private function _rule__numeric ($value, array $params = array(), $name = null) {
        return (bool) preg_match('/^[\-+]?\d*\.?\d+$/', $value);
    }

    private function _rule__integer ($value, array $params = array(), $name = null) {
        return (bool) preg_match('/^[\-+]?\d+$/', $value);
    }

    private function _rule__decimal ($value, array $params = array(), $name = null) {
        return (bool) preg_match('/^\d+$/', $value);
    }

    private function _rule__is_natural ($value, array $params = array(), $name = null) {
        return (bool) preg_match( '/^[0-9]+$/', $value);
    }

    private function _rule__float ($value, array $params = array(), $name = null) {
        return (bool) preg_match('/^[\-+]?[0-9]+(\.[0-9]+)?([eE][\-+]?[0-9]+)?$/', $value);
    }

    private function _rule__is_natural_no_zero ($value, array $params = array(), $name = null) {
        return (bool) (preg_match( '/^[0-9]+$/', $value) && $value != 0);
    }

    private function _rule__valid_base64 ($value, array $params = array(), $name = null) {
        return (bool) ! preg_match('/[^a-zA-Z0-9\/\+=]/', $value);
    }

    private function _rule__valid_url ($value, array $params = array(), $name = null) {
        return filter_var($value, FILTER_VALIDATE_URL);
    }

    private function _rule__valid_date ($value, array $params = array(), $name = null) {
        $stamp = strtotime($value);
        if (is_numeric($stamp)) {
            return (bool) checkdate(date( 'm', $stamp ), date( 'd', $stamp ), date( 'Y', $stamp ));
        }
        return false;
    }


}