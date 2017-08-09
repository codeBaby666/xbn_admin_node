'use strict';

import mongoose from 'mongoose'

const Schema = mongoose.Schema;

const clearanceSchema = new Schema({
    export_form_id:Number,
    cancel_status:String,
    advance:Number,
    final_payment:Number,
    status:Number,
    exchange_method:String,
    delivery_address:{
        address:Array,
        detail_address:String,
        contacts:String,
        phone:Number
    },
    international_trader:{
        address:String,
        nation:String,
        contacts:String,
        phone:Number,
        fax:String
    },
    orderAttachments:Array,
    domesticTradeContractAttachments:Array,
    otherAttachments:Array,
    form_number:String,
    customs_port:String,
    contacts:String,
    phone:String,
    email:String,
    mobile:String,
    account_name:String,
    bank_name:String,
    bank_account:String,
    bank_contacts:String,
    bank_phone_number:String,
    bank_im_email:String,
    currency:String,
    price_term:String,
    price_term_other:String,
    fare:String,
    premium:String,
    package_type:String,
    package_number:Number,
    packaging_material:String,
    tray_type:String,
    detail_confirmed:String,
    total_net_weight:Number,
    total_gros_weight:Number,
    total_goods_count:Number,
    total_value:Number,
    shipment_date:Date,
    trade_nation:String,
    target_nation:String,
    domestic_source:String,
    contract_type:String,
    contract_number:String,
    company_id:Number,
    create_date:Date,
    destination_country:String,
    data_source_id:String
});

clearanceSchema.index({id: 1});

const Clearance = mongoose.model('Xbnclearance', clearanceSchema);

const goodSchema = new Schema({
    "export_goods_id":Number,
    "export_form_id":Number,
    "name_cn":String,
    "hs_code":String,
    "brand":String,
    "model":String,
    "name_en":String,
    "texture":String,
    "goods_usage":String,
    "origin_country":String,
    "attribute":String,
    "category":String,
    "package_count":Number,
    "net_weight":Number,
    "gros_weight":Number,
    "quantity":Number,
    "unit":String,
    "unit_price":Number,
    "package_value":Number,
    "manufacturer":String,
    "goods_size":String,
    "drawer_county":String
});

goodSchema.index({id: 1});

const Good = mongoose.model('Xbngood', goodSchema);

export default {Clearance,Good}
