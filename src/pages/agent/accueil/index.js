import NavBarComp from "@/components/NavbarAgent";
import SideNavBar from "@/components/SideBarNavAgent";
import ProtectedRouteAgent from "@/components/ProtectedRouteAgent";
import { Container } from "react-bootstrap";
import { useMyContext } from "@/context/Mycontext";
import { Card } from "react-bootstrap";
import styles from "@/styles/Accueil.module.css";
import { useEffect, useState } from "react";
import axios from "axios";
import { getCookie } from "@/libs/clientCookie";

const Accueil = () => {


 const [listeAgents, setListeAgents] = useState([]);
 const [listeClients, setListeClients] = useState([]);
 const [listeDevis, setListeDevis] = useState([]);
 const [listeFactures, setListeFactures] = useState([]);
 const [listeEvacuations, setListeEvacuations] = useState([]);
 const [listeDechecheteries, setListeDecheteries] = useState([]);
 const [listeControles, setListeControles] = useState([]);
 const [listeMatieres, setListeMatieres] = useState([]);
 const [factureData, setFactureData] = useState(null);
 const [cartProduct, setCartProduct] = useState([]);


 useEffect(() => {

  axios.get("/api/administrateur/agent")
   .then(response => {
    if (response.data.success) {
     setListeAgents(response.data.agents);
    }
   })
   .catch(e => {
    console.log(e)
   });

  axios.get("/api/administrateur/decheteries")
   .then(response => {
    if (response.data.success) {
     setListeDecheteries(response.data.decheteries);
    }
   })
   .catch(e => {
    console.log(e)
   })

  axios.get("/api/administrateur/clients")
   .then(response => {
    if (response.data.success) {
     setListeClients(response.data.clients);
    }
   })
   .catch(e => {
    console.log(e)
   })

  const userData = getCookie("agent");

  if (userData) {

   const data = JSON.parse(userData);

   axios.get("/api/administrateur/enregistrer-controle")
    .then(response => {
     if (response.data.success) {

      const filteredData = response.data.controles.filter(item => item.agent.value === data.id);
      const sortedControles = filteredData.sort((a, b) => b.numero - a.numero);
      setListeControles(sortedControles)
     }
    })
    .catch(e => {
     console.log(e)
    })

   axios.get("/api/administrateur/evacuations")
    .then(response => {
     const filteredData = response.data.evacuations.filter(item => item.agentID === data.id);

     setListeEvacuations(filteredData)
    })
    .catch(e => console.log(e))

   axios.get("/api/administrateur/devis")
    .then(response => {
     if (response.data.success) {

      const filteredData = response.data.devis.filter(item => item.agentID === data.id);

      const sortedDevis = filteredData.sort((a, b) => b.numero - a.numero);
      setListeDevis(sortedDevis);
     }
    })
    .catch(e => console.log(e))



  }




 }, []);



 return (
  <>
   <NavBarComp title="OPTIM'OM - Tableau de bord" />
   <div className="page-content">
    <SideNavBar />
    <Container>
     <div className={styles.cardBox}>
      <Card className={styles.cardComp} bg="primary" text="white">
       <Card.Header>Contrôle d'accès</Card.Header>
       <Card.Body>
        <h1>{listeControles.length > 0 ? listeControles.length : 0}</h1>
       </Card.Body>
      </Card>

      <Card className={styles.cardComp} bg="warning" text="white">
       <Card.Header>Evacuations</Card.Header>
       <Card.Body>
        <h1>{listeEvacuations.length > 0 ? listeEvacuations.length : 0}</h1>
       </Card.Body>
      </Card>

      <Card className={styles.cardComp} bg="info" text="white">
       <Card.Header>Dépot</Card.Header>
       <Card.Body>
        <h1>{listeDevis.length > 0 ? listeDevis.length : 0}</h1>
       </Card.Body>
      </Card>
     </div>
    </Container>
   </div>
  </>
 )
};

export default ProtectedRouteAgent(Accueil);