import NavBarComp from "@/components/Navbar";
import SideNavBar from "@/components/SideNavBar";
import ProtectedRouteAgent from "@/components/ProtectedRoute";
import { Container, Button, Breadcrumb, Form, InputGroup, Spinner, Toast, ToastContainer, Modal } from "react-bootstrap";
import { useState, useRef, useEffect } from "react";
import { EyeSlash, Eye } from "react-bootstrap-icons";
import styles from "@/styles/Agent.module.css";
import generateDefaultPassword from "@/libs/generatePassword";
import axios from "axios";
import { getCookie } from "@/libs/clientCookie";

const Parametres = () => {

 const formRef = useRef(null);

 const [loadingBtn, setLoadingBtn] = useState(false);
 const [errorMsg, setErrorMsg] = useState(null);
 const [formValidated, setFormValidated] = useState(false);
 const [openPass, setOpenPass] = useState(false);
 const [password, setPassword] = useState("");
 const [ancienPassword, setAncienPassword] = useState("");
 const [nom, setNom] = useState("");
 const [prenom, setPrenom] = useState("");
 const [telephone, setTelephone] = useState("");
 const [email, setEmail] = useState("");
 const [sendPass, setSendPass] = useState(false);
 const [agentData, setAgentData] = useState(null);
 const [showToast, setShowToast] = useState(false);


 useEffect(() => {
  const userData = getCookie("admin");

  if (userData) {

   const data = JSON.parse(userData);

   setNom(data.nom);
   setPrenom(data.prenom);
   setEmail(data.email);

  }
 }, []);


 const handleSubmit = async (event) => {
  event.preventDefault();
  const form = event.currentTarget;
  if (form.checkValidity() === false) {
   event.stopPropagation();
  } else {
   setLoadingBtn(true);
   setFormValidated(true);


   try {
    const response = await axios.post("/api/administrateur/parametres", {
     nom,
     prenom,
     email,
     password,
     ancienPassword,
     sendPass
    });
    setLoadingBtn(false);
    if (response.data.success) {
     setNom('');
     setPrenom('');
     setEmail('');
     setPassword('');
     setAncienPassword("");
     setFormValidated(false);
     setShowToast(true);
    } else {
     setErrorMsg(response.data.message);
     setTimeout(() => setErrorMsg(null), 5000);
    }
   } catch (e) {
    setLoadingBtn(false);
    setErrorMsg("Echec de connexion. Veuillez réessayer");
    setTimeout(() => setErrorMsg(null), 5000);
   }

  }
 };

 const generatePass = () => {
  const pass = generateDefaultPassword();
  setPassword(pass);
  setOpenPass(true);
 }

 return (
  <>
   <NavBarComp title="Paramètres du profil" />
   <div className="page-content">
    <SideNavBar />
    <Container>
     <ToastContainer
      className="p-3"
      position={"top-end"}
      style={{ zIndex: 1 }}
     >
      <Toast bg="success" onClose={() => setShowToast(false)} show={showToast} delay={3000} autohide>
       <Toast.Header closeButton={false} style={{ color: "black", fontWeight: "bold" }}>
        Succès
       </Toast.Header>
       <Toast.Body style={{ color: "white" }}>Modifier avec succès.</Toast.Body>
      </Toast>
     </ToastContainer>
     <Breadcrumb>
      <Breadcrumb.Item href="/dashboard/accueil">Accueil</Breadcrumb.Item>
      <Breadcrumb.Item active>Paramètres</Breadcrumb.Item>
     </Breadcrumb>

     <Form ref={formRef} noValidate validated={formValidated} onSubmit={handleSubmit}>

      <Form.Group className="mb-3" controlId="">
       <Form.Label>E-mail *</Form.Label>
       <Form.Control required value={email} onInput={e => setEmail(e.target.value)} type="email" placeholder="Adresse email" />
      </Form.Group>

      <Form.Group className="mb-3" controlId="">
       <Form.Label>Nom *</Form.Label>
       <Form.Control required value={nom} onInput={e => setNom(e.target.value)} type="text" placeholder="Nom de l'agent" />
      </Form.Group>

      <Form.Group className="mb-3" controlId="">
       <Form.Label>Prénom *</Form.Label>
       <Form.Control required value={prenom} onInput={e => setPrenom(e.target.value)} type="text" placeholder="Prénom de l'agent" />
      </Form.Group>

      <Form.Group className="mb-3" controlId="formBasicCheckbox">
       <Form.Check type="checkbox" onClick={() => setSendPass(!sendPass)} label="Changer de mot de passe" />
      </Form.Group>
      {
       sendPass &&
       <>
        <Form.Label>Ancien mot de passe *</Form.Label>
        <InputGroup className="mb-3">
         <Form.Control required={openPass ? true : false} onInput={e => setAncienPassword(e.target.value)} aria-label="Configuration mot de passe" type={openPass ? "text" : "password"} placeholder="Ancien mot de passe" value={ancienPassword} />
         <InputGroup.Text onClick={() => setOpenPass(!openPass)} >
          {openPass ? <Eye /> : <EyeSlash />}
         </InputGroup.Text>
        </InputGroup>
        <Form.Label>Nouveau mot de passe *</Form.Label>
        <InputGroup className="mb-3">
         <Form.Control required={openPass ? true : false} onInput={e => setPassword(e.target.value)} aria-label="Configuration mot de passe" type={openPass ? "text" : "password"} placeholder="Nouveau mot de passe" value={password} />
         <InputGroup.Text onClick={() => setOpenPass(!openPass)} >
          {openPass ? <Eye /> : <EyeSlash />}
         </InputGroup.Text>
        </InputGroup>

        <Button variant="secondary" type="button" onClick={generatePass}>
         Générer un mot de passe
        </Button>
       </>
      }

      <div className={styles.centeredButton}>
       <p className="error-display">{errorMsg && errorMsg}</p>
      </div>

      {
       loadingBtn ?
        <Spinner variant="success"></Spinner>
        :
        <Button variant="success" type="button" onClick={handleSubmit}>
         Enregistrer
        </Button>
      }


     </Form>

    </Container>
   </div>
  </>
 )
};

export default ProtectedRouteAgent(Parametres);