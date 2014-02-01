<?php

define("CRUD_MODELS_WORK_DIR", __DIR__);
define("CRUD_MODELS_ROOT_DIR", __DIR__."/crud_models");

define("RELATION_ONE_TO_ONE", 0);
define("RELATION_MUCH_TO_ONE", 1);
define("RELATION_ONE_TO_MUCH", 2);
define("RELATION_MUCH_TO_MUCH", 3);

include(CRUD_MODELS_WORK_DIR."/core/CrudModel.php");

include(CRUD_MODELS_WORK_DIR."/core/DbTableAbstract.php");
include(CRUD_MODELS_WORK_DIR."/core/DbTable.php");

include(CRUD_MODELS_WORK_DIR."/core/DbTableFieldAbstract.php");
include(CRUD_MODELS_WORK_DIR."/core/DbTableFieldPropsAbstract.php");
include(CRUD_MODELS_WORK_DIR."/core/DbTableFieldInstallAbstract.php");

include(CRUD_MODELS_WORK_DIR."/core/fields/DbTableField.php");
include(CRUD_MODELS_WORK_DIR."/core/fields/DbTableFieldId.php");
include(CRUD_MODELS_WORK_DIR."/core/fields/DbTableFieldRelation.php");
