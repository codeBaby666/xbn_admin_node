'use strict';

import MenuModel from '../../models/menu/menu'
import crypto from 'crypto'
import dtime from 'time-formater'

class Menu {
  constructor(){
    this.getMenu = this.getMenu.bind(this);
  }
  async getMenu(req, res, next){
    try{
      const allMenu = await MenuModel.find();
      res.send({
        statusCode: 2000000,
        data: [allMenu],
        message: '成功'
      })
    }catch(err){
      console.log('获取菜单列表失败', err);
      res.send({
        statusCode: 0,
        type: 'ERROR_GET_MENU_LIST',
        message: '获取菜单列表失败'
      })
    }
  }
}

export default new Menu()
