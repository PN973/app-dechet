import ProtectedRoute from "@/components/ProtectedRoute";
import { useRouter } from "next/router";
import { Button, InputGroup, Form, Spinner, Toast, ToastContainer, Modal } from "react-bootstrap";
import { useState, useRef, useEffect } from "react";
import axios from "axios";
import styles from "@/styles/Agent.module.css";
import { EyeSlash, Eye } from "react-bootstrap-icons";

const Profil = () => {

  const router = useRouter();

  const formRef = useRef(null);


  const [agentData, setAgentData] = useState(null);
  const [decheterieData, setDecheterieData] = useState(null);

  const [openClientModal, setOpenClientModal] = useState(true);
  const [formValidated, setFormValidated] = useState(false);
  const [listeAgent, setListeAgent] = useState([]);
  const [listeDechecheteries, setListeDecheteries] = useState([]);

  const [loadingBtn, setLoadingBtn] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  const [showToast, setShowToast] = useState(false);
  const [loadingData, setLoadingData] = useState(true);

  const [nom, setNom] = useState("");
  const [prenom, setPrenom] = useState("");
  const [telephone, setTelephone] = useState("");
  const [decheterie, setDecheterie] = useState("");

  useEffect(() => {
    axios.get("/api/administrateur/agent")
      .then(response => {
        if (response.data.success) {
          setListeAgent(response.data.agents);
        }
      })
      .catch(e => {
        console.log(e)
      });

    axios.get("/api/administrateur/decheteries")
      .then(response => {
        if (response.data.success) {

          const valideDecheteries = response.data.decheteries.filter(elt => elt.etat === "valide");
          setListeDecheteries(valideDecheteries);
        }
      })
      .catch(e => {
        console.log(e)
      })


  }, []);

  useEffect(() => {

    const agentParams = listeAgent.find(elt => elt.id === router.query.profil);


    if (agentParams) {

      const decheterieParams = listeDechecheteries.find(elt => elt.id === agentParams.decheterieID);
      setAgentData(agentParams);
      setDecheterieData(decheterieParams);
      setNom(agentParams.nom);
      setPrenom(agentParams.prenom);
      setTelephone(agentParams.telephone);
      setDecheterie(agentParams.decheterieID);
      setLoadingData(false);
    };


  }, [listeAgent, listeDechecheteries])

  const handleSubmit = async (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    if (form.checkValidity() === false) {
      event.stopPropagation();
    } else {
      setLoadingBtn(true);
      setFormValidated(true);
      axios.post("/api/administrateur/modifier-agent", {
        agentID: router.query.profil,
        nom,
        prenom,
        telephone,
        decheterie,
      })
        .then(response => {

          setLoadingBtn(false);
          if (response.data.success) {
            setShowToast(true);
            router.push("/dashboard/agents")

          } else {
            setErrorMsg(response.data.message);
            setTimeout(() => setErrorMsg(null), 5000);
          }
        })
        .catch(e => console.log(e))

    }
  };

  return (
    <>

      <ToastContainer
        className="p-3"
        position={"top-end"}
        style={{ zIndex: 1 }}
      >
        <Toast bg="success" onClose={() => setShowToast(false)} show={showToast} delay={5000} autohide>
          <Toast.Header closeButton={false} style={{ color: "black", fontWeight: "bold" }}>
            Succès
          </Toast.Header>
          <Toast.Body style={{ color: "white" }}>Agent modifié avec succès.</Toast.Body>
        </Toast>
      </ToastContainer>
      <Modal show={openClientModal} onHide={() => router.push("/dashboard/agents")} fullscreen>
        <Modal.Header closeButton>
          <Modal.Title>{agentData ? "Modifier le compte de l'agent " + agentData.nom + " " + agentData.prenom : ""}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {
            loadingData ?
              <div className="loader-division" style={{ marginTop: 20 }}>
                <Spinner variant="secondary"></Spinner>
              </div>
              :


              <Form ref={formRef} noValidate validated={formValidated} onSubmit={handleSubmit}>

                <Form.Group className="mb-3" controlId="">
                  <Form.Label>E-mail *</Form.Label>
                  <Form.Control disabled required defaultValue={agentData.email} onInput={e => setEmail(e.target.value)} type="email" placeholder="Adresse email" />
                </Form.Group>

                <Form.Group className="mb-3" controlId="">
                  <Form.Label>Sélectionner une décheterie *</Form.Label>
                  <Form.Select onChange={e => setDecheterie(e.target.value)} aria-label="Default decheterie" disabled>
                    <option value={decheterieData ? decheterieData.id : ""}>{decheterieData ? decheterieData.nom : "Sélectionner une déchèterie"}</option>
                    {
                      listeDechecheteries.length > 0 && listeDechecheteries.map((res, index) => {
                        return (
                          <option key={res.id} value={res.id}>{res.nom}</option>
                        )
                      })
                    }
                  </Form.Select>
                </Form.Group>

                <Form.Group className="mb-3" controlId="">
                  <Form.Label>Nom *</Form.Label>
                  <Form.Control required defaultValue={agentData.nom} onInput={e => setNom(e.target.value)} type="text" placeholder="Nom de l'agent" />
                </Form.Group>

                <Form.Group className="mb-3" controlId="">
                  <Form.Label>Prénom *</Form.Label>
                  <Form.Control required defaultValue={agentData.prenom} onInput={e => setPrenom(e.target.value)} type="text" placeholder="Prénom de l'agent" />
                </Form.Group>

                {/*<Form.Group className="mb-3" controlId="">
                  <Form.Label>Téléphone *</Form.Label>
                  <Form.Control required defaultValue={agentData.telephone} onInput={e => setTelephone(e.target.value)} type="tel" placeholder="Téléphone de l'agent" />
                </Form.Group>*/}


                <div className={styles.centeredButton}>
                  <p className="error-display">{errorMsg && errorMsg}</p>
                </div>

              </Form>

          }



        </Modal.Body>
        <Modal.Footer>

          <Button variant="secondary" onClick={() => router.push("/dashboard/agents")}>
            Annuler
          </Button>
          {
            loadingBtn ?
              <Spinner variant="success"></Spinner>
              :
              <Button variant="success" type="button" onClick={handleSubmit}>
                Modifier
              </Button>
          }

        </Modal.Footer>
      </Modal>
    </>
  )
};

export default ProtectedRoute(Profil);