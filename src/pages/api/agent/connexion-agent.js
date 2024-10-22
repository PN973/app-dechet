import { getDatabase, ref, child, get } from "firebase/database";
import firebaseApp from "@/libs/firebase";
import structures from "@/libs/structures";

import bcryptjs from "bcryptjs";

const db = getDatabase(firebaseApp);
const dbRef = ref(db);

const handler = async (req, res) => {
 if (req.method === "POST") {

  const { identifiant, password } = req.body;

  let agent = null;

  const snapshotAgents = await get(child(dbRef, `${structures.agents}`));

  snapshotAgents.forEach(snapchild => {
   const data = snapchild.val();
   if (data.email === identifiant) {
    agent = data;
   }
  });

  if (agent && agent.etat === "valide") {

   const authPass = await bcryptjs.compare(password, agent.password);

   if (authPass) {

    const { id, nom, prenom, email, decheterieID, authorization } = agent;

    res.status(200).json({ success: true, user: { id, nom, prenom, email, decheterieID, authorization } })

   } else {

    res.status(200).json({ success: false, message: "Identifiant/Mot de passe invalide" })

   }

  } else {

   res.status(200).json({ success: false, message: "Identifiant/Mot de passe invalide" })
  }


 } else {
  res.json({ success: false, message: "Unauthorized request" });
 }
};

export default handler;