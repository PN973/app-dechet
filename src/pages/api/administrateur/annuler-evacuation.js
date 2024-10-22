import { ref, update, get, getDatabase } from 'firebase/database';
import firebaseApp from '@/libs/firebase';
import structures from '@/libs/structures';

const db = getDatabase(firebaseApp);

const handler = async (req, res) => {
 if (req.method === "POST") {

  const evacuationID = req.body.id;

  const evacuationRef = ref(db, `${structures.evacuations}/${evacuationID}`);

  try {
   // Mettre à jour l'état
   await update(evacuationRef, { etat: 'annule' });

   // Récupérer l'objet mis à jour
   const snapshot = await get(evacuationRef);
   const updatedRecord = snapshot.val();

   // Renvoyer l'objet mis à jour au front-end
   res.status(200).json({ success: true, evacuation: updatedRecord });
  } catch (error) {
   res.status(500).json({ success: false, message: "Echec connexion" });
  }

 } else {
  res.status(500).json({ success: false })
 }
};

export default handler;