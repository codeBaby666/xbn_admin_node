'use strict';

import SupplierModel from '../../models/supplier/supplier'
import AdminModel from '../../models/admin/admin'
import crypto from 'crypto'
import formidable from 'formidable'
import dtime from 'time-formater'
import Async from 'async'

class Supplier {
    constructor(){}

    async createCompany(req, res, next){
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
            const {company_name_cn,user_id,registered_capital,company_phone,detail_address,address,threeToOne,license} = fields;
            console.log(req.session.user_id)
            const userName = await AdminModel.User.findOne({"user_id" : req.session.user_id});
            try{
                const total = await SupplierModel.Company.count();
                const newCompany = {
                    company_name_cn: company_name_cn,
                    user_id: user_id,
                    registered_capital: registered_capital,
                    company_phone: company_phone,
                    detail_address: detail_address,
                    address: address,
                    threeToOne: threeToOne,
                    create_date: dtime().format('YYYY-MM-DD HH:mm'),
                    company_id: total + 1,
                    created_user_name : userName.user_name,
                    threeToOneCertificate:{
                        imageUrl: license.threeToOneCertificate.imageUrl,
                        number: license.threeToOneCertificate.number,
                        issuedDate: license.threeToOneCertificate.issuedDate,
                        address: license.threeToOneCertificate.address,
                        license_type: license.threeToOneCertificate.license_type
                    },
                    entryPermitCertificate:{
                        imageUrl: license.entryPermitCertificate.imageUrl,
                        license_type: license.entryPermitCertificate.license_type
                    },
                    businessLicense:{
                        imageUrl: license.businessLicense.imageUrl,
                        number: license.businessLicense.number,
                        issuedDate: license.businessLicense.issuedDate,
                        address: license.businessLicense.address,
                        license_type: license.businessLicense.license_type
                    },
                    organizationCertificate:{
                        imageUrl:license.organizationCertificate.imageUrl,
                        number:license.organizationCertificate.number,
                        license_type: license.organizationCertificate.license_type
                    },
                    taxRegistrationCertificate:{
                        imageUrl:license.taxRegistrationCertificate.imageUrl,
                        number:license.taxRegistrationCertificate.number,
                        license_type: license.taxRegistrationCertificate.license_type
                    }
                };

                const companyRes = await SupplierModel.Company.create(newCompany);
                console.log(companyRes)

                res.send({
                    statusCode: 2000000,
                    data:[companyRes],
                    message: '添加成功',
                })
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
    async listByPage(req, res, next){
        const admin_id = req.session.user_id;
        if (!admin_id) {
            console.log('获取用户信息的session失效');
            res.send({
                status: 0,
                type: 'ERROR_SESSION',
                message: 'session失效'
            })
            return
        }

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
                const total = await SupplierModel.Company.find(query);
                const response = await SupplierModel.Company.find(query).skip((pageNo - 1) * pageSize).limit(pageSize).sort({'create_date':-1});
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
    async getSupplierInfo(req, res, next){
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
            const admin_id = req.query.company_id;
            console.log(admin_id)
            const info = await SupplierModel.Company.findOne({company_id: admin_id}, '-_id -__v');
            if (!info) {
                throw new Error('未找到当前用户')
            }else{
                const infoArray = [];
                infoArray.push(info);
                Async.map(infoArray,function(item, callback) {
                    console.log(item.user_id)
                    AdminModel.User.findOne({"user_id" : item.user_id}).exec(function(err, doc){
                        doc.user_name ? item._doc.user_name  = doc.user_name : '';
                        item._doc.mobile  = doc.mobile;
                        callback(null, item);
                        if (err) {
                            throw new Error('Err:'+ err)
                        }
                    });
                }, function(err,results) {
                    if (err) {
                        throw new Error('Err:'+ err)
                    }else{
                        res.send({
                            statusCode: 2000000,
                            data:results,
                            message: '成功'
                        })
                    }
                });
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
    async changeSupplier(req, res, next){
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
            const {company_id,query} = fields;

            try{
                const response = await SupplierModel.Company.findOneAndUpdate({company_id},query);
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
    async changeCompany(req, res, next){
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
            const {company_id,query} = fields;

            try{
                const response = await SupplierModel.Company.findOneAndUpdate({company_id},query);
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

export default new Supplier()