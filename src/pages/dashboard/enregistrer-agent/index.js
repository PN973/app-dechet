import NavBarComp from "@/components/Navbar";
import SideNavBar from "@/components/SideNavBar";
import ProtectedRoute from "@/components/ProtectedRoute";
import { Container, Row, Button, Breadcrumb, Form, Spinner, InputGroup, Modal } from "react-bootstrap";
import { useState } from "react";
import axios from "axios";
import generateDefaultPassword from "@/libs/generatePassword";
import { EyeSlash, Eye } from "react-bootstrap-icons";
import styles from "@/styles/Agent.module.css";



const EnrAgents = () => {

  const [openForm, setOpenForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [openPass, setOpenPass] = useState(false);
  const [password, setPassword] = useState("");
  const [nom, setNom] = useState("");
  const [prenom, setPrenom] = useState("");
  const [telephone, setTelephone] = useState("");
  const [email, setEmail] = useState("");
  const [sendPass, setSendPass] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const [show, setShow] = useState(false);

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);



  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    axios.post("/api/administrateur/agent", { nom, prenom, telephone, email, password, sendPass })
      .then(response => {

        setLoading(false);
        if (response.data.success) {
          setNom("");
          setPrenom("");
          setTelephone("");
          setEmail("");
          setPassword("");
          setSendPass(false);
          handleShow();
        } else {
          setErrorMsg(response.data.message);
          setTimeout(() => setErrorMsg(null), 5000);
        }

      })
      .catch(e => {
        setLoading(false);
        setErrorMsg("Echec de connexion. Veuillez réessayer");
        setTimeout(() => setErrorMsg(null), 5000);
      })
  };

  const generatePass = () => {
    const pass = generateDefaultPassword();
    setPassword(pass);
    setOpenPass(true);
  }


  return (
    <>
      <NavBarComp title="Gestions des agents" />
      <div className="page-content">
        <SideNavBar />
        <Container>
          <Breadcrumb>
            <Breadcrumb.Item href="/dashboard/accueil">Accueil</Breadcrumb.Item>
            <Breadcrumb.Item active>Enregistrer un nouveau agent</Breadcrumb.Item>
          </Breadcrumb>

          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3" controlId="">
              <Form.Label>Nom *</Form.Label>
              <Form.Control value={nom} onInput={e => setNom(e.target.value)} type="text" placeholder="Nom de l'agent" />
            </Form.Group>

            <Form.Group className="mb-3" controlId="">
              <Form.Label>Prénom *</Form.Label>
              <Form.Control value={prenom} onInput={e => setPrenom(e.target.value)} type="text" placeholder="Prénom de l'agent" />
            </Form.Group>

            <Form.Group className="mb-3" controlId="">
              <Form.Label>Téléphone *</Form.Label>
              <Form.Control value={telephone} onInput={e => setTelephone(e.target.value)} type="tel" placeholder="Téléphone de l'agent" />
            </Form.Group>

            <Form.Group className="mb-3" controlId="">
              <Form.Label>E-mail *</Form.Label>
              <Form.Control value={email} onInput={e => setEmail(e.target.value)} type="email" placeholder="Adresse email" />
            </Form.Group>

            <Form.Label>Mot de passe *</Form.Label>
            <InputGroup className="mb-3">
              <Form.Control onInput={e => setPassword(e.target.value)} aria-label="Configuration mot de passe" type={openPass ? "text" : "password"} placeholder="Mot de passe" value={password} />
              <InputGroup.Text onClick={() => setOpenPass(!openPass)} >
                {openPass ? <Eye /> : <EyeSlash />}
              </InputGroup.Text>
            </InputGroup>


            <Button variant="secondary" type="button" onClick={generatePass}>
              Générer un mot de passe
            </Button>

            <Form.Group className="mb-3" controlId="formBasicCheckbox">
              <Form.Check type="checkbox" onClick={() => setSendPass(!sendPass)} label="Envoyer le mot de passe par mail" />
            </Form.Group>

            <div className={styles.centeredButton}>
              <p className="error-display">{errorMsg && errorMsg}</p>
            </div>

            {
              loading ?
                <div className="loader-division">
                  <Spinner variant="success"></Spinner>
                </div>

                :
                <Row>
                  <Button variant="success" type="submit">
                    Valider
                  </Button>
                </Row>

            }

          </Form>

        </Container>
      </div>
      <Modal show={show} onHide={handleClose}>
        <Modal.Header >
          <Modal.Title>Succès</Modal.Title>
        </Modal.Header>
        <Modal.Body>Votre nouveau agent a été crée avec succès. Veuillez lui transmettre son identifiant (e-mail) et mot de passe pour accéder à son compte agent.</Modal.Body>
        <Modal.Footer>
          <Button variant="primary" onClick={handleClose}>
            Ok
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  )
};

export default ProtectedRoute(EnrAgents);