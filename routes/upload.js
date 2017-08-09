'use strict';

import express from 'express'
import Upload from '../controller/upload/upload'
const router = express.Router()

router.post('/upload', Upload.upload);
router.get('/download', Upload.download);

export default router