const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const messageSchema = new Schema({ 
    owner: {
        //  Change this to objectId later when you send the real user
        // type: String,
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    text: {
        type:String,
        required:true,
        trim: true,
    },
    media: {
        type: String,
        default: null
    }, 
},{
        timestamps:true
});
module.exports = mongoose.model('Messages', messageSchema);
