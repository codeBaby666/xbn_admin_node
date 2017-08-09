/**
 * Created by dells on 2017/6/26.
 */
'use strict';

import mongoose from 'mongoose'

const Schema = mongoose.Schema;

const xbnmenuSchema = new Schema({
  "menu_id" : Number,
  "menu_name" : String,
  "link" : String,
  "icon_url" : String,
});

xbnmenuSchema.index({id: 1});

const Xbnmenu = mongoose.model('Xbnmenu', xbnmenuSchema);


export default Xbnmenu
