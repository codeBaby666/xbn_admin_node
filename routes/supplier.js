'use strict';

import express from 'express'
import Supplier from '../controller/supplier/supplier'
const router = express.Router()


router.post('/listByPage', Supplier.listByPage);
router.get('/getSupplierInfo', Supplier.getSupplierInfo);
router.put('/changeSupplier', Supplier.changeSupplier);
router.post('/createCompany', Supplier.createCompany);
router.put('/changeCompany', Supplier.changeCompany);

export default router