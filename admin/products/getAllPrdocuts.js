const Product = require('../../models/productSchema');

const getAllProducts = async (req, res) => {
    const { name, price, category } = req.query;

    let query = {};
    if (name) query.name = { $regex: name, $options: 'i' };
    if (price) query.price = Number(price);
    if (category) query.category = category;

    try {
        const products = await Product.find(query);
        res.json(products);
    } catch (error) {
        console.error('Error while trying to retrieve products:', error);
        res.status(500).json({ message: 'Error while trying to retrieve the products', error });
    }
};

module.exports = { getAllProducts };
