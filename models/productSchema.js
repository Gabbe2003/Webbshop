const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const InventoryItemSchema = require('./invetorySchema');

const ProductSchema = new Schema({
    name: {
        type: String,
        required: true,
        unique: true, 
        trim: true    
    },
    description: {
        type: String,
        trim: true
    },
    price: {
        type: Number,
        required: true,
        min: 0        
    },
    imageUrl: {
        type: String,  
        required: false 
    },
    inventory: [InventoryItemSchema],
    category: {
        type: [String],
        enum: ['Socks', 'Shoes', 'Pants', 'Underwear', 'T-shirt', 'Sweatshirt', 'Jacket'],
        required: true,
        trim: true
    },
    purchasesCount: {
        type: Number,
        default: 0  
    }, 
});

module.exports = mongoose.model('Product', ProductSchema);
