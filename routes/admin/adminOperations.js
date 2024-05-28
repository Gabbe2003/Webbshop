const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');


const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, 
    max: 10, 
    message: 'Too many password change requests from this IP, please try again after 15 minutes',
  });
  

const createProduct = require('../../admin//products/createProduct');
const getAllProducts = require('../../admin/products/getAllPrdocuts');
const deleteProduct = require('../../admin/products/deleteProduct');
const updateProduct = require('../../admin/products/updateProduct');
const getAllUsers = require('../../admin/controller/getAllUsers');

router.get('/getAllUsers', limiter, getAllUsers.getAllUsers);
router.post('/createProduct', limiter, createProduct.createProduct)
router.get('/getAllProducts', limiter, getAllProducts.getAllProducts);
router.delete('/deleteProduct/:productId', limiter, deleteProduct);
router.put('/updateProduct/:productId', limiter, updateProduct);

module.exports = router; 