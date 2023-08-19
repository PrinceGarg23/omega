import React, { useState } from 'react';
import Web3 from 'web3';
import LoyaltyToken from '../contracts/LoyaltyToken.json';
// import { abi as ERC20ABI } from '../contracts/ERC20.json';
import './Admin.css';

function Admin() {
    const web3 = new Web3(window.ethereum);
    const contractAddress = '0x34d3aEA61363c9328C8f75dAE13afa80d1220b8c';
    const loyaltyTokenContract = new web3.eth.Contract(LoyaltyToken.abi, contractAddress);


    //
    const [sharedWalletAddress, setSharedWalletAddress] = useState('');
    const [conversionRate, setConversionRate] = useState(1);
    const [mintAmount, setMintAmount] = useState(0);
    const [whitelistAddress, setWhitelistAddress] = useState('');
    const [buyerAddress, setBuyerAddress] = useState('');
    const [removeWhitelistAddress, setRemoveWhitelistAddress] = useState('');
    const [removeBuyerAddress, setRemoveBuyerAddress] = useState('');
    const [recipientAddress, setRecipientAddress] = useState('');
    const [rewardAmount, setRewardAmount] = useState('');
    const [burnAccount, setBurnAccount] = useState('');
    const [balanceAddress, setBalanceAddress] = useState('');
    const [balance, setBalance] = useState(0);



    //

    async function handleCheckBalance() {
        try {
            const accounts = await web3.eth.getAccounts();
            const userAddress = accounts[0];
            const balance = await loyaltyTokenContract.methods.balanceOf(balanceAddress).call();
            setBalance(balance);
        } catch (error) {
            console.error('Error checking balance:', error);
        }
    }

    const handleSetSharedWallet = async () => {
        try {
            const accounts = await web3.eth.getAccounts();
            const userAddress = accounts[0];
            const tx = await loyaltyTokenContract.methods.setSharedWallet(sharedWalletAddress).send({ from: userAddress });
            console.log('Transaction:', tx);
        } catch (error) {
            console.error('Error setting shared wallet:', error);
        }
    };

    async function handleSetConversionRate() {
        try {
            const accounts = await web3.eth.getAccounts();
            const userAddress = accounts[0];
            await loyaltyTokenContract.methods.setConversionRate(conversionRate).send({
                from: userAddress,
            });
            console.log('Conversion rate updated successfully!');
        } catch (error) {
            console.error('Error setting conversion rate:', error);
        }
    }

    async function handleMintToSharedWallet() {
        try {
            const accounts = await web3.eth.getAccounts();
            const userAddress = accounts[0];
            await loyaltyTokenContract.methods.mintToSharedWallet(mintAmount).send({
                from: userAddress,
            });
            console.log(`${mintAmount} tokens minted to shared wallet.`);
        } catch (error) {
            console.error('Error minting tokens:', error);
        }
    }

    async function handleAddToWhitelist() {
        try {
            const accounts = await web3.eth.getAccounts();
            const userAddress = accounts[0];
            await loyaltyTokenContract.methods.addToWhitelist(whitelistAddress).send({
                from: userAddress,
            });
            console.log(`${whitelistAddress} added to whitelist.`);
        } catch (error) {
            console.error('Error adding to whitelist:', error);
        }
    }

    async function handleAddToBuyerAddresses() {
        try {
            const accounts = await web3.eth.getAccounts();
            const userAddress = accounts[0];
            await loyaltyTokenContract.methods.addToBuyerAddresses(buyerAddress).send({
                from: userAddress,
            });
            console.log(`${buyerAddress} added to buyer addresses.`);
        } catch (error) {
            console.error('Error adding to buyer addresses:', error);
        }
    }

    async function handleRemoveFromWhitelist() {
        try {
            const accounts = await web3.eth.getAccounts();
            const userAddress = accounts[0];
            await loyaltyTokenContract.methods.removeFromWhitelist(removeWhitelistAddress).send({
                from: userAddress,
            });
            console.log(`${removeWhitelistAddress} removed from whitelist.`);
        } catch (error) {
            console.error('Error removing from whitelist:', error);
        }
    }

    async function handleRemoveFromBuyerAddresses() {
        try {
            const accounts = await web3.eth.getAccounts();
            const userAddress = accounts[0];
            await loyaltyTokenContract.methods.removeFromBuyerAddresses(removeBuyerAddress).send({
                from: userAddress,
            });
            console.log(`${removeBuyerAddress} removed from buyer addresses.`);
        } catch (error) {
            console.error('Error removing from buyer addresses:', error);
        }
    }

    async function handleRewardBuyer() {
        try {
            const accounts = await web3.eth.getAccounts();
            const userAddress = accounts[0];
            await loyaltyTokenContract.methods.rewardBuyer(recipientAddress, rewardAmount).send({
                from: userAddress,
            });
            console.log(`${rewardAmount} tokens rewarded to ${recipientAddress}.`);
        } catch (error) {
            console.error('Error rewarding buyer:', error);
        }
    }

    async function handleBurnExpiredTokens() {
        try {
            const accounts = await web3.eth.getAccounts();
            const userAddress = accounts[0];
            await loyaltyTokenContract.methods.burnExpiredTokens(burnAccount).send({
                from: userAddress,
            });
            console.log(`Expired tokens burned for ${burnAccount}.`);
        } catch (error) {
            console.error('Error burning expired tokens:', error);
        }
    }

    async function handleAutomateMinting() {
        try {
            const accounts = await web3.eth.getAccounts();
            const userAddress = accounts[0];
            await loyaltyTokenContract.methods.automateMinting().send({
                from: userAddress,
            });
            console.log('Automated minting executed.');
        } catch (error) {
            console.error('Error automating minting:', error);
        }
    }

    //

    return (
        <div className="admin-panel">
            <h2>Admin Panel</h2>
            <div className="interaction-section">
                <h3>Set Shared Wallet</h3>
                <input
                    type="text"
                    placeholder="Enter shared wallet address"
                    value={sharedWalletAddress}
                    onChange={(e) => setSharedWalletAddress(e.target.value)}
                />
                <button onClick={handleSetSharedWallet}>Set Shared Wallet</button>
            </div>
            <div className="interaction-section">
                <h3>Set Conversion Rate</h3>
                <input
                    type="number"
                    value={conversionRate}
                    onChange={(e) => setConversionRate(e.target.value)}
                />
                <button onClick={handleSetConversionRate}>Set Conversion Rate</button>
            </div>
            <div className="interaction-section">
                <h3>Mint Tokens to Shared Wallet</h3>
                <input
                    type="number"
                    value={mintAmount}
                    onChange={(e) => setMintAmount(e.target.value)}
                />
                <button onClick={handleMintToSharedWallet}>Mint Tokens</button>
            </div>
            <div className="interaction-section">
                <h3>Check Balance</h3>
                <input
                    type="text"
                    value={balanceAddress}
                    onChange={(e) => setBalanceAddress(e.target.value)}
                    placeholder="Address to check balance"
                />
                <button onClick={handleCheckBalance}>Check Balance</button>
                {balanceAddress && <p>Balance: {balance}</p>}
            </div>
            <div className="interaction-section">
                <h3>Add Address to Whitelist</h3>
                <input
                    type="text"
                    value={whitelistAddress}
                    onChange={(e) => setWhitelistAddress(e.target.value)}
                    placeholder="Address to whitelist"
                />
                <button onClick={handleAddToWhitelist}>Add to Whitelist</button>
            </div>
            <div className="interaction-section">
                <h3>Add Address to Buyer Addresses</h3>
                <input
                    type="text"
                    value={buyerAddress}
                    onChange={(e) => setBuyerAddress(e.target.value)}
                    placeholder="Address to add"
                />
                <button onClick={handleAddToBuyerAddresses}>Add to Buyer Addresses</button>
            </div>
            <div className="interaction-section">
                <h3>Remove Address from Whitelist</h3>
                <input
                    type="text"
                    value={removeWhitelistAddress}
                    onChange={(e) => setRemoveWhitelistAddress(e.target.value)}
                    placeholder="Address to remove"
                />
                <button onClick={handleRemoveFromWhitelist}>Remove from Whitelist</button>
            </div>
            <div className="interaction-section">
                <h3>Remove Address from Buyer Addresses</h3>
                <input
                    type="text"
                    value={removeBuyerAddress}
                    onChange={(e) => setRemoveBuyerAddress(e.target.value)}
                    placeholder="Address to remove"
                />
                <button onClick={handleRemoveFromBuyerAddresses}>Remove from Buyer Addresses</button>
            </div>
            <div className="interaction-section">
                <h3>Reward Buyer</h3>
                <input
                    type="text"
                    value={recipientAddress}
                    onChange={(e) => setRecipientAddress(e.target.value)}
                    placeholder="Recipient address"
                />
                <input
                    type="number"
                    value={rewardAmount}
                    onChange={(e) => setRewardAmount(e.target.value)}
                    placeholder="Reward amount"
                />
                <button onClick={handleRewardBuyer}>Reward Buyer</button>
            </div>
            <div className="interaction-section">
                <h3>Burn Expired Tokens</h3>
                <input
                    type="text"
                    value={burnAccount}
                    onChange={(e) => setBurnAccount(e.target.value)}
                    placeholder="Account to burn tokens for"
                />
                <button onClick={handleBurnExpiredTokens}>Burn Expired Tokens</button>
            </div>
            <div className="interaction-section">
                <h3>Automate Minting</h3>
                <button onClick={handleAutomateMinting}>Automate Minting</button>
            </div>
        </div>
    );


}


export default Admin;