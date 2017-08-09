'use strict';

import mongoose from 'mongoose'

const Schema = mongoose.Schema;

const companySchema = new Schema({
	company_id : Number,
	user_id: Number,
	license_id: Number,
	company_name_cn : String,
	company_name_en : String,
	detail_address : String,
	company_phone : Number,
	registered_capital : Number,
	threeToOne : Boolean,
	create_date : Date,
	last_update_date : Date,
	business_scope : String,
	last_audit_logging : String,
	currency : String,
	employees : Number,
	province : Number,
	city : Number,
	district : Number,
	address : Array,
	status : String,
	created_by_admin : String,
	created_user_name : String,
	company_type : {type: String, default: '1'}, //0:供应商,1:采购商,2:即是供应商又是采购商
	data_source_id : String,
	member_type : {type: String, default: '0'},
	threeToOneCertificate:{
		imageUrl:String,
		number:String,
		issuedDate:Date,
		address:Array,
		license_type: {type: Number, default: 1}
	},
	entryPermitCertificate:{
		imageUrl:String,
		license_type: {type: Number, default: 5}
	},
	businessLicense:{
		imageUrl:String,
		number:String,
		issuedDate:Date,
		address:Array,
		license_type: {type: Number, default: 2}
	},
	organizationCertificate:{
		imageUrl:String,
		number:String,
		license_type: {type: Number, default: 3}
	},
	taxRegistrationCertificate:{
		imageUrl:String,
		number:String,
		license_type: {type: Number, default: 4}
	}
});

companySchema.index({id: 1});

const Company = mongoose.model('Xbncomp', companySchema);

export default {Company}