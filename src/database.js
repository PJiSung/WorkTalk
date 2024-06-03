const mongoose = require("mongoose");
require('dotenv').config();

    mongoose
        .connect(
            process.env.DB_HOST
        )
        .then(() => console.log("MongoDB connect"))
        .catch((err) => console.log(err));

module.exports = mongoose;
