import NavBarComp from "@/components/Navbar";
import SideNavBar from "@/components/SideNavBar";
import ProtectedRoute from "@/components/ProtectedRoute";
import { Container } from "react-bootstrap";
import { useEffect, useState } from "react";
import axios from "axios";
import { Card } from "react-bootstrap";
import styles from "@/styles/Accueil.module.css";

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

  axios.get("/api/administrateur/enregistrer-controle")
   .then(response => {
    if (response.data.success) {
     setListeControles(response.data.controles)
    }
   })
   .catch(e => {
    console.log(e)
   })

  axios.get("/api/administrateur/decheteries")
   .then(response => {
    if (response.data.success) {
     setListeDecheteries(response.data.decheteries);
    }
   })
   .catch(e => {
    console.log(e)
   })

  axios.get("/api/administrateur/devis")
   .then(response => {
    if (response.data.success) {
     setListeDevis(response.data.devis);
    }
   })
   .catch(e => console.log(e))

  axios.get("/api/administrateur/matiere")
   .then(response => {
    if (response.data.success) {
     setListeMatieres(response.data.matieres);
    }
   })
   .catch(e => {
    console.log(e)
   })


  axios.get("/api/administrateur/evacuations")
   .then(response => {
    setListeEvacuations(response.data.evacuations)
   })
   .catch(e => console.log(e))

  axios.get("/api/administrateur/invoice")
   .then(response => {
    if (response.data.success) {
     setListeFactures(response.data.factures);
     /*
     const facture = response.data.factures.find(elt => elt.id === router.query.invoice);
     let array = [];
     facture.data.forEach(element => {
      const products = element.produits;
      products.forEach(elt => {
       const obj = { dateEmission: element.date, data: elt }
       array.push(obj)
      })

     });

     setFactureData(facture);
     setCartProduct(array);
     */
    }
   })
   .catch(e => console.log(e))


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

export default ProtectedRoute(Accueil);