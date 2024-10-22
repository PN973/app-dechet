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

  const { decheterie, nom, prenom, email } = req.body;

  if (decheterie !== "" && nom !== "" && prenom !== "" && email !== "") {

   const chauffeursRef = ref(db, `${structures.chauffeurs}`);
   const emailQuery = query(chauffeursRef, orderByChild('email'), equalTo(email));

   try {
    const snapshot = await get(emailQuery);
    if (!snapshot.exists()) {

     const date = new Date();
     const chauffeurID = uuidv4();
     const defaultPass = generateDefaultPassword();
     const salt = await bcryptjs.genSalt();
     const hashPass = await bcryptjs.hash(defaultPass.toString(), salt);

     const authToken = jwt.sign({ chauffeurID, nom, prenom, email }, process.env.JSONWEBTOKEN_PRIVATE);

     await set(ref(db, `${structures.chauffeurs}/${chauffeurID}`), {
      id: chauffeurID,
      decheterieID: decheterie,
      email: email,
      password: hashPass,
      nom: nom,
      prenom: prenom,
      authorization: authToken,
      etat: "valide",
      date: date.toString()
     });

     const newObjRefChauffeur = ref(db, `${structures.chauffeurs}/${chauffeurID}`);
     const snapshotChauffeur = await get(newObjRefChauffeur);
     const newChauffeur = snapshotChauffeur.val();

     res.status(200).json({ success: true, chauffeur: newChauffeur })
    } else {
     res.status(200).json({ success: false, message: "Ce chauffeur existe déja" });
    }

   } catch (error) {
    res.status(200).json({ success: false, message: "Echec connexion" })
   }

  } else {
   res.status(200).json({ success: false, message: "Veuillez remplir les champs obligatoires (*)" })
  }

 } else if (req.method === "GET") {

  const chauffeursRef = ref(db, `${structures.chauffeurs}`);
  const snapshot = await get(chauffeursRef);

  if (snapshot.exists()) {
   const data = snapshot.val();
   const chauffeursArray = Object.keys(data).map(key => ({ id: key, ...data[key] }));
   res.status(200).json({ success: true, chauffeurs: chauffeursArray })
  } else {

   res.status(200).json({ success: true, message: "Aucun chauffeur" })
  }

 } else if (req.method === "PATCH") {

  const { chauffeurID, action } = req.body;

  if (action === "desactivation") {

   const chauffeurRef = ref(db, `${structures.chauffeurs}/${chauffeurID}`);

   await update(chauffeurRef, { etat: "invalid" });

   const snapshot = await get(chauffeurRef);
   const updatedRecord = snapshot.val();

   res.status(200).json({ success: true, chauffeur: updatedRecord })

  } else if (action === "activation") {

   const chauffeurRef = ref(db, `${structures.chauffeurs}/${chauffeurID}`);

   await update(chauffeurRef, { etat: "valide" });

   const snapshot = await get(chauffeurRef);
   const updatedRecord = snapshot.val();

   res.status(200).json({ success: true, chauffeur: updatedRecord })
  }

 } else if (req.method === "PUT") {

  const { chauffeurID, nom, prenom } = req.body;

  if (nom !== "" && prenom !== "") {

   const chauffeurRef = ref(db, `${structures.chauffeurs}/${chauffeurID}`);

   await update(chauffeurRef, { nom: nom, prenom: prenom });

   const snapshot = await get(chauffeurRef);
   const updatedRecord = snapshot.val();

   res.status(200).json({ success: true, chauffeur: updatedRecord })

  } else {
   res.status(200).json({ success: false, message: "Veuillez remplir les champs obligatoire (*)" })
  }


 }

};

export default handler;