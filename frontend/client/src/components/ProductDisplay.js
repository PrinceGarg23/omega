import React, { useState, useEffect } from 'react';
import { firestore } from '../firebase';
import ProductCard from './ProductCard'; // Import the ProductCard component
import './ProductCard.css';

function ProductDisplay() {
    const [products, setProducts] = useState([]);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const productsCollection = await firestore.collection('products').get();
                const productsData = productsCollection.docs.map((doc) => doc.data());
                setProducts(productsData);
                console.log();
            } catch (error) {
                console.error('Error fetching products:', error);
            }
        };

        fetchProducts();
    }, []);

    return (
        <div className="product-display">
            <h3>Available Products</h3>
            <div className="product-list">
                {products.map((product, index) => (
                    <ProductCard key={index} product={product} />
                ))}
            </div>
        </div>
    );
}

export default ProductDisplay;
