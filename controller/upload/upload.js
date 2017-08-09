'use strict';

import fs from 'fs'
import path from 'path'
import cors from 'cors'
import crypto from 'crypto'
import formidable from 'formidable'
import Async from 'async'
import multer from 'multer'

class Upload {
    constructor(){}

    async upload(req, res, next){
        const Storage = multer.diskStorage({
            destination: function (req, file, callback) {
                callback(null, "public/static/images");
            },
            filename: function (req, file, callback) {
                callback(null, file.originalname);
            }
        });
        const uploadFile = multer({ storage: Storage });
        const upload= uploadFile.single('file');
        upload(req, res, function (err) {
            let fileType = req.body.fileType;
            if (err) {
                console.log("Error:" + err);
                res.send({
                    statusCode: 0,
                    type: 'GET_ERROR_FROMDATA',
                    message: err.message,
                })
            }

            let arr = req.file.destination.split("/");
            arr.shift();
            let filePath = arr.join("/");

            res.send({
                statusCode: 2000000,
                data: {
                    type: fileType,
                    file_name: req.file.originalname,
                    file_path: filePath +'/'+req.file.originalname
                },
                message: '上传成功',
            })
        });
    }
    async download(req, res, next){
        let filePath = '';
        if(req.query){
            if(req.query.file_path){
                let arr = req.query.file_path.split("/");
                arr.pop();
                arr.unshift('public');
                filePath = arr.join("/");
            }
        }
        const currDir = path.normalize(filePath),
            fileName = req.query.file_name,
            currFile = path.join(currDir,fileName);
        const exist = await fs.existsSync(currFile);
        if (exist) {
            res.set({
                "Content-type": "application/octet-stream",
                "Content-Disposition": "attachment;filename=" + encodeURI(fileName)
            });
            const fReadStream = fs.createReadStream(currFile);
            fReadStream.on("data", function (chunk) {
                res.write(chunk, "binary")
            });
            fReadStream.on("end", function () {
                res.end();
            });
        } else {
            res.set("Content-type", "text/html");
            res.send("file not found!");
            res.end();
        }
    }
}

export default new Upload()
