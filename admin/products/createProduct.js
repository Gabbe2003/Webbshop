const Product = require('../../models/productSchema');

const createProduct = async (req, res) => {
    const { name, description, price, imageUrl, inventory, category } = req.body;

    // Validate required fields
    if (!name || !price || !inventory || inventory.length === 0 || !category) {
        return res.status(400).json({ message: 'Required fields are missing. Please provide name, price, inventory (with at least one item), and category.' });
    }

    // Additional validations
    if (typeof name !== 'string') {
        return res.status(400).json({ message: 'Invalid name. Name must be a string.' });
    }
    if (typeof description !== 'string' && description !== undefined) {
        return res.status(400).json({ message: 'Invalid description. Description must be a string if provided.' });
    }
    if (typeof price !== 'number' || price < 0) {
        return res.status(400).json({ message: 'Invalid price. Price must be a non-negative number.' });
    }
    if (imageUrl && typeof imageUrl !== 'string') {
        return res.status(400).json({ message: 'Invalid image URL. Image URL must be a string if provided.' });
    }
    if (!Array.isArray(category)) {
        return res.status(400).json({ message: 'Invalid category. Category must be an array.' });
    }

    // Check inventory structure
    const inventoryValidation = inventory.every(item => 
        typeof item.size === 'string' && ['XS', 'S', 'M', 'L', 'XL'].includes(item.size) &&
        typeof item.color === 'string' && ['Blue', 'Black', 'White', 'Red', 'Green', 'Yellow', 'Grey', 'Pink', 'Brown', 'Orange', 'Purple'].includes(item.color) &&
        typeof item.stock === 'number' && item.stock >= 0
    );

    if (!inventoryValidation) {
        return res.status(400).json({ message: 'Invalid inventory. Ensure each item has a valid size, color, and non-negative stock.' });
    }

    try {
        const newProduct = new Product({
            name, 
            description, 
            price, 
            imageUrl, 
            inventory, 
            category
        });
        const savedProduct = await newProduct.save();
        console.log(savedProduct);
        res.status(201).json(savedProduct);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Failed to create the product due to server error.', err });
    }
};

module.exports = { createProduct };
