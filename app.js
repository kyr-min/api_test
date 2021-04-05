const express = require("express");
const dotenv = require('dotenv').config();
const app = express();

const request = require('request');


var bibigo_water_dumpling = '=19870190051-561';
var bokum_rice = '=20020614179649';
var stone_age = '=198803110017';

var text_before;



var RwmatUrl = 'http://apis.data.go.kr/1470000/FoodRwmatrInfoService/getFoodRwmatrList';
var RwamatQueryParams = '?' + encodeURIComponent('ServiceKey') + '=' + process.env.RWMATKEY;

var foodInfoUrl = 'http://openapi.foodsafetykorea.go.kr/api';
var foodInfoQueryParams = '/' + process.env.FOODINFOKEY;
foodInfoQueryParams += '/' + 'C002';
foodInfoQueryParams += '/' + 'xml';
foodInfoQueryParams += '/' + '1';
foodInfoQueryParams += '/' + '5';


function getSpecificInfo(rwmat_in) { //원재료별 정보
    RwamatQueryParams += '&' + encodeURIComponent('rprsnt_rawmtrl_nm') + '=' + encodeURIComponent(rwmat_in);
    RwamatQueryParams += '&' + encodeURIComponent('pageNo') + '=' + encodeURIComponent('1');
    RwamatQueryParams += '&' + encodeURIComponent('numOfRows') + '=' + encodeURIComponent('1');

    request({
        url: RwmatUrl + RwamatQueryParams,
        method: 'GET'
    }, function (error, response, body) {
        // console.log('Status for Rwmat', response.statusCode);
        console.log("");
        if(text_before === undefined){
            text_before = response.body;
        } 
        else if(text_before === response.body){
            console.log("뭔가 이상한데???");
        }
        let start = response.body.indexOf("MLSFC_NM");
        let end = response.body.indexOf("MLSFC_NM", start + 1);

        

        let MLSFC_NM = response.body.substring(start, end);
        
        console.log(`start = ${start} end = ${end}`);
        console.log(`rwmat_in = ${rwmat_in}     MLSFC_NM = ${MLSFC_NM}`);
    });
}
// var callFoodInfoAPI = request({ //식품 정보
//     url: foodInfoUrl + foodInfoQueryParams,
//     method: 'GET'
// }, function (error, response, body) {
//     console.log('Status for foodInfo', response.statusCode);
//     let bodyJSON = JSON.parse(body);
//     let rwmat_arr = bodyJSON.C002.row[0].RAWMTRL_NM.split(",");
//     console.log(rwmat_arr);
//     for(let i = 0; i<rwmat_arr.length; i++){
//         getSpecificInfo(rwmat_arr[i]);
//     }
// })

function callFoodInfoAPI(prodnum) { //식품 정보
    let rwmat_arr;
    try {
        foodInfoQueryParams += '/' + encodeURIComponent('PRDLST_REPORT_NO') + prodnum;
        request({
            url: foodInfoUrl + foodInfoQueryParams,
            method: 'GET'
        }, function (error, response, body) {
            console.log(foodInfoUrl + foodInfoQueryParams)
            console.log('Status for foodInfo', response.statusCode);

            let start = response.body.indexOf("RAWMTRL_NM");
            let end = response.body.indexOf("RAWMTRL_NM", start + 3);
            let temp = 0;

            rwmat_arr = response.body.substring(start + 11, end - 2).split(',');

            console.log(rwmat_arr.length);

            // getSpecificInfo(rwmat_arr[temp])
            //     .then(()=>{
            //         if(temp < rwmat_arr.length){
            //             temp++;
                        
            //         }
            //     })
            //     .catch((err) => console.error(err));

            rwmat_arr.forEach(element => {
                getSpecificInfo(element);
            })
        })
    } catch (error) {
        console.error(error);
    }
}

callFoodInfoAPI(bibigo_water_dumpling)

console.log("started")



app.get('/', (req, res) => {
    res.render('index.ejs', );
    res.write("hello");
})


app.listen(3000);