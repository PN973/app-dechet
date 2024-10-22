import firebaseApp from "@/libs/firebase";
import { getDatabase, ref, set, child, get, update, query, orderByChild, equalTo } from "firebase/database";
import { v4 as uuidv4 } from 'uuid';
import structures from "@/libs/structures";
import generateDefaultPassword from '@/libs/generatePassword';
import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";


const db = getDatabase(firebaseApp);
const dbRef = ref(db);

const handler = async (req, res) => {
 if (req.method === "POST") {
  const { decheterie, numeroBenne, immatSelected } = req.body;

  if ([decheterie, numeroBenne, immatSelected].every(val => val !== "")) {

   const benneRef = ref(db, `${structures.bennes}`);
   const numQuery = query(benneRef, orderByChild('numBenne'), equalTo(numeroBenne));

   try {
    const snapshot = await get(numQuery);
    if (!snapshot.exists()) {

     const date = new Date();
     const benneID = uuidv4();

     await set(ref(db, `${structures.bennes}/${benneID}`), {
      id: benneID,
      decheterieID: decheterie,
      numBenne: numeroBenne,
      immatriculation: immatSelected,
      etat: "valide",
      date: date.toString()
     });

     const newObjRefBenne = ref(db, `${structures.bennes}/${benneID}`);
     const snapshotBenne = await get(newObjRefBenne);
     const newBenne = snapshotBenne.val();

     res.status(200).json({ success: true, benne: newBenne });

    } else {
     res.status(200).json({ success: false, message: `Cette benne (n° ${numeroBenne}) existe déja` });
    }

   } catch (error) {

   }

  } else {
   res.status(200).json({ success: false, message: "Veuillez remplir les champs obligatoires (*)" })
  }

 } else if (req.method === "GET") {

  const benneRef = ref(db, `${structures.bennes}`);
  const snapshot = await get(benneRef);

  if (snapshot.exists()) {
   const data = snapshot.val();
   const benneArray = Object.keys(data).map(key => ({ id: key, ...data[key] }));
   res.status(200).json({ success: true, bennes: benneArray })
  } else {

   res.status(200).json({ success: true, message: "Aucune benne" })
  }


 } else if (req.method === "PATCH") {

  const { benneID, action } = req.body;

  if (action === "desactivation") {

   const benneRef = ref(db, `${structures.bennes}/${benneID}`);

   await update(benneRef, { etat: "invalid" });

   const snapshot = await get(benneRef);
   const updatedRecord = snapshot.val();

   res.status(200).json({ success: true, benne: updatedRecord })

  } else if (action === "activation") {

   const benneRef = ref(db, `${structures.bennes}/${benneID}`);

   await update(benneRef, { etat: "valide" });

   const snapshot = await get(benneRef);
   const updatedRecord = snapshot.val();

   res.status(200).json({ success: true, benne: updatedRecord })
  }

 } else if (req.method === "PUT") {

  const { benneID, numeroBenne, immatSelected } = req.body;

  if (numeroBenne !== "" && immatSelected !== "") {

   const benneRef = ref(db, `${structures.bennes}/${benneID}`);

   await update(benneRef, { numBenne: numeroBenne, immatriculation: immatSelected });

   const snapshot = await get(benneRef);
   const updatedRecord = snapshot.val();

   res.status(200).json({ success: true, benne: updatedRecord })

  } else {
   res.status(200).json({ success: false, message: "Veuillez remplir les champs obligatoire (*)" })
  }


 }

};

export default handler;