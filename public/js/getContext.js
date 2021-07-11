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
            let resultCode_end = body.indexOf("resultCode", resultCode_start + 1);
            let resultCode = body.substring(resultCode_start + 11, resultCode_end - 2);
            return resultCode;
            break;
        default:
            console.error("no case found");
    }
}

module.exports = getContext