module.exports = {
	"install-database": [
		"copy-new-files:db-config",
		"mysqldump-schema:database-default"
	]
};