<?php



abstract class IntercessorAbstractComponent extends IntercessorAbstract {


	public function __construct (Intercessor &$api) {
		$this->api = $api;
	}

	protected function getSpec ($name, $default) {
		return $this->api->getSpec($name, $default);
	}

}