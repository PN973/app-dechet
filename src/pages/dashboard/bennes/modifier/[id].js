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
 const [listeBennes, setListeBennes] = useState([]);
 const [successMsg, setSuccessMsg] = useState(null);
 const [immatSelected, setImmatSelected] = useState("");
 const [numeroBenne, setNumeroBenne] = useState("");
 const [decheterie, setDecheterie] = useState("");

 function formatInput(value) {
  // Enlever tous les caractères non alphanumériques
  const cleanedValue = value.replace(/[^a-zA-Z0-9]/g, '');

  // Extraire les différentes parties
  const part1 = cleanedValue.slice(0, 2).toUpperCase();
  const part2 = cleanedValue.slice(2, 5);
  const part3 = cleanedValue.slice(5, 7).toUpperCase();

  // Combiner les parties avec le format désiré
  const formattedValue = `${part1}-${part2}-${part3}`;

  return formattedValue;
 }

 const handleInputChangeImmat = (event) => {
  const value = event.target.value;
  const formatted = formatInput(value);
  setImmatSelected(formatted);
 };

 useEffect(() => {


  axios.get("/api/administrateur/bennes")
   .then(response => {
    if (response.data.success) {

     setListeBennes(response.data.bennes);
     const benneData = response.data.bennes.find(elt => elt.id === router.query.id);
     setImmatSelected(benneData.immatriculation);
     setNumeroBenne(benneData.numBenne);


     if (benneData) {

      axios.get("/api/administrateur/decheteries")
       .then(response => {
        if (response.data.success) {

         setListeDecheteries(response.data.decheteries);

         const decheterieData = response.data.decheteries.find(elt => elt.id === benneData.decheterieID);
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
   axios.put("/api/administrateur/bennes", { benneID: router.query.id, numeroBenne, immatSelected })
    .then(response => {
     setFormValidated(false);
     setLoadingBtn(false);

     if (response.data.success) {
      setImmatSelected(response.data.benne.immatriculation);
      setNumeroBenne(response.data.benne.numBenne);
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
     <Modal.Title>Modifier la benne n° {numeroBenne && numeroBenne}</Modal.Title>
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
       <Form.Label>Numéro de benne *</Form.Label>
       <Form.Control defaultValue={numeroBenne} onInput={e => setNumeroBenne(e.target.value)} type="number" placeholder="Numéro de benne" />
      </Form.Group>

      <Form.Group>
       <Form.Label>Immatriculation *</Form.Label>
       <Form.Control
        type="text"
        placeholder="Du type AB-123-BC"
        value={immatSelected}
        onInput={handleInputChangeImmat}
        required
       />
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
};

export default ProtectedRoute(Modifier);