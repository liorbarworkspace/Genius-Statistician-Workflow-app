

// FIX: Import 'where' from 'firebase/firestore' to fix "Cannot find name 'where'" error.
import { 
    doc, 
    getDoc, 
    setDoc,
    collection,
    getDocs,
    writeBatch,
    query,
    orderBy,
    limit,
    serverTimestamp,
    addDoc,
    where
} from 'firebase/firestore';
import { db } from './firebase';
import { User as AuthUser } from 'firebase/auth';
import { User, GameDetails, LoginRecord } from '../types';

// Collection references
const USERS_COLLECTION = 'users';
const GAMES_COLLECTION = 'games';
const LOGINS_COLLECTION = 'logins';

/**
 * Retrieves a user document from Firestore by UID.
 */
export const getUserDocument = async (uid: string): Promise<User | null> => {
    if (!db) throw new Error("Firestore not configured");
    const userDocRef = doc(db, USERS_COLLECTION, uid);
    const userSnapshot = await getDoc(userDocRef);
    if (userSnapshot.exists()) {
        return userSnapshot.data() as User;
    }
    return null;
};


/**
 * Creates a new user document in Firestore from a Firebase Auth user object.
 * This is typically called on the user's first sign-in.
 */
export const createUserDocumentFromAuth = async (userAuth: AuthUser): Promise<User> => {
    if (!db) throw new Error("Firestore not configured");
    const userDocRef = doc(db, USERS_COLLECTION, userAuth.uid);
    
    const newUser: User = {
        uid: userAuth.uid,
        email: userAuth.email || '',
        role: userAuth.email === 'liorbar.workspace@gmail.com' ? 'admin' : 'user' // Set first admin
    };

    await setDoc(userDocRef, newUser);
    return newUser;
};


/**
 * Adds a login record to the 'logins' collection.
 */
export const logUserLogin = async (uid: string) => {
    if (!db) throw new Error("Firestore not configured");
    const user = await getUserDocument(uid);
    if (!user) return;

    const loginRecord = {
        uid: user.uid,
        email: user.email,
        timestamp: serverTimestamp()
    };
    await addDoc(collection(db, LOGINS_COLLECTION), loginRecord);
};


/**
 * Fetches initial data (games, users, logins) for the app.
 * Admins get all users and full login history.
 */
export const getInitialData = async (userRole: User['role']): Promise<{ users: User[], games: GameDetails[], logins: LoginRecord[] }> => {
    if (!db) throw new Error("Firestore not configured");
    
    // Get all games, ordered by a field if necessary (e.g., date)
    const gamesQuery = query(collection(db, GAMES_COLLECTION), orderBy('date', 'desc'));
    const gamesSnapshot = await getDocs(gamesQuery);
    const games = gamesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as GameDetails));

    let users: User[] = [];
    let logins: LoginRecord[] = [];

    if (userRole === 'admin') {
        const usersSnapshot = await getDocs(collection(db, USERS_COLLECTION));
        users = usersSnapshot.docs.map(doc => doc.data() as User);

        const loginsQuery = query(collection(db, LOGINS_COLLECTION), orderBy('timestamp', 'desc'), limit(200));
        const loginsSnapshot = await getDocs(loginsQuery);
        logins = loginsSnapshot.docs.map(doc => doc.data() as LoginRecord);
    }
    
    return { users, games, logins };
};

/**
 * Saves or updates a game document in Firestore.
 */
export const saveGame = async (game: GameDetails) => {
    if (!db) throw new Error("Firestore not configured");
    const gameDocRef = doc(db, GAMES_COLLECTION, game.id);
    await setDoc(gameDocRef, game, { merge: true });
};

/**
 * Updates the entire list of authorized users. Admin only.
 * This implementation finds users by email and updates their role, or creates them if they don't exist.
 */
export const updateUsers = async (updatedUsers: User[]) => {
    if (!db) throw new Error("Firestore not configured");
    
    // This is a simplified version. A real-world app might handle this differently,
    // e.g., by not allowing email changes and managing users by UID.
    // For this app's purpose, we'll overwrite based on the provided list.
    const batch = writeBatch(db);
    const usersCollectionRef = collection(db, USERS_COLLECTION);
    const snapshot = await getDocs(usersCollectionRef);

    // Delete existing users that are not in the new list
    snapshot.docs.forEach(doc => {
        if (!updatedUsers.some(u => u.uid === doc.id)) {
            batch.delete(doc.ref);
        }
    });

    // Add or update users from the new list
    for (const user of updatedUsers) {
        // Find existing user by email to get their UID if it's a new addition without one
        const userQuery = query(usersCollectionRef, where("email", "==", user.email));
        const existingUserSnapshot = await getDocs(userQuery);
        let docRef;
        if (!existingUserSnapshot.empty) {
             docRef = existingUserSnapshot.docs[0].ref;
        } else {
            // This case is tricky without a UID from Auth.
            // The Admin UI should prevent adding users who haven't logged in at least once.
            // For now, we'll log a warning.
            console.warn(`Cannot add user ${user.email} directly without a UID. User must log in once to be created.`);
            continue;
        }
       batch.set(docRef, { email: user.email, role: user.role, uid: docRef.id }, { merge: true });
    }

    await batch.commit();
};

/**
 * Deletes all documents from the 'games' collection. Admin only.
 */
export const clearGames = async () => {
    if (!db) throw new Error("Firestore not configured");
    const batch = writeBatch(db);
    const gamesCollectionRef = collection(db, GAMES_COLLECTION);
    const snapshot = await getDocs(gamesCollectionRef);
    snapshot.docs.forEach(doc => {
        batch.delete(doc.ref);
    });
    await batch.commit();
};