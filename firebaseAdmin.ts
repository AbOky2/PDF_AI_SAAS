
import { initializeApp,getApp, App, getApps, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { getStorage } from "firebase-admin/storage";

import { ServiceAccount } from "firebase-admin";

const serviceAccount: ServiceAccount = {
    projectId: process.env.FIREBASE_PROJECT_ID,
    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  };

let app : App;
if (getApps().length===0){
    app = initializeApp({
        credential : cert(serviceAccount),
    });
}
else{
    app = getApp();
}

const adminDb = getFirestore(app);
const adminStorage = getStorage(app);

export{app as adminApp, adminDb, adminStorage};