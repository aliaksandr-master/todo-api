module.exports = function(grunt){

	var options = this;

	return {
		fonts_in_css:{
			overwrite: true,
			src: [
				'client/css/styles.min.css'
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
							url = '/client/'+options.cacheKey+'/fonts/'+fileName;
						}else if(/^[\/\\]*client\//.test(url) && /\.(png|jpg|jpeg|gif)/.test(url)){
							url = url.replace(/^([\/\\]*)client/,'//client/'+options.cacheKey+'/');
						}
						//							console.log($0,'  url:',url);
						return "url('"+url+"')";
					}
				}
			]
		},
		srcVersion:{
			overwrite: true,
			src: [
				'client/index.html'
			],
			replacements: [
				{
					from: /['"]\s*\/*client\//gi,
					to: function($0){
						$0 = $0+options.cacheKey+'/';
						return $0;
					}
				}
			]
		},
		livereload: {
			overwrite: true,
			src: [ 'client/index.html' ],
			replacements: [
				{
					from: '</head>',
					to: '<script async src="'+options.liveReload.url+'"></script></head>'
				}
			]
		},
		favicon:{
			overwrite: true,
			src: [ 'client/index.html' ],
			replacements: [
				{
					from: '<!--/meta-->',
					to: '<link rel="icon" href="/client/favicon.ico" type="image/x-icon"><!--/meta-->'
				}
			]
		},
		dev_index: {
			overwrite: true,
			src: [ 'client/index.html' ],
			replacements: [
				{
					from: '</head>',
					to: '<script>window.build='+options.cacheKey+';</script>\n</head>'
				},
				{
					from: '</head>',
					to: '<link type="text/css" rel="stylesheet" href="/client/css/styles.min.css"/>\n</head>'
				},
				{
					from: '</head>',
					to: '<script src="/client/js/app.js"></script>\n</head>'
				},
				{
					from: /<body>\s*<\/body>/,
					to: '<body></body>'
				},
				{
					from: /\n\s+/g,
					to: "\n"
				}
			]
		}
	};
};