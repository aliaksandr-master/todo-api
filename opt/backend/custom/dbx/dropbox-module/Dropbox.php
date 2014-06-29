<?php

require_once __DIR__."/../dropbox-sdk/Dropbox/autoload.php";
use \Dropbox as dbx;

class Dropbox{

    /**
     * @var Dropbox\Client
     */
    private $dbxClient;

    private $clientIdentifier = 'PHP-Example/1.0';

    
    public function __construct($appToken, $appKey = null, $appSecret = null)
    {
        $this->dbxClient = new dbx\Client($appToken, $this->clientIdentifier);

//        In case if we need to get app token through our service
//        Follow the given url and press 'Allow' button
//        Than get token and save it in the database
//
//        $appInfo = new dbx\AppInfo($appKey, $appSecret);
//        $webAuth = new dbx\WebAuthNoRedirect($appInfo, $this->clientIdentifier);
//        $authorizeUrl = $webAuth->start();
    }

    /**
     * @return array
     */
    public function getAccountInfo()
    {
        return $this->dbxClient->getAccountInfo();
    }

    /**
     * @param string $path - begins with '/'
     * @return array|null
     */
    public function getMetadataWithChildren($path = '/')
    {
        return $this->dbxClient->getMetadataWithChildren($path);
    }

    /**
     * @param $path - path to check
     * @param string $hash - saved in the database, got it from our last authentication ($hash is changed if data is modified)
     * @return array
     */
    public function getMetadataWithChildrenIfChanged($path, $hash)
    {
        return $this->dbxClient->getMetadataWithChildrenIfChanged($path, $hash);
    }







}

