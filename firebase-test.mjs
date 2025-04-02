// Firebase test script
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyA8otwO2yaCaz-qS3RvzMDSDj57qXQikec",
  authDomain: "is-ali-capping.firebaseapp.com",
  projectId: "is-ali-capping",
  storageBucket: "is-ali-capping.firebasestorage.app",
  messagingSenderId: "376785366126",
  appId: "1:376785366126:web:80889869d9e035992a8a7f",
  measurementId: "G-VNE88MGFJ3"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Test Firestore access
async function testFirestore() {
  console.log('Testing Firestore connection...');
  try {
    const usersCollection = collection(db, 'users');
    const snapshot = await getDocs(usersCollection);
    console.log(`Successfully connected to Firestore! Found ${snapshot.size} user documents.`);
    snapshot.forEach(doc => {
      console.log(`User: ${doc.id}`, doc.data());
    });
  } catch (error) {
    console.error('Error connecting to Firestore:', error);
  }
}

testFirestore(); 