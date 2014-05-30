<?php



abstract class IntercessorAbstractComponent extends IntercessorAbstract {


	public function __construct (Intercessor &$kernel) {
		$this->kernel = $kernel;
	}

	protected function getSpec ($name, $default) {
		return $this->kernel->getSpec($name, $default);
	}

}