const mongoose = require('mongoose')

const connection = mongoose.connect(process.env.DB_URI).then(res=>{
    console.log("Connected to the DB");
},err=>{
    console.log(err,"Something went wrong pls contact admin");
});

module.exports = { connection };