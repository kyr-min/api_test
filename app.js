const express = require("express");
const dotenv = require('dotenv').config();
const request = require('request');
const bodyParser = require("body-parser");
const fs = require("fs");

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

var users = [
    {
        name: "foo",
        age: 30
    },
    {
        name: "boo",
        age:12
    }
]

function material(matName) {
    request({
        url: rwMat.url + rwMat.params + '&' + encodeURIComponent('rprsnt_rawmtrl_nm') + '=' + encodeURIComponent(matName) +
            '&' + encodeURIComponent('pageNo') + '=' + encodeURIComponent('1') + '&' + encodeURIComponent('numOfRows') + '=' + encodeURIComponent('1'),
        method: 'GET'
    }, function (error, response, body) {
        console.log('Status', response.statusCode);
        // console.log('Headers', JSON.stringify(response.headers));
        console.log(body);

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
    request({
        url: foodInfo.url + foodInfo.params + '/' + encodeURIComponent('PRDLST_REPORT_NO') + '=' + prodnum,
        method: 'GET'
    }, function (error, response, body) {
        console.log('Status for foodInfo', response.statusCode);
        console.log(body);
        let count_start = response.body.indexOf("totalCount");
        let count_end = response.body.indexOf("totalCount", count_start + 1);
        let totCount = response.body.substring(count_start + 11, count_end - 2);

        if (totCount != 0) {
            let start = response.body.indexOf("RAWMTRL_NM");
            let end = response.body.indexOf("RAWMTRL_NM", start + 3);

            rwmat_arr = response.body.substring(start + 11, end - 2).split(',');
            console.log(rwmat_arr);

            rwmat_arr.forEach(element => {
                material(element);
            })
        } else {
            throw `Product(${prodnum}) Not Found`;
        }
    });
}

// material("위고둥");
info("1985049901137");

console.log("started")


app.get('/api/users', (req, res) => {
    res.json(users);
})

app.get('/api/users/:name', (req, res) => {
    let user = users.find((u) => {
        return u.name === req.params.name;
    })

    if(user){
        res.json(user);
    } else {
        res.status(404).json({errorMessage:'User was not found'})
    }
})

app.post("/api/users", (req, res) => {
    users.push(req.body);
    res.json(users);
})


app.get('/', (req, res) => {
    res.render('index.ejs', );
    res.write("hello");
})


app.listen(3000);