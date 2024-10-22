import structures from "@/libs/structures";
import { getDatabase, ref, set, child, get } from "firebase/database";
import firebaseApp from "@/libs/firebase";
import { v4 as uuidv4 } from 'uuid';

const db = getDatabase(firebaseApp);
const dbRef = ref(db);

const handler = async (req, res) => {

 if (req.method === "POST") {

  const { clientID, listeFacturation, dateDU, dateA } = req.body;

  if (listeFacturation.length > 0 && clientID.length > 0) {

   const factureID = uuidv4();
   const date = new Date();

   let arrayFacture = [];
   const snapshotFacture = await get(child(dbRef, `${structures.factures}`));
   snapshotFacture.forEach(snapChild => {
    const data = snapChild.val();
    arrayFacture.push(data);
   });

   const factureNumber = arrayFacture.length + 1;

   await set(ref(db, `${structures.factures}/${factureID}`), {
    id: factureID,
    numero: factureNumber,
    clientID: clientID,
    periodeFacturationDu: dateA,
    periodeFacturationAu: dateDU,
    data: listeFacturation,
    agentID: "administrateur",
    date: date.toString()
   })

   const newObjRef = ref(db, `${structures.factures}/${factureID}`);
   const snapshot = await get(newObjRef);
   const updatedRecord = snapshot.val();


   res.status(200).json({
    success: true,
    facture: updatedRecord
   })
  } else {
   res.status(200).json({ success: false, message: "Devis invalide" })
  }



 } else if (req.method === "GET") {

  
  let arrayFacture = [];
  const snapshotFacture = await get(child(dbRef, `${structures.factures}`));
  snapshotFacture.forEach(snapChild => {
   const data = snapChild.val();
   arrayFacture.push(data);
  });

  res.status(200).json({
   success: true,
   factures: arrayFacture
  })

 } else {
  res.status(500).json({ success: false, message: "Unauthorized request" });
 }

};


export default handler;