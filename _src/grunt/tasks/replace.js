"use strict";
module.exports = function(grunt){

	var options = this;
	var _ = options._;
	var pkg = options.pkg;
	var cfg = options;

	var CACHE_KEY = options.cacheKey;

	return {

		fonts:{
			overwrite: true,
			src: [
				'client/**/*.{css,less,scss,sass}',
				'client/*.{css,less,scss,sass}'
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
							url = '/client/'+CACHE_KEY+'/fonts/'+fileName;
						}else if(/^[\/\\]*client\//.test(url) && /\.(png|jpg|jpeg|gif)/.test(url)){
							url = url.replace(/^([\/\\]*)client/,'//client/'+CACHE_KEY+'/');
						}
						//							console.log($0,'  url:',url);
						return "url('"+url+"')";
					}
				}
			]
		},

		matchConfigFromAnywhere: {
			src: [
				'client/js/**/*.js',
				'client/js/*.js',
				'client/*.{js,html}'
			],
			overwrite: true,
			replacements: [{
				from: /\$\{(config|package):([^\}]+)\}/g,
				to: function (word, _i, _f, matches) {
					var config = matches[0] === 'config' ? cfg : pkg,
						name = matches[1],
						value = _.reduce(name.split('.'), function(config, name) {
							return config != null ? config[name] : null;
						},config);

					if (value == null) {
						console.error('Configuration variable "' + name + '" is not defined in config files!');
						grunt.fail();
					}

					console.log(word,value);
					return value;
				}
			}]
		},

		indexReplaceResourceVersion: {
			overwrite: true,
			src: [
				'client/*.{html,css}',
				'client/**/*.{html,css}'
			],
			replacements: [
				{
					from: /(['"]\s*\/*)client\//gi,
					to: '$1client'+CACHE_KEY+'/'
				}
			]
		},

		livereload: {
			overwrite: true,
			src: 'client/index.html',
			replacements: [
				{
					from: '</head>',
					to: '<script async src="'+options.liveReload.src+'"></script></head>'
				}
			]
		}

	};

};