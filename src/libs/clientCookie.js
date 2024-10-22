// utils/clientCookies.js
import Cookies from 'js-cookie';

// Fonction pour définir un cookie avec une expiration
export const setCookie = (name, value, days) => {
 Cookies.set(name, value, { expires: days });
};

// Fonction pour obtenir un cookie
export const getCookie = (name) => {
 return Cookies.get(name);
};

// Fonction pour supprimer un cookie
export const removeCookie = (name) => {
 Cookies.remove(name);
};
