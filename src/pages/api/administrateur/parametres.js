import { ref, update, get, getDatabase, child } from 'firebase/database';
import firebaseApp from '@/libs/firebase';
import structures from '@/libs/structures';
import bcryptjs from "bcryptjs";

const db = getDatabase(firebaseApp);
const dbRef = ref(db);

const handler = async (req, res) => {
 if (req.method === "POST") {

  const id = "6b2bf398-7c1f-40e1-bef1-3d1149a6a8e4";
  const {
   nom,
   prenom,
   email,
   password,
   ancienPassword,
   sendPass
  } = req.body;

  if (!sendPass) {
   if (nom !== "" && prenom !== "" && email !== "") {
    const adminRef = ref(db, `${structures.administrateurs}/${id}`);

    await update(adminRef, { nom: nom, prenom: prenom, email: email });

    res.status(200).json({ success: true });
   } else {
    res.status(200).json({ success: false, message: "Veuillez remplir tous les champs" });
   }

  } else {

   if (nom !== "" && prenom !== "" && email !== "" && ancienPassword !== "" && password !== "") {

    const adminSnap = await get(child(dbRef, `${structures.administrateurs}/${id}`));
    const admin = adminSnap.val();

    const isValidPass = await bcryptjs.compare(ancienPassword, admin.password);

    if (isValidPass) {

     if (password.length >= 8) {
      const adminRef = ref(db, `${structures.administrateurs}/${id}`);

      const salt = await bcryptjs.genSalt();
      const hashPass = await bcryptjs.hash(password, salt);

      await update(adminRef, { nom: nom, prenom: prenom, email: email, password: hashPass });

      res.status(200).json({ success: true });

     } else {
      res.status(200).json({ success: false, message: "Le nouveau mot de passe doit contenir min 8 caractères" });
     }

    } else {

     res.status(200).json({ success: false, message: "Ancien mot de passe invalide" });
    }


   } else {
    res.status(200).json({ success: false, message: "Veuillez remplir tous les champs" });
   }


  }


 } else {
  res.status(500).json({ success: false });
 }
}

export default handler;