const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UserSchema = new Schema({
    email: {
        type: String,
        required: true
    }
})
const User = mongoose.model("coming-soon-emails", UserSchema);
module.exports = User;
