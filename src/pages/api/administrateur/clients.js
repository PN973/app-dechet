import structures from "@/libs/structures";
import { getDatabase, ref, set, child, get } from "firebase/database";
import firebaseApp from "@/libs/firebase";
import { v4 as uuidv4 } from 'uuid';
import validateEmail from "@/libs/emailValidator";


const db = getDatabase(firebaseApp);
const dbRef = ref(db);

const handler = async (req, res) => {
 if (req.method === "POST") {
  const { tags, isEntreprise, decheterie, nomSociete, numSiret, nomGerant, prenomGerant, immatriculation, courriel, telephone, ville, codePostal, adresse, nomParticulier, prenomParticulier } = req.body;

  if (isEntreprise) {

   if (nomSociete !== "" && numSiret !== "" && nomGerant !== "" && prenomGerant !== "" && courriel !== "" && telephone !== "" && ville !== "" && codePostal !== "" && adresse !== "") {

    if (validateEmail(courriel)) {
     let arrayClients = [];
     const snapshotClient = await get(child(dbRef, `${structures.clients}`));
     snapshotClient.forEach(snapchild => {
      const data = snapchild.val();
      arrayClients.push(data);
     });

     const isClient = await arrayClients.find(elt => elt.email === courriel);

     if (!isClient) {

      const date = new Date();
      const clientID = uuidv4();

      await set(ref(db, `${structures.clients}/${clientID}`), {
       id: clientID,
       societe: isEntreprise,
       decheterieID: decheterie,
       nomSociete,
       numSiret,
       nom: nomGerant,
       prenom: prenomGerant,
       immatriculation: tags,
       email: courriel,
       telephone,
       ville,
       codePostal,
       adresse,
       agentID: "administrateur",
       etat: "valide",
       date: date.toString()
      })

      const newObjRef = ref(db, `${structures.clients}/${clientID}`);
      const snapshot = await get(newObjRef);
      const updatedRecord = snapshot.val();

      res.status(200).json({
       success: true, client: updatedRecord
      });

     } else {
      res.status(200).json({ success: false, message: "Ce client existe déja" });
     }

    } else {
     res.status(200).json({ success: false, message: "Courriel invalide" });
    }

   } else {
    res.status(200).json({ success: false, message: "Veuillez remplir les champs obligatoire (*)" });
   }

  } else {

   if (nomParticulier !== "" && prenomParticulier !== "" && courriel !== "" && telephone !== "" && ville !== "" && codePostal !== "" && adresse !== "") {

    if (validateEmail(courriel)) {
     let arrayClients = [];
     const snapshotClient = await get(child(dbRef, `${structures.clients}`));
     snapshotClient.forEach(snapchild => {
      const data = snapchild.val();
      arrayClients.push(data);
     });

     const isClient = await arrayClients.find(elt => elt.email === courriel);

     if (!isClient) {

      const date = new Date();
      const clientID = uuidv4();

      await set(ref(db, `${structures.clients}/${clientID}`), {
       id: clientID,
       societe: isEntreprise,
       decheterieID: decheterie,
       nom: nomParticulier,
       prenom: prenomParticulier,
       immatriculation: tags,
       email: courriel,
       telephone,
       ville,
       codePostal,
       adresse,
       agentID: "administrateur",
       etat: "valide",
       date: date.toString()
      });

      const newObjRef = ref(db, `${structures.clients}/${clientID}`);
      const snapshot = await get(newObjRef);
      const updatedRecord = snapshot.val();

      res.status(200).json({
       success: true, client: updatedRecord
      });


     } else {
      res.status(200).json({ success: false, message: "Ce client existe déja" });
     }

    } else {
     res.status(200).json({ success: false, message: "Courriel invalide" });
    }

   } else {
    res.status(200).json({ success: false, message: "Veuillez remplir les champs obligatoire (*)" });
   }

  }

 } else if (req.method === "GET") {
  let arrayClients = [];
  const snapshotClient = await get(child(dbRef, `${structures.clients}`));
  snapshotClient.forEach(snapchild => {
   const data = snapchild.val();
   arrayClients.push(data);
  });

  res.status(200).json({ success: true, clients: arrayClients });
 }
};

export default handler;