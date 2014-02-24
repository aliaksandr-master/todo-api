<?php

interface IApiError {

    function getErrors();

    function error($message = null, $code = 500, $fatal = false);

    function valid();

}