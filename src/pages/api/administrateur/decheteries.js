import { getDatabase, ref, set, child, get } from "firebase/database";
import firebaseApp from "@/libs/firebase";
import { v4 as uuidv4 } from 'uuid';
import structures from "@/libs/structures";


const db = getDatabase(firebaseApp);
const dbRef = ref(db);

const handler = async (req, res) => {
 if (req.method === "POST") {

  const { nomDecheterie, departement, commune, codePostal } = req.body;

  if (nomDecheterie !== "" && departement !== "" && commune !== "" && codePostal !== "") {

   let arrayDecheteries = [];
   const snapshotDecheterie = await get(child(dbRef, `${structures.decheteries}`));
   snapshotDecheterie.forEach(snapchild => {
    const data = snapchild.val();
    arrayDecheteries.push(data);
   });

   const isDecheterie = await arrayDecheteries.find(elt => elt.nom === nomDecheterie && elt.etat === "valide");

   if (!isDecheterie) {

    const date = new Date();
    const decheterieID = uuidv4();

    await set(ref(db, `${structures.decheteries}/${decheterieID}`), {
     id: decheterieID,
     nom: nomDecheterie,
     departement: departement,
     commune: commune,
     codePostal: codePostal,
     etat: "valide",
     date: date.toString()
    })
    const newObjRef = ref(db, `${structures.decheteries}/${decheterieID}`);
    const snapshot = await get(newObjRef);
    const updatedRecord = snapshot.val();

    res.status(200).json({
     success: true, decheterie: updatedRecord,
    })
   } else {
    res.status(200).json({ success: false, message: "Une déchèterie similaire existe. Veuillez renommer." })
   }

  } else {
   res.status(200).json({ success: false, message: "Veuillez remplir tous les champs obligatoires (*)" })
  }


 } else if (req.method === "GET") {

  let arrayDecheteries = [];
  const snapshotDecheterie = await get(child(dbRef, `${structures.decheteries}`));
  snapshotDecheterie.forEach(snapchild => {
   const data = snapchild.val();
   arrayDecheteries.push(data);
  });

  res.status(200).json({ success: true, decheteries: arrayDecheteries });

 } else {
  res.status(400).json({ success: false, message: "Unauthorized request" })
 }
}


export default handler;