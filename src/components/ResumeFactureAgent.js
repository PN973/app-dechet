import { Card, Button, Spinner, Toast, ToastContainer } from "react-bootstrap";
import { useMyContext } from "@/context/Mycontext";
import styled from "styled-components";
import styles from "@/styles/facturation.module.css";
import { InfoCircleFill } from "react-bootstrap-icons";
import SignatureCanvas from 'react-signature-canvas';
import { useRef, useState } from "react";
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import firebaseApp from "@/libs/firebase";
import { v4 as uuidv4 } from 'uuid';
import { useRouter } from "next/router";
import axios from "axios";
import { getCookie } from "@/libs/clientCookie";


const storage = getStorage(firebaseApp, "gs://numerisation-a1bed.appspot.com");

const Divider = styled.hr`
  border: none;
  height: 1px;
  background-color: #ccc;
  margin: 2px 0;
`;


const ResumeFacture = () => {

  const router = useRouter();

  const {
    facturation, setFacturation,
    clientFacturation, setClientFacturation,
    immatriculationDepot, setImmatriculationDepot,
    observationsDepot, setObservationsDepot
  } = useMyContext();

  const signatureOptimomRef = useRef(null);
  const signatureExutoireRef = useRef(null);

  const [signatureOptimom, setSignatureOptimom] = useState(null);
  const [signatureExutoire, setSignatureExutoire] = useState(null);

  const [loader, setLoader] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const [showToast, setShowToast] = useState(false);


  const totalComplet = facturation.reduce((accumulateur, produit) => {
    return accumulateur + produit.total;
  }, 0);

  const base64ToBlob = (base64) => {
    const byteString = atob(base64.split(',')[1]);
    const mimeString = base64.split(',')[0].split(':')[1].split(';')[0];
    const buffer = new ArrayBuffer(byteString.length);
    const dataView = new Uint8Array(buffer);

    for (let i = 0; i < byteString.length; i++) {
      dataView[i] = byteString.charCodeAt(i);
    }

    return new Blob([buffer], { type: mimeString });
  };

  const uploadSignatureOptimom = (base64Signature) => {
    const nomOfficiel = uuidv4(); // Génère un nom officiel unique
    const path = `signatures-devis-optimom/${nomOfficiel}`;
    const storageRef = ref(storage, path);

    const blob = base64ToBlob(base64Signature);
    const uploadTask = uploadBytesResumable(storageRef, blob);

    uploadTask.on(
      "state_changed",
      (snapshot) => {
        // Gère la progression du téléchargement
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        //console.log("Progression du téléchargement :", progress);
      },
      (error) => {
        // Gère l'erreur de téléchargement
        //console.error("Erreur lors du téléchargement du fichier :", error);
      },
      () => {
        // Gère la réussite du téléchargement
        getDownloadURL(uploadTask.snapshot.ref)
          .then((uploadUrl) => {
            //console.log("URL du fichier :", uploadUrl);
            setSignatureOptimom(uploadUrl);
            // Vous pouvez utiliser l'URL du fichier téléchargé ici
          })
          .catch((error) => {
            //console.error("Erreur lors de l'obtention de l'URL du fichier :", error);
          });
      }
    );
  };

  const uploadSignatureExutoire = (base64Signature) => {
    const nomOfficiel = uuidv4(); // Génère un nom officiel unique
    const path = `signatures-devis-exutoire/${nomOfficiel}`;
    const storageRef = ref(storage, path);

    const blob = base64ToBlob(base64Signature);
    const uploadTask = uploadBytesResumable(storageRef, blob);

    uploadTask.on(
      "state_changed",
      (snapshot) => {
        // Gère la progression du téléchargement
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        //console.log("Progression du téléchargement :", progress);
      },
      (error) => {
        // Gère l'erreur de téléchargement
        //console.error("Erreur lors du téléchargement du fichier :", error);
      },
      () => {
        // Gère la réussite du téléchargement
        getDownloadURL(uploadTask.snapshot.ref)
          .then((uploadUrl) => {
            setSignatureExutoire(uploadUrl);
            //console.log("URL du fichier :", uploadUrl);
            // Vous pouvez utiliser l'URL du fichier téléchargé ici
          })
          .catch((error) => {
            console.error("Erreur lors de l'obtention de l'URL du fichier :", error);
          });
      }
    );
  };

  const handleAnnulation = () => {
    setClientFacturation(null);
    setFacturation([]);
    setSignatureOptimom(null);
    setSignatureExutoire(null);
    router.push("/dashboard/factures");
  }


  const handleEnrDevis = () => {
    setLoader(true);
    const userData = getCookie("agent");
    const data = JSON.parse(userData);
    axios.post("/api/agent/enregistrer-devis", { id: data.id, immatriculationDepot, observationsDepot, facturation, clientFacturation, totalComplet, signatureOptimom })
      .then(response => {
        setLoader(false);

        if (response.data.success) {
          setClientFacturation(null);
          setFacturation([]);
          setSignatureOptimom(null);
          setSignatureExutoire(null);
          setShowToast(true);
        } else {
          setErrorMsg(response.data.message);
          setTimeout(() => setErrorMsg(null), 5000);
        }
      })
      .catch(e => {
        setLoader(false);
        console.log(e)
      })
  }

  const handleValDevis = () => {
    setLoader(true);
    const userData = getCookie("agent");
    const data = JSON.parse(userData);
    axios.post("/api/administrateur/valider-devis", { id: data.id, immatriculationDepot, observationsDepot, facturation, clientFacturation, totalComplet, signatureOptimom, signatureExutoire })
      .then(response => {
        setLoader(false);
        if (response.data.success) {
          setClientFacturation(null);
          setFacturation([]);
          setSignatureOptimom(null);
          setSignatureExutoire(null);
          setShowToast(true);
        } else {
          setErrorMsg(response.data.message);
          setTimeout(() => setErrorMsg(null), 5000);
        }
      })
      .catch(e => {
        setLoader(false);
        console.log(e)
      })
  }


  //console.log(facturation, totalComplet)

  return (
    <>
      <ToastContainer
        className="p-3"
        position={"top-end"}
        style={{ zIndex: 1 }}
      >
        <Toast bg="success" onClose={() => setShowToast(false)} show={showToast} delay={3000} autohide>
          <Toast.Header closeButton={false} style={{ color: "black", fontWeight: "bold" }}>
            Succès
          </Toast.Header>
          <Toast.Body style={{ color: "white" }}>Nouveau dépot enregistré avec succès.</Toast.Body>
        </Toast>
      </ToastContainer>
      <Card bg="dark" text="white" border="light">
        <Card.Header>
          <Card.Title>Résumé</Card.Title>
        </Card.Header>
        {
          clientFacturation &&
          <Card.Body>
            <h5 className={styles.titleResume}>Informations du client <InfoCircleFill /> </h5>
            <Divider />
            <p><strong>Nom & prénom :</strong> <span>{clientFacturation.nom + " " + clientFacturation.prenom} </span> </p>
            <p><strong>Courriel :</strong> <span>{clientFacturation.email} </span> </p>
            <p><strong>Téléphone :</strong> <span>{clientFacturation.telephone} </span> </p>
            <p><strong>Adresse :</strong> <span>{clientFacturation.adresse} </span> </p>

            <Divider />
            <div className={styles.signatureTitle}>
              <h5 className={styles.titleResume}>Signature OPTIM'OM  </h5>
              <Button variant="warning" onClick={() => { signatureOptimomRef.current.clear(); setSignatureOptimom(null) }} >Effacer la signature</Button>
            </div>

            <SignatureCanvas
              ref={signatureOptimomRef}
              penColor='black'
              backgroundColor="white"
              canvasProps={{ className: styles.sigCanvas, }}
              onEnd={() => uploadSignatureOptimom(signatureOptimomRef.current.toDataURL("image/png"))}
            />



            <div className={styles.centeredButton}>
              <p className="error-display">{errorMsg && errorMsg}</p>
            </div>
          </Card.Body>
        }

        {
          clientFacturation && facturation.length > 0 ?

            <Card.Footer >
              <div className={styles.alignRight}>
                <p className={styles.total}><strong>Total TTC : </strong> <span>{totalComplet} € </span> </p>
              </div>
              <div className={styles.alignRightButton}>
                <Button variant="danger" onClick={() => handleAnnulation()}>Annuler</Button>
                {
                  loader ?
                    <Spinner variant="success"></Spinner>
                    :
                    signatureOptimom && !signatureExutoire ?
                      <Button variant="primary" onClick={handleEnrDevis}>Enregistrer</Button>
                      :
                      signatureOptimom && signatureExutoire ?
                        <Button variant="success" onClick={handleValDevis}>Valider</Button>
                        :
                        <Button variant="secondary" disabled>Enregistrer</Button>
                }

              </div>

            </Card.Footer>
            :
            null
        }


      </Card>
    </>
  )
};

export default ResumeFacture;