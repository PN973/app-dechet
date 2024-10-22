import { ref, update, get, getDatabase } from 'firebase/database';
import firebaseApp from '@/libs/firebase';
import structures from '@/libs/structures';

const db = getDatabase(firebaseApp);
const dbRef = ref(db);


const handler = async (req, res) => {
 if (req.method === "POST") {

  const agentID = req.body.agent.id;

  const agentRef = ref(db, `${structures.agents}/${agentID}`);

  try {
   // Mettre à jour l'état
   await update(agentRef, { etat: 'invalid' });

   // Récupérer l'objet mis à jour
   const snapshot = await get(agentRef);
   const updatedRecord = snapshot.val();

   // Renvoyer l'objet mis à jour au front-end
   res.status(200).json({ success: true, agent: updatedRecord });
  } catch (error) {
   res.status(500).json({ success: false, message: "Echec connexion" });
  }

 } else {
  res.status(500).json({ success: false })
 }
};

export default handler;