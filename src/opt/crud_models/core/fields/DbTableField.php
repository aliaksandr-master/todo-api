<?php

class DbTableField extends DbTableFieldInstallAbstract {

    const E_VAL_IS_OVER = 1;

    public function checkValue($value){

        if(!is_null($this->getDbLength())){
            $len = strlen((string) $value);
            if($len > $this->getDbLength()){
                return self::E_VAL_IS_OVER;
            }
        }

        return 0;
    }

    public function prepareValue($value){
        $type = $this->getAliasType();

        $r = $value;

        switch($type){
            case self::aTYPE_INT:
                $r = intval($value);
                break;
            case self::aTYPE_TINYINT:
                $r = intval($value);
                break;
            case self::aTYPE_DOUBLE:
                $r = doubleval($value);
                break;
            case self::aTYPE_VARCHAR:
                $r = strval($value);
                break;
            case self::aTYPE_TEXT:
                $r = strval($value);
                break;
            case self::aTYPE_BOOL:
                $r = 1 * ((bool)$value);
                break;
            case self::aTYPE_DATE:

                break;
            case self::aTYPE_DATETIME:

                break;
        }

        return $r;
    }

}