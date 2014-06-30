<?php

interface IUserSession {

	function getSessionCell();

	function current ($dataName = null, $default = null);

	function login ($user);

	function logout ();

	function isLogged ();

}