import structures from "@/libs/structures";
import { getDatabase, ref, set, child, get } from "firebase/database";
import firebaseApp from "@/libs/firebase";
import { v4 as uuidv4 } from 'uuid';

const db = getDatabase(firebaseApp);
const dbRef = ref(db);

const handler = async (req, res) => {

 if (req.method === "POST") {

  res.status(200).json({ success: true, message: "Ee attente" });

 } else if (req.method === "GET") {

  let arrayDevis = [];
  const snapshotDevis = await get(child(dbRef, `${structures.devis}`));
  snapshotDevis.forEach(snapChild => {
   const data = snapChild.val();
   arrayDevis.push(data);
  });

  res.status(200).json({ success: true, devis: arrayDevis });
 } else {
  res.status(500).json({ success: false, message: "Unauthorized request" });
 }

};


export default handler;