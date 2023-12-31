import React, { useEffect, useState } from 'react';
import { firestore, auth } from '../firebase';
import './OrderHistory.css';
import { TailSpin } from 'react-loader-spinner';

function OrderHistory() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        setLoading(true);
        const userId = auth.currentUser.uid;
        const ordersRef = firestore.collection('orders');

        const unsubscribe = ordersRef
            .where('buyerId', '==', userId)
            .orderBy('createdAt')
            .onSnapshot((snapshot) => {
                const orderData = [];
                snapshot.forEach((doc) => {
                    orderData.push({ id: doc.id, ...doc.data() });
                });
                setOrders(orderData);
                setLoading(false);
            });


        return () => {
            unsubscribe();
        };

    }, []);

    // Render order history
    return (
        <div className="order-history">
            <h1>Order History</h1>
            {loading ? <TailSpin height={50} width={50} /> : <ul className="order-list">
                {orders.map((order) => (
                    <li className="order-item" key={order.id}>
                        <div className="order-details">
                            <span className="order-id">Order ID: {order.id}</span>
                            <span className="order-status">Status: {order.status}</span>
                            <span className="order-total">Total Cost: {order.totalCost}</span>
                        </div>
                        {/* Additional details or actions */}
                    </li>
                ))}
            </ul>
            }
        </div >
    );
}

export default OrderHistory;
