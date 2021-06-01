const express = require("express");
const dotenv = require('dotenv').config();
const request = require('request');
const bodyParser = require("body-parser");
const fs = require("fs");
const {
    MongoClient
} = require("mongodb");

const uri = process.env.MONGO_URI;

const client = new MongoClient(uri, { useUnifiedTopology: true, useNewUrlParser: true ,connectTimeoutMS: 30000 , keepAlive: 1});

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

function getContext(forWhat, body) {
    switch (forWhat) {
        case "mat-totalCount":
            let count_start = body.indexOf("totalCount");
            let count_end = body.indexOf("totalCount", count_start + 1);
            let totCount = body.substring(count_start + 11, count_end - 2);
            return totCount;
            break;

        case "food-totalCount":
            let tcs = body.indexOf("total_count");
            let tce = body.indexOf("total_count", tcs + 1);
            let totalCount = body.substring(tcs + 12, tce - 2);
            return totalCount;
            break;

        case "RPRSNT_RAWMTRL_NM":
            let RPRSNT_RAWMTRL_start = body.indexOf("RPRSNT_RAWMTRL_NM");
            let RPRSNT_RAWMTRL_end = body.indexOf("RPRSNT_RAWMTRL_NM", RPRSNT_RAWMTRL_start + 1);
            let RPRSNT_RAWMTRL_NM = body.substring(RPRSNT_RAWMTRL_start + 18, RPRSNT_RAWMTRL_end - 2);
            return RPRSNT_RAWMTRL_NM;
            break;

        case "MLSFC_NM":
            let MLSFC_start = body.indexOf("MLSFC_NM");
            let MLSFC_end = body.indexOf("MLSFC_NM", MLSFC_start + 1);
            let MLSFC_NM = body.substring(MLSFC_start + 9, MLSFC_end - 2);
            return MLSFC_NM;
            break;

        case "RAWMTRL_NM":
            let RAWMTRL_start = body.indexOf("RAWMTRL_NM");
            let RAWMTRL_end = body.indexOf("RAWMTRL_NM", RAWMTRL_start + 1);
            let rwmat_arr = body.substring(RAWMTRL_start + 11, RAWMTRL_end - 2).split(',');
            return rwmat_arr;
            break;

        case "PRDLST_NM":
            let PRDLST_NM_start = body.indexOf("PRDLST_NM");
            let PRDLST_NM_end = body.indexOf("PRDLST_NM", PRDLST_NM_start + 1);
            let prodName = body.substring(PRDLST_NM_start + 10, PRDLST_NM_end - 2);
            return prodName;
            break;
        case "resultCode":
            let resultCode_start = body.indexOf("resultCode");
            let resultCode_end = body.indexOf("resultCode", resultCode_start +1);
            let resultCode = body.substring(resultCode_start + 11, resultCode_end-2);
            return resultCode;
            break;
        default:
            console.error("no case found");
    }
}

function material(matName) {
    return new Promise((resolve, reject) => {
        request({
            url: rwMat.url + rwMat.params + '&' + encodeURIComponent('rprsnt_rawmtrl_nm') + '=' + encodeURIComponent(matName) +
                '&' + encodeURIComponent('pageNo') + '=' + encodeURIComponent('1') + '&' + encodeURIComponent('numOfRows') + '=' + encodeURIComponent('1'),
            method: 'GET'
        }, function (error, response, body) {
            let resultCode = parseInt(getContext("resultCode", response.body));
            
            if (resultCode != 0) {
                let RPRSNT_RAWMTRL_NM = getContext("RPRSNT_RAWMTRL_NM", response.body);
                let MLSFC_NM = getContext("MLSFC_NM", response.body);

                let result = {
                    matName: matName,
                    RPRSNT_NML: RPRSNT_RAWMTRL_NM,
                    MLSFC_NM: MLSFC_NM
                };

                resolve(result);
            } else {
                let result = {
                    matName: matName,
                    MLSFC_NM: "not-found"
                }
                resolve(result);
            }
        });
    })
}

