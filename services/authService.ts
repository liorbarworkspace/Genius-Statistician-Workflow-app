
import { 
    onAuthStateChanged, 
    signInWithPopup, 
    GoogleAuthProvider,
    signOut,
    User
} from 'firebase/auth';
import { auth } from './firebase';

const provider = new GoogleAuthProvider();

export const signInWithGoogle = () => {
    if (!auth) throw new Error("Firebase not configured");
    return signInWithPopup(auth, provider);
}

export const signOutUser = () => {
    if (!auth) throw new Error("Firebase not configured");
    return signOut(auth);
};

export const onAuthStateChangedListener = (callback: (user: User | null) => void) => {
    if (!auth) {
        // If firebase is not configured, immediately call back with null user
        // so the app doesn't hang in a loading state.
        callback(null);
        return () => {}; // Return an empty unsubscribe function
    }
    return onAuthStateChanged(auth, callback);
};
