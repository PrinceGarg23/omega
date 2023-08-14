import React, { useState } from 'react';
// import Web3 from 'web3';
import ProductListingForm from '../ProductListingForm';
import Sidebar from './SideBar';
// import { auth, firestore } from '../../firebase';
import './SellerDashboard.css';
import ReceivedOrders from '../ReceivedOrders';

function SellerDashboard() {

  // const web3 = new Web3(window.ethereum);
  const [selectedSection, setSelectedSection] = useState('list-product');

  // const [isMetamaskConnected, setIsMetamaskConnected] = useState(false);
  // const [isMetamaskAvailable, setIsMetamaskAvailable] = useState(true);

  // useEffect(() => {
  //   const checkMetamaskConnection = async () => {
  //     try {
  //       if (!window.ethereum) {
  //         setIsMetamaskAvailable(false);
  //         return;
  //       }

  //       const accounts = await web3.eth.getAccounts();
  //       setIsMetamaskConnected(accounts.length > 0);
  //     } catch (error) {
  //       console.error('Error checking Metamask connection:', error);
  //     }
  //   };

  //   checkMetamaskConnection();
  // }, [web3]);

  const renderSectionContent = () => {
    switch (selectedSection) {
      case 'list-product':
        return <ProductListingForm />;
      case 'received-orders':
        return <ReceivedOrders />
      // Add more cases for other sections
      default:
        return null; // Default to no content
    }
  };

  // const connectToMetamask = async () => {
  //   try {
  //     if (!window.ethereum) {
  //       console.log('Metamask extension is not available.');
  //       return;
  //     }

  //     await window.ethereum.enable();
  //     const accounts = await web3.eth.getAccounts();
  //     const userAddress = accounts[0];

  //     // Store userAddress in Firestore
  //     const userId = auth.currentUser.uid;
  //     await firestore.collection('users').doc(userId).update({
  //       ethereumAddress: userAddress,
  //     });

  //     setIsMetamaskConnected(true);
  //     console.log('Connected to Metamask:', userAddress);
  //   } catch (error) {
  //     console.error('Error connecting to Metamask:', error);
  //   }
  // };

  // return (
  //   <div className="dashboard-content">
  //     <Sidebar />
  //     <h2>Seller Dashboard</h2>
  //     {/* ... (other content) */}
  //     {isMetamaskAvailable ? (
  //       <button
  //         onClick={connectToMetamask}
  //         className={`connect-button ${isMetamaskConnected ? 'connected' : ''}`}
  //         disabled={isMetamaskConnected}
  //       >
  //         {isMetamaskConnected ? 'Metamask Connected' : 'Connect to Metamask'}
  //       </button>
  //     ) : (
  //       <p className='warn'>Metamask extension is not available.Please add metamask extension.</p>
  //     )}
  //     <ProductListingForm />
  //   </div>
  // );


  return (
    <div className="dashboard-content">
      <Sidebar setSelectedSection={setSelectedSection} />
      <div className="main-content">
        {renderSectionContent()}
        {/* {isMetamaskAvailable ? (
          <button
            onClick={connectToMetamask}
            className={`connect-button ${isMetamaskConnected ? 'connected' : ''}`}
            disabled={isMetamaskConnected}
          >
            {isMetamaskConnected ? 'Metamask Connected' : 'Connect to Metamask'}
          </button>
        ) : (
          <p className='warn'>Metamask extension is not available. Please add the Metamask extension.</p>
        )} */}
      </div>
    </div>
  );
}

export default SellerDashboard;
