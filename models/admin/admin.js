'use strict';

import mongoose from 'mongoose'

const Schema = mongoose.Schema;

const xbnuserSchema = new Schema({
	user_name: { type: String , index: true},
	password: String,
	mobile: String,
	email: String,
	user_id: Number,
	create_date: String,
	admin: {type: String, default: '管理员'},
	status: {type: Number, default: 1},  //1:待审核 2:通过、3:驳回
	/*companyNameCn: {type:String,ref : "Xbncomp"}, //这里即为主表的外键，关联子表。ref后的Xbncomp代表的是子表Xbncomp的Model*/
	companyNameCn: String,
	avatar: {type: String, default: 'default.jpg'},
	city: String,
});

xbnuserSchema.index({id: 1});

const User = mongoose.model('Xbnuser', xbnuserSchema);

const xbnadminSchema = new Schema({
	admin_name: { type: String , index: true},
	password: String,
	admin_id: Number,
	lastLoginIp: String,
	lastLoginTime: String,
	loginCount: {type: Number, default: 0},
	create_date: Date,
	role_id: Number,
	realname: String,
	role_name: String,
	status: {type: Number, default: 1},  //1:待审核 2:通过、3:驳回
});

xbnadminSchema.index({id: 1});

const Admin = mongoose.model('Xbnadmin', xbnadminSchema);

const role_operationSchema = new Schema({
	role_id: Number,
	role_name:String,
	operationIds: Array,
	create_date: Date
});

role_operationSchema.index({id: 1});

const Role_opera = mongoose.model('Xbnrole_operation', role_operationSchema);

const rolepermissionsSchema = new Schema({
	operation_id:Number,
	operation_name:String,
	parent_id:Number,
	childOperations:Array,
	link:String,
	method:String,
	data_source_id:Number
});

rolepermissionsSchema.index({id: 1});

const Permissions = mongoose.model('Xbnpermissions', rolepermissionsSchema);


export default {User,Admin,Permissions,Role_opera}

