const mongoose = require("mongoose");
const bcrypt = require('bcrypt');
const Schema = mongoose.Schema;

const UserSchema = new Schema({ 
    username: {
        type: String,
        required: true, 
        unique: true,
        trim: true,
        index:true
    },
    password: {
        type: String,
        required: true, 
    },
    email: {
        type: String,
        required: true, 
        unique: true,
        trim: true,
        lowercase: true,
        index:true
    },
    refreshToken:[],
    verifyTokens: [{
        token: { type: String },
        expires: { type: Date },
    }],
    verified: {
        type: Boolean,
        default: false,
    },
    roles: {
        type: [String],
        enum: ['Admin', 'User'],
        default: ['User'] 
    }, purchases: [{
        type: Schema.Types.ObjectId,
        ref: 'Purchase'
    }],
    }, {
        timestamps:true
});

//We want to always hash the password as close as possible to the database in order to not do it each time we want to store a password.
UserSchema.pre('save', async function (next) {
    // Only hash the password if it has been modified (or is new)
    if (!this.isModified('password')) return next();

    try {
        // Generate a salt and hash the password
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(`Error while hashing password ${error}`);
    }
}); 

module.exports = mongoose.model('User', UserSchema);
