
// Auth middleware:
import jwt from "jsonwebtoken";

// Middleware d'authentification
export default function authMiddleware(handler) {
 return async (req, res) => {
  // Récupérer le token d'authentification depuis les en-têtes de la requête
  const token = req.headers.authorization;

  // Vérifier si le token est présent
  if (!token) {
   return res.json({ success: false, message: "Unauthorized" });
  }

  try {
   // Vérifier le token avec la clé secrète
   const decodedToken = await jwt.verify(token, process.env.JWT_TOKEN);


   // Ajouter les données du token décodé à la requête
   req.user = decodedToken;

   // Passer à l'handler suivant
   return handler(req, res);

  } catch (error) {

   res.json({ success: false, message: "Unauthorized" });
  }

 };
}