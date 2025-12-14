import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  onSnapshot,
  type DocumentData,
  type QueryConstraint,
  type DocumentReference,
  type CollectionReference,
  serverTimestamp,
  GeoPoint,
  Timestamp,
} from 'firebase/firestore'
import { db } from './config'

// Re-export types for use in other files
export type { QueryConstraint }

// Collection references
export const collections = {
  users: 'users',
  drivers: 'drivers',
  merchants: 'merchants',
  products: 'products',
  rides: 'rides',
  orders: 'orders',
  transactions: 'transactions',
  promos: 'promos',
  notifications: 'notifications',
} as const

// Get collection reference
export const getCollection = (collectionName: string): CollectionReference => {
  return collection(db, collectionName)
}

// Get document reference
export const getDocRef = (collectionName: string, docId: string): DocumentReference => {
  return doc(db, collectionName, docId)
}

// Get single document
export const getDocument = async <T extends DocumentData>(
  collectionName: string,
  docId: string
): Promise<T | null> => {
  const docRef = doc(db, collectionName, docId)
  const docSnap = await getDoc(docRef)

  if (docSnap.exists()) {
    return { id: docSnap.id, ...docSnap.data() } as unknown as T
  }

  return null
}

// Get multiple documents with query
export const getDocuments = async <T extends DocumentData>(
  collectionName: string,
  constraints: QueryConstraint[] = []
): Promise<T[]> => {
  const collectionRef = collection(db, collectionName)
  const q = query(collectionRef, ...constraints)
  const querySnapshot = await getDocs(q)

  return querySnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as unknown as T[]
}

// Create or update document
export const setDocument = async <T extends DocumentData>(
  collectionName: string,
  docId: string,
  data: Partial<T>,
  merge: boolean = true
): Promise<void> => {
  const docRef = doc(db, collectionName, docId)
  await setDoc(docRef, { ...data, updatedAt: serverTimestamp() }, { merge })
}

// Update document
export const updateDocument = async <T extends DocumentData>(
  collectionName: string,
  docId: string,
  data: Partial<T>
): Promise<void> => {
  const docRef = doc(db, collectionName, docId)
  await updateDoc(docRef, { ...data, updatedAt: serverTimestamp() })
}

// Delete document
export const deleteDocument = async (
  collectionName: string,
  docId: string
): Promise<void> => {
  const docRef = doc(db, collectionName, docId)
  await deleteDoc(docRef)
}

// Real-time document listener
export const subscribeToDocument = <T extends DocumentData>(
  collectionName: string,
  docId: string,
  callback: (data: T | null) => void
) => {
  const docRef = doc(db, collectionName, docId)

  return onSnapshot(docRef, (docSnap) => {
    if (docSnap.exists()) {
      callback({ id: docSnap.id, ...docSnap.data() } as unknown as T)
    } else {
      callback(null)
    }
  })
}

// Real-time collection listener
export const subscribeToCollection = <T extends DocumentData>(
  collectionName: string,
  constraints: QueryConstraint[],
  callback: (data: T[]) => void
) => {
  const collectionRef = collection(db, collectionName)
  const q = query(collectionRef, ...constraints)

  return onSnapshot(q, (querySnapshot) => {
    const documents = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as unknown as T[]
    callback(documents)
  })
}

// Export utilities
export {
  query,
  where,
  orderBy,
  limit,
  startAfter,
  serverTimestamp,
  GeoPoint,
  Timestamp,
}
