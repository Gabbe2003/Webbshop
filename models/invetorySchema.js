const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Define the subschema for inventory items without turning it into a separate model
const InventoryItemSchema = new Schema({
    size: {
        type: String,
        enum: ['XS', 'S', 'M', 'L', 'XL'],
        required: true
    },
    color: {
        type: String,
        enum: ['Blue', 'Black', 'White', 'Red', 'Green', 'Yellow', 'Grey', 'Pink', 'Brown', 'Orange', 'Purple'],
        required: true
    },
    stock: {
        type: Number,
        required: true,
        min: 0
    }
});

// Export just the schema
module.exports = InventoryItemSchema;
