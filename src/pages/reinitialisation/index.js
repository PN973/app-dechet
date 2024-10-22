import axios from "axios";
import { useState, useRef } from "react";
import Head from "next/head";
import styles from "@/styles/Home.module.css";
import { Container, Form, Button, Spinner, Toast, ToastContainer } from "react-bootstrap";


const Reinitialisation = () => {
 const formRef = useRef(null);
 const [identifiant, setIdentifiant] = useState("");
 const [loading, setLoading] = useState(false);
 const [errorMsg, setErrorMsg] = useState(null);
 const [show, setShow] = useState("");

 const handleReinitialisation = async (e) => {
  e.preventDefault();
  setLoading(true);
  axios.post("/api/agent/reinitialisation", { identifiant })
   .then(response => {
    setLoading(false);

    if (response.data.success) {
     setShow(true);
     formRef.current.reset();
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


 return (
  <>
   <Head>
    <title>Optim'om</title>
    <meta name="description" content="" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <link rel="icon" href="/favicon.ico" />
   </Head>
   <main>
    <Container className={styles.container}>
     <ToastContainer position="top-center">
      <Toast bg="success" onClose={() => setShow(false)} show={show} delay={5000} autohide>
       <Toast.Header closeButton>
        <strong className="me-auto" >E-mail envoyé</strong>
       </Toast.Header>
       <Toast.Body style={{ color: "white" }}>Un email contenant votre nouveau mot de passe vous a été envoyé.</Toast.Body>
      </Toast>
     </ToastContainer>
     <div>
      OPTIM'OM
     </div>
     <h1>Connexion</h1>

     <Form ref={formRef} onSubmit={handleReinitialisation} style={{ width: 300 }}>

      <Form.Group className="form-control" controlId="formBasicEmail" style={{ marginTop: 15 }}>
       <Form.Label>Identifiant *</Form.Label>
       <Form.Control onInput={(e) => setIdentifiant(e.target.value)} type="email" placeholder="Votre email" />
      </Form.Group>

      <div className={styles.centeredButton}>
       <p className="error-display">{errorMsg && errorMsg}</p>
       {
        loading ?
         <Spinner animation="border" variant="primary" style={{ marginTop: 15 }} />
         :
         <Button onClick={handleReinitialisation} variant="primary" type="submit" style={{ marginTop: 15 }}>Réinitialiser le mot de passe</Button>

       }
      </div>


     </Form>
    </Container>
   </main>
  </>
 )
};

export default Reinitialisation