import structures from "@/libs/structures";
import { getDatabase, ref, set, child, get } from "firebase/database";
import firebaseApp from "@/libs/firebase";
import { v4 as uuidv4 } from 'uuid';
import evacuations from "@/pages/dashboard/evacuations";


const db = getDatabase(firebaseApp);
const dbRef = ref(db);


const handler = async (req, res) => {
 if (req.method === "POST") {

 } else if (req.method === "GET") {
  let arrayEvacuations = [];
  const snapshotEvacuations = await get(child(dbRef, `${structures.evacuations}`));
  snapshotEvacuations.forEach(snapchild => {
   const data = snapchild.val();
   arrayEvacuations.push(data);
  });

  res.status(200).json({ success: true, evacuations: arrayEvacuations });
 } else {
  res.status(500).json({ success: false, message: "Unauthorized" })
 }
};

export default handler;