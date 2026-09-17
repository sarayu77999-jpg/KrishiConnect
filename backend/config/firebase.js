import { initializeApp, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { readFileSync } from "fs";

const serviceAccount = JSON.parse(
  readFileSync(
    new URL("../serviceAccountKey.json", import.meta.url),
    "utf8"
  )
);

initializeApp({
  credential: cert({
    projectId: serviceAccount.project_id,
    clientEmail: serviceAccount.client_email,
    privateKey: serviceAccount.private_key.replace(/\\n/g, "\n")
  })
});

const db = getFirestore();

export { db };