// components/ProtectedRoute.js
import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { isAuthenticated } from '@/libs/authAgent';

const ProtectedRouteAgent = (WrappedComponent) => {
 return (props) => {
  const router = useRouter();

  useEffect(() => {
   if (!isAuthenticated()) {
    router.push('/'); // Redirige vers la page de connexion si non connecté
   } 
  }, []);

  return isAuthenticated() ? <WrappedComponent {...props} /> : null;
 };
};

export default ProtectedRouteAgent;
