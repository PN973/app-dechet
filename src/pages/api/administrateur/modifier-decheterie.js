import { ref, update, get, getDatabase } from 'firebase/database';
import firebaseApp from '@/libs/firebase';
import structures from '@/libs/structures';

const db = getDatabase(firebaseApp);

const handler = async (req, res) => {
 if (req.method === "POST") {

  const { id, nomDecheterie, departement, commune, codePostal } = req.body;
  console.log(id, nomDecheterie, departement, commune, codePostal);

  if (id !== "" && nomDecheterie !== "" && departement !== "" && commune !== "" && codePostal !== "") {

   const decheterieRef = ref(db, `${structures.decheteries}/${id}`);

   await update(decheterieRef, { nom: nomDecheterie, departement: departement, commune: commune, codePostal: codePostal });

   const snapshot = await get(decheterieRef);
   const updatedRecord = snapshot.val();

   // Renvoyer l'objet mis à jour au front-end
   res.status(200).json({ success: true, decheterie: updatedRecord });

   res.status(200).json({ success: true })
  } else {
   res.status(200).json({ success: false, message: "Veuillez remplir les champs obligatoires (*)" });
  }


 } else {
  res.status(500).json({ success: false, message: "Unauthorized" });
 }
};

export default handler;