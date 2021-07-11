const getContext = require('../public/js/getContext');
const request = require('request');
const db = require("../DB/database.js");

async function info(client, foodInfo, prodNum) {
    return new Promise(async (resolve, reject) => {
        let isItInDb = await db.findInfo(client, prodNum);
        if(isItInDb) {
            resolve(isItInDb);
        } else {
            request({
                url: foodInfo.url + foodInfo.params + '/' + encodeURIComponent('PRDLST_REPORT_NO') + '=' + prodNum,
                method: 'GET'
            }, async function (error, response, body) {
                let totCount = getContext("food-totalCount", response.body);
                if (totCount != 0) {
                    let rwmat_arr = getContext("RAWMTRL_NM", response.body)
    
                    let prodName = getContext("PRDLST_NM", response.body);
                    let result = {
                        prodNum: prodNum,
                        prodName: prodName,
                        rwmat_arr: rwmat_arr
                    }
                    db.createListing(client, result, "info");
                    resolve(result);
                } else {
                    reject(`Cannot find product with following prodNum : ${prodNum}`);
                }
            });
        }
    })
}

module.exports = info;