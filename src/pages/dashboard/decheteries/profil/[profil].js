import ProtectedRoute from "@/components/ProtectedRoute";
import { useRouter } from "next/router";

const ProfilDecheterie = () => {

 const router = useRouter();
 return (
  <>
   <div> {router.query.profil}</div>
  </>
 )
};

export default ProtectedRoute(ProfilDecheterie);