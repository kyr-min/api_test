const express = require("express");
const dotenv = require('dotenv').config();
const bodyParser = require("body-parser");
const {
    MongoClient
} = require("mongodb");
const info = require("./APIs/info");
const material = require("./APIs/material")
const db = require("./DB/database.js");

const uri = process.env.MONGO_URI;

const client = new MongoClient(uri, {
    useUnifiedTopology: true,
    useNewUrlParser: true,
    connectTimeoutMS: 30000,
    keepAlive: 1
});

// const bibigo_water_dumpling = '19870190051-561';
// const fried_rice = '20020614179649';
// const stone_age = '198803110017';
const addDB = 1;

const app = express();
app.use(bodyParser.json());
app.set("view engine", 'ejs');

db.dbConnect(client);



const rwMat = {
    url: "http://apis.data.go.kr/1470000/FoodRwmatrInfoService/getFoodRwmatrList",
    params: '?' + encodeURIComponent('ServiceKey') + '=' + process.env.RWMATKEY,
}

const foodInfo = {
    url: 'http://openapi.foodsafetykorea.go.kr/api',
    params: '/' + process.env.FOODINFOKEY + '/C002/xml/1/5'
}

async function main(prodNum) {
    var api_res = {
        err_msg: null,
        data_res: null
    };
    try {
        isItinDB = await db.findOneByprodNum(client, prodNum);
        var data_res = null;
        if (isItinDB != null) {
            data_res = isItinDB;
        } else {
            let result;
            try {
                result = await info(client, foodInfo, prodNum);
                data_res = {
                    prodName: 0,
                    prodNum: null,
                    status: null,
                    materials: [],
                    count: 0,
                    plant: 0,
                    dairy: 0,
                    eggs: 0,
                    microbe: 0,
                    disinfectant: 0,
                    aquaProd: 0,
                    foodAdditives: 0,
                    nutrient: 0,
                    starch: 0,
                    otherThanLivestock: 0,
                    livestock: 0,
                    notFound: 0,
                    etc: 0
                }
                for (let i = 0; i < result.rwmat_arr.length; i++) {
                    let mat_info = await material(client, rwMat, result.rwmat_arr[i]);
                    data_res.count++;
                    switch (mat_info.MLSFC_NM) {
                        case "식물":
                            data_res.plant++;
                            break;
                        case "미생물":
                            data_res.microbe++;
                            break;
                        case "살균소독제":
                            data_res.disinfectant++;
                            break;
                        case "수산물":
                            data_res.aquaProd++;
                            break;
                        case "식품첨가물":
                            data_res.foodAdditives++;
                            break;
                        case "영양성분":
                            data_res.nutrient++;
                            break;
                        case "전분제":
                            data_res.starch++;
                            break;
                        case "축,수산물 외 동물":
                            data_res.otherThanLivestock++;
                            break;
                        case "축산물":
                            data_res.livestock++;
                            break;
                        case "유제품":
                            data_res.dairy++;
                            break;
                        case "난류":
                            data_res.eggs++;
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
                            data_res.etc++;
                            break;
                        case "not Found":
                            data_res.notFound++;
                            break;
                        default:
                            data_res.notFound++;
                            break;
                    }
                    data_res.materials.push(mat_info);
                }
                data_res.prodName = result.prodName;
                data_res.prodNum = prodNum;
                data_res.status = "Good";
                await db.createListing(client, data_res, "food");
            } catch (e) {
                data_res = null;
                api_res.err_msg = e;
            }
        }
        api_res.data_res = data_res;
        return api_res;
    } catch (e) {
        api_res.err_msg = `Server cannot connect to Database : ${e}`
        api_res.data_res = null;
        return api_res;
    }
}


app.get("/api/:prodNum", async (req, res) => {
    console.log(`recieved param : ${req.params.prodNum}`);
    res.send(await main(req.params.prodNum).catch(console.error));
})

app.get("/api/report/:prodNum/:status", async (req, res) => {
    console.log(`prodNum = ${req.params.prodNum}`);
    console.log(`status = ${req.params.status}`);
    res.send(await db.report(client, req.params.prodNum, req.params.status));
})

app.get("/", (req, res) => {
    res.render('index');
})

app.listen(process.env.PORT);
