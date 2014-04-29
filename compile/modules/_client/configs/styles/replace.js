"use strict";

module.exports = function(grunt, options){

	var CACHE_KEY = options.buildTimestamp;

	return {

		'client-fonts':{
			overwrite: true,
			src: [
				this.BUILD + '/client/static/**/*.css'
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
							url = '/client/static-'+CACHE_KEY+'/fonts/'+fileName;
						}else if(/^[\/\\]*static\//.test(url) && /\.(png|jpg|jpeg|gif)/.test(url)){
							url = url.replace(/([\/\\]?)static[\\\/]]/,'$1static-' + CACHE_KEY +'/');
						}
						//							console.log($0,'  url: ',url);
						return "url('"+url+"')";
					}
				}
			]
		}
	};

};