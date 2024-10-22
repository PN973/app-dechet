import ProtectedRoute from "@/components/ProtectedRouteAgent";
import { useRouter } from "next/router";
import { Spinner, Card, ListGroup, Breadcrumb, Container, Button, Table, Form, Row, Col, Offcanvas } from "react-bootstrap";
import styles from "@/styles/DepotDetails.module.css";
import { useEffect, useState, useRef } from "react";
import axios from "axios";
import Image from "next/image";
import Logo from "@/images/logo.png";
import Cacl from "@/images/cacl.png";
import { useReactToPrint } from "react-to-print";
import { CheckSquare, XSquare } from "react-bootstrap-icons";
import { format } from "date-fns";


const Details = () => {

  const router = useRouter();

  const printRef = useRef(null);

  const depotID = router.query.slug;

  const [depotData, setDepotData] = useState(null);
  const [listeEvacuations, setListeEvacuations] = useState([]);
  const [listeAgents, setListeAgents] = useState([]);
  const [listeClients, setListeClients] = useState([]);
  const [listeDevis, setListeDevis] = useState([]);
  const [listeFactures, setListeFactures] = useState([]);
  const [listeDechecheteries, setListeDecheteries] = useState([]);
  const [listeControles, setListeControles] = useState([]);
  const [listeMatieres, setListeMatieres] = useState([]);

  const [showImgTicket, setsShowImgTicket] = useState(false);
  const [showObservations, setShowObservations] = useState(false);

  useEffect(() => {
    axios.get("/api/administrateur/evacuations")
      .then(async (response) => {
        setListeEvacuations(response.data.evacuations);
      })
      .catch(e => console.log(e))

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
      .then(async (response) => {
        if (response.data.success) {
          const data = await response.data.devis.find(elt => elt.id === depotID);
          setDepotData(data);
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



  }, []);

  const handlePrint = useReactToPrint({
    content: () => printRef.current,
  });

  if (!depotData) return (
    <div className={styles.loaderComp}>
      <Spinner variant='primary'></Spinner>
    </div>
  );


  const decheterieData = listeDechecheteries.find(elt => elt.id === depotData.client.decheterieID);
  const listeDechets = depotData.produits;
  const totalVolume = listeDechets.reduce((total, dechet) => total + dechet.quantite, 0);




  return (
    <Container>
      <Breadcrumb>
        <Breadcrumb.Item href="/agent/accueil">Accueil</Breadcrumb.Item>
        <Breadcrumb.Item href="/agent/evacuations">Dépots Pro</Breadcrumb.Item>
        <Breadcrumb.Item active>Dépot n° 00{depotData.numero}</Breadcrumb.Item>
      </Breadcrumb>
      <div className={styles.btnList}>
        <Button variant="primary" onClick={handlePrint}>Imprimer</Button>
        <Button variant="info" onClick={() => setShowObservations(true)}>Observations</Button>
      </div>
      <Offcanvas show={showObservations} onHide={() => setShowObservations(false)}>
        <Offcanvas.Header closeButton>
          <Offcanvas.Title>Observations</Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body>
          {depotData && depotData.observations ? depotData.observations : "Aucune observation"}
        </Offcanvas.Body>
      </Offcanvas>
      <div className={styles.Depot} ref={printRef}>
        <div className={styles.header}>
          <Image
            width={187}
            height={60}
            src={Logo}
          />
          <h6 className={styles.titleBordered}>
            Fiche contrôle  <br />accès pro
          </h6>
          {/*<ListGroup style={{ border: "1px solid black" }} >
      <ListGroup.Item style={{ fontWeight: "bold", textAlign: "center" }}></ListGroup.Item>
     </ListGroup>*/}
          <Image
            width={187}
            height={60}
            src={Cacl}
          />
        </div>

        <h6 className={styles.titleBordered} style={{ width: "100%" }}>
          {decheterieData && decheterieData.nom}
        </h6>

        <Table size="sm" bordered={false} style={{ margin: "5px 0" }}>
          <tbody>
            <tr>
              <td style={{ border: "1px solid black" }}>Date et heure</td>
              <td style={{ border: "1px solid black" }}>{depotData && format(new Date(depotData.date), ("dd-MM-yyyy à HH:mm"))}</td>
            </tr>
            <tr>
              <td style={{ border: "1px solid black" }}>Nom de la société</td>
              <td style={{ border: "1px solid black" }}>{depotData && depotData.client.nomSociete}</td>
            </tr>
            <tr>
              <td style={{ border: "1px solid black" }}>Numéro de siret</td>
              <td style={{ border: "1px solid black" }}>{depotData && depotData.client.numSiret}</td>
            </tr>
            <tr>
              <td style={{ border: "1px solid black" }}>Nom apporteur</td>
              <td style={{ border: "1px solid black" }}>{depotData && depotData.client.nom + " " + depotData.client.prenom}</td>
            </tr>
            <tr>
              <td style={{ border: "1px solid black" }}>Adresse</td>
              <td style={{ border: "1px solid black" }}>{depotData && depotData.client.adresse}</td>
            </tr>
            <tr>
              <td style={{ border: "1px solid black" }}>Ville</td>
              <td style={{ border: "1px solid black" }}>{depotData && depotData.client.ville}</td>
            </tr>
            <tr>
              <td style={{ border: "1px solid black" }}>Code postal</td>
              <td style={{ border: "1px solid black" }}>{depotData && depotData.client.codePostal}</td>
            </tr>
            <tr>
              <td style={{ border: "1px solid black" }}>Courriel</td>
              <td style={{ border: "1px solid black" }}>{depotData && depotData.client.email}</td>
            </tr>
            <tr>
              <td style={{ border: "1px solid black" }}>Numéro de téléphone</td>
              <td style={{ border: "1px solid black" }}>{depotData && depotData.client.telephone}</td>
            </tr>
            <tr>
              <td style={{ border: "1px solid black" }}>Immatriculation du véhicule</td>
              <td style={{ border: "1px solid black" }}>{depotData && depotData.client.immatriculation ? depotData.client.immatriculation : "....................."}</td>
            </tr>
          </tbody>
        </Table>

        <table className={styles.table}>
          <thead>
            <tr>
              <th>Désignation</th>
              <th>Quantité</th>
              <th>Unité de mesure</th>
              <th>Prix unitaire</th>
            </tr>
          </thead>
          <tbody>
            {
              depotData ?
                depotData.produits.map((res, index) => {
                  return (
                    <tr>
                      <td>{res.produit.nom} </td>
                      <td>{res.quantite.toFixed(2)}</td>
                      <td>{res.quantite.toFixed(2) + " " + res.produit.unite}</td>
                      <td>{res.produit.prix} €</td>
                    </tr>
                  )
                })
                :
                null
            }

          </tbody>
        </table>
        <div className={styles.total}>
          <table className={styles.tableTotal}>
            <tr>
              <td style={{ background: "#f5f5f5", fontWeight: "bold" }} >Volume Total</td>
              <td>{totalVolume} m3</td>
            </tr>
          </table>
        </div>
        <div>
          <p>Observations:</p>
          <p>
            {depotData && depotData.observations ? depotData.observations : "Aucune observation"}
          </p>
        </div>
        <Row style={{ marginTop: 10 }}>
          <Col>
            <Card>
              <Card.Header>Signature OPTIM'OM</Card.Header>
              <Card.Body style={{ height: 90, display: "flex", justifyContent: "center" }}>
                {
                  depotData && depotData.signatureOptimom ? (
                    <img
                      src={depotData.signatureOptimom}
                      className={styles.darkImage}
                    />

                  ) : (
                    "Non signé"
                  )
                }
              </Card.Body>
            </Card>
          </Col>
          <Col>
            <Card>
              <Card.Header>Signature EXUTOIRE</Card.Header>
              <Card.Body style={{ height: 90, display: "flex", justifyContent: "center" }}>
                {
                  depotData && depotData.signatureExutoire ? (
                    <img
                      src={depotData.signatureExutoire}
                      className={styles.darkImage}
                    />
                  ) : (
                    "Non signé"
                  )
                }
              </Card.Body>
            </Card>

          </Col>
        </Row>
        <div className={styles.footer}>
          <p>SAS OPTIM'OM</p>
          <p>Exploitant de la déchèterie de CAYENNE</p>
          <p>Gsm : 0694 44 69 59 - 0694 48 61 00</p>
          <p style={{ gap: 10 }}>
            <span>ddc@optimom973.com</span>
            <span>contact@optimom973.com</span>
          </p>
        </div>
      </div>
    </Container>
  )
};

export default ProtectedRoute(Details);