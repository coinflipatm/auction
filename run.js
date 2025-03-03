// Execute in your browser console or create a utility script
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { db } from './firebase';

async function createAdminUser(email, password) {
  try {
    const auth = getAuth();
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    
    // Set the user role to 'admin' in Firestore
    const userRef = doc(db, "users", userCredential.user.uid);
    await setDoc(userRef, {
      username: email.split('@')[0],
      email: email,
      role: 'admin',
      createdAt: new Date(),
      updatedAt: new Date()
    });
    
    console.log('Admin user created successfully:', userCredential.user.uid);
  } catch (error) {
    console.error('Error creating admin user:', error);
  }
}