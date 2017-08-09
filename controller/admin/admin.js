'use strict';

import AdminModel from '../../models/admin/admin'
import SupplierModel from '../../models/supplier/supplier'
import crypto from 'crypto'
import formidable from 'formidable'
import dtime from 'time-formater'
import Async from 'async'

class Admin {
	constructor(){
		this.login = this.login.bind(this);
		this.userRegister = this.userRegister.bind(this);
		this.encryption = this.encryption.bind(this);
	}
	async login(req, res, next){
		const form = new formidable.IncomingForm();
		form.parse(req, async (err, fields, files) => {
			if (err) {
				res.send({
					statusCode: 0,
					type: 'FORM_DATA_ERROR',
					message: '表单信息错误'
				})
				return
			}
			const {user_name, password} = fields;
			console.log({fields:fields});
			try{
				if (!user_name) {
					throw new Error('用户名参数错误')
				}else if(!password){
					throw new Error('密码参数错误')
				}
			}catch(err){
				console.log(err.message, err);
				res.send({
					statusCode: 0,
					type: 'GET_ERROR_PARAM',
					message: err.message,
				})
				return
			}
			const newpassword = this.encryption(password);
			try{
				const ip = req.headers['x-real-ip'] ? req.headers['x-real-ip'] : req.ip.replace(/::ffff:/, '');
				console.log(ip)
				const query = {
					"lastLoginTime":dtime().format('YYYY-MM-DD HH:mm'),
					"lastLoginIp": ip
				};
				console.log(query)
				const admin = await AdminModel.User.findOneAndUpdate({user_name},query,{$inc:{"loginCount":1}});
				console.log(admin);
				if (!admin) {
					res.send({
						statusCode: 0,
						type: 'ERROR_PASSWORD',
						message: '该用户不存在',
					})
				/*}else if(newpassword.toString() != admin.password.toString()){*/
				}else if(password.toString() != admin.password.toString()){
					console.log('管理员登录密码错误');
					console.log({fields:fields});
					res.send({
						statusCode: 0,
						type: 'ERROR_PASSWORD',
						message: '该用户已存在，密码输入错误',
					})
				}else{
					req.session.user_id = admin.user_id;
					res.send({
						statusCode: 2000000,
						data:[admin],
						message: '登录成功'
					})
				}
			}catch(err){
				console.log('登录管理员失败', err);
				res.send({
					status: 0,
					type: 'LOGIN_ADMIN_FAILED',
					message: '登录管理员失败',
				})
			}
		})
	}
	async changePassword(req, res, next){
		const form = new formidable.IncomingForm();
		form.parse(req, async (err, fields, files) => {
			if (err) {
				res.send({
					statusCode: 0,
					type: 'FORM_DATA_ERROR',
					message: '表单信息错误'
				})
				return
			}
			const {oldPas, newPas} = fields;
			console.log({fields:fields});
			try{
				if (!oldPas) {
					throw new Error('原密码错误')
				}else if(!newPas){
					throw new Error('新密码不能为空')
				}
			}catch(err){
				console.log(err.message, err);
				res.send({
					statusCode: 0,
					type: 'GET_ERROR_PARAM',
					message: err.message,
				})
				return
			}
			const user_id = req.session.user_id;
			try{
				await AdminModel.User.findOneAndUpdate({user_id},{"password": newPas},(err,response) =>{
					if (err) {
						console.log("Error:" + err);
						res.send({
							statusCode: 0,
							type: 'PUT_ERROR_PASSWORD',
							message: '修改密码失败',
						})
					}else{
						console.log("res:" + response);
						res.send({
							statusCode: 2000000,
							data:[response],
							message: '修改成功',
						})
					}
				});
			}catch(err){
				console.log("Error:" + err);
				res.send({
					statusCode: 0,
					type: 'GET_ERROR_FROMDATA',
					message: err.message,
				})
			}
		})
	}
	async userRegister(req, res, next){
		const form = new formidable.IncomingForm();
		form.parse(req, async (err, fields, files) => {
			if (err) {
				res.send({
					statusCode: 0,
					type: 'FORM_DATA_ERROR',
					message: '表单信息错误'
				})
				return
			}
			const {companyNameCn, user_name, mobile, password, email, status} = fields;

			try{
				if (!user_name) {
					throw new Error('姓名不能为空')
				}else if(!password){
					throw new Error('密码不能为空')
				}else if(!companyNameCn){
					throw new Error('公司名称不能为空')
				}else if(!mobile){
					throw new Error('手机号码不能为空')
				}else if(!email){
					throw new Error('email不能为空')
				}
			}catch(err){
				console.log(err.message, err);
				res.send({
					statusCode: 0,
					type: 'GET_ERROR_FORM',
					message: err.message,
				})
			}
			try{
				const total = await AdminModel.User.count();
				console.log(total)
				const newAdmin = {
					user_name: user_name,
					companyNameCn:companyNameCn,
					email: email,
					mobile: mobile,
					password: password,
					user_id: total + 1,
					create_date: dtime().format('YYYY-MM-DD HH:mm'),
					status:status
				};
				const newUser = await AdminModel.User.create(newAdmin);
				res.send({
					statusCode: 2000000,
					data:[newUser],
					success: '新增用户成功',
				})
			}catch(err){
				console.log('新增用户失败', err);
				res.send({
					statusCode: 0,
					type: 'REGISTER_ADMIN_FAILED',
					message: '新增用户失败',
				})
			}
		})
	}
	async changeUser(req, res, next){
		const form = new formidable.IncomingForm();
		form.parse(req, async (err, fields, files) => {
			if (err) {
				res.send({
					statusCode: 0,
					type: 'FORM_DATA_ERROR',
					message: '表单信息错误'
				})
				return
			}
			const {companyNameCn, user_name, mobile, password, email, user_id,status} = fields;

			try{
				if (!user_id) {
					throw new Error('用户ID不能为空')
				}else if (!user_name) {
					throw new Error('姓名不能为空')
				}else if(!password){
					throw new Error('密码不能为空')
				}else if(!companyNameCn){
					throw new Error('公司名称不能为空')
				}else if(!mobile){
					throw new Error('手机号码不能为空')
				}else if(!email){
					throw new Error('email不能为空')
				}
			}catch(err){
				console.log(err.message, err);
				res.send({
					statusCode: 0,
					type: 'GET_ERROR_FORM',
					message: err.message,
				})
			}

			try{
				const query = {
					companyNameCn: companyNameCn,
					user_name: user_name,
					mobile: mobile,
					password: password,
					email: email,
					status: status
				}
				const response = await AdminModel.User.findOneAndUpdate({user_id},query);
				console.log(response)
				if (response) {
					res.send({
						statusCode: 2000000,
						data:[response],
						message: '修改成功',
					})
				}else{
					console.log("Error:" + err);
					res.send({
						statusCode: 0,
						type: 'PUT_ERROR_ROLE',
						message: '修改失败',
					})
				}
			}catch(err){
				console.log("Error:" + err);
				res.send({
					statusCode: 0,
					type: 'GET_ERROR_FROMDATA',
					message: err.message,
				})
			}
		})
	}
	encryption(password){
		const newpassword = this.Md5(this.Md5(password).substr(2, 7) + this.Md5(password));
		return newpassword
	}
	Md5(password){
		const md5 = crypto.createHash('md5');
		return md5.update(password).digest('base64');
	}
	async singout(req, res, next){
		try{
			delete req.session.user_id;
			res.send({
				statusCode: 2000000,
				data:['1'],
				success: '退出成功'
			})
		}catch(err){
			console.log('退出失败', err)
			res.send({
				status: 0,
				data:['0'],
				message: '退出失败'
			})
		}
	}
	async listByPage(req, res, next){
		const form = new formidable.IncomingForm();
		form.parse(req, async (err, fields, files) => {
			if (err) {
				res.send({
					statusCode: 0,
					type: 'FORM_DATA_ERROR',
					message: '表单信息错误'
				})
				return
			}
			const { pageNo, pageSize, query } = fields;
			console.log({fields:fields});
			try{
				if (!pageNo) {
					throw new Error('当前页码不能为空')
				}else if(!pageSize){
					throw new Error('显示条数不能为空')
				}
			}catch(err){
				console.log(err.message, err);
				res.send({
					statusCode: 0,
					type: 'GET_ERROR_page',
					message: err.message,
				})
				return
			}

			/*const pageSize = pageSize;                   //一页多少条
			const currentPage = pageNo;                //当前第几页
			const sort = {'create_date':-1};        //排序（按创建时间倒序）
			const condition = query;                 //条件查询
			const skipnum = (currentPage - 1) * pageSize;   //跳过数*/
			try{
				console.log(query);
				const total = await AdminModel.User.find(query);
				const response = await AdminModel.User.find(query).skip((pageNo - 1) * pageSize).limit(pageSize).sort({'create_date':-1});
				Async.map(response,function(item, callback) {
					SupplierModel.Company.findOne({"user_id" : item.user_id}).exec(function(err, doc){
						item.companyNameCn ? '' : item.companyNameCn = doc.company_name_cn;
						callback(null, item);
					});
				}, function(err,results) {
					res.send({
						statusCode: 2000000,
						data:{
							list:results,
							page:{
								pageNo:pageNo,
								pageSize:pageSize,
								query:"",
								totalCount:total.length,
								totalPages:Math.ceil(total.length/pageSize)
							}
						},
						message: '成功',
					});
				});

				/* populate 关联查询
				AdminModel.User.populate(response,[{ path: 'companyNameCn', select: 'company_name_cn'}],function(err,resData){
						console.log("resData:" + resData);
				});*/
			}catch(err){
				console.log("Error:" + err);
				res.send({
					statusCode: 0,
					type: 'GET_ERROR_DATA',
					message: err.message,
				})
			}
		})
	}
	async companyNameCheck(req, res, next){
		const form = new formidable.IncomingForm();
		form.parse(req, async (err, fields, files) => {
			if (err) {
				res.send({
					statusCode: 0,
					type: 'FORM_DATA_ERROR',
					message: '表单信息错误'
				})
				return
			}
			const { companyNameCn } = fields;
			console.log({fields:fields});
			try{
				if (!companyNameCn) {
					throw new Error('公司名称不能为空')
				}
			}catch(err){
				console.log(err.message, err);
				res.send({
					statusCode: 0,
					type: 'GET_ERROR_EMPTY',
					message: err.message,
				})
				return
			}

			try{
				const response = await AdminModel.Company.findOne({companyNameCn});
				if (!response) {
					res.send({
						statusCode: 2000000,
						data:'1',
						message: '未注册'
					})
				}else if(response){
					res.send({
						statusCode: 2000000,
						data: '0',
						message: '已注册'
					})
				}
			}catch(err){
				console.log("Error:" + err);
				res.send({
					statusCode: 0,
					type: 'GET_ERROR_DATA',
					message: err.message,
				})
			}
		})
	}
	async getUserInfo(req, res, next){
		const admin_id = req.session.user_id;
		console.log(admin_id)
		if (!admin_id) {
			console.log('获取用户信息的session失效');
			res.send({
				status: 0,
				type: 'ERROR_SESSION',
				message: 'session失效'
			})
			return
		}
		try{
			const admin_id = req.query.user_id;
			console.log(admin_id)
			const info = await AdminModel.User.findOne({user_id: admin_id}, '-_id -__v');
			if (!info) {
				throw new Error('未找到当前用户')
			}else{
				res.send({
					statusCode: 2000000,
					data:[info],
					message: '成功'
				})
			}
		}catch(err){
			console.log('获取用户信息失败');
			res.send({
				status: 0,
				type: 'GET_ADMIN_INFO_FAILED',
				message: '获取用户信息失败'
			})
		}
	}
	async addAdmin(req, res, next){
		const form = new formidable.IncomingForm();
		form.parse(req, async (err, fields, files) => {
			if (err) {
				res.send({
					statusCode: 0,
					type: 'FORM_DATA_ERROR',
					message: '表单信息错误'
				})
				return
			}
			const {admin_name, password, role_id, realname} = fields;
			try{
				if (!admin_name) {
					throw new Error('管理员不能为空')
				}else if(!password){
					throw new Error('密码不能为空')
				}else if(!role_id){
					throw new Error('角色不能为空')
				}else if(!realname){
					throw new Error('真实姓名不能为空')
				}
			}catch(err){
				console.log(err.message, err);
				res.send({
					statusCode: 0,
					type: 'GET_ERROR_FORM',
					message: err.message,
				})
			}
			try{
				const total = await AdminModel.User.count();;
				console.log(total)
				const newAdminInfo = {
					admin_name: admin_name,
					password: password,
					role_id: role_id,
					realname:realname,
					create_date: dtime().format('YYYY-MM-DD HH:mm'),
					admin_id: total + 1,
				};
				const newAdmin = await AdminModel.Admin.create(newAdminInfo);
				res.send({
					statusCode: 2000000,
					data:[newAdmin],
					success: '新增管理员成功',
				})
			}catch(err){
				console.log('新增管理员失败', err);
				res.send({
					statusCode: 0,
					type: 'REGISTER_ADMIN_FAILED',
					message: '新增管理员失败',
				})
			}
		})
	}
	async changeAdmin(req, res, next){
		const form = new formidable.IncomingForm();
		form.parse(req, async (err, fields, files) => {
			if (err) {
				res.send({
					statusCode: 0,
					type: 'FORM_DATA_ERROR',
					message: '表单信息错误'
				})
				return
			}
			const {admin_name, password, role_id, realname,admin_id} = fields;
			try{
				if (!admin_id) {
					throw new Error('管理员Id不能为空')
				}else if (!admin_name) {
					throw new Error('管理员不能为空')
				}else if(!password){
					throw new Error('密码不能为空')
				}else if(!role_id){
					throw new Error('角色不能为空')
				}else if(!realname){
					throw new Error('真实姓名不能为空')
				}
			}catch(err){
				console.log(err.message, err);
				res.send({
					statusCode: 0,
					type: 'GET_ERROR_FORM',
					message: err.message,
				})
			}

			try{
				const query = {
					admin_name: admin_name,
					password: password,
					role_id: role_id,
					realname: realname
				}
				const response = await AdminModel.Admin.findOneAndUpdate({admin_id},query);
				console.log(response)
				if (response) {
					res.send({
						statusCode: 2000000,
						data:[response],
						message: '修改成功',
					})
				}else{
					console.log("Error:" + err);
					res.send({
						statusCode: 0,
						type: 'PUT_ERROR_ROLE',
						message: '修改失败',
					})
				}
			}catch(err){
				console.log("Error:" + err);
				res.send({
					statusCode: 0,
					type: 'GET_ERROR_FROMDATA',
					message: err.message,
				})
			}
		})
	}
	async getAllAdmin(req, res, next){
		const form = new formidable.IncomingForm();
		form.parse(req, async (err, fields, files) => {
			if (err) {
				res.send({
					statusCode: 0,
					type: 'FORM_DATA_ERROR',
					message: '表单信息错误'
				})
				return
			}
			const { pageNo, pageSize, query } = fields;
			console.log({fields:fields});
			try{
				if (!pageNo) {
					throw new Error('当前页码不能为空')
				}else if(!pageSize){
					throw new Error('显示条数不能为空')
				}
			}catch(err){
				console.log(err.message, err);
				res.send({
					statusCode: 0,
					type: 'GET_ERROR_page',
					message: err.message,
				})
				return
			}

			/*const pageSize = pageSize;                   //一页多少条
			 const currentPage = pageNo;                //当前第几页
			 const sort = {'create_date':-1};        //排序（按创建时间倒序）
			 const condition = query;                 //条件查询
			 const skipnum = (currentPage - 1) * pageSize;   //跳过数*/
			try{
				const total = await AdminModel.Admin.find(query);
				const response = await AdminModel.Admin.find(query).skip((pageNo - 1) * pageSize).limit(pageSize).sort({'create_date':-1});
				Async.map(response,function(item, callback) {
					AdminModel.Role_opera.findOne({"role_id" : item.role_id}).exec(function(err, doc){
						console.log(doc.role_name);
						item.role_name = doc.role_name;
						callback(null, item);
					});
				}, function(err,results) {
					res.send({
						statusCode: 2000000,
						data:{
							list:results,
							page:{
								pageNo:pageNo,
								pageSize:pageSize,
								query:"",
								totalCount:total.length,
								totalPages:Math.ceil(total.length/pageSize)
							}
						},
						message: '成功',
					});
				});

			}catch(err){
				console.log("Error:" + err);
				res.send({
					statusCode: 0,
					type: 'GET_ERROR_DATA',
					message: err.message,
				})
			}
		})
	}
	async delAdmin(req, res, next){
		const admin_id = req.session.user_id;
		console.log(admin_id)
		if (!admin_id) {
			console.log('获取用户信息的session失效');
			res.send({
				status: 0,
				type: 'ERROR_SESSION',
				message: 'session失效'
			})
			return
		}
		try{
			const id = req.query.admin_id;
			console.log(id)
			const info = await AdminModel.Admin.findOneAndRemove({admin_id: id});
			if (!info) {
				throw new Error('未找到当前用户')
			}else{
				res.send({
					statusCode: 2000000,
					data:[info],
					message: '成功'
				})
			}
		}catch(err){
			console.log('获取用户信息失败');
			res.send({
				status: 0,
				type: 'GET_ADMIN_INFO_FAILED',
				message: '获取用户信息失败'
			})
		}
	}
	async roleListByPage(req, res, next){
		const form = new formidable.IncomingForm();
		form.parse(req, async (err, fields, files) => {
			if (err) {
				res.send({
					statusCode: 0,
					type: 'FORM_DATA_ERROR',
					message: '表单信息错误'
				})
				return
			}
			const { pageNo, pageSize, query } = fields;
			try{
				if (!pageNo) {
					throw new Error('当前页码不能为空')
				}else if(!pageSize){
					throw new Error('显示条数不能为空')
				}
			}catch(err){
				console.log(err.message, err);
				res.send({
					statusCode: 0,
					type: 'GET_ERROR_page',
					message: err.message,
				})
				return
			}

			/*const pageSize = pageSize;                   //一页多少条
			 const currentPage = pageNo;                //当前第几页
			 const sort = {'create_date':-1};        //排序（按创建时间倒序）
			 const condition = query;                 //条件查询
			 const skipnum = (currentPage - 1) * pageSize;   //跳过数*/
			try{
				console.log(query);
				const total = await AdminModel.Role_opera.find(query);
				const response = await AdminModel.Role_opera.find(query).skip((pageNo - 1) * pageSize).limit(pageSize).sort({'create_date':-1});
				res.send({
					statusCode: 2000000,
					data:{
						list:response,
						page:{
							pageNo:pageNo,
							pageSize:pageSize,
							query:"",
							totalCount:total.length,
							totalPages:Math.ceil(total.length/pageSize)
						}
					},
					message: '成功',
				});
			}catch(err){
				console.log("Error:" + err);
				res.send({
					statusCode: 0,
					type: 'GET_ERROR_DATA',
					message: err.message,
				})
			}
		})
	}
	async getRoleList(req, res, next){
		const admin_id = req.session.user_id;
		console.log(admin_id)
		if (!admin_id) {
			console.log('获取用户信息的session失效');
			res.send({
				status: 0,
				type: 'ERROR_SESSION',
				message: 'session失效'
			})
			return
		}
		try{
			const response = await AdminModel.Role_opera.find();
			res.send({
				statusCode: 2000000,
				data:{
					list:response,
				},
				message: '成功',
			});
		}catch(err){
			console.log("Error:" + err);
			res.send({
				statusCode: 0,
				type: 'GET_ERROR_DATA',
				message: err.message,
			})
		}
	}
	async getAdminInfo(req, res, next){
		const admin_id = req.session.user_id;
		console.log(admin_id)
		if (!admin_id) {
			console.log('获取用户信息的session失效');
			res.send({
				status: 0,
				type: 'ERROR_SESSION',
				message: 'session失效'
			})
			return
		}
		try{
			const admin_id = req.query.admin_id;
			console.log(admin_id)
			const info = await AdminModel.Admin.findOne({admin_id: admin_id}, '-_id -__v');
			if (!info) {
				throw new Error('未找到当前用户')
			}else{
				res.send({
					statusCode: 2000000,
					data:[info],
					message: '成功'
				})
			}
		}catch(err){
			console.log('获取用户信息失败');
			res.send({
				status: 0,
				type: 'GET_ADMIN_INFO_FAILED',
				message: '获取用户信息失败'
			})
		}
	}
	async addRole(req, res, next){
		const form = new formidable.IncomingForm();
		form.parse(req, async (err, fields, files) => {
			if (err) {
				res.send({
					statusCode: 0,
					type: 'FORM_DATA_ERROR',
					message: '表单信息错误'
				})
				return
			}
			const {role_id, role_name, operationIds} = fields;
			try{
				if (!role_name) {
					throw new Error('角色名称不能为空')
				}else if(operationIds.length < 1){
					throw new Error('角色权限不能为空')
				}
			}catch(err){
				console.log(err.message, err);
				res.send({
					statusCode: 0,
					type: 'GET_ERROR_FORM',
					message: err.message
				})
			}
			try{
				const total = await AdminModel.Role_opera.count();
				const newRoleInfo = {
					role_id: total + 1,
					role_name: role_name,
					operationIds: operationIds,
					create_date: dtime().format('YYYY-MM-DD HH:mm'),
				};
				const newRole = await AdminModel.Role_opera.create(newRoleInfo);
				res.send({
					statusCode: 2000000,
					data:[newRole],
					success: '新增角色成功',
				})
			}catch(err){
				console.log('新增角色失败', err);
				res.send({
					statusCode: 0,
					type: 'REGISTER_ADMIN_FAILED',
					message: '新增角色失败',
				})
			}
		})
	}
	async changeRole(req, res, next){
		const form = new formidable.IncomingForm();
		form.parse(req, async (err, fields, files) => {
			if (err) {
				res.send({
					statusCode: 0,
					type: 'FORM_DATA_ERROR',
					message: '表单信息错误'
				})
				return
			}
			const {role_id, role_name, operationIds} = fields;
			try{
				if (!role_name) {
					throw new Error('角色名称不能为空')
				}else if(operationIds.length < 1){
					throw new Error('角色权限不能为空')
				}else if(!role_id){
					throw new Error('角色Id不能为空')
				}
			}catch(err){
				console.log(err.message, err);
				res.send({
					statusCode: 0,
					type: 'GET_ERROR_FORM',
					message: err.message
				})
			}

			try{
				const response = await AdminModel.Role_opera.findOneAndUpdate({role_id},{"role_name": role_name,"operationIds": operationIds});
				console.log(response)
				if (response) {
					res.send({
						statusCode: 2000000,
						data:[response],
						message: '修改成功',
					})
				}else{
					console.log("Error:" + err);
					res.send({
						statusCode: 0,
						type: 'PUT_ERROR_ROLE',
						message: '修改角色失败',
					})
				}
			}catch(err){
				console.log("Error:" + err);
				res.send({
					statusCode: 0,
					type: 'GET_ERROR_FROMDATA',
					message: err.message,
				})
			}
		})
	}
	async getRoleInfo(req, res, next){
		const admin_id = req.session.user_id;
		console.log(admin_id)
		if (!admin_id) {
			console.log('获取用户信息的session失效');
			res.send({
				status: 0,
				type: 'ERROR_SESSION',
				message: 'session失效'
			})
			return
		}
		try{
			const admin_id = req.query.role_id;
			console.log(admin_id)
			const info = await AdminModel.Role_opera.findOne({role_id: admin_id}, '-_id -__v');
			if (!info) {
				throw new Error('未找到当前用户')
			}else{
				res.send({
					statusCode: 2000000,
					data:[info],
					message: '成功'
				})
			}
		}catch(err){
			console.log('获取用户信息失败');
			res.send({
				status: 0,
				type: 'GET_ADMIN_INFO_FAILED',
				message: '获取用户信息失败'
			})
		}
	}
	async delRole(req, res, next){
		const admin_id = req.session.user_id;
		console.log(admin_id)
		if (!admin_id) {
			console.log('获取用户信息的session失效');
			res.send({
				status: 0,
				type: 'ERROR_SESSION',
				message: 'session失效'
			})
			return
		}
		try{
			const id = req.query.role_id;
			console.log(id)
			const info = await AdminModel.Role_opera.findOneAndRemove({role_id: id});
			if (!info) {
				throw new Error('未找到当前用户')
			}else{
				res.send({
					statusCode: 2000000,
					data:[info],
					message: '成功'
				})
			}
		}catch(err){
			console.log('获取用户信息失败');
			res.send({
				status: 0,
				type: 'GET_ADMIN_INFO_FAILED',
				message: '获取用户信息失败'
			})
		}
	}
	async getRolePermissionsList(req, res, next){
		const admin_id = req.session.user_id;
		console.log(admin_id)
		if (!admin_id) {
			console.log('获取用户信息的session失效');
			res.send({
				status: 0,
				type: 'ERROR_SESSION',
				message: 'session失效'
			})
			return
		}
		try{
			const response = await AdminModel.Permissions.find();
			res.send({
				statusCode: 2000000,
				data: response,
				message: '成功',
			});
		}catch(err){
			console.log("Error:" + err);
			res.send({
				statusCode: 0,
				type: 'GET_ERROR_DATA',
				message: err.message,
			})
		}
	}
}

export default new Admin()