"use strict";
module.exports = function(grunt, options){

	var _ = require('underscore');
	var pkg = options.package;
	var cfg = options;

	var CACHE_KEY = options.cacheKey;

	return {

		'client-fonts':{
			overwrite: true,
			src: [
				this.BUILD + '/client/**/*.css'
			],
			replacements: [
				{
					from: /url\s*\([^\)]+\)/gi,
					to: function($0){
						$0 = $0.replace(/^url/,"");
						var url = $0.replace(/['"\s\(\)]+/g, "").trim();
						var fileName;
						// FONTS
						if(/\.(woff|ttf|eot|svg)/.test(url)){
							fileName = url.split(/[\/\\]+/).pop();
							url = '//client-'+CACHE_KEY+'/fonts/'+fileName;
						}else if(/^[\/\\]*client\//.test(url) && /\.(png|jpg|jpeg|gif)/.test(url)){
							url = url.replace(/^([\/\\]*)client/,'//client-'+CACHE_KEY+'//');
						}
						//							console.log($0,'  url:',url);
						return "url('"+url+"')";
					}
				}
			]
		}
	};

};