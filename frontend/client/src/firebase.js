import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/firestore';


const firebaseConfig = {
    apiKey: "AIzaSyBOyRbw7tuhVd0FteMD-ddQvusrXFZaQB4",
    authDomain: "omega-522d7.firebaseapp.com",
    projectId: "omega-522d7",
    storageBucket: "omega-522d7.appspot.com",
    messagingSenderId: "552808573817",
    appId: "1:552808573817:web:bd0f5ab51e2983799d9da8",
    measurementId: "G-E7RM4K4TGS"
  };

    firebase.initializeApp(firebaseConfig);

  export const auth = firebase.auth();
  export const firestore = firebase.firestore();
  export default firebase;