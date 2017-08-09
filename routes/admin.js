'use strict';

import express from 'express'
import Admin from '../controller/admin/admin'
const router = express.Router()

router.post('/login', Admin.login);
router.put('/changePassword', Admin.changePassword);
router.post('/userRegister', Admin.userRegister);
router.put('/changeUser', Admin.changeUser);
router.get('/singout', Admin.singout);
router.post('/listByPage', Admin.listByPage);
router.post('/companyNameCheck', Admin.companyNameCheck);
router.get('/getUserInfo', Admin.getUserInfo);
router.post('/addAdmin', Admin.addAdmin);
router.put('/changeAdmin', Admin.changeAdmin);
router.delete('/delAdmin', Admin.delAdmin);
router.post('/getAllAdmin', Admin.getAllAdmin);
router.post('/roleListByPage', Admin.roleListByPage);
router.get('/getRoleList', Admin.getRoleList);
router.get('/getAdminInfo', Admin.getAdminInfo);
router.delete('/delRole', Admin.delRole);
router.post('/addRole', Admin.addRole);
router.put('/changeRole', Admin.changeRole);
router.get('/getRoleInfo', Admin.getRoleInfo);
router.get('/getRolePermissionsList', Admin.getRolePermissionsList);

export default router