import ProtectedRoute from "@/components/ProtectedRoute";
import { useRouter } from "next/router";
import { Spinner, Card, ListGroup, Breadcrumb, Container, Button, Table, Form, Row, Col, Offcanvas } from "react-bootstrap";
import styles from "@/styles/EvacuationsDetails.module.css";
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

  const evacuationID = router.query.slug;

  const [evacuationData, setEvacuationData] = useState(null);
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
  const [showRecapitulatif, setShowRecapitulatif] = useState(false);

  useEffect(() => {
    axios.get("/api/administrateur/evacuations")
      .then(async (response) => {
        const data = await response.data.evacuations.find(elt => elt.id === evacuationID);
        setEvacuationData(data);
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



  }, []);

  const handlePrint = useReactToPrint({
    content: () => printRef.current,
  });



  if (!evacuationData) return (
    <div className={styles.loaderComp}>
      <Spinner variant='primary'></Spinner>
    </div>
  );


  const decheterieData = listeDechecheteries.find(elt => elt.id === evacuationData.decheterieID);


  return (
    <Container>
      <Breadcrumb>
        <Breadcrumb.Item href="/dashboard/accueil">Accueil</Breadcrumb.Item>
        <Breadcrumb.Item href="/dashboard/evacuations">Evacuations</Breadcrumb.Item>
        <Breadcrumb.Item active>Accueil</Breadcrumb.Item>
      </Breadcrumb>
      <div className={styles.btnList}>
        <Button variant="primary" onClick={handlePrint}>Imprimer</Button>
        <Button variant="info" onClick={() => setShowObservations(true)}>Observations</Button>
        <Button variant="warning" onClick={() => setsShowImgTicket(true)}>Ticket</Button>
       {/* <Button variant="secondary" onClick={() => setShowRecapitulatif(true)}>Récapitulatif</Button>*/}
      </div>

      <Offcanvas show={showObservations} onHide={() => setShowObservations(false)}>
        <Offcanvas.Header closeButton>
          <Offcanvas.Title>Observations</Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body>
          {evacuationData && evacuationData.observations ? evacuationData.observations : "Aucune observation"}
        </Offcanvas.Body>
      </Offcanvas>

      <Offcanvas show={showImgTicket} onHide={() => setsShowImgTicket(false)}>
        <Offcanvas.Header closeButton>
          <Offcanvas.Title>Images ticket</Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body>
          {
            evacuationData && evacuationData.listeImagesObservations && evacuationData.listeImagesObservations.length > 0 ? (

              evacuationData.listeImagesObservations.map((res) => {
                return (
                  <img
                    className={styles.darkImage}
                    width={160}
                    height={240}
                    key={res}
                    src={res}
                  />
                )
              })

            ) : (
              "Aucune images"
            )
          }
        </Offcanvas.Body>
      </Offcanvas>

      {/*<Offcanvas show={showRecapitulatif} onHide={() => setShowRecapitulatif(false)}>
        <Offcanvas.Header closeButton>
          <Offcanvas.Title>Image récapitulatif</Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body>
          {evacuationData && evacuationData.imageRecapitulatif ?
            <img
              className={styles.darkImage}
              width={160}
              height={240}
              src={evacuationData.imageRecapitulatif}
            />
            :
            "Aucune image"}
        </Offcanvas.Body>
      </Offcanvas>
*/}
      <div className={styles.Evacuation} ref={printRef}>
        <div className={styles.header}>
          <Image
            width={187}
            height={60}
            src={Logo}
          />
          <h6 className={styles.titleBordered}>
            BON DE TRANSFERT <br />EVACUATION
          </h6>
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
              <td style={{ border: "1px solid black" }}>Date du transfert</td>
              <td style={{ border: "1px solid black" }}>{evacuationData && format(new Date(evacuationData.date), ("dd-MM-yyyy"))}</td>
            </tr>
            <tr>
              <td style={{ border: "1px solid black" }}>Immatriculation véhicule</td>
              <td style={{ border: "1px solid black" }}>{evacuationData && evacuationData.immatriculation}</td>
            </tr>
            <tr>
              <td style={{ border: "1px solid black" }}>Nom du chauffeur</td>
              <td style={{ border: "1px solid black" }}>{evacuationData && evacuationData.nomChauffeur}</td>
            </tr>
            <tr>
              <td style={{ border: "1px solid black" }}>Numéro benne évacuée</td>
              <td style={{ border: "1px solid black" }}>{evacuationData && evacuationData.numBenne}</td>
            </tr>
            <tr>
              <td style={{ border: "1px solid black" }}>Heure départ Déchèterie</td>
              <td style={{ border: "1px solid black" }}>{evacuationData && evacuationData.heureEvacuation}</td>
            </tr>
            <tr>
              <td style={{ border: "1px solid black" }}>Date et Heure retour Déchèterie</td>
              <td style={{ border: "1px solid black" }}>{evacuationData && evacuationData.heureEvacuationRetour ? format(new Date(evacuationData.date), ("dd-MM-yyyy")) + " à " + evacuationData.heureEvacuationRetour : "Non confirmé"}</td>
            </tr>
          </tbody>
        </Table>
        <h6 style={{ fontWeight: "bold" }}>Flux :</h6>
        <ListGroup horizontal={true} bordered={false}>
          {
            evacuationData && evacuationData.matieresEvacuees.length > 0 ?
              evacuationData.matieresEvacuees.map((res, index) => {
                return (

                  <ListGroup.Item key={res.id} style={{ margin: "5px 0", border: "1px solid black" }}>{res.nom}</ListGroup.Item>

                )
              })
              :
              null
          }
        </ListGroup>




        <Table size="sm" bordered style={{ margin: "5px 0" }}>
          <tbody>
            {/*<tr>
              <td style={{ border: "1px solid black" }}>Pesée exutoire :</td>
              <td style={{ border: "1px solid black" }}>
                {
                  evacuationData && evacuationData.peseeExutoire === "true" ?
                    <div className={styles.customCheck}>
                      <CheckSquare size={20} />
                      <h6>Oui</h6>
                    </div>
                    :
                    <div className={styles.customCheck}>
                      <XSquare size={20} />
                      <h6>Non</h6>
                    </div>
                }

              </td>
              <td style={{ border: "1px solid black" }}>
                {
                  evacuationData && evacuationData.peseeExutoire !== "true" ?
                    <div className={styles.customCheck}>
                      <CheckSquare size={20} />
                      <h6>Oui</h6>
                    </div>
                    :
                    <div className={styles.customCheck}>
                      <XSquare size={20} />
                      <h6>Non</h6>
                    </div>
                }

              </td>
            </tr>*/}


            {/*<tr>
              <td style={{ border: "1px solid black" }}>Pesée :</td>
              <td style={{ border: "1px solid black" }}>
                {
                  evacuationData && evacuationData.typePesee === "Badge" ?
                    <div className={styles.customCheck}>
                      <CheckSquare size={20} />
                      <h6>Oui</h6>
                    </div>
                    :
                    <div className={styles.customCheck}>
                      <XSquare size={20} />
                      <h6>Non</h6>
                    </div>
                }

              </td>
              <td style={{ border: "1px solid black" }}>
                {
                  evacuationData && evacuationData.typePesee !== "Badge" ?
                    <div className={styles.customCheck}>
                      <CheckSquare size={20} />
                      <h6>Oui</h6>
                    </div>
                    :
                    <div className={styles.customCheck}>
                      <XSquare size={20} />
                      <h6>Non</h6>
                    </div>
                }

              </td>
            </tr>*/}
            <tr>
              <td style={{ border: "1px solid black" }}>Pesée 1 (en entrée) :</td>
              <td style={{ border: "1px solid black" }}>
                {evacuationData && evacuationData.peseeEnEntree}
              </td>
              <td style={{ border: "1px solid black" }}>
                Tonnes
              </td>
            </tr>
            <tr>
              <td style={{ border: "1px solid black" }}>Pesée 2 (en sortie) :</td>
              <td style={{ border: "1px solid black" }}>
                {evacuationData && evacuationData.peseeEnSortie}
              </td>
              <td style={{ border: "1px solid black" }}>
                Tonnes
              </td>
            </tr>
            <tr>
              <td style={{ border: "1px solid black" }}>Pesée Net :</td>
              <td style={{ border: "1px solid black" }}>
                {evacuationData && evacuationData.peseeNet}
              </td>
              <td style={{ border: "1px solid black" }}>
                Tonnes
              </td>
            </tr>
          </tbody>
        </Table>

        {/*<Row>
          <Col>
            <Card>
              <Card.Header>Observations</Card.Header>
              <Card.Body>
                {evacuationData && evacuationData.observations}
              </Card.Body>
            </Card>
          </Col>

        </Row>*/}

        <Row style={{ marginTop: 10 }}>
          <Col>
            <Card>
              <Card.Header>Signature OPTIM'OM</Card.Header>
              <Card.Body style={{ height: 90, display: "flex", justifyContent: "center" }}>
                {
                  evacuationData && evacuationData.signatureOptimom ? (
                    <img src={evacuationData.signatureOptimom}
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
                  evacuationData && evacuationData.signatureExutoire ? (
                    <img src={evacuationData.signatureExutoire}
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
    </Container >
  )
};

export default ProtectedRoute(Details);