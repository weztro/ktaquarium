import { 
  collection, 
  query, 
  onSnapshot, 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  QueryConstraint
} from "firebase/firestore";
import { db } from "./firebase";

/**
 * Subscribes to a Firestore collection in real-time with centralized error catching.
 * Logs the exact collection causing errors (e.g. Permission Denied).
 */
export function subscribeToCollection(
  collectionName: string,
  constraints: QueryConstraint[],
  onUpdate: (data: any[]) => void,
  onError: (err: any) => void
) {
  try {
    const q = query(collection(db, collectionName), ...constraints);
    return onSnapshot(
      q,
      (snapshot) => {
        const list = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
        onUpdate(list);
      },
      (error) => {
        console.error(`[FirestoreService] ERROR: Permission denied or load failure in collection "${collectionName}":`, error);
        onError(error);
      }
    );
  } catch (error: any) {
    console.error(`[FirestoreService] Failed to set up snapshot listener for collection "${collectionName}":`, error);
    onError(error);
    return () => {};
  }
}

/**
 * Fetch a single document by ID from a collection
 */
export async function getDocument(collectionName: string, docId: string) {
  try {
    const docRef = doc(db, collectionName, docId);
    const snap = await getDoc(docRef);
    if (!snap.exists()) return null;
    return { id: snap.id, ...snap.data() };
  } catch (error: any) {
    console.error(`[FirestoreService] ERROR: Fetching document in collection "${collectionName}" with ID "${docId}" failed:`, error);
    throw error;
  }
}

/**
 * Creates or overwrites a document by ID with merging options
 */
export async function setDocument(collectionName: string, docId: string, data: any) {
  try {
    const docRef = doc(db, collectionName, docId);
    await setDoc(docRef, data, { merge: true });
  } catch (error: any) {
    console.error(`[FirestoreService] ERROR: Setting document in collection "${collectionName}" with ID "${docId}" failed:`, error);
    throw error;
  }
}

/**
 * Updates specific fields in a document
 */
export async function updateDocument(collectionName: string, docId: string, data: any) {
  try {
    const docRef = doc(db, collectionName, docId);
    await updateDoc(docRef, data);
  } catch (error: any) {
    console.error(`[FirestoreService] ERROR: Updating document in collection "${collectionName}" with ID "${docId}" failed:`, error);
    throw error;
  }
}

/**
 * Deletes a document by ID
 */
export async function deleteDocument(collectionName: string, docId: string) {
  try {
    const docRef = doc(db, collectionName, docId);
    await deleteDoc(docRef);
  } catch (error: any) {
    console.error(`[FirestoreService] ERROR: Deleting document in collection "${collectionName}" with ID "${docId}" failed:`, error);
    throw error;
  }
}
