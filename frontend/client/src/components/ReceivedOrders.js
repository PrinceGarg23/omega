import React, { useEffect, useState } from 'react';
import { auth, firestore } from '../firebase';
import './ReceivedOrders.css';
import { useNavigate } from 'react-router-dom';

function ReceivedOrders() {
    const [orders, setOrders] = useState([]);
    const [userId, setUserId] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        if (auth.currentUser) {
            setUserId(auth.currentUser.uid);
        } else {
            navigate('/login');
        }

    }, [userId]);
    const handleConfirmStatus = async (orderId) => {
        try {
            await firestore.collection('orders').doc(orderId).update({
                status: 'Confirmed', // Update the status to 'Confirmed' or any other desired value
            });
            console.log('Order status confirmed successfully');
        } catch (error) {
            console.error('Error confirming order status:', error);
        }
    };

    useEffect(() => {
        const userId = auth.currentUser.uid;
        const ordersRef = firestore.collection('orders');

        const unsubscribe = ordersRef
            .where('sellerId', '==', userId)
            .orderBy('createdAt', 'desc').onSnapshot((snapshot) => {
                const orderData = [];
                snapshot.forEach((doc) => {
                    orderData.push({ id: doc.id, ...doc.data() });
                });
                setOrders(orderData);
            });

        return () => {
            unsubscribe();
        };
    }, []);

    return (
        <div>
            <h2>Received Orders</h2>
            <ul>
                {orders.map((order) => (
                    <li key={order.id} className="order-card">
                        <div className="order-details">
                            <p>Order ID: {order.id}</p>
                            <p>Buyer: {order.buyerId}</p>
                        </div>
                        <div className="order-status">
                            Status: {order.status}
                            {order.status !== 'Confirmed' && (
                                <button
                                    className="confirm-button"
                                    onClick={() => handleConfirmStatus(order.id)}
                                >
                                    Confirm Order
                                </button>
                            )}
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default ReceivedOrders;