function info(prodNum) {
    return new Promise((resolve, reject) => {
        request({
            url: foodInfo.url + foodInfo.params + '/' + encodeURIComponent('PRDLST_REPORT_NO') + '=' + prodNum,
            method: 'GET'
        }, function (error, response, body) {
            let totCount = getContext("food-totalCount", response.body);
            if (totCount != 0) {
                let rwmat_arr = getContext("RAWMTRL_NM", response.body)

                let prodName = getContext("PRDLST_NM", response.body);

                let result = {
                    prodNum: prodNum,
                    prodName: prodName,
                    rwmat_arr: rwmat_arr
                }

                return resolve(result);
            } else {
                reject(`no Food found`);
            }
        });
    });
}
console.log("started");

async function main(prodNum) {
    try {
        await client.connect();
        console.log("MongoDB connected");

        isItinDB = await findOneByprodNum(client, prodNum);
        var json_combined;
        if (isItinDB != null) {
            json_combined = isItinDB;
        } else {
            let result = await info(prodNum);
            let materials = []
            let plant = 0;
            let aquaProd = 0;
            let microbe = 0;
            let nutrient = 0;
            let disinfectant = 0;
            let foodAdditives = 0;
            let starch = 0;
            let livestock = 0;
            let otherThanLivestock = 0;
            let etc = 0;
            let notFound = 0;
            let count = 0;
            for (let i = 0; i < result.rwmat_arr.length; i++) {
                let mat_info = await material(result.rwmat_arr[i]);
                count++;
                switch (mat_info.MLSFC_NM) {
                    case "식물":
                        plant++;
                        break;
                    case "미생물":
                        microbe++;
                        break;
                    case "살균소독제":
                        disinfectant++;
                        break;
                    case "수산물":
                        aquaProd++;
                        break;
                    case "식품첨가물 ":
                        foodAdditives++;
                        break;
                    case "영양성분":
                        nutrient++;
                        break;
                    case "전분제":
                        starch++;
                        break;
                    case "축,수산물 외 동물":
                        otherThanLivestock++;
                        break;
                    case "축산물":
                        livestock++;
                        break;
                    case "개별인정":
                    case "고무제":
                    case "금속제":
                    case "기능성원료":
                    case "기타":
                    case "목재류":
                    case "셀로판제":
                    case "유리제,도자기제,법랑 및 옹기류":
                    case "종이제 또는 가공지제":
                    case "한시적인정":
                    case "합성수지제":
                    case "세척제":
                    case "행굼보조제":
                    case "기타위생용품":
                    case "위생물수건":
                        etc++;
                        break;
                    case "not Found":
                        notFound++;
                        break;
                    default:
                        notFound++;
                        break;
                }
                materials.push(mat_info);
            }
            console.log(materials);
            json_combined = {
                prodNum: prodNum,
                prodName: result.prodName,
                status: null,
                materials: materials,
                count: count,
                plant: plant,
                microbe: microbe,
                disinfectant: disinfectant,
                aquaProd: aquaProd,
                foodAdditives: foodAdditives,
                nutrient: nutrient,
                starch: starch,
                otherThanLivestock: otherThanLivestock,
                livestock: livestock,
                notFound: notFound
            }
            await createListing(client, json_combined);
        }
        return json_combined;
    } catch (e) {
        console.error(e);
    }
}

async function findOneByprodNum(client, prodOfListing) {
    const result = await client.db("mobileContents").collection("food").findOne({
        prodNum: prodOfListing
    });
    if (result) {
        console.log(`Found Name, in: ${prodOfListing}  found: ${result}`)
        return result;
    } else {
        console.log(`No listings found, in: ${prodOfListing}`);
        return null;
    }
}

async function createListing(client, document) {
    const result = await client.db("mobileContents").collection("food").insertOne(document);

    console.log(`document inserted in DB   id: ${result.insertedId}`);
}

app.get("/api/:prodNum", async (req, res) => {
    console.log(req.params.prodNum);
    res.send(await main(req.params.prodNum).catch(console.error));
})

app.get("/api/reportissue/:prodNum", async(req, res) => {
    
})

app.get("/", (req, res) => {
    res.send('<h1>Hello</h1>');
})

app.listen(process.env.PORT);