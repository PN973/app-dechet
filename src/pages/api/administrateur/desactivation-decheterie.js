import { ref, update, get, getDatabase } from 'firebase/database';
import firebaseApp from '@/libs/firebase';
import structures from '@/libs/structures';
import decheteries from '@/pages/dashboard/decheteries';

const db = getDatabase(firebaseApp);
const dbRef = ref(db);


const handler = async (req, res) => {
 if (req.method === "POST") {

  const decheterieID = req.body.id;

  const decheterieRef = ref(db, `${structures.decheteries}/${decheterieID}`);

  try {
   // Mettre à jour l'état
   await update(decheterieRef, { etat: 'invalid' });

   // Récupérer l'objet mis à jour
   const snapshot = await get(decheterieRef);
   const updatedRecord = snapshot.val();

   // Renvoyer l'objet mis à jour au front-end
   res.status(200).json({ success: true, decheterie: updatedRecord });
  } catch (error) {
   res.status(500).json({ success: false, message: "Echec connexion" });
  }

 } else {
  res.status(500).json({ success: false })
 }
};

export default handler;