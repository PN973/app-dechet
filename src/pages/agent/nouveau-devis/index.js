import NavBarComp from "@/components/Navbar";
import ProtectedRouteAgent from "@/components/ProtectedRouteAgent";
import Facturation from "@/components/FactureAgent";
import styles from "@/styles/facturation.module.css";
import styled from "styled-components";
import { useRouter } from "next/router";
import { useEffect } from "react";
import { useMyContext } from "@/context/Mycontext";
import { Breadcrumb } from "react-bootstrap";
import ResumeFacture from "@/components/ResumeFactureAgent";


const Container = styled.div`
  display: flex;
  flex-direction: row;
  width: 100%; /* 100% de la largeur de la fenêtre */
  height: 100vh; /* 100% de la hauteur de la fenêtre */
  @media (max-width: 768px) {
   flex-direction: column; /* Pour les petits écrans, alignement vertical */
 }
`;

// Col styled component (avec ajustements)
const Col = styled.div`
  flex: ${props => props.width}; /* Utilisation de props pour définir la largeur en pourcentage */
  padding: 20px;
  &:not(:last-child) {
    margin-right: 10px; /* Espacement entre les colonnes */
  }

  @media (max-width: 768px) {
   flex: 1; /* Sur mobile, chaque colonne prend toute la largeur disponible */
   margin-bottom: 20px; /* Espacement entre les colonnes sur mobile */
 }
`;



const NouveauDevis = () => {

  const router = useRouter();

  const { facturation, setFacturation, clientFacturation, setClientFacturation } = useMyContext();

  useEffect(() => {
    const handleRouteChange = (url) => {
      setClientFacturation(null);
      setFacturation([]);
    };

    // Écouter l'événement routeChangeStart
    router.events.on('routeChangeStart', handleRouteChange);

    return () => {
      // Nettoyer l'écouteur lorsque le composant est démonté
      router.events.off('routeChangeStart', handleRouteChange);
    };
  }, [router.events]);
  return (
    <>
      <NavBarComp title="Créer un nouveau dépot" />
      <div style={{ margin: 20 }}>
        <Breadcrumb>
          <Breadcrumb.Item href="/agent/accueil">Accueil</Breadcrumb.Item>
          <Breadcrumb.Item href="/agent/depots">Dépots</Breadcrumb.Item>
          <Breadcrumb.Item active>Nouveau dépot</Breadcrumb.Item>
        </Breadcrumb>
      </div>

      <div className={styles.devis} >
        <div className={styles.factureDiv}>
          <Facturation />
        </div>

        <div className={styles.resumeDiv}>
          <ResumeFacture />
        </div>
      </div>
    </>

  )
};

export default ProtectedRouteAgent(NouveauDevis);