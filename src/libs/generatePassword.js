import crypto from "crypto";

const generateDefaultPassword = () => {
 const min = 10000000; // Le plus petit nombre à 6 chiffres
 const max = 99999999; // Le plus grand nombre à 6 chiffres
 const range = max - min + 1;
 const randomBytes = crypto.randomBytes(4); // Utilisez 4 octets pour une bonne distribution des nombres aléatoires
 const randomNumber = randomBytes.readUInt32LE(0); // Convertissez les octets en un nombre entier non signé de 32 bits en petit boutiste
 return min + Math.floor(randomNumber / (0xffffffff / range));
};

export default generateDefaultPassword;