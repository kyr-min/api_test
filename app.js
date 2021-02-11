const express = require("express");
const convert = require("xml-js");
const dotenv = require('dotenv').config();

const app =  express();

var request = require('request');




var RwmatUrl = 'http://apis.data.go.kr/1470000/FoodRwmatrInfoService/getFoodRwmatrList';
var RwamatQueryParams = '?' + encodeURIComponent('ServiceKey') + process.env.RWMATKEY;
RwamatQueryParams += '&' + encodeURIComponent('rprsnt_rawmtrl_nm') + '=' + encodeURIComponent('곡류가공품'); /* */
RwamatQueryParams += '&' + encodeURIComponent('pageNo') + '=' + encodeURIComponent('1'); /* */
RwamatQueryParams += '&' + encodeURIComponent('numOfRows') + '=' + encodeURIComponent('3');

var foodInfoUrl = 'http://openapi.foodsafetykorea.go.kr/api';
var foodInfoQueryParams = '/' + process.env.FOODINFOKEY;
foodInfoQueryParams += '/' + 'C002';
foodInfoQueryParams += '/' + 'json';
foodInfoQueryParams += '/' + '1';
foodInfoQueryParams += '/' + '1';
foodInfoQueryParams += '/' + encodeURIComponent('PRDLST_REPORT_NO') + '=19830308010216';


var callRwmatAPI = request({
    url: RwmatUrl + RwamatQueryParams,
    method: 'GET'
}, function (error, response, body) {
    var result_json;
    console.log('Status for Rwmat', response.statusCode);
    // console.log('Headers', JSON.stringify(response.headers));
    console.log(body);
    
    result_json = convert.xml2json(body, {compact: false, spaces: 2});
    // console.log(result_json);
    return result_json;
});

var callFoodInfoAPI = request({
    url: foodInfoUrl + foodInfoQueryParams,
    method: 'GET'
}, function (error, response, body) {
    console.log('Status for foodInfo', response.statusCode);
    // console.log(foodInfoUrl+foodInfoQueryParams);
    // console.log('Headers', JSON.stringify(response.headers));
    console.log('Result', body);
})

console.log("started")






app.get('/', (req, res) => {
    res.render('index.ejs')
})


app.listen(3000);

