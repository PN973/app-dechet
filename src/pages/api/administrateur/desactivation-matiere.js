import { ref, update, get, getDatabase } from 'firebase/database';
import firebaseApp from '@/libs/firebase';
import structures from '@/libs/structures';

const db = getDatabase(firebaseApp);

const handler = async (req, res) => {
 if (req.method === "POST") {

  const matiereID = req.body.id;

  const matiereRef = ref(db, `${structures.matieres}/${matiereID}`);

  try {
   // Mettre à jour l'état
   await update(matiereRef, { etat: 'invalid' });

   // Récupérer l'objet mis à jour
   const snapshot = await get(matiereRef);
   const updatedRecord = snapshot.val();

   // Renvoyer l'objet mis à jour au front-end
   res.status(200).json({ success: true, matiere: updatedRecord });
  } catch (error) {
   res.status(500).json({ success: false, message: "Echec connexion" });
  }

 } else {
  res.status(500).json({ success: false })
 }
};

export default handler;