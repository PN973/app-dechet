import { ref, query, orderByChild, equalTo, get, getDatabase, update } from 'firebase/database';
import sendEmail from '@/libs/mailer';
import firebaseApp from '@/libs/firebase';
import structures from '@/libs/structures';
import generateDefaultPassword from '@/libs/generatePassword';
import bcryptjs from "bcryptjs";

const db = getDatabase(firebaseApp);


const handler = async (req, res) => {
 if (req.method === "POST") {

  const { identifiant } = req.body;

  const userRef = ref(db, `${structures.agents}`);
  const emailQuery = query(userRef, orderByChild('email'), equalTo(identifiant));


  try {
   const snapshot = await get(emailQuery);
   if (snapshot.exists()) {
    const userData = snapshot.val();
    const id = Object.keys(userData)[0];
    const pass = generateDefaultPassword();
    const salt = await bcryptjs.genSalt();

    const hashPass = await bcryptjs.hash(`${pass}`, salt);

    const agentRef = ref(db, `${structures.agents}/${id}`);

    await update(agentRef, { password: hashPass });

    const to = identifiant;
    const subject = "Demande de réinitialisation de mot de passe";
    const message = `Votre nouveau mot de passe est: ${pass} .`;

    await sendEmail(to, subject, message);

    res.status(200).json({ success: true });
   } else {
    res.status(200).json({ success: false, message: "E-mail invalide" })
   }
  } catch (error) {
   res.status(200).json({ success: false, message: "Echec connexion" })
  }


 } else if (req.method === "GET") {
  res.status(200).json({ success: false, message: 'Method GET' });
 }
};

export default handler;
