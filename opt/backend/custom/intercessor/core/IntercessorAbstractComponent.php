<?php



abstract class IntercessorAbstractComponent extends IntercessorAbstract {

	/** @var Intercessor */
	protected $kernel;

	public function __construct (Intercessor &$kernel) {
		$this->kernel = $kernel;
	}

	protected function getSpec ($name, $default) {
		return $this->kernel->getSpec($name, $default);
	}

}