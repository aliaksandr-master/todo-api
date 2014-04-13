"use strict";

module.exports = function (db) {

	db.table('user')
		.Field('id')
			.pk()
		.Field('last_name')
			.ai().nn().ua().pk().default(1)
		.OneToOne('user_groups')
		.OneToMany('user_groups')
		.ManyToMany('user_groups')
};