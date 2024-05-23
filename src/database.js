const mongoose = require("mongoose");

const connect = () => {
    mongoose
        .connect(
            process.env.DB_HOST
        )
        .then(() => console.log("MongoDB connect"))
        .catch((err) => console.log(err));
}

module.exports = connect;
