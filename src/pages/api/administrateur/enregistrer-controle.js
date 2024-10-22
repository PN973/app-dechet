import structures from "@/libs/structures";
import { getDatabase, ref, set, child, get } from "firebase/database";
import firebaseApp from "@/libs/firebase";
import { v4 as uuidv4 } from 'uuid';

const db = getDatabase(firebaseApp);
const dbRef = ref(db);

const handler = async (req, res) => {
 if (req.method === "POST") {

  const { communeEvacuation, tags, agent, client, dateSelected, heureSelected, immatSelected, communeSelected, produits, isEntreprise } = req.body;


  if (!isEntreprise) {
   if (agent !== "" && dateSelected !== "" && heureSelected !== "" && communeSelected !== "" && produits.length > 0 && communeEvacuation !== "") {

    const controleID = uuidv4();
    const date = new Date();

    let arrayControles = [];
    const snapshotControle = await get(child(dbRef, `${structures.controles}`));
    snapshotControle.forEach(snapChild => {
     const data = snapChild.val();
     arrayControles.push(data);
    });

    const controleNumber = arrayControles.length + 1;

    await set(ref(db, `${structures.controles}/${controleID}`), {
     id: controleID,
     numero: controleNumber,
     agentID: "administrateur",
     agent: agent,
     client: client,
     dateOperation: dateSelected,
     heure: heureSelected,
     immatriculation: tags,
     commune: communeEvacuation,
     produits: produits,
     etat: "valide",
     date: date.toString()
    });

    const controleRef = ref(db, `${structures.controles}/${controleID}`);
    const snapshot = await get(controleRef);
    const controle = snapshot.val();

    res.status(200).json({ success: true, controle: controle });
   } else {

    res.status(200).json({ success: false, message: "Veuillez remplir les champs obligatoires (*)" });
   }


  } else {
   if (agent !== "" && dateSelected !== "" && heureSelected !== "" && communeSelected !== "" && produits.length > 0 && tags.length > 0 && communeEvacuation !== "" /*immatSelected !== ""*/) {

    const controleID = uuidv4();
    const date = new Date();

    let arrayControles = [];
    const snapshotControle = await get(child(dbRef, `${structures.controles}`));
    snapshotControle.forEach(snapChild => {
     const data = snapChild.val();
     arrayControles.push(data);
    });

    const controleNumber = arrayControles.length + 1;

    await set(ref(db, `${structures.controles}/${controleID}`), {
     id: controleID,
     numero: controleNumber,
     agentID: "administrateur",
     agent: agent,
     client: client,
     dateOperation: dateSelected,
     heure: heureSelected,
     immatriculation: tags,
     commune: communeEvacuation,
     produits: produits,
     etat: "valide",
     date: date.toString()
    });

    const controleRef = ref(db, `${structures.controles}/${controleID}`);
    const snapshot = await get(controleRef);
    const controle = snapshot.val();

    res.status(200).json({ success: true, controle: controle });
   } else {

    res.status(200).json({ success: false, message: "Veuillez remplir les champs obligatoires (*)" });
   }

  }

 } else if (req.method === "GET") {

  let arrayControles = [];
  const snapshotControle = await get(child(dbRef, `${structures.controles}`));
  snapshotControle.forEach(snapChild => {
   const data = snapChild.val();
   arrayControles.push(data);
  });

  res.status(200).json({ success: true, controles: arrayControles });

 }
};

export default handler;