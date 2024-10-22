import { ref, update, get, getDatabase } from 'firebase/database';
import firebaseApp from '@/libs/firebase';
import structures from '@/libs/structures';

const db = getDatabase(firebaseApp);

const handler = async (req, res) => {
 if (req.method === "POST") {

  const { id, nomMatiere, uniteMesure, prixMatiere, consignes } = req.body;

  if (id !== "" && nomMatiere !== "" && uniteMesure !== "" && prixMatiere) {

   const matiereRef = ref(db, `${structures.matieres}/${id}`);

   await update(matiereRef, { nom: nomMatiere, unite: uniteMesure, prix: prixMatiere, consignes: consignes });

   const snapshot = await get(matiereRef);
   const updatedRecord = snapshot.val();

   // Renvoyer l'objet mis à jour au front-end
   res.status(200).json({ success: true, matiere: updatedRecord });

   res.status(200).json({ success: true })
  } else {
   res.status(200).json({ success: false, message: "Veuillez remplir les champs obligatoires (*)" });
  }


 } else {
  res.status(500).json({ success: false, message: "Unauthorized" });
 }
};

export default handler;