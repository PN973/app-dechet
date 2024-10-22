import { ref, update, get, getDatabase, child } from 'firebase/database';
import firebaseApp from '@/libs/firebase';
import structures from '@/libs/structures';
import bcryptjs from "bcryptjs";

const db = getDatabase(firebaseApp);
const dbRef = ref(db);

const handler = async (req, res) => {
 if (req.method === "POST") {
  const {
   id,
   nom,
   prenom,
   telephone,
   password,
   ancienPassword,
   sendPass
  } = req.body;

  if (!sendPass) {
   if (nom !== "" && prenom !== "" && telephone !== "") {
    const agentRef = ref(db, `${structures.agents}/${id}`);

    await update(agentRef, { nom: nom, prenom: prenom, telephone: telephone });

    res.status(200).json({ success: true });
   } else {
    res.status(200).json({ success: false, message: "Veuillez remplir tous les champs" });
   }

  } else {

   if (nom !== "" && prenom !== "" && ancienPassword !== "" && password !== "") {

    let arrayAgents = [];
    const snapshotAgent = await get(child(dbRef, `${structures.agents}`));
    snapshotAgent.forEach(snapchild => {
     const data = snapchild.val();
     arrayAgents.push(data);
    });

    const agent = arrayAgents.find(elt => elt.id === id);

    const isValidPass = await bcryptjs.compare(ancienPassword, agent.password);

    if (isValidPass) {

     if (password.length >= 8) {
      const agentRef = ref(db, `${structures.agents}/${id}`);

      const salt = await bcryptjs.genSalt();
      const hashPass = await bcryptjs.hash(password, salt);

      await update(agentRef, { nom: nom, prenom: prenom, telephone: telephone, password: hashPass });

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