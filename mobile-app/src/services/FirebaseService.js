// Firebase Service for Mobile App
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
  limit,
  onSnapshot
} from 'firebase/firestore';
import { 
  getStorage, 
  ref, 
  uploadBytes, 
  getDownloadURL
} from 'firebase/storage';

class FirebaseService {
  constructor() {
    this.auth = getAuth();
    this.db = getFirestore();
    this.storage = getStorage();
    this.currentUser = null;
    
    // Listen for auth state changes
    onAuthStateChanged(this.auth, (user) => {
      this.currentUser = user;
      console.log('Firebase Auth State:', user ? 'User logged in' : 'User logged out');
    });
  }

  // Authentication methods
  async signIn(email, password) {
    try {
      console.log('Firebase: Attempting sign in...');
      const userCredential = await signInWithEmailAndPassword(this.auth, email, password);
      console.log('Firebase: Sign in successful');
      return { success: true, user: userCredential.user };
    } catch (error) {
      console.error('Firebase: Sign in error:', error);
      return { success: false, error: error.message };
    }
  }

  async signUp(email, password, userData = {}) {
    try {
      console.log('Firebase: Attempting sign up...');
      const userCredential = await createUserWithEmailAndPassword(this.auth, email, password);
      
      // Add additional user data to Firestore
      if (userData) {
        await this.addUserData(userCredential.user.uid, userData);
      }
      
      console.log('Firebase: Sign up successful');
      return { success: true, user: userCredential.user };
    } catch (error) {
      console.error('Firebase: Sign up error:', error);
      return { success: false, error: error.message };
    }
  }

  async signOut() {
    try {
      console.log('Firebase: Signing out...');
      await signOut(this.auth);
      console.log('Firebase: Sign out successful');
      return { success: true };
    } catch (error) {
      console.error('Firebase: Sign out error:', error);
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
      console.log('Firebase: User data added with ID:', docRef.id);
      return { success: true, id: docRef.id };
    } catch (error) {
      console.error('Firebase: Error adding user data:', error);
      return { success: false, error: error.message };
    }
  }

  async getUserData(uid) {
    try {
      const q = query(collection(this.db, 'users'), where('uid', '==', uid));
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        const doc = querySnapshot.docs[0];
        console.log('Firebase: User data retrieved');
        return { success: true, data: { id: doc.id, ...doc.data() } };
      } else {
        console.log('Firebase: User data not found');
        return { success: false, error: 'User data not found' };
      }
    } catch (error) {
      console.error('Firebase: Error getting user data:', error);
      return { success: false, error: error.message };
    }
  }

  // Health reports methods
  async addHealthReport(reportData) {
    try {
      console.log('Firebase: Adding health report...');
      const docRef = await addDoc(collection(this.db, 'healthReports'), {
        ...reportData,
        userId: this.currentUser?.uid,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      console.log('Firebase: Health report added with ID:', docRef.id);
      return { success: true, id: docRef.id };
    } catch (error) {
      console.error('Firebase: Error adding health report:', error);
      return { success: false, error: error.message };
    }
  }

  async getHealthReports(limitCount = 50) {
    try {
      console.log('Firebase: Getting health reports...');
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
      
      console.log('Firebase: Retrieved', reports.length, 'health reports');
      return { success: true, data: reports };
    } catch (error) {
      console.error('Firebase: Error getting health reports:', error);
      return { success: false, error: error.message };
    }
  }

  // Real-time health reports listener
  subscribeToHealthReports(callback, limitCount = 50) {
    console.log('Firebase: Subscribing to health reports...');
    const q = query(
      collection(this.db, 'healthReports'),
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    );
    
    return onSnapshot(q, (querySnapshot) => {
      const reports = [];
      querySnapshot.forEach((doc) => {
        reports.push({ id: doc.id, ...doc.data() });
      });
      console.log('Firebase: Real-time update -', reports.length, 'health reports');
      callback({ success: true, data: reports });
    }, (error) => {
      console.error('Firebase: Real-time subscription error:', error);
      callback({ success: false, error: error.message });
    });
  }

  // Water reports methods
  async addWaterReport(reportData) {
    try {
      console.log('Firebase: Adding water report...');
      const docRef = await addDoc(collection(this.db, 'waterReports'), {
        ...reportData,
        userId: this.currentUser?.uid,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      console.log('Firebase: Water report added with ID:', docRef.id);
      return { success: true, id: docRef.id };
    } catch (error) {
      console.error('Firebase: Error adding water report:', error);
      return { success: false, error: error.message };
    }
  }

  async getWaterReports(limitCount = 50) {
    try {
      console.log('Firebase: Getting water reports...');
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
      
      console.log('Firebase: Retrieved', reports.length, 'water reports');
      return { success: true, data: reports };
    } catch (error) {
      console.error('Firebase: Error getting water reports:', error);
      return { success: false, error: error.message };
    }
  }

  // File upload methods
  async uploadFile(file, path) {
    try {
      console.log('Firebase: Uploading file to', path);
      const storageRef = ref(this.storage, path);
      const snapshot = await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(snapshot.ref);
      
      console.log('Firebase: File uploaded successfully');
      return { success: true, url: downloadURL };
    } catch (error) {
      console.error('Firebase: Error uploading file:', error);
      return { success: false, error: error.message };
    }
  }

  // Analytics methods
  async getDashboardStats() {
    try {
      console.log('Firebase: Getting dashboard stats...');
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

      console.log('Firebase: Dashboard stats retrieved');
      return { success: true, data: stats };
    } catch (error) {
      console.error('Firebase: Error getting dashboard stats:', error);
      return { success: false, error: error.message };
    }
  }

  // Emergency contact methods
  async addEmergencyContact(contactData) {
    try {
      console.log('Firebase: Adding emergency contact...');
      const docRef = await addDoc(collection(this.db, 'emergencyContacts'), {
        ...contactData,
        userId: this.currentUser?.uid,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      console.log('Firebase: Emergency contact added with ID:', docRef.id);
      return { success: true, id: docRef.id };
    } catch (error) {
      console.error('Firebase: Error adding emergency contact:', error);
      return { success: false, error: error.message };
    }
  }

  async getEmergencyContacts() {
    try {
      console.log('Firebase: Getting emergency contacts...');
      const q = query(
        collection(this.db, 'emergencyContacts'),
        where('userId', '==', this.currentUser?.uid),
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
      
      const contacts = [];
      querySnapshot.forEach((doc) => {
        contacts.push({ id: doc.id, ...doc.data() });
      });
      
      console.log('Firebase: Retrieved', contacts.length, 'emergency contacts');
      return { success: true, data: contacts };
    } catch (error) {
      console.error('Firebase: Error getting emergency contacts:', error);
      return { success: false, error: error.message };
    }
  }
}

export default new FirebaseService();
