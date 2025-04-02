import { initializeApp } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc, 
  onSnapshot,
  query,
  orderBy,
  limit,
  addDoc,
  serverTimestamp,
  DocumentData,
  getDocs
} from 'firebase/firestore';
import { getAnalytics } from 'firebase/analytics';
import { Claim } from '../types';

// Configuration should be in environment variables in a production app
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "demo-key-for-development",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "is-ali-capping",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

// Valid users list
export const VALID_USERS = ['ali', 'umar', 'qasim', 'jibraan', 'sadi', 'abdul', 'sohail', 'maha'];

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
// Initialize Analytics only in browser environment
let analytics = null;
if (typeof window !== 'undefined') {
  analytics = getAnalytics(app);
}

// Define collections
const usersCollection = collection(db, 'users');
const claimsCollection = collection(db, 'claims');

// User profile interface
export interface UserProfile {
  name: string;
  localCapCount: number;
  lastActive: Date;
}

// Community claim interface (extends the regular Claim)
export interface CommunityClaim extends Claim {
  id?: string;
  userId: string;
  userName: string;
  timestamp: Date;
}

// Initialize or get user profile
export const getUserProfile = async (userName: string): Promise<UserProfile> => {
  // Validate username
  if (!VALID_USERS.includes(userName.toLowerCase())) {
    throw new Error('Invalid username. Please use one of the valid usernames.');
  }
  
  const normalizedUserName = userName.toLowerCase();
  const userDocRef = doc(usersCollection, normalizedUserName);
  const userDoc = await getDoc(userDocRef);
  
  if (userDoc.exists()) {
    return userDoc.data() as UserProfile;
  } else {
    // Create new user profile
    const newUser: UserProfile = {
      name: normalizedUserName,
      localCapCount: 0,
      lastActive: new Date()
    };
    
    await setDoc(userDocRef, newUser);
    return newUser;
  }
};

// Update user's local cap count
export const updateUserCapCount = async (userName: string, increment: number): Promise<void> => {
  const normalizedUserName = userName.toLowerCase();
  const userDocRef = doc(usersCollection, normalizedUserName);
  const userDoc = await getDoc(userDocRef);
  
  if (userDoc.exists()) {
    const userData = userDoc.data() as UserProfile;
    await updateDoc(userDocRef, {
      localCapCount: userData.localCapCount + increment,
      lastActive: new Date()
    });
  }
};

// Add a claim to the community collection
export const addCommunityClaim = async (claim: Claim, userName: string): Promise<string> => {
  const normalizedUserName = userName.toLowerCase();
  
  const communityClaim: Omit<CommunityClaim, 'id'> = {
    ...claim,
    userId: normalizedUserName,
    userName: normalizedUserName,
    timestamp: new Date()
  };
  
  const docRef = await addDoc(claimsCollection, {
    ...communityClaim,
    timestamp: serverTimestamp() // Use server timestamp for consistency
  });
  
  return docRef.id;
};

// Get global cap count
export const getGlobalCapCount = async (): Promise<number> => {
  const snapshot = await getDocs(usersCollection);
  let totalCount = 0;
  
  snapshot.forEach((doc) => {
    const userData = doc.data() as UserProfile;
    totalCount += userData.localCapCount;
  });
  
  return totalCount;
};

// Subscribe to global cap count changes
export const subscribeToGlobalCapCount = (callback: (count: number) => void): (() => void) => {
  return onSnapshot(usersCollection, (snapshot) => {
    let totalCount = 0;
    
    snapshot.forEach((doc) => {
      const userData = doc.data() as UserProfile;
      totalCount += userData.localCapCount;
    });
    
    callback(totalCount);
  });
};

// Subscribe to recent community claims
export const subscribeToRecentClaims = (
  callback: (claims: CommunityClaim[]) => void,
  claimsLimit = 10
): (() => void) => {
  const recentClaimsQuery = query(
    claimsCollection,
    orderBy('timestamp', 'desc'),
    limit(claimsLimit)
  );
  
  return onSnapshot(recentClaimsQuery, (snapshot) => {
    const claims: CommunityClaim[] = [];
    
    snapshot.forEach((doc) => {
      const data = doc.data() as DocumentData;
      claims.push({
        ...data,
        id: doc.id,
        timestamp: data.timestamp?.toDate() || new Date()
      } as CommunityClaim);
    });
    
    callback(claims);
  });
}; 