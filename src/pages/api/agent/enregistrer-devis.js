import structures from "@/libs/structures";
import { getDatabase, ref, set, child, get } from "firebase/database";
import firebaseApp from "@/libs/firebase";
import { v4 as uuidv4 } from 'uuid';

const db = getDatabase(firebaseApp);
const dbRef = ref(db);

const handler = async (req, res) => {

 if (req.method === "POST") {

  const { id, immatriculationDepot, observationsDepot, facturation, clientFacturation, totalComplet, signatureOptimom } = req.body;

  if (facturation.length > 0 && clientFacturation && totalComplet > 0 && signatureOptimom && immatriculationDepot.length > 3) {

   const devisID = uuidv4();
   const date = new Date();

   let arrayDevis = [];
   const snapshotDevis = await get(child(dbRef, `${structures.devis}`));
   snapshotDevis.forEach(snapChild => {
    const data = snapChild.val();
    arrayDevis.push(data);
   });

   const devisNumber = arrayDevis.length + 1;

   await set(ref(db, `${structures.devis}/${devisID}`), {
    id: devisID,
    numero: devisNumber,
    client: clientFacturation,
    immatriculation: immatriculationDepot,
    observations: observationsDepot,
    produits: facturation,
    signatureOptimom: signatureOptimom,
    signatureExutoire: null,
    agentID: id,
    totalDevis: totalComplet,
    etat: "attente",
    date: date.toString()
   })

   const newObjRef = ref(db, `${structures.devis}/${devisID}`);
   const snapshot = await get(newObjRef);
   const updatedRecord = snapshot.val();


   res.status(200).json({
    success: true,
    devis: updatedRecord
   })
  } else {
   res.status(200).json({ success: false, message: "Devis invalide" })
  }



 } else {
  res.status(500).json({ success: false, message: "Unauthorized request" });
 }

};


export default handler;