import { initializeApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'
import { getAuth } from 'firebase/auth'
import { getFunctions } from 'firebase/functions'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'demo-key',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'demo.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'demo-project',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || 'demo',
}

export const isDemo = !import.meta.env.VITE_FIREBASE_API_KEY

let app, db, auth, functions
try {
  app = initializeApp(firebaseConfig)
  db = getFirestore(app)
  auth = getAuth(app)
  functions = getFunctions(app)
} catch (e) {
  console.warn('Firebase init failed:', e.message)
}

export { db, auth, functions }
export default app
