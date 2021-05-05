const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const { Array, Boolean, String } = Schema.Types;

const ContainerSchema = new Schema({
    title: {
        type: String,
        required: true,
    },
    listings: {
        type: Array,
        default: [],
    }
});

const Container = mongoose.model("container", ContainerSchema);
module.exports = Container;
