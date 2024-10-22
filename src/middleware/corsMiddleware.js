import Cors from 'cors';

// Initialise le middleware CORS
const corsMiddleware = Cors({
 methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE'],
 origin: "*"
});

// Fonction middleware CORS
export default function corsHandler(req, res, handler) {
 return new Promise((resolve, reject) => {
  corsMiddleware(req, res, (result) => {
   if (result instanceof Error) {
    return reject(result);
   }
   return resolve(handler(req, res));
  });
 });
}
