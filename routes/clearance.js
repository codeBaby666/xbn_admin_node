import express from 'express'
import Clearance from '../controller/clearance/clearance'
const router = express.Router()

router.post('/listByPage', Clearance.listByPage);
router.get('/getClearanceInfo', Clearance.getClearanceInfo);
router.get('/getGoodInfo', Clearance.getGoodInfo);
router.put('/changeGood', Clearance.changeGood);
router.put('/changeClearance', Clearance.changeClearance);

export default router
