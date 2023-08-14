import React, { useState, useEffect } from 'react';
import { auth, firestore } from '../firebase';
import { useNavigate } from 'react-router-dom';
import './CartPage.css';
import { TailSpin } from 'react-loader-spinner';

function CartPage() {
    const [cartItems, setCartItems] = useState([]);
    const [userId, setUserId] = useState(null);
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);



    const fetchCartItems = async () => {
        try {
            setLoading(true);
            const userId = auth.currentUser.uid;
            const userDoc = await firestore.collection('users').doc(userId).get();
            const cart = userDoc.data().cart || {};

            // Fetch product details for each cart item
            const cartItemsData = [];
            for (const productId in cart) {
                const productDoc = await firestore.collection('products').doc(productId).get();
                const productData = productDoc.data();
                cartItemsData.push({
                    id: productId,
                    name: cart[productId].name,
                    price: cart[productId].price,
                    quantity: cart[productId].quantity,
                });
            }

            setCartItems(cartItemsData);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching cart items:', error);
        }
    };

    useEffect(() => {
        if (auth.currentUser) {
            setUserId(auth.currentUser.uid);
            fetchCartItems();
        } else {
            navigate('/login');
        }

    }, [userId]);


    const generateOrderId = () => {
        const timestamp = new Date().getTime();
        const randomNum = Math.floor(Math.random() * 10000);
        return `ORDER-${timestamp}-${randomNum}`;
    };

    const deleteItem = async (productId) => {
        try {
            const userDoc = await firestore.collection('users').doc(userId).get();
            const cart = userDoc.data().cart || {};

            delete cart[productId];

            await firestore.collection('users').doc(userId).update({ cart });
            fetchCartItems(); // Refresh the cart items after deletion
        } catch (error) {
            console.error('Error deleting item from cart:', error);
        }
    };

    const decreaseQuantity = async (productId) => {
        try {
            const userDoc = await firestore.collection('users').doc(userId).get();
            const cart = userDoc.data().cart || {};

            if (cart[productId].quantity > 1) {
                cart[productId].quantity--;

                await firestore.collection('users').doc(userId).update({ cart });
                fetchCartItems(); // Refresh the cart items after quantity change
            }
        } catch (error) {
            console.error('Error decreasing quantity in cart:', error);
        }
    };

    const placeOrder = async () => {
        try {
            setLoading(true);
            const userDoc = await firestore.collection('users').doc(userId).get();
            const cart = userDoc.data().cart || {};

            // Group products by seller
            const productsBySeller = {};
            for (const productId in cart) {
                const productDoc = await firestore.collection('products').doc(productId).get();
                const productData = productDoc.data();
                //console.log(productData.productPrice);

                if (!productsBySeller[productData.sellerId]) {
                    productsBySeller[productData.sellerId] = [];
                }

                productsBySeller[productData.sellerId].push({
                    productId,
                    name: productData.productName,
                    price: productData.productPrice,
                    quantity: cart[productId].quantity,
                });
            }

            // Send orders to respective sellers
            for (const sellerId in productsBySeller) {
                const orderItems = productsBySeller[sellerId];
                let totalCost = 0;
                for (const item of orderItems) {
                    totalCost += item.price * item.quantity;
                    //console.log(totalCost, item.price, item.quantity);
                }

                const order = {
                    buyerId: userId,
                    sellerId,
                    items: orderItems,
                    totalCost,
                    status: 'pending',
                    createdAt: new Date(),
                };

                const orderId = generateOrderId();

                //console.log('Order to be added:', order);

                await firestore.collection('orders').doc(orderId).set(order);
                alert('Order Placed!!');
            }

            // Clear the cart after placing the order
            await firestore.collection('users').doc(userId).update({ cart: {} });


            // Update order history
            const orderHistory = userDoc.data().orderHistory || [];
            orderHistory.push({ orders: productsBySeller });
            await firestore.collection('users').doc(userId).update({ orderHistory });

            // Refresh the cart items after placing the order
            fetchCartItems();
            setLoading(false);
        } catch (error) {
            console.error('Error placing order:', error);
        }
    };

    return (
        <div className="cart-page">
            <h3>Your Cart</h3>
            {loading ? <TailSpin height={50} width={50} /> : <div className="cart-items">
                {cartItems.map((item) => (
                    <div key={item.id} className="cart-item">
                        {/* ... (other item details) */}
                        <div className="item-details">
                            <p className="item-name">{item.name}</p>
                            <p className="item-price">Price: Rs {item.price * item.quantity}</p>
                        </div>
                        <div className="item-actions">
                            <button onClick={() => decreaseQuantity(item.id)}>-</button>
                            <span>{item.quantity}</span>
                            <button onClick={() => deleteItem(item.id)}>Delete</button>
                        </div>
                    </div>
                ))}
            </div>}
            <p className="total-price">
                Total Price: Rs {cartItems.reduce((total, item) => total + item.price * item.quantity, 0)}
            </p>
            <div className="place-order">
                <button onClick={placeOrder}>Place Order</button>
            </div>
        </div>
    );
}

export default CartPage;
