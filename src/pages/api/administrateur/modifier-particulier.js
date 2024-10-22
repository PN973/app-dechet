import { ref, update, get, getDatabase } from 'firebase/database';
import firebaseApp from '@/libs/firebase';
import structures from '@/libs/structures';

const db = getDatabase(firebaseApp);

const handler = async (req, res) => {
 if (req.method === "POST") {

  const { tags, id, prenomParticulier, nomParticulier, courriel, telephone, ville, codePostal, adresse, immatriculation } = req.body;

  if (id !== "" && prenomParticulier !== "" && nomParticulier !== "" && courriel !== "" && telephone !== "" && ville !== "" && codePostal !== "" && adresse !== "") {

   const clientRef = ref(db, `${structures.clients}/${id}`);

   await update(clientRef, { prenom: prenomParticulier, nom: nomParticulier, email: courriel, telephone: telephone, ville: ville, codePostal: codePostal, adresse: adresse, immatriculation: tags });

   const snapshot = await get(clientRef);
   const updatedRecord = snapshot.val();

   // Renvoyer l'objet mis à jour au front-end
   res.status(200).json({ success: true, client: updatedRecord });

   res.status(200).json({ success: true })
  } else {
   res.status(200).json({ success: false, message: "Veuillez remplir les champs obligatoires (*)" });
  }


 } else {
  res.status(500).json({ success: false, message: "Unauthorized" });
 }
};

export default handler;