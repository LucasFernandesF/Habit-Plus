import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  sendEmailVerification, // ← ADICIONE ESTA IMPORT
  signOut,
  onAuthStateChanged,
  User
} from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from './firebase';

export const signUp = async (email: string, password: string, additionalData?: any) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user; // ← CORREÇÃO AQUI

    if (user) {
      // Salva dados do usuário no Firestore
      await setDoc(doc(db, 'users', user.uid), {
        email: email,
        name: additionalData?.name || '',
        createdAt: new Date(),
        emailVerified: false, // ← Marca como não verificado
        ...additionalData
      });

      // Envia email de verificação ← CORREÇÃO AQUI
      await sendEmailVerification(user);
    }

    return userCredential;
  } catch (error: any) {
    throw new Error(error.message);
  }
};

export const signIn = async (email: string, password: string) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential;
  } catch (error: any) {
    throw new Error(error.message);
  }
};

export const resetPassword = async (email: string) => {
  try {
    await sendPasswordResetEmail(auth, email);
    return true;
  } catch (error: any) {
    throw new Error(error.message);
  }
};

export const logout = async () => {
  try {
    await signOut(auth);
  } catch (error: any) {
    throw new Error(error.message);
  }
};

export const observeAuth = (callback: (user: User | null) => void) => {
  return onAuthStateChanged(auth, callback);
};

// Função para reenviar verificação de email
export const resendEmailVerification = async () => {
  try {
    if (auth.currentUser) {
      await sendEmailVerification(auth.currentUser);
      return true;
    }
    return false;
  } catch (error: any) {
    throw new Error(error.message);
  }
};