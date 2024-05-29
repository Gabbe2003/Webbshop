const Product = require('../../models/productSchema');

const deleteProduct = async (req,res) => {
    
    const { productId } = req.params;

    try {
        
        const deleteProductById = await Product.findByIdAndDelete(productId);
        if (!deleteProductById) {
            return res.status(404).json({ message: 'Products not found.' });
        }

        console.log(deleteProductById.name)
        res.status(200).json({ message: `Success deletion of product ${deleteProductById.name}`})
    } catch (error) {
        return res.status(500).json({ message: 'Error while deleting the product.', error})
    }
}


module.exports = deleteProduct;
