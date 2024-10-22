import { getDatabase, ref, child, get } from "firebase/database";
import firebaseApp from "@/libs/firebase";
import structures from "@/libs/structures";

import bcryptjs from "bcryptjs";

const db = getDatabase(firebaseApp);
const dbRef = ref(db);

const handler = async (req, res) => {
 if (req.method === "POST") {

  const { identifiant, password } = req.body;

  let arrayAdministrateurs = [];
  const snapshotAdministrateur = await get(child(dbRef, `${structures.administrateurs}`));
  snapshotAdministrateur.forEach(snapchild => {
   const data = snapchild.val();
   arrayAdministrateurs.push(data);
  });

  const adminExist = await arrayAdministrateurs.find(elt => elt.email === identifiant);

  if (adminExist) {

   const authPassword = await bcryptjs.compare(password, adminExist.password);

   if (authPassword) {

    const { nom, prenom, email, authorization } = adminExist;
    res.json({ success: true, admin: { nom, prenom, email, authorization } });
   } else {
    res.json({ success: false, message: "Identifiant/Mot de passe invalide" });
   }

  } else {
   res.json({ success: false, message: "Identifiant/Mot de passe invalide" });
  }


 } else {
  res.json({ success: false, message: "Unauthorized request" });
 }
};

export default handler;