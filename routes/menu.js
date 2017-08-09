'use strict';

import express from 'express'
import Menu from '../controller/menu/menu'
const router = express.Router()

router.get('/menu', Menu.getMenu);

export default router