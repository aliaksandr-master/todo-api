<?php

require_once("dropbox-module/Dropbox.php");

//$appKey = 'kkkkkkkkkkk';
//$appSecret = 'ssssssssss';
//$appToken = 'tttttttttt';
$appToken = 'HXl8ReBbatoAAAAAAAADjTfz32w3C2iSbxDDug3EkIC7vbbRaUGzvAs5061Y4y9v';

$dropbox = new Dropbox($appToken);

// Список всех папок и файлов в выбранном каталоге(по умолчанию корневой католог)
$data = $dropbox->getMetadataWithChildren();
var_dump($data);

// Сохранил хеш(ниже) корневой папки, затем изменил название одной из папок, которая лежит в корне - ее хеш тоже изменился, как и хеш корневой папки
$oldHash = '77c6550b7e2d3725a7673e0d37ad7635';
$changedData = $dropbox->getMetadataWithChildrenIfChanged('/', $oldHash);
var_dump($changedData);

