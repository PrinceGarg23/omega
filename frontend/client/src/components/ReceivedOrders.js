import React, { useEffect, useState } from 'react';
import { auth, firestore } from '../firebase';
import './ReceivedOrders.css';
import Web3 from 'web3';
import LoyaltyToken from '../contracts/LoyaltyToken.json';
import { useNavigate } from 'react-router-dom';

function ReceivedOrders() {
    const [orders, setOrders] = useState([]);
    const [userId, setUserId] = useState(null);
    const [loyalBuyer, setLoyalBuyer] = useState(false);
    const navigate = useNavigate();

    const web3 = new Web3(window.ethereum);
    const contractAddress = '0x34d3aEA61363c9328C8f75dAE13afa80d1220b8c';
    const loyaltyTokenContract = new web3.eth.Contract(LoyaltyToken.abi, contractAddress);

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

    const addRewardHistoryEntry = async (customerId, rewardAmount) => {
        try {
            const userRef = firestore.collection('users').doc(customerId);
            const userDoc = await userRef.get();
            const currentRewardHistory = userDoc.data().rewardHistory || [];

            // Add the new reward entry to the history
            const newRewardEntry = {
                rewardAmount: rewardAmount,
                rewardDate: new Date(),
            };
            const updatedRewardHistory = [...currentRewardHistory, newRewardEntry];

            // Update the user document with the updated reward history
            await userRef.update({ rewardHistory: updatedRewardHistory });

            console.log('Reward history entry added to user document successfully');
        } catch (error) {
            console.error('Error adding reward history entry to user document:', error);
        }
    };


    const rewardLoyalCustomer = async (orderId, buyerId, amount) => {
        try {
            const accounts = await web3.eth.getAccounts();
            const userAddress = accounts[0];
            const addressRef = await firestore.collection('users').doc(buyerId).get();
            const data = addressRef.data();
            console.log(data);
            await loyaltyTokenContract.methods.rewardBuyer(data.ethereumAddress, amount).send({
                from: userAddress,
            });
            addRewardHistoryEntry(buyerId, amount);
            alert("Rewarded with ", amount, " tokens");
            handleConfirmStatus(orderId);
            console.log('Reward ', amount, ' transaction successful');
        } catch (error) {
            console.error('Error while rewarding:', error);
        }
    };
    const fetchCustomerPurchaseHistory = async (buyerId) => {
        try {
            const ordersRef = firestore.collection('orders');
            const querySnapshot = await ordersRef
                .where('buyerId', '==', buyerId)
                .orderBy('createdAt')
                .get();

            const purchaseHistory = [];
            querySnapshot.forEach((doc) => {
                const orderData = doc.data();
                const items = orderData.items || []; // Ensure there is a default array
                const purchaseEntry = {
                    id: doc.id,
                    createdAt: orderData.createdAt,
                    // items: items,
                    totalCost: orderData.totalCost,
                };
                purchaseHistory.push(purchaseEntry);
            });
            console.log(purchaseHistory);
            return purchaseHistory;
        } catch (error) {
            console.error('Error fetching purchase history:', error);
            return [];
        }
    };


    const checkLoyalty = async (buyerId) => {
        const customerPurchaseHistory = await fetchCustomerPurchaseHistory(buyerId);
        console.log("from loyalty : ", customerPurchaseHistory);
        // Set your loyalty criteria thresholds
        const minTransactionsForLoyalty = 3;
        const minTotalAmountForLoyalty = 3000;

        // Calculate the total number of transactions and total amount spent
        const totalTransactions = customerPurchaseHistory.length;
        let totalAmountSpent = 0;

        for (const purchase of customerPurchaseHistory) {
            totalAmountSpent += purchase.totalCost;
        }
        console.log((
            totalTransactions >= minTransactionsForLoyalty &&
            totalAmountSpent >= minTotalAmountForLoyalty
        ));
        console.log("checkL : ",
            (totalTransactions >= minTransactionsForLoyalty &&
                totalAmountSpent >= minTotalAmountForLoyalty
            ));
        // Check if the customer meets the loyalty criteria
        return (
            totalTransactions >= minTransactionsForLoyalty &&
            totalAmountSpent >= minTotalAmountForLoyalty
        );
    };


    const handleCheckLoyaltyAndReward = async (orderId, buyerId) => {
        try {
            // Replace this with your loyalty check logic
            const isLoyal = await checkLoyalty(buyerId);
            console.log("Before : ", isLoyal);
            setLoyalBuyer(isLoyal);
            console.log("After : ", isLoyal);

            // if (isLoyal) {
            //     // Provide a space to reward the loyal customer
            //     const rewardAmount = 100; // Example reward amount
            //     return (
            //         <div>
            //             <p>Customer is loyal! Reward with tokens:</p>
            //             <button onClick={() => rewardLoyalCustomer(buyerId, rewardAmount)}>
            //                 Reward {rewardAmount} Tokens
            //             </button>
            //         </div>
            //     );
            // } else {
            //     return <p>Customer is not loyal.</p>;
            // }
        } catch (error) {
            console.error('Error while checking loyalty:', error);
        }
    };

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
                                <>
                                    <button
                                        className="confirm-button"
                                        onClick={() => handleConfirmStatus(order.id)}
                                    >
                                        Confirm Order
                                    </button>
                                    <button
                                        className="loyalty-reward-button"
                                        onClick={() => handleCheckLoyaltyAndReward(order.id, order.buyerId)}
                                    >
                                        Check Loyalty and Reward
                                    </button>
                                    {loyalBuyer ? (
                                        <button
                                            className="reward-button"
                                            onClick={() => rewardLoyalCustomer(order.id, order.buyerId, order.totalCost / 100)}
                                        >
                                            Reward Buyer
                                        </button>
                                    ) : (
                                        <p>Customer is not loyal.</p>
                                    )}
                                </>
                            )}
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default ReceivedOrders;
