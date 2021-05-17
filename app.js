const express = require("express");
const dotenv = require('dotenv').config();
const request = require('request');
const bodyParser = require("body-parser");
const fs = require("fs");
const mongoose = require("mongodb");
const User = require('./models/Food');
const Food = require("./models/Food");

const app = express();
app.use(bodyParser.json());

const bibigo_water_dumpling = '19870190051-561';
const fried_rice = '20020614179649';
const stone_age = '198803110017';

const notFoundData_loc = __dirname + "\\data\\notFound.txt"
const FoundData_loc = __dirname + "\\data\\Found.txt"

const rwMat = {
    url: "http://apis.data.go.kr/1470000/FoodRwmatrInfoService/getFoodRwmatrList",
    params: '?' + encodeURIComponent('ServiceKey') + '=' + process.env.RWMATKEY,
}

const foodInfo = {
    url: 'http://openapi.foodsafetykorea.go.kr/api',
    params: '/' + process.env.FOODINFOKEY + '/C002/xml/1/5'
}

function material(matName) {
    request({
        url: rwMat.url + rwMat.params + '&' + encodeURIComponent('rprsnt_rawmtrl_nm') + '=' + encodeURIComponent(matName) +
            '&' + encodeURIComponent('pageNo') + '=' + encodeURIComponent('1') + '&' + encodeURIComponent('numOfRows') + '=' + encodeURIComponent('1'),
        method: 'GET'
    }, function (error, response, body) {
        console.log('Status', response.statusCode);
        // console.log('Headers', JSON.stringify(response.headers));

        console.log('Reponse received');
        let count_start = response.body.indexOf("totalCount");
        let count_end = response.body.indexOf("totalCount", count_start + 1);
        let totCount = response.body.substring(count_start + 11, count_end - 2);

        if (totCount > 0) {
            let RPRSNT_RAWMTRL_start = response.body.indexOf("RPRSNT_RAWMTRL_NM");
            let RPRSNT_RAWMTRL_end = response.body.indexOf("RPRSNT_RAWMTRL_NM", RPRSNT_RAWMTRL_start + 1);
            let RPRSNT_RAWMTRL_NM = response.body.substring(RPRSNT_RAWMTRL_start + 18, RPRSNT_RAWMTRL_end - 2);

            let MLSFC_start = response.body.indexOf("MLSFC_NM");
            let MLSFC_end = response.body.indexOf("MLSFC_NM", MLSFC_start + 1);
            let MLSFC_NM = response.body.substring(MLSFC_start + 9, MLSFC_end - 2);

            let FoundData = fs.readFileSync(FoundData_loc, "utf-8");
            if (!FoundData.includes(matName)) {
                fs.appendFile(FoundData_loc, `${matName} = ${RPRSNT_RAWMTRL_NM},${MLSFC_NM}\n`, (err) => {
                    console.log(err);
                })
            }

            console.log(`${matName} = ${MLSFC_NM}`);
        } else {
            console.log(`Material(${matName}) Not Found`);
            let notFoundData = fs.readFileSync(notFoundData_loc, "utf8");
            if (!notFoundData.includes(matName)) {
                fs.appendFile(notFoundData_loc, matName + "\n", (err) => {
                    console.log(error);
                })
                console.log(`Material(${matName}) appended in file ${notFoundData_loc}`)
            } else {
                console.log(`Material(${matName}) not added. already exists`)
            }
        }
    });
}

function info(prodnum) {
    return new Promise((resolve, reject) => {
        request({
            url: foodInfo.url + foodInfo.params + '/' + encodeURIComponent('PRDLST_REPORT_NO') + '=' + prodnum,
            method: 'GET'
        }, function (error, response, body) {
            var result = {
                prodNum: "-1",
                prodName: "",
                rwmat_arr: []
            }
            console.log('Status for foodInfo', response.statusCode);
    
            let count_start = response.body.indexOf("totalCount");
            let count_end = response.body.indexOf("totalCount", count_start + 1);
            let totCount = response.body.substring(count_start + 11, count_end - 2);
            console.log(body);
            if (totCount != 0) {
                let RAWMTRL_start = response.body.indexOf("RAWMTRL_NM");
                let RAWMTRL_end = response.body.indexOf("RAWMTRL_NM", RAWMTRL_start + 1);
    
                let rwmat_arr = response.body.substring(RAWMTRL_start + 11, RAWMTRL_end - 2).split(',');
                
                let PRDLST_NM_start = response.body.indexOf("PRDLST_NM");
                let PRDLST_NM_end = response.body.indexOf("PRDLST_NM", PRDLST_NM_start + 1);
    
                prodName = response.body.substring(PRDLST_NM_start+10, PRDLST_NM_end-2);
    
                rwmat_arr.forEach(element => {
                    // material(element);
                })
    
                result.prodNum = prodnum;
                result.prodName = prodName;
                result.rwmat_arr = rwmat_arr;
            
                resolve(result);
            } else {
                reject(`Product(${prodnum}) Not Found`);
            }
        });
    })
}
console.log("started")

async function upload(prodNum) {
    try{
        return await info(prodNum);
    }catch(error) {
        return null;
    }
}


app.listen(3000, err => {
    if(err){
        console.error(err);
    } else {
        mongoose.connect(process.env.MONGOOSEURL, {useNewUrlParser: true, useUnifiedTopology: true}, (err, client) => {
            if(err) {
                console.error(err);
            }else {
                console.log("Connected to mongoose DB");
            }
            const val = client.db("mobileContents");
            var results = [];
            app.get("/see", (req, res) => {
                val.collection("food").find().toArray().then(result => {
                    results.push(result);
                })
                .catch(error => console.error(error));
                res.json(results);
            })
            app.get("/create/:prodNum", (req, res) => {
                val.collection("food").find({prodNum: req.params.prodNum}).toArray().then(result => {
                    if(result.length === 0){
                        info(req.params.prodNum);
                    }
                }).catch(error => console.error(error));
            })
        })
    }
});