import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';

// Client Firebase configuration loaded from firebase-applet-config.json
let app: FirebaseApp;
let auth: Auth;
let db: Firestore;

// Read config injected or bundled
import config from '../../firebase-applet-config.json';

if (!getApps().length) {
  app = initializeApp(config);
} else {
  app = getApps()[0];
}

auth = getAuth(app);
db = config.firestoreDatabaseId ? getFirestore(app, config.firestoreDatabaseId) : getFirestore(app);

export { app, auth, db };
