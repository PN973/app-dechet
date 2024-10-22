import { ref, update, get, getDatabase } from 'firebase/database';
import firebaseApp from '@/libs/firebase';
import structures from '@/libs/structures';

const db = getDatabase(firebaseApp);
const dbRef = ref(db);


const handler = async (req, res) => {
 if (req.method === "POST") {

  const { agentID, nom, prenom, telephone, decheterie } = req.body;

  if (nom !== "" && prenom !== "" && decheterie !== "" && agentID !== "") {

   const agentRef = ref(db, `${structures.agents}/${agentID}`);

   await update(agentRef, { nom: nom, prenom: prenom, telephone: telephone, decheterieID: decheterie });

   res.status(200).json({ success: true })
  } else {
   res.status(200).json({ success: false, message: "Veuillez remplir les champs obligatoires (*)" });
  }


 } else {
  res.status(500).json({ success: false, message: "Unauthorized" });
 }
};

export default handler;