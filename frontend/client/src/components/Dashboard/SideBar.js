// components/Sidebar.js
import React from 'react';
import './Sidebar.css'; // Import the CSS file
import { useState, useEffect } from 'react';
import Web3 from 'web3';
import { auth, firestore } from '../../firebase';
import { useNavigate } from 'react-router-dom';
import { TailSpin } from 'react-loader-spinner';
import LoyaltyToken from '../../contracts/LoyaltyToken.json';

function Sidebar({ setSelectedSection }) {

    const web3 = new Web3(window.ethereum);
    const contractAddress = '0x34d3aEA61363c9328C8f75dAE13afa80d1220b8c';
    const loyaltyToken = new web3.eth.Contract(LoyaltyToken.abi, contractAddress);
    const navigate = useNavigate();

    const [isMetamaskConnected, setIsMetamaskConnected] = useState(false);
    const [isMetamaskAvailable, setIsMetamaskAvailable] = useState(true);
    const [firebaseAddress, setFirebaseAddress] = useState('');
    const [loading, setLoading] = useState(true);
    // const [userData, setUserData] = useState({});

    useEffect(() => {
        const checkMetamaskConnection = async () => {
            try {
                if (!window.ethereum) {
                    setIsMetamaskAvailable(false);
                    return;
                }

                const accounts = await web3.eth.getAccounts();
                setIsMetamaskAvailable(accounts.length > 0);
            } catch (error) {
                console.error('Error checking Metamask connection:', error);
            }
        };

        checkMetamaskConnection();
    }, [web3]);


    const handleLogout = async () => {
        try {
            await auth.signOut();
            navigate('/login');
        } catch (error) {
            console.error('Error logging out:', error);
        }
    };


    const connectToMetamask = async () => {
        setLoading(true);
        try {
            if (!window.ethereum) {
                console.log('Metamask extension is not available.');
                return;
            }
            await window.ethereum.enable();
            const accounts = await web3.eth.getAccounts();
            const userAddress = accounts[0];

            // console.log("firebase:", firebaseAddress);
            // console.log("user : ", userAddress);

            if (firebaseAddress == userAddress) {
                setIsMetamaskConnected(true);
            } else if (firebaseAddress == '') {

                // Store userAddress in Firestore
                const userId = auth.currentUser.uid;
                await firestore.collection('users').doc(userId).update({
                    ethereumAddress: userAddress,
                });

                await loyaltyToken.methods.addToWhitelist(userAddress).send({
                    from: userAddress,
                });

                console.log('Address added to whitelist successfully!');


                setIsMetamaskConnected(true);
                console.log('Connected to Metamask:', userAddress);
            }
            else {
                setLoading(false);
                alert("Different Metamask Account Connected!");
                navigate('/login');
            }
            setLoading(false);

        } catch (error) {
            console.error('Error connecting to Metamask:', error);
            setLoading(false);
        }
    };

    useEffect(() => {
        // const userId = auth.currentUser?.uid;
        // if (userId) {
        //     const userRef = firebase.database().ref('users').child(userId);
        //     userRef.on('value', (snapshot) => {
        //         const userData = snapshot.val();
        //         if (userData && userData.ethereumAddress) {
        //             setFirebaseAddresses(userData.ethereumAddress);
        //             setCurrentAddress(userData.ethereumAddress);
        //         } else {
        //             setFirebaseAddresses('');
        //         }
        //     });
        // }
        // try {
        //     const accounts = web3.eth.getAccounts();
        //     const userAddress = accounts[0];
        //     if (firebaseAddresses == userAddress) {
        //         setIsMetamaskConnected(true);
        //     }
        // } catch (e) {
        //     console.log(e);
        // }


        if (window.ethereum) {
            window.ethereum.on('accountsChanged', (accounts) => {
                if (accounts.length === 0) {
                    console.log('No accounts available');
                    setIsMetamaskConnected(false);
                } else {
                    // setCurrentAddress(web3.eth.getAccounts()[0]);
                    navigate('/login');

                }
            });
        }


    }, []);

    useEffect(() => {
        setLoading(true);
        const userId = auth.currentUser?.uid;
        if (userId) {
            const fetchUserData = async () => {
                try {
                    const userRef = await firestore.collection('users').doc(userId).get();
                    const userData = userRef.data();
                    if (userData && userData.ethereumAddress) {
                        setFirebaseAddress(userData.ethereumAddress);
                    }
                } catch (error) {
                    console.error('Error fetching user data:', error);
                }
            };

            fetchUserData();
            setLoading(false);
        }
    }, [auth.currentUser, firestore]);

    return (
        <div className="sidebar">
            <h3>Dashboard</h3>
            <ul>

                {loading ? <TailSpin height={50} width={50} /> :

                    <li>
                        {isMetamaskAvailable ? (
                            <button
                                onClick={connectToMetamask}
                                className={`connect-button ${isMetamaskConnected ? 'connected' : ''}`}
                                disabled={isMetamaskConnected}
                            >
                                {isMetamaskConnected ? 'Metamask Connected' : 'Connect to Metamask'}
                            </button>
                        ) : (
                            <p className='warn'>Metamask extension is not available. Please add the Metamask extension.</p>
                        )}
                    </li>

                }

                <li>
                    <button onClick={() => setSelectedSection('list-product')}>List Product</button>
                </li>
                <li>
                    <button onClick={() => setSelectedSection('received-orders')}>Received Orders</button>
                </li>
                <li>
                    <button onClick={handleLogout}>Log Out</button>
                </li>
            </ul>
        </div>
    );
}

export default Sidebar;
