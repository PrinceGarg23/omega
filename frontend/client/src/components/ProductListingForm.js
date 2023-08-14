// components/ProductListingForm.js
import React, { useState } from 'react';
import { firestore, auth } from '../firebase';
import './a.css';

function ProductListingForm() {
    const [productName, setProductName] = useState('');
    const [productDescription, setProductDescription] = useState('');
    const [productPrice, setProductPrice] = useState('');
    const [availableQuantity, setAvailableQuantity] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();

        const userId = auth.currentUser.uid;

        try {
            const ref = await firestore.collection('products').add({
                sellerId: userId,
                productName,
                productDescription,
                productPrice: parseFloat(productPrice),
                availableQuantity,
                createdAt: new Date(),
            });

            const productDocId = ref.id;
            await ref.update({
                productId: productDocId
            });
            // Clear the form after submission
            setProductName('');
            setProductDescription('');
            setProductPrice('');
            setAvailableQuantity('');
        } catch (error) {
            console.error('Error adding product:', error);
        }
    };

    return (
        <div className="product-listing-card">
            <h3>List Your Product</h3>
            <form onSubmit={handleSubmit}>
                <input
                    type="text"
                    placeholder="Product Name"
                    value={productName}
                    onChange={(e) => setProductName(e.target.value)}
                />
                <textarea
                    placeholder="Product Description"
                    value={productDescription}
                    onChange={(e) => setProductDescription(e.target.value)}
                />
                <input
                    type="number"
                    placeholder="Product Price"
                    value={productPrice}
                    onChange={(e) => setProductPrice(e.target.value)}
                />
                <input
                    type="number"
                    placeholder="Available Quantity"
                    value={availableQuantity}
                    onChange={(e) => setAvailableQuantity(e.target.value)}
                />
                <button type="submit">List Product</button>
            </form>
        </div>
    );
}

export default ProductListingForm;
