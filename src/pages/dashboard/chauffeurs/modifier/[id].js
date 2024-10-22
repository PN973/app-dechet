import ProtectedRoute from "@/components/ProtectedRoute";
import { useRouter } from "next/router";
import { Container, Button, Modal, ToastContainer, Toast, Breadcrumb, Form, Spinner } from "react-bootstrap";
import { useState, useEffect, useRef } from "react";
import axios from "axios";

const Modifier = () => {

  const router = useRouter();

  const formRef = useRef(null);

  const [openModal, setOpenModal] = useState(true);
  const [formValidated, setFormValidated] = useState(false);
  const [loadingBtn, setLoadingBtn] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const [listeDechecheteries, setListeDecheteries] = useState([]);
  const [listeChauffeurs, setListeChauffeurs] = useState([]);
  const [decheterie, setDecheterie] = useState("");
  const [nom, setNom] = useState("");
  const [prenom, setPrenom] = useState("");
  const [email, setEmail] = useState("");
  const [successMsg, setSuccessMsg] = useState(null);

  useEffect(() => {


    axios.get("/api/administrateur/chauffeurs")
      .then(response => {
        if (response.data.success) {

          setListeChauffeurs(response.data.chauffeurs);
          const chauffeurData = response.data.chauffeurs.find(elt => elt.id === router.query.id);
          setEmail(chauffeurData.email);
          setNom(chauffeurData.nom);
          setPrenom(chauffeurData.prenom);

          if (chauffeurData) {

            axios.get("/api/administrateur/decheteries")
              .then(response => {
                if (response.data.success) {

                  const valideDecheteries = response.data.decheteries.filter(elt => elt.etat === "valide");
                  setListeDecheteries(valideDecheteries);

                  const decheterieData = response.data.decheteries.find(elt => elt.id === chauffeurData.decheterieID);
                  setDecheterie(decheterieData.nom);

                }
              })
              .catch(e => {
                console.log(e)
              })


          }

        }
      })
      .catch(e => {
        console.log(e)
      })
  }, [router.query.id]);

  const handleClose = () => {
    setOpenModal(false);
  };

  const handleSubmit = (event) => {

    event.preventDefault();
    const form = event.currentTarget;
    if (form.checkValidity() === false) {
      event.stopPropagation();
    } else {
      setFormValidated(true);
      setLoadingBtn(true);
      axios.put("/api/administrateur/chauffeurs", { chauffeurID: router.query.id, nom, prenom })
        .then(response => {
          setFormValidated(false);
          setLoadingBtn(false);

          if (response.data.success) {
            setNom(response.data.chauffeur.nom);
            setPrenom(response.data.chauffeur.prenom);
            setSuccessMsg("Modifier avec succès");
            setTimeout(() => setSuccessMsg(null), 5000);

          } else {
            setErrorMsg(response.data.message);
            setTimeout(() => setErrorMsg(null), 5000);
          }
        })
        .catch(e => {
          setFormValidated(false);
          setLoadingBtn(false);
          setErrorMsg("Echec de connexion. Veuillez réessayer");
          setTimeout(() => setErrorMsg(null), 5000);
        })
    }
  }





  return (
    <>
      <Modal show={openModal} fullscreen>
        <Modal.Header >
          <Modal.Title>Modifier le chauffeur {nom && prenom ? nom + " " + prenom : ""}</Modal.Title>
        </Modal.Header>
        <Modal.Body>

          <Form ref={formRef} noValidate validated={formValidated}>

            <Form.Group className="mb-3" controlId="">
              <Form.Label>Sélectionner une décheterie *</Form.Label>
              <Form.Select disabled aria-label="Default decheterie" >
                <option value="">{decheterie}</option>
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3" controlId="">
              <Form.Label>E-mail *</Form.Label>
              <Form.Control defaultValue={email} disabled type="email" placeholder="E-mail du chauffeur" />
            </Form.Group>

            <Form.Group className="mb-3" controlId="">
              <Form.Label>Nom *</Form.Label>
              <Form.Control defaultValue={nom} onInput={e => setNom(e.target.value)} type="text" placeholder="Nom du chauffeur" required />
            </Form.Group>

            <Form.Group className="mb-3" controlId="">
              <Form.Label>Prénom *</Form.Label>
              <Form.Control defaultValue={prenom} onInput={e => setPrenom(e.target.value)} type="text" placeholder="Prénom du chauffeur" required />
            </Form.Group>


          </Form>

          <p className="error-display" style={{ color: "green" }}>{successMsg && successMsg}</p>

          <p className="error-display">{errorMsg && errorMsg}</p>

        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            Annuler
          </Button>
          {
            loadingBtn ?
              <Spinner variant="primary"></Spinner>
              :
              <Button variant="primary" onClick={handleSubmit}>
                Enregistrer
              </Button>
          }

        </Modal.Footer>
      </Modal>

    </>
  )
}

export default ProtectedRoute(Modifier);
