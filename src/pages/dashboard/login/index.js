import { useState } from "react";
import Head from "next/head";
import { Inter } from "next/font/google";
import styles from "@/styles/Home.module.css";
import { Container, Form, Button, Spinner } from "react-bootstrap";
import axios from "axios";
import { useRouter } from "next/router";
import { setCookie } from "@/libs/clientCookie";


export default function LoginAdmin() {

  const router = useRouter();

  const [identifiant, setIdentifiant] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    axios.post("/api/administrateur/connexion-administrateur", { identifiant, password })
      .then(async (response) => {
        setLoading(false);

        if (response.data.success) {
          setCookie("admin", JSON.stringify(response.data.admin), 7);
          router.push("/dashboard/accueil");
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

  }
  return (
    <>
      <Head>
        <title>Progiciel</title>
        <meta name="description" content="" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main>
        <Container className={styles.container}>
          <div>
            OPTIM'OM
          </div>
          <h1>Administrateur</h1>
          <Form onSubmit={handleLogin} style={{ width: 300 }}>

            <Form.Group className="form-control" controlId="formBasicEmail" style={{ marginTop: 15 }}>
              <Form.Label>Identifiant *</Form.Label>
              <Form.Control onInput={(e) => setIdentifiant(e.target.value)} type="email" placeholder="Identifiant" />
            </Form.Group>

            <Form.Group className="form-control" controlId="formBasicPassword" style={{ marginTop: 15 }}>
              <Form.Label>Mot de passe *</Form.Label>
              <Form.Control onInput={(e) => setPassword(e.target.value)} type="password" placeholder="Mot de passe" />
            </Form.Group>

            <div className={styles.centeredButton}>
              <p className="error-display">{errorMsg && errorMsg}</p>
              {
                loading ?
                  <Spinner animation="border" variant="primary" style={{ marginTop: 15 }} />
                  :
                  <Button variant="primary" type="submit" style={{ marginTop: 15 }}>
                    Se connecter
                  </Button>
              }
            </div>


          </Form>
        </Container>
      </main>

    </>
  );
}
