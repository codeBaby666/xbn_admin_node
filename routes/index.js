'use strict';

import admin from './admin'
import menu from './menu'
import supplier from './supplier'
import clearance from './clearance'
import upload from './upload'

export default app => {
	// app.get('/', (req, res, next) => {
	// 	res.redirect('/');
	// });
	app.use('/admin', admin);
	app.use('/menu', menu);
	app.use('/supplier', supplier);
	app.use('/clearance', clearance);
	app.use('/upload', upload);
}