import React, { useState, useEffect } from 'react';
import { firestore } from '../firebase';
import ProductCard from './ProductCard'; // Import the ProductCard component
import './ProductCard.css';
import { TailSpin } from 'react-loader-spinner';

function ProductDisplay() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                setLoading(true);
                const productsCollection = await firestore.collection('products').get();
                const productsData = productsCollection.docs.map((doc) => doc.data());
                setProducts(productsData);
                // console.log();
                setLoading(false);
            } catch (error) {
                console.error('Error fetching products:', error);
            }
        };

        fetchProducts();
    }, []);

    return (
        <div className="product-display">
            <h1>Available Products</h1>
            {loading ? <TailSpin height={50} width={50} /> : <div className="product-list">
                {products.map((product, index) => (
                    <ProductCard key={index} product={product} />
                ))}
            </div>}
        </div>
    );
}

export default ProductDisplay;
