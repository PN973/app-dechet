import { ref, update, get, getDatabase } from 'firebase/database';
import firebaseApp from '@/libs/firebase';
import structures from '@/libs/structures';


const db = getDatabase(firebaseApp);


const handler = async (req, res) => {
 if (req.method === "POST") {

  const { id, dateEvacuation, heureEvacuation } = req.body;

  if (id !== "" && dateEvacuation !== "" && heureEvacuation !== "") {
   const evacutionRef = ref(db, `${structures.evacuations}/${id}`);

   try {
    // Mettre à jour l'état
    await update(evacutionRef, { dateEvacuationRetour: dateEvacuation, heureEvacuationRetour: heureEvacuation });

    // Récupérer l'objet mis à jour
    const snapshot = await get(evacutionRef);
    const updatedRecord = snapshot.val();

    // Renvoyer l'objet mis à jour au front-end
    res.status(200).json({ success: true, evacuation: updatedRecord });
   } catch (error) {
    res.status(500).json({ success: false, message: "Echec connexion" });
   }

  } else {

   res.status(200).json({ success: false, message: "Veuillez remplir les champs obligatoires (*)" });

  }


 } else {
  res.status(500).json({ success: false })
 }
};

export default handler;