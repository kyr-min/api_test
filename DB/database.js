async function dbConnect(inclient) {
    await inclient.connect();
    console.log("DB Connected")
}

async function report(client, prodNum, status) {
    var res;
    try{
        var update = await updateStatus(client, prodNum, status);
        
        if(update){
            res = await findOneByprodNum(client, prodNum);
            return res;
        }
    } catch (e){
        return "Error";
    }
}

async function findOneByprodNum(client, prodNum) {
    const result = await client.db("mobileContents").collection("food").findOne({
        prodNum: prodNum
    });
    if (result) {
        //console.log(`Found product, in: ${prodNum}`);
        return result;
    } else {
        //console.log(`No product found, in: ${prodNum}`);
        return null;
    }
}

async function findMat(client, matName) {
    const result = await client.db("mobileContents").collection("material").findOne({
        matName: matName
    });
    if(result) {
        // console.log(`Found matName in: ${matName}`);
        return result;
    } else {
        // console.log(`Not found, in: ${matName}`);
        return null;
    }
}

async function findInfo(client, prodNum){
    const result = await client.db("mobileContents").collection("info").findOne({
        prodNum: prodNum
    });
    if (result) {
        // console.log(`Found product, in: ${prodNum}`);
        return result;
    } else {
        // console.log(`No product found, in: ${prodNum}`);
        return null;
    }
}

async function createListing(client, document, colName) {
    const result = await client.db("mobileContents").collection(colName).insertOne(document);
    // if(result){
    //     console.log(`document inserted in DB   id: ${result.insertedId}`);
    // } else {
    //     console.log(`Couldn't insert document into DB`);
    // }
}

async function updateStatus(client, prodNum, status) {
    var result;
    try{
        result = await client.db("mobileContents").collection("food").updateOne({prodNum: prodNum}, {$set : {status : status}});
        return "Succesfull";
    } catch(e) {
        return null;
    }
}

module.exports = {dbConnect, report, findOneByprodNum, createListing, updateStatus, findMat, findInfo};