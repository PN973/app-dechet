import { getDatabase, ref, set, child, get } from "firebase/database";
import firebaseApp from "@/libs/firebase";
import { v4 as uuidv4 } from 'uuid';
import structures from "@/libs/structures";

const db = getDatabase(firebaseApp);
const dbRef = ref(db);

const handler = async (req, res) => {
 if (req.method === "POST") {

  const { decheterie, nomMatiere, uniteMesure, prixMatiere, consignes } = req.body;

  if (decheterie, nomMatiere !== "" && uniteMesure !== "" && prixMatiere !== "") {

   let arrayMatieres = [];
   const snapshotMatiere = await get(child(dbRef, `${structures.matieres}`));
   snapshotMatiere.forEach(snapchild => {
    const data = snapchild.val();
    arrayMatieres.push(data);
   });

   const isMatiere = await arrayMatieres.find(elt => elt.nom === nomMatiere && elt.decheterieID === decheterie && elt.etat === "valide");

   if (!isMatiere) {

    const date = new Date();
    const matiereID = uuidv4();

    await set(ref(db, `${structures.matieres}/${matiereID}`), {
     id: matiereID,
     decheterieID: decheterie,
     nom: nomMatiere,
     unite: uniteMesure,
     prix: prixMatiere,
     consignes: consignes,
     etat: "valide",
     date: date.toString()
    })

    const newObjRef = ref(db, `${structures.matieres}/${matiereID}`);
    const snapshot = await get(newObjRef);
    const updatedRecord = snapshot.val();

    res.status(200).json({
     success: true, matiere: updatedRecord
    })
   } else {
    res.status(200).json({ success: false, message: "Une matière similaire existe pour cette décheterie. Veuillez renommer." })
   }

  } else {
   res.status(200).json({ success: false, message: "Veuillez remplir tous les champs obligatoires (*)" })
  }


 } else if (req.method === "GET") {

  let arrayMatieres = [];
  const snapshotMatiere = await get(child(dbRef, `${structures.matieres}`));
  snapshotMatiere.forEach(snapchild => {
   const data = snapchild.val();
   arrayMatieres.push(data);
  });


  res.status(200).json({ success: true, matieres: arrayMatieres });

 } else {
  res.status(400).json({ success: false, message: "Unauthorized request" })
 }
}


export default handler;