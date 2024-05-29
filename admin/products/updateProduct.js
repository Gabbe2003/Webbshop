const Product = require('../../models/productSchema');

const updateProduct = async (req, res) => {
    const { productId } = req.params;
    const { name, price, description, imageUrl, inventory, category } = req.body;

    if (!productId) {
        return res.status(400).json({ message: 'No product ID provided in the parameter.' });
    }

    // Prepare update object
    let updateData = {};
    if (name !== undefined) {
        if (name.trim() === '') {
            return res.status(400).json({ message: 'Product name cannot be empty.' });
        }
        // Check if the name is already in use by another product
        const existingProduct = await Product.findOne({ name: name.trim(), _id: { $ne: productId } });
        if (existingProduct) {
            return res.status(400).json({ message: 'Product name is already in use.' });
        }
        updateData.name = name.trim();
    }
    if (description !== undefined) updateData.description = description;
    if (price !== undefined) {
        if (typeof price !== 'number' || price < 0) {
            return res.status(400).json({ message: 'Invalid price. Price must be a non-negative number.' });
        }
        updateData.price = price;
    }
    if (imageUrl !== undefined) updateData.imageUrl = imageUrl;
    if (inventory !== undefined) {
        // Validate inventory structure (optional, can add specific checks similar to create handler)
        updateData.inventory = inventory;
    }
    if (category !== undefined) updateData.category = category;

    try {
        const updatedProduct = await Product.findByIdAndUpdate(
            productId,
            { $set: updateData },
            { new: true, runValidators: true }
        );

        if (!updatedProduct) {
            return res.status(404).json({ message: 'Product not found or no changes made.' });
        }

        return res.status(200).json({
            message: 'Successfully updated the product',
            product: updatedProduct
        });
    } catch (error) {
        console.error('Error while updating the product:', error);
        return res.status(500).json({ message: 'Error while updating the product', error });
    }
};

module.exports = updateProduct;
