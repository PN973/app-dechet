import ProtectedRoute from "@/components/ProtectedRoute";
import { useRouter } from "next/router";

const ProfilClient = () => {

 const router = useRouter();
 return (
  <>
   <div> {router.query.profil}</div>
  </>
 )
};

export default ProtectedRoute(ProfilClient);