'use strict';

module.exports = {
	port: 8111,
	url: 'mongodb://localhost:27017/xbn_user',
	session: {
		name: 'SID',
		secret: 'SID',
		cookie: {
			httpOnly: true,
		    secure:   false,
		    maxAge:   365 * 24 * 60 * 60 * 1000,
		}
	}
}