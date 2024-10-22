import NavBarComp from "@/components/Navbar";
import SideNavBar from "@/components/SideNavBar";
import ProtectedRoute from "@/components/ProtectedRoute";

const Formulaires = () => {
 return (
  <>
   <NavBarComp title="Gestion des formulaires" />
   <SideNavBar />
  </>
 )
};

export default ProtectedRoute(Formulaires);