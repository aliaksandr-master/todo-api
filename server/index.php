<?php

$_SERVER['REQUEST_URI'] = preg_replace("/^[\/]+server[\/]+/", "/", $_SERVER['REQUEST_URI']);

$url = $_SERVER['REQUEST_URI'];

var_dump($url);

