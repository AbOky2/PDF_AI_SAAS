/* eslint-disable @typescript-eslint/ban-ts-comment */

import { initializeApp,getApp, App, getApps, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { getStorage } from "firebase-admin/storage";

//@ts-ignore
// eslint-disable-next-line @typescript-eslint/no-require-imports
const service_key = require('@/service_key.json');

let app : App;
if (getApps().length===0){
    app = initializeApp({
        credential : cert(service_key),
    });
}
else{
    app = getApp();
}

const adminDb = getFirestore(app);
const adminStorage = getStorage(app);

export{app as adminApp, adminDb, adminStorage};