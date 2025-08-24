import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User
} from 'firebase/auth';
import { 
  getFirestore, 
  doc, 
  setDoc, 
  getDoc, 
  collection,
  query,
  where,
  getDocs
} from 'firebase/firestore';

// Your Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Authentication functions
export const signIn = async (email: string, password: string) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return { success: true, user: userCredential.user };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

export const signUp = async (email: string, password: string) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    return { success: true, user: userCredential.user };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

export const signOutUser = async () => {
  try {
    await signOut(auth);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

export const getCurrentUser = (): User | null => {
  return auth.currentUser;
};

export const onAuthStateChange = (callback: (user: User | null) => void) => {
  return onAuthStateChanged(auth, callback);
};

// Firestore functions
export const saveUserData = async (userId: string, data: any) => {
  try {
    await setDoc(doc(db, 'users', userId, 'data', 'projects'), {
      ...data,
      lastUpdated: new Date().toISOString()
    });
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

export const loadUserData = async (userId: string) => {
  try {
    const docRef = doc(db, 'users', userId, 'data', 'projects');
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return { success: true, data: docSnap.data() };
    } else {
      return { success: false, error: 'No data found' };
    }
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

export const syncData = async (userId: string, localData: any) => {
  try {
    // Get cloud data
    const cloudResult = await loadUserData(userId);
    
    if (!cloudResult.success) {
      // No cloud data, upload local data
      await saveUserData(userId, localData);
      return { success: true, action: 'uploaded' };
    }
    
    const cloudData = cloudResult.data;
    const localLastUpdated = new Date(localData.lastUpdated);
    const cloudLastUpdated = new Date(cloudData.lastUpdated);
    
    if (localLastUpdated > cloudLastUpdated) {
      // Local data is newer, upload to cloud
      await saveUserData(userId, localData);
      return { success: true, action: 'uploaded' };
    } else {
      // Cloud data is newer, return cloud data
      return { success: true, action: 'downloaded', data: cloudData };
    }
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

export { auth, db };
