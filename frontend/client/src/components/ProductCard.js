import React, { useState } from 'react';
import './ProductCard.css';
import { auth, firestore } from '../firebase';

function ProductCard({ product }) {
    const [quantity, setQuantity] = useState(1);

    const increaseQuantity = () => {
        setQuantity(quantity + 1);
    };

    const decreaseQuantity = () => {
        if (quantity > 1) {
            setQuantity(quantity - 1);
        }
    };

    const addToCart = async () => {
        try {
            if (quantity <= product.availableQuantity) {
                const userId = auth.currentUser.uid;
                const userDoc = await firestore.collection('users').doc(userId).get();
                const cart = userDoc.data().cart || {};
                // console.log(product.productId);
                cart[product.productId] = { name: product.productName, desc: product.productDescription, quantity, price: product.productPrice };
                await firestore.collection('users').doc(userId).update({ cart });
                alert('Product added to cart!');
            } else {
                alert("This much is not in stock!")
            }


        } catch (error) {
            console.error('Error adding product to cart:', error);
        }

    };

    return (
        <div className="product-card">
            <h3>{product.productName.toUpperCase()}</h3>
            <p>{product.productDescription}</p>
            <p>Price: Rs {product.productPrice} </p>
            <div className="quantity-controls">
                <button onClick={decreaseQuantity}>-</button>
                <span>{quantity}</span>
                <button onClick={increaseQuantity}>+</button>
            </div>
            <button onClick={addToCart}>Add to Cart</button>
        </div>
    );
}

export default ProductCard;
