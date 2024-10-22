// utils/auth.js
import { getCookie } from "@/libs/clientCookie";

export const isAuthenticated = () => {
  const userData = getCookie("agent");
  return !!userData; // Renvoie true si userData existe, sinon false
};
