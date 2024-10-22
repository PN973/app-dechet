import structures from "@/libs/structures";
import { getDatabase, ref, set, child, get } from "firebase/database";
import firebaseApp from "@/libs/firebase";
import { v4 as uuidv4 } from 'uuid';

const db = getDatabase(firebaseApp);
const dbRef = ref(db);


const handler = async (req, res) => {
 if (req.method === "POST") {

  const { imageRecapitulatif, typeEvacuation, decheterie, dateEvacuation, heureEvacuation, immatriculation, nomChauffeur, numBenne, matieresEvacuees, peseeExutoire, typePesee, peseeEnEntree, peseeEnSortie, peseeNet, observations, listeImagesObservations, signatureOptimom } = req.body;


  if (typeEvacuation) {

   if (decheterie !== "" && dateEvacuation !== "" && heureEvacuation !== "" && immatriculation !== "" && nomChauffeur !== "" && numBenne !== "" && matieresEvacuees.length > 0  /*&& peseeExutoire !== ""&& typePesee !== ""*/ && peseeEnEntree !== "" && peseeEnSortie !== "" && peseeNet !== "" && signatureOptimom !== "") {

    const date = new Date();
    const evacuationID = uuidv4();
    let arrayEvacuation = [];
    const snapshotEvacuation = await get(child(dbRef, `${structures.evacuations}`));
    snapshotEvacuation.forEach(snapChild => {
     const data = snapChild.val();
     arrayEvacuation.push(data);
    });

    const prevNumber = arrayEvacuation.length;
    const nextNumber = prevNumber + 1;


    await set(ref(db, `${structures.evacuations}/${evacuationID}`), {
     id: evacuationID,
     numEvacuation: nextNumber,
     agentID: "administrateur",
     decheterieID: decheterie,
     dateEvacuation: dateEvacuation,
     heureEvacuation: heureEvacuation,
     immatriculation: immatriculation,
     nomChauffeur: nomChauffeur,
     numBenne: numBenne,
     matieresEvacuees: matieresEvacuees,
     peseeExutoire: peseeExutoire,
     typePesee: typePesee,
     peseeEnSortie: peseeEnSortie,
     peseeEnEntree: peseeEnEntree,
     peseeNet: peseeNet,
     observations: observations,
     listeImagesObservations: listeImagesObservations,
     signatureOptimom: signatureOptimom,
     typeEvacuation: typeEvacuation,
     imageRecapitulatif: imageRecapitulatif,
     etat: "attente",
     date: date.toString()
    })

    const newObjRef = ref(db, `${structures.evacuations}/${evacuationID}`);
    const snapshot = await get(newObjRef);
    const updatedRecord = snapshot.val();


    res.status(200).json({ success: true, evacuation: updatedRecord });
   } else {
    res.status(200).json({ success: false, message: "Veuillez remplir les champs obligatoires (*)" });
   }


  } else {

   if (decheterie !== "" && dateEvacuation !== "" && heureEvacuation !== "" && matieresEvacuees.length > 0 /*&& immatriculation !== "" && nomChauffeur !== "" && numBenne !== "" && matieresEvacuees.length > 0 && peseeExutoire !== "" && typePesee !== "" && peseeEnEntree !== "" && peseeEnSortie !== "" && peseeNet !== ""*/ && signatureOptimom !== "") {

    const date = new Date();
    const evacuationID = uuidv4();
    let arrayEvacuation = [];
    const snapshotEvacuation = await get(child(dbRef, `${structures.evacuations}`));
    snapshotEvacuation.forEach(snapChild => {
     const data = snapChild.val();
     arrayEvacuation.push(data);
    });

    const prevNumber = arrayEvacuation.length;
    const nextNumber = prevNumber + 1;


    await set(ref(db, `${structures.evacuations}/${evacuationID}`), {
     id: evacuationID,
     numEvacuation: nextNumber,
     agentID: "administrateur",
     decheterieID: decheterie,
     dateEvacuation: dateEvacuation,
     heureEvacuation: heureEvacuation,
     immatriculation: immatriculation,
     nomChauffeur: nomChauffeur,
     numBenne: numBenne,
     matieresEvacuees: matieresEvacuees,
     peseeExutoire: peseeExutoire,
     typePesee: typePesee,
     peseeEnSortie: peseeEnSortie,
     peseeEnEntree: peseeEnEntree,
     peseeNet: peseeNet,
     observations: observations,
     listeImagesObservations: listeImagesObservations,
     signatureOptimom: signatureOptimom,
     typeEvacuation: typeEvacuation,
     imageRecapitulatif: imageRecapitulatif,
     etat: "attente",
     date: date.toString()
    })

    const newObjRef = ref(db, `${structures.evacuations}/${evacuationID}`);
    const snapshot = await get(newObjRef);
    const updatedRecord = snapshot.val();


    res.status(200).json({ success: true, evacuation: updatedRecord });
   } else {
    res.status(200).json({ success: false, message: "Veuillez remplir les champs obligatoires (*)" });
   }


  }




 } else {

  res.status(500).json({ success: false });

 }
};

export default handler;