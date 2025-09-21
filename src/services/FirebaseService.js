// Firebase Service - Handles all Firebase operations
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from 'firebase/auth';
import { 
  getFirestore, 
  collection, 
  addDoc, 
  getDocs, 
  doc, 
  updateDoc, 
  deleteDoc,
  query,
  where,
  orderBy,
  limit
} from 'firebase/firestore';
import { 
  getStorage, 
  ref, 
  uploadBytes, 
  getDownloadURL,
  deleteObject
} from 'firebase/storage';
import { app } from '../../config/firebase-config.js';

class FirebaseService {
  constructor() {
    this.auth = getAuth(app);
    this.db = getFirestore(app);
    this.storage = getStorage(app);
    this.currentUser = null;
    
    // Listen for auth state changes
    onAuthStateChanged(this.auth, (user) => {
      this.currentUser = user;
      if (user) {
        console.log('User signed in:', user.uid);
      } else {
        console.log('User signed out');
      }
    });
  }

  // Authentication methods
  async signIn(email, password) {
    try {
      const userCredential = await signInWithEmailAndPassword(this.auth, email, password);
      return { success: true, user: userCredential.user };
    } catch (error) {
      console.error('Sign in error:', error);
      return { success: false, error: error.message };
    }
  }

  async signUp(email, password, userData = {}) {
    try {
      const userCredential = await createUserWithEmailAndPassword(this.auth, email, password);
      
      // Add additional user data to Firestore
      if (userData) {
        await this.addUserData(userCredential.user.uid, userData);
      }
      
      return { success: true, user: userCredential.user };
    } catch (error) {
      console.error('Sign up error:', error);
      return { success: false, error: error.message };
    }
  }

  async signOut() {
    try {
      await signOut(this.auth);
      return { success: true };
    } catch (error) {
      console.error('Sign out error:', error);
      return { success: false, error: error.message };
    }
  }

  getCurrentUser() {
    return this.currentUser;
  }

  // User data methods
  async addUserData(uid, userData) {
    try {
      const docRef = await addDoc(collection(this.db, 'users'), {
        uid,
        ...userData,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      return { success: true, id: docRef.id };
    } catch (error) {
      console.error('Error adding user data:', error);
      return { success: false, error: error.message };
    }
  }

  async getUserData(uid) {
    try {
      const q = query(collection(this.db, 'users'), where('uid', '==', uid));
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        const doc = querySnapshot.docs[0];
        return { success: true, data: { id: doc.id, ...doc.data() } };
      } else {
        return { success: false, error: 'User data not found' };
      }
    } catch (error) {
      console.error('Error getting user data:', error);
      return { success: false, error: error.message };
    }
  }

  // Health reports methods
  async addHealthReport(reportData) {
    try {
      const docRef = await addDoc(collection(this.db, 'healthReports'), {
        ...reportData,
        userId: this.currentUser?.uid,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      return { success: true, id: docRef.id };
    } catch (error) {
      console.error('Error adding health report:', error);
      return { success: false, error: error.message };
    }
  }

  async getHealthReports(limitCount = 50) {
    try {
      const q = query(
        collection(this.db, 'healthReports'),
        orderBy('createdAt', 'desc'),
        limit(limitCount)
      );
      const querySnapshot = await getDocs(q);
      
      const reports = [];
      querySnapshot.forEach((doc) => {
        reports.push({ id: doc.id, ...doc.data() });
      });
      
      return { success: true, data: reports };
    } catch (error) {
      console.error('Error getting health reports:', error);
      return { success: false, error: error.message };
    }
  }

  // Water reports methods
  async addWaterReport(reportData) {
    try {
      const docRef = await addDoc(collection(this.db, 'waterReports'), {
        ...reportData,
        userId: this.currentUser?.uid,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      return { success: true, id: docRef.id };
    } catch (error) {
      console.error('Error adding water report:', error);
      return { success: false, error: error.message };
    }
  }

  async getWaterReports(limitCount = 50) {
    try {
      const q = query(
        collection(this.db, 'waterReports'),
        orderBy('createdAt', 'desc'),
        limit(limitCount)
      );
      const querySnapshot = await getDocs(q);
      
      const reports = [];
      querySnapshot.forEach((doc) => {
        reports.push({ id: doc.id, ...doc.data() });
      });
      
      return { success: true, data: reports };
    } catch (error) {
      console.error('Error getting water reports:', error);
      return { success: false, error: error.message };
    }
  }

  // File upload methods
  async uploadFile(file, path) {
    try {
      const storageRef = ref(this.storage, path);
      const snapshot = await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(snapshot.ref);
      
      return { success: true, url: downloadURL };
    } catch (error) {
      console.error('Error uploading file:', error);
      return { success: false, error: error.message };
    }
  }

  async deleteFile(path) {
    try {
      const storageRef = ref(this.storage, path);
      await deleteObject(storageRef);
      return { success: true };
    } catch (error) {
      console.error('Error deleting file:', error);
      return { success: false, error: error.message };
    }
  }

  // Analytics methods
  async getDashboardStats() {
    try {
      const [healthReports, waterReports] = await Promise.all([
        this.getHealthReports(100),
        this.getWaterReports(100)
      ]);

      const stats = {
        totalHealthReports: healthReports.data?.length || 0,
        totalWaterReports: waterReports.data?.length || 0,
        recentHealthReports: healthReports.data?.slice(0, 10) || [],
        recentWaterReports: waterReports.data?.slice(0, 10) || []
      };

      return { success: true, data: stats };
    } catch (error) {
      console.error('Error getting dashboard stats:', error);
      return { success: false, error: error.message };
    }
  }
}

export default new FirebaseService();

