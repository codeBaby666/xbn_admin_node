'use strict';

import ClearanceModel from '../../models/clearance/clearance'
import SupplierModel from '../../models/supplier/supplier'
import crypto from 'crypto'
import formidable from 'formidable'
import dtime from 'time-formater'
import Async from 'async'

class Clearance {
    constructor(){}

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
                if(query.create_date){
                    query.create_date = {"$gte" : query.create_date[0], "$lte" : query.create_date[1]}
                }
                if(query.status && Object.prototype.toString.call(query.status) === '[object Array]'){
                    query.status = {"$gte" : query.status[0], "$lte" : query.status[1]}
                }
                console.log(query);
                const total = await ClearanceModel.Clearance.find(query);
                const response = await ClearanceModel.Clearance.find(query).skip((pageNo - 1) * pageSize).limit(pageSize).sort({'create_date':-1});
                Async.map(response,function(item, callback) {
                    SupplierModel.Company.findOne({"company_id" : item.company_id}).exec(function(err, doc){
                        item._doc.companyNameCn = doc.company_name_cn;
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
    async getClearanceInfo(req, res, next){
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
            const admin_id = req.query.export_form_id;
            console.log(admin_id)
            const info = await ClearanceModel.Clearance.findOne({export_form_id: admin_id}, '-_id -__v');
            if (!info) {
                throw new Error('未找到当前用户')
            }else{
                const good = await ClearanceModel.Good.find({export_form_id: admin_id}, '-_id -__v');
                info._doc.goods = good;
                res.send({
                    statusCode: 2000000,
                    data:[info],
                    message: '成功'
                })
            }
        }catch(err){
            console.log('获取报关单信息失败');
            res.send({
                status: 0,
                type: 'GET_ADMIN_INFO_FAILED',
                message: '获取报关单信息失败'
            })
        }
    }
    async getGoodInfo(req, res, next){
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
            const admin_id = req.query.export_goods_id;
            console.log(admin_id)
            const info = await ClearanceModel.Good.findOne({export_goods_id: admin_id}, '-_id -__v');
            res.send({
                statusCode: 2000000,
                data:[info],
                message: '成功'
            })
        }catch(err){
            console.log('获取货品信息失败');
            res.send({
                status: 0,
                type: 'GET_ADMIN_INFO_FAILED',
                message: '获取货品信息失败'
            })
        }
    }
    async changeGood(req, res, next){
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
            const {export_goods_id,query} = fields;
            try{
                const response = await ClearanceModel.Good.findOneAndUpdate({export_goods_id},query);
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
    async changeClearance(req, res, next){
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
            const {export_form_id,query} = fields;

            try{
                const response = await ClearanceModel.Clearance.findOneAndUpdate({export_form_id},query);
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
}

export default new Clearance()
