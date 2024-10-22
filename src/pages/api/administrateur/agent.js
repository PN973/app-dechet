import structures from "@/libs/structures";
import sendEmail from '@/libs/mailer';
import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";
import { getDatabase, ref, set, child, get } from "firebase/database";
import firebaseApp from "@/libs/firebase";
import { v4 as uuidv4 } from 'uuid';
import validateEmail from "@/libs/emailValidator";


const db = getDatabase(firebaseApp);
const dbRef = ref(db);


const handler = async (req, res) => {

 if (req.method === "POST") {
  const { nom, prenom, telephone, email, password, decheterie, sendPass } = req.body;

  if (nom !== "" && prenom !== "" && email !== "" && password && decheterie !== "") {

   if (validateEmail(email)) {

    let arrayAgents = [];
    const snapshotAgent = await get(child(dbRef, `${structures.agents}`));
    snapshotAgent.forEach(snapchild => {
     const data = snapchild.val();
     arrayAgents.push(data);
    });

    const isAgent = await arrayAgents.find(elt => elt.email === email);

    if (!isAgent) {

     const date = new Date();
     const agentID = uuidv4();
     const salt = await bcryptjs.genSalt();
     const hashPass = await bcryptjs.hash(password.toString(), salt);

     const authorization = await jwt.sign({ nom, prenom, telephone, email }, process.env.JSONWEBTOKEN_PRIVATE);

     await set(ref(db, `${structures.agents}/${agentID}`), {
      id: agentID,
      decheterieID: decheterie,
      email: email,
      telephone: telephone,
      password: hashPass,
      nom: nom,
      prenom: prenom,
      authorization: authorization,
      etat: "valide",
      date: date.toString()
     })

     const newObjRef = ref(db, `${structures.agents}/${agentID}`);
     const snapshot = await get(newObjRef);
     const updatedRecord = snapshot.val();

     if (sendPass) {
      const to = email;
      const subject = "Nouveau compte";
      const message = `Vous venez d' être ajouter comme agent de OPTIM'OM SAS. Url de connexion: https://optimom.netlify.app/ - identifiant: ${email} - mot de passe: ${password} .`;

      await sendEmail(to, subject, message);
     }

     res.status(200).json({
      success: true, agent: updatedRecord
     });

    } else {
     res.status(200).json({ success: false, message: "Cette agent/email existe déja" });
    }

   } else {
    res.status(200).json({ success: false, message: "Adresse e-mail invalide" });
   }

  } else {
   res.status(200).json({ success: false, message: "Veuillez remplir les champs obligatoires (*)" });
  }


 } else if (req.method === "GET") {

  let arrayAgents = [];
  const snapshotAgent = await get(child(dbRef, `${structures.agents}`));
  snapshotAgent.forEach(snapchild => {
   const data = snapchild.val();
   arrayAgents.push(data);
  });

  res.status(200).json({ success: true, agents: arrayAgents });

 } else {
  res.status(400).json({ success: false, message: "Unauthorized request" });
 }
};

export default handler;