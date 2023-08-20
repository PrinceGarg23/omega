import React, { useState, useEffect } from 'react';
import { auth, firestore } from '../firebase';
import './LoyaltyPointsPage.css'; // Import your CSS file
import Web3 from 'web3';
import LoyaltyToken from '../contracts/LoyaltyToken.json';

function LoyaltyPointsPage() {
    const web3 = new Web3(window.ethereum);
    const contractAddress = '0x34d3aEA61363c9328C8f75dAE13afa80d1220b8c';
    const loyaltyTokenContract = new web3.eth.Contract(LoyaltyToken.abi, contractAddress);

    const products = [
        { id: 1, name: 'Trendy Sunglasses', price: 30, image: 'https://firebasestorage.googleapis.com/v0/b/omega-522d7.appspot.com/o/sunglasses.webp?alt=media&token=fe943a52-e5a0-4506-9553-f6ed212c73e8' },
        { id: 2, name: 'Fogg Perfume', price: 50, image: 'https://firebasestorage.googleapis.com/v0/b/omega-522d7.appspot.com/o/fogg.webp?alt=media&token=a89aca6b-4434-4fd6-a348-51f98bf7003c' },
        { id: 3, name: 'Sony Liv Premium(1 month)', price: 80, image: 'https://firebasestorage.googleapis.com/v0/b/omega-522d7.appspot.com/o/sony.jpeg?alt=media&token=df50b7fa-0523-44cf-81e8-f4ccf281d0b6' },
        { id: 4, name: 'Flipkart Plus Premium (1 month)', price: 100, image: 'https://firebasestorage.googleapis.com/v0/b/omega-522d7.appspot.com/o/flip.webp?alt=media&token=909c7741-da83-4df5-9c2f-6c7a6659e35b' },
    ];


    const [userId, setUserId] = useState(null);
    const [tokenBalance, setTokenBalance] = useState(0);
    const [showTokenHistory, setShowTokenHistory] = useState(false);
    const [showRedeemSection, setShowRedeemSection] = useState(false);
    const [showAboutSection, setShowAboutSection] = useState(true);
    const [tokenHistory, setTokenHistory] = useState([]);
    // const [selectedProduct, setSelectedProduct] = useState(null);
    const [selectedProductId, setSelectedProductId] = useState(null);


    async function handleCheckBalance() {
        try {
            const accounts = await web3.eth.getAccounts();
            const userAddress = accounts[0];
            const balance = await loyaltyTokenContract.methods.balanceOf(userAddress).call();
            setTokenBalance(balance);
        } catch (error) {
            console.error('Error checking balance:', error);
        }
    }

    const fetchUserData = async () => {
        try {
            const userRef = firestore.collection('users').doc(userId);
            await userRef.get().then((doc) => {
                if (doc.exists) {
                    handleCheckBalance();
                    // setTokenBalance(doc.data().tokenBalance);
                    setTokenHistory(doc.data().rewardHistory || []);
                }
                console.log(doc.data().rewardHistory);
            });
        } catch (error) {
            console.error('Error fetching user data:', error);
        }

    }

    useEffect(() => {
        const userid = auth.currentUser?.uid;
        console.log(userId);
        setUserId(userid);
        console.log(userId);
        if (userid) {


            fetchUserData();
        }
    }, [auth.currentUser, firestore, userId]);

    // useEffect(() => {
    //     // Fetch the user's token balance and reward history from Firebase
    //     const userRef = firestore.collection('users').doc(userId);

    //     userRef.get().then((doc) => {
    //         if (doc.exists) {
    //             // setTokenBalance(doc.data().tokenBalance);
    //             setTokenHistory(doc.data().rewardHistory || []);
    //         }
    //     });
    // }, [auth.currentUser, firestore, userId]);



    const handleRedeemProduct = async () => {
        if (selectedProductId) {
            try {
                const selectedProduct = products.find((product) => product.id === selectedProductId);

                if (selectedProduct && tokenBalance >= selectedProduct.price) {

                    const accounts = await web3.eth.getAccounts();
                    const userAddress = accounts[0];
                    await loyaltyTokenContract.methods.redeemDiscount(selectedProduct.price).send({
                        from: userAddress,
                    });
                    console.log('Product redeemed successfully blockchain');
                    // Update user's token balance
                    const updatedTokenBalance = tokenBalance - selectedProduct.price;
                    await firestore.collection('users').doc(userId).update({
                        tokenBalance: updatedTokenBalance,
                    });
                    setTokenBalance(updatedTokenBalance);

                    // Add product to reward history
                    const rewardEntry = {
                        rewardDate: new Date(),
                        rewardAmount: -selectedProduct.price,
                        product: selectedProduct.name,
                    };

                    const updatedRewardHistory = [...tokenHistory, rewardEntry];
                    await firestore.collection('users').doc(userId).update({
                        rewardHistory: updatedRewardHistory,
                    });
                    fetchUserData();
                    // setTokenHistory(updatedRewardHistory);

                    // Clear selected product
                    setSelectedProductId(null);

                    alert('Product redeemed successfully');
                } else {
                    alert('Not enough tokens or product not found.');
                }
            } catch (error) {
                console.error('Error redeeming product:', error);
            }
        } else {
            console.log('Please select a product to redeem.');
        }
    };


    return (
        <div className="loyalty-points-page">
            <h2>Loyalty Points</h2>
            <div className="token-balance">
                <p>Current Token Balance: {tokenBalance}</p>
                <p>Referral Code: {userId}</p>
            </div>
            <div className="toggle-buttons">
                <button
                    className={`toggle-button ${showAboutSection ? 'active' : ''}`}
                    onClick={() => {
                        setShowTokenHistory(false);
                        setShowRedeemSection(false); // Deactivate the other section
                        setShowAboutSection(true);
                    }}
                >
                    About
                </button>&nbsp;
                <button
                    className={`toggle-button ${showTokenHistory ? 'active' : ''}`}
                    onClick={() => {
                        setShowTokenHistory(true);
                        setShowRedeemSection(false); // Deactivate the other section
                        setShowAboutSection(false);
                    }}
                >
                    Show Token History
                </button>&nbsp;
                <button
                    className={`toggle-button ${showRedeemSection ? 'active' : ''}`}
                    onClick={() => {
                        setShowRedeemSection(true);
                        setShowTokenHistory(false); // Deactivate the other section
                        setShowAboutSection(false);
                    }}
                >
                    Redeem Tokens
                </button>
            </div>

            {showAboutSection && (
                <div className="about">
                    <h1>INTRODUCTION</h1>
                    <h2>FlipKΩin, harnessed through cutting-edge blockchain technology, stands as a distinctive interchangeable token designed to serve as a reward mechanism for our loyal customers.</h2>
                    <h3>Eligibility to become a Loyal Customer</h3>
                    <p>1. Minimum 3 Purchases.<br />
                        2. Minimum Rs.3000 purchase value in total.</p>
                    <p>Fulfill the above requirements to become a loyal customer and start getting rewards now.</p>
                    <h3>How to earn FlipKΩin?</h3>
                    <p>1. Become a Loyal Customer.<br />
                        2. Get rewarded upto 100 tokens on each purchase.<br />
                        3. Earn tokens through Referrals.(Must use your referral ID)<br />
                    </p>
                    <h3>How can you Redeem Tokens?</h3>
                    <p>
                        1. You can directly purchase Subsidised Products through your tokens.<br />
                        2. Get Subscriptions of your favourite OTT Platform in exchange of your tokens.<br />
                        3. Become a Flipkart Plus Member at a discounted price through your tokens.
                    </p>

                </div>
            )}

            {showTokenHistory && (
                <div className="token-history">
                    <h1>Token Earning History</h1>
                    <ul>
                        {tokenHistory.map((entry, index) => (
                            <li key={index}>
                                Earned on : {entry.rewardDate.toDate().toString()}
                                {/* <div className='amount'>{entry.rewardAmount} tokens</div> */}
                                &nbsp;&nbsp;&nbsp;&nbsp;
                                {entry.product || ''}
                                <div
                                    className="amount"
                                    style={{ color: entry.rewardAmount >= 0 ? 'green' : 'red' }}
                                >
                                    {entry.rewardAmount} tokens
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
            {/* {showRedeemSection && (
                <div className="redeem-section">
                    <h1>Redeem Products</h1>
                    <h3>Redeem your tokens for products!</h3>
                    <div className="product-grid">
                        {products.map((product) => (
                            <div
                                key={product.id}
                                className="product-card"
                                onClick={() => setSelectedProductId(product.id)}
                                style={{
                                    border: selectedProductId === product.id ? '2px solid #2196f3' : '1px solid #ccc',
                                }}
                            >
                                <div className="product-name">{product.name}</div>
                                <div className="product-price">{product.price} tokens</div>
                            </div>
                        ))}
                    </div>
                    <button className="redeem-button" onClick={handleRedeemProduct}>
                        Redeem Product
                    </button>
                </div>
            )} */}
            {showRedeemSection && (
                <div className="redeem-section">
                    <h1>Redeem Products</h1>
                    <h3>Redeem your tokens for products!</h3>
                    <div className="product-grid">
                        {products.map((product) => (
                            <div
                                key={product.id}
                                className="product-card"
                                onClick={() => setSelectedProductId(product.id)}
                                style={{
                                    border: selectedProductId === product.id ? '2px solid #2196f3' : '1px solid #ccc',
                                }}
                            >
                                <div className="product-image">
                                    <img src={product.image} alt={product.name} />
                                </div>
                                <div className="product-details">
                                    <div className="product-name">{product.name}</div>
                                    <div className="product-price">{product.price} tokens</div>
                                </div>
                            </div>
                        ))}
                    </div>
                    <button className="redeem-button" onClick={handleRedeemProduct}>
                        Redeem Product
                    </button>
                </div>
            )}

        </div>
    );
}

export default LoyaltyPointsPage;
