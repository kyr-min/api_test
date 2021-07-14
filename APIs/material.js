const getContext = require('../public/js/getContext');
const request = require('request');
const db = require("../DB/database.js");

function material(client, rwMat, matName) {
    return new Promise( async (resolve, reject) => {
        let isItInDB = await db.findMat(client, matName);
        if (isItInDB) {
            resolve(isItInDB);
        } else {
            request({
                url: rwMat.url + rwMat.params + '&' + encodeURIComponent('rprsnt_rawmtrl_nm') + '=' + encodeURIComponent(matName) +
                    '&' + encodeURIComponent('pageNo') + '=' + encodeURIComponent('1') + '&' + encodeURIComponent('numOfRows') + '=' + encodeURIComponent('1'),
                method: 'GET'
            }, async function (error, response, body) {
                let totCount = parseInt(getContext("mat-totalCount", response.body));
                let resultCode = parseInt(getContext("resultCode", response.body));
                if (totCount != 0 && resultCode == 0) {
                    let RPRSNT_RAWMTRL_NM = getContext("RPRSNT_RAWMTRL_NM", response.body);
                    let MLSFC_NM = getContext("MLSFC_NM", response.body);

                    let result = {
                        matName: matName,
                        RPRSNT_NML: RPRSNT_RAWMTRL_NM,
                        MLSFC_NM: MLSFC_NM
                    };
                    await db.createListing(client, result, "material");
                    resolve(result);
                } else {
                    let result = {
                        matName: matName,
                        MLSFC_NM: "not-found"
                    }
                    await db.createListing(client, result, "material");
                    resolve(result);
                }
            });
        }
    })
}

module.exports = material;