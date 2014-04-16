module.exports = {
	"build-client": [
		"compile-client-env",
		"compile-client-langs",
		"compile-client-images",
		"compile-client-styles",
		"compile-client-html",
		"compile-client-scripts",
		"compile-client-templates",
		"compile-client-content",
		"compile-client-routing"
	],
	"compile-client-content": [
		"clean:client-content",
		"client-content-compile",
		"copy:client-content-img"
	],
	"compile-client-env": [
		"copy:client-env"
	],
	"compile-client-html": [
		"copy:client-html",
		"replace:client-index-static-version"
	],
	"compile-client-images": [
		"clean:client-images",
		"copy:client-images"
	],
	"compile-client-langs": [
		"client-lang-parser"
	],
	"compile-client-routing": [
		"template:client-routes"
	],
	"compile-client-scripts": [
		"jshint:client",
		"clean:client-scripts",
		"copy:client-scripts",
		//	"coffee:client-compile",
		//	"typescript:client-compile",
		"replace:client-match-config"
	],
	"compile-client-styles": [
		"clean:client-styles",
		"clean:client-fonts",
		"copy:client-styles",
		"less:client-styles",
		"copy:client-fonts",
		"replace:client-fonts",
		"autoprefixer:client-styles"
	],
	"compile-client-templates": [
		"clean:client-templates",
		"handlebars:client-templates"
	],
	"install-client": [
		"clean:client",
		"bower:client-install",
		"copy:client-vendor"
	]
};