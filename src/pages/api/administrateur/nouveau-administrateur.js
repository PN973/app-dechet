import { getDatabase, ref, set, child, get } from "firebase/database";
import firebaseApp from "@/libs/firebase";
import validateEmail from "@/libs/emailValidator";
import structures from "@/libs/structures";
import { v4 as uuidv4 } from 'uuid';
import jwt from "jsonwebtoken";
import bcryptjs from "bcryptjs";

const db = getDatabase(firebaseApp);
const dbRef = ref(db);

const handler = async (req, res) => {
 if (req.method === "POST") {

  const { identifiant, password } = req.body;

  if (validateEmail(identifiant)) {

   let arrayAdministrateurs = [];
   const snapshotAdministrateur = await get(child(dbRef, `${structures.administrateurs}`));
   snapshotAdministrateur.forEach(snapchild => {
    const data = snapchild.val();
    arrayAdministrateurs.push(data);
   });

   const adminExist = await arrayAdministrateurs.find(elt => elt.email === identifiant);

   if (!adminExist) {

    const date = new Date();
    const adminID = uuidv4();
    const nom = "admin";
    const prenom = "admin";

    const authToken = await jwt.sign({ adminID, nom, prenom, identifiant }, process.env.JSONWEBTOKEN_PRIVATE);

    const salt = await bcryptjs.genSalt();

    const hashPass = await bcryptjs.hash(password, salt);

    await set(ref(db, `${structures.administrateurs}/${adminID}`), {
     id: adminID,
     email: identifiant,
     password: hashPass,
     nom: nom,
     prenom: prenom,
     authorization: authToken,
     date: date.toString()
    })

    res.json({ success: true });
   } else {
    res.json({ success: false, message: "Ce compte administrateur existe déja" });
   }

  } else {
   res.json({ success: false, message: "Veuillez entrer une adresse email valide" });
  }


 } else {
  res.json({ success: false, message: "Unauthorized request" });
 }
};

export default handler;