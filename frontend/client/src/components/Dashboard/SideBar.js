// components/Sidebar.js
import React from 'react';
import './Sidebar.css'; // Import the CSS file
import { useState, useEffect } from 'react';
import Web3 from 'web3';
import { auth, firestore } from '../../firebase';
import { useNavigate } from 'react-router-dom';

function Sidebar({ setSelectedSection }) {

    const web3 = new Web3(window.ethereum);
    const navigate = useNavigate();

    const [isMetamaskConnected, setIsMetamaskConnected] = useState(false);
    const [isMetamaskAvailable, setIsMetamaskAvailable] = useState(true);

    useEffect(() => {
        const checkMetamaskConnection = async () => {
            try {
                if (!window.ethereum) {
                    setIsMetamaskAvailable(false);
                    return;
                }

                const accounts = await web3.eth.getAccounts();
                setIsMetamaskConnected(accounts.length > 0);
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
        try {
            if (!window.ethereum) {
                console.log('Metamask extension is not available.');
                return;
            }

            await window.ethereum.enable();
            const accounts = await web3.eth.getAccounts();
            const userAddress = accounts[0];

            // Store userAddress in Firestore
            const userId = auth.currentUser.uid;
            await firestore.collection('users').doc(userId).update({
                ethereumAddress: userAddress,
            });

            setIsMetamaskConnected(true);
            console.log('Connected to Metamask:', userAddress);
        } catch (error) {
            console.error('Error connecting to Metamask:', error);
        }
    };
    return (
        <div className="sidebar">
            <h3>Dashboard</h3>
            <ul>

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