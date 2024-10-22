import NavBarComp from "@/components/Navbar";
import SideNavBar from "@/components/SideNavBar";
import ProtectedRoute from "@/components/ProtectedRoute";
import { Container, Row, Button, Breadcrumb, Form, Spinner, Card, Modal, Alert } from "react-bootstrap";
import { useState, useRef, useEffect } from "react";
import axios from "axios";
import { format } from "date-fns";
import DataTable from 'react-data-table-component';
import { CSVLink } from 'react-csv';
import styled from 'styled-components';
import { useReactToPrint } from 'react-to-print';
import { useRouter } from "next/router";

import { v4 as uuidv4 } from 'uuid';
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import firebaseApp from "@/libs/firebase";
import SignatureCanvas from 'react-signature-canvas';
import styles from "@/styles/facturation.module.css";

import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

const storage = getStorage(firebaseApp, "gs://numerisation-a1bed.appspot.com");



const SearchInput = styled.input`
  margin-bottom: 20px;
  padding: 10px;
  width: 100%;
  box-sizing: border-box;
`;

const PrintButton = styled.button`
  margin-top: 20px;
  margin-left:20px;
  padding: 10px 20px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
`;


const ExportButton = styled.button`
  margin-top: 20px;
  padding: 10px 20px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
`;

const ProfilClient = () => {

  const router = useRouter();

  const clientID = router.query.profil;

  const tableRef = useRef();

  const signatureExutoireRef = useRef(null);

  const [filterText, setFilterText] = useState('');
  const [loadingData, setLoadingData] = useState(true);
  const [searchResult, setSearchResult] = useState([]);
  const [listeAgent, setListeAgent] = useState([]);
  const [listeDevis, setListeDevis] = useState([]);
  const [listeClients, setListeClients] = useState([]);
  const [clientProfil, setClientProfil] = useState(null);
  const [listeFacturation, setListeFacturation] = useState([]);

  const [selectedRow, setSelectedRow] = useState(null);

  const [showModalValidation, setShowModalValidation] = useState(false);
  const [loadingBtn, setLoadingBtn] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  const [signatureExutoire, setSignatureExutoire] = useState(null);
  const [listeDechecheteries, setListeDecheteries] = useState([]);

  const [dateA, setDateA] = useState(null);
  const [dateDU, setDateDU] = useState(null);

  const [showConsigne, setShowConsigne] = useState(true);

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

          setListeDecheteries(response.data.decheteries);
        }
      })
      .catch(e => {
        console.log(e)
      })

  }, []);

  useEffect(() => {

    setLoadingData(false);

  }, [listeAgent, listeDevis])

  useEffect(() => {
    axios.get("/api/administrateur/clients")
      .then(response => {
        if (response.data.success) {
          setListeClients(response.data.clients);
          const data = response.data.clients.find(elt => elt.id === clientID);
          setClientProfil(data);
        }
      })
      .catch(e => {
        console.log(e)
      })


    axios.post("/api/administrateur/devis-client", { clientID })
      .then(response => {
        if (response.data.success) {

          const sortedDevis = response.data.devis.sort((a, b) => b.numero - a.numero);
          setListeDevis(sortedDevis);
        }
      })
      .catch(e => console.log(e))

  }, [clientID])


  const columns = [
    {
      name: <p style={{ fontWeight: "bold", fontSize: 16 }}>N°</p>,
      selector: (row, index) => index + 1,
      sortable: true,
    },
    {
      name: <p style={{ fontWeight: "bold", fontSize: 16 }}>Date</p>,
      selector: (row, index) => {
        return format(new Date(row.date), "dd-MM-yyyy")
      },  // Génère un ID en fonction de l'index
      sortable: true,
    },
    {
      name: <p style={{ fontWeight: "bold", fontSize: 16 }}>Agent</p>,
      selector: row => {
        const agentInfos = listeAgent.find(elt => elt.id === row.agentID);
        if (agentInfos) {
          return agentInfos.nom + " " + agentInfos.prenom
        } else {
          return "Administrateur"
        }
      },
      sortable: true,
    },
    {
      name: <p style={{ fontWeight: "bold", fontSize: 16 }}>Client</p>,
      selector: row => row.client.nom + " " + row.client.prenom,
      sortable: true,
    },
    {
      name: <p style={{ fontWeight: "bold", fontSize: 16 }}>Total TTC</p>,
      selector: row => row.totalDevis + " €",
      sortable: true,
    },
    {
      name: <p style={{ fontWeight: "bold", fontSize: 16 }}>Etat</p>,
      selector: row => {
        if (row.etat === "attente") {
          return <p className="enAttente">En attente</p>
        } else if (row.etat === "valide") {
          return <p className="valide">Valide</p>
        } else if (row.etat === "annule") {
          return <p className="annule">Annulé</p>
        }
      },
      sortable: true,
    },
    {
      name: <p style={{ fontWeight: "bold", fontSize: 16 }}>Options</p>,
      selector: row => {
        if (row.etat === "attente") {
          return (
            <div className="optionsButton">
              <Button variant="success" onClick={() => handleValidation(row.id)}>Valider</Button>
              <Button variant="warning" onClick={() => router.push("/dashboard/depots/details/" + row.id)} >Détails</Button>
              <Button variant="danger" onClick={() => handleAnnule(row.id)}>Annuler</Button>
            </div>

          )
        } else if (row.etat === "valide") {
          return (
            <div className="optionsButton">
              <Button variant="primary" onClick={() => router.push("/dashboard/depots/details/" + row.id)}>Imprimer</Button>
            </div>

          )
        }
      },
      sortable: true,
    },
  ];


  const paginationOptions = {
    rowsPerPageText: 'Lignes par page', // Texte personnalisé pour "Rows per page"
    rangeSeparatorText: 'de',
  };


  const handlePrint = useReactToPrint({
    content: () => tableRef.current,
  });

  const handleSearch = (elt) => {
    const allData = [...listeDevis];
    if (elt.length > 0) {
      setFilterText(elt);
      const filteredData = allData.filter(item =>
        item.client.nom.toLowerCase().includes(elt.toLowerCase())
      );

      setSearchResult(filteredData);

    } else {
      setFilterText("");
    }

  }

  const handleRowClicked = row => {
    console.log("Row data:", row);
  };



  const handleValidation = (id) => {
    const data = listeDevis.find(elt => elt.id === id);
    if (data) {
      setSelectedRow(data);
      setShowModalValidation(true);
    }
  };

  const handleConfirmValidation = () => {

    setLoadingBtn(true);

    axios.post("/api/administrateur/signer-devis", { id: selectedRow.id, signatureExutoire })
      .then(response => {
        if (response.data.success) {
          const updatedDevis = response.data.devis;

          // Mettre à jour la liste des devis
          setListeDevis((prevListeDevis) => {
            // Remplacer l'élément mis à jour
            const updatedList = prevListeDevis.map(devis =>
              devis.id === selectedRow.id ? updatedDevis : devis
            );

            // Trier la liste mise à jour par numéro en ordre décroissant
            return updatedList.sort((a, b) => b.numero - a.numero);
          });

          // Autres actions après la mise à jour et le tri
          setLoadingBtn(false);
          setShowModalValidation(false);
        }
      })
      .catch(e => {
        console.log(e)
      })
  }

  const handleAnnule = (id) => {
    axios.post("/api/administrateur/annuler-devis", { id })
      .then(response => {
        if (response.data.success) {
          const updatedDevis = response.data.devis;

          // Mettre à jour la liste des devis
          setListeDevis((prevListeDevis) => {
            // Remplacer l'élément mis à jour
            const updatedList = prevListeDevis.map(devis =>
              devis.id === id ? updatedDevis : devis
            );

            // Trier la liste mise à jour par numéro en ordre décroissant
            return updatedList.sort((a, b) => b.numero - a.numero);
          });

        }
      })
      .catch(e => {
        console.log(e)
      })
  }

  const handleSelectRow = ({ selectedRows }) => {
    // You can set state or dispatch with something like Redux so we can use the retrieved data
    setListeFacturation(selectedRows)

  };

  const handleFilter = () => {
    // Filtrer les données en fonction de dateA et dateDU
    const allData = [...listeDevis];
    if (dateA && dateDU) {

      const filtered = allData.filter(item => {
        const itemDate = new Date(item.date);
        return itemDate >= dateA && itemDate <= dateDU;
      });

      if (filtered.length === 0) {
        setErrorMsg("Aucun dépot disponible pour cette période");
        setTimeout(() => setErrorMsg(null), 5000);
      }

      setSearchResult(filtered);
    } else {
      setSearchResult(allData);
      setErrorMsg("Sélectionner un intervalle valide");
      setTimeout(() => setErrorMsg(null), 5000);
    }
  };

  const [showErrorInvoice, setShowErrorInvoice] = useState(false);
  const [errorInvoice, setErrorInvoice] = useState(false);

  const handleCreateInvoice = () => {
    if (dateA && dateDU) {

      if (listeFacturation.length > 0) {

        setLoadingBtn(true);

        axios.post("/api/administrateur/invoice", { dateDU, dateA, clientID, listeFacturation })
          .then(response => {
            console.log(response);

            if (response.data.success) {
              router.push("/dashboard/factures/invoice/" + response.data.facture.id)
            }
            setLoadingBtn(false);
          })
          .catch(e => console.log(e))

      } else {
        setErrorInvoice("Cocher des éléments.");
        setShowErrorInvoice(true)
      }

    } else {
      setErrorInvoice("Sélectionner un intervalle valide.");
      setShowErrorInvoice(true)
    }
  };

  const exportToXLSX = (filename) => {

    let allDevis = [...listeDevis];

    // Transformation des données en format adapté à xlsx
    const worksheetData = allDevis.map((item, itemIndex) => {
      const decheterie = listeDechecheteries.find(elt => elt.id === item.client.decheterieID);
      return ({
        Numero_facture: item.numero,
        Date: format(new Date(item.date), "dd-MM-yyyy à HH:mm"),
        Client: item.client.nomSociete,
        Nom: item.client.nom,
        Prenom: item.client.prenom,
        Email: item.client.email,
        Telephone: item.client.telephone,
        Immatriculation: item.client.immatriculation,
        Dechetterie: decheterie.nom,
        Articles: item.produits.map(res => `${res.produit.nom}:${res.quantite}`).join(', '),
      })
    });

    // Création de la feuille de calcul
    const worksheet = XLSX.utils.json_to_sheet(worksheetData);

    // Définir les styles pour les en-têtes de colonnes (en gras)
    const headerStyle = {
      font: { bold: true }
    };

    // Appliquer le style aux en-têtes de colonnes
    Object.keys(worksheetData[0]).forEach((key, index) => {
      const cellAddress = XLSX.utils.encode_cell({ r: 0, c: index });
      if (worksheet[cellAddress]) {
        worksheet[cellAddress].s = headerStyle;
      }
    });

    // Définir les tailles par défaut des colonnes
    const defaultColumnWidths = [
    ];

    worksheet['!cols'] = defaultColumnWidths;

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");

    // Générer le fichier Excel et le télécharger
    const xlsxOutput = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([xlsxOutput], { type: 'application/octet-stream' });
    saveAs(blob, `${filename}.xlsx`);
  };





  return (
    <>
      <NavBarComp title={clientProfil ? "Gestions des dépots de " + clientProfil.nomSociete : ""} />
      <div className="page-content">
        <SideNavBar />
        <Container>
          <Breadcrumb>
            <Breadcrumb.Item href="/dashboard/accueil">Accueil</Breadcrumb.Item>
            <Breadcrumb.Item href="/dashboard/clients">Clients</Breadcrumb.Item>
            <Breadcrumb.Item active>{clientProfil ? clientProfil.nomSociete : ""}</Breadcrumb.Item>
          </Breadcrumb>

          <div>
            {
              showConsigne ?
                <Alert variant="danger" onClose={() => setShowConsigne(false)} dismissible>
                  <Alert.Heading>Consignes de facturation</Alert.Heading>

                  <h5>Étape 1 : Vérification des Dépôts</h5>
                  <ol>
                    <li>Tous les dépôts doivent être validés.</li>
                    <li>Toutes les signatures doivent être collectées.</li>
                  </ol>

                  <h5>Étape 2 : Tri des Dépôts par Date</h5>
                  <ol>
                    <li>Trier les dépôts par date, du plus ancien au plus récent.</li>
                    <li>Sélectionner la période de facturation.</li>
                  </ol>

                  <h5>Étape 3 : Sélection et Facturation</h5>
                  <ol>
                    <li>Cocher les éléments de la période sélectionnée.</li>
                    <li>Cliquer sur "Créer une facture".</li>
                  </ol>

                </Alert>
                :
                null
            }

          </div>
          <Form.Group>
            <Form.Label>Date du</Form.Label>
            <SearchInput
              type="date"
              placeholder="Du"
              onChange={(e) => setDateA(new Date(e.target.value))}
            />
          </Form.Group>
          <Form.Group>
            <Form.Label>Date à</Form.Label>
            <SearchInput
              type="date"
              placeholder="Au"
              onChange={(e) => setDateDU(new Date(e.target.value))}
            />
          </Form.Group>

          <div className={styles.factureBtn}>
            <Button variant="secondary" onClick={handleFilter}>Filtrer les dépots</Button>
          </div>
          <p className="error-display">{errorMsg && errorMsg}</p>


          <div style={{ margin: '20px 0' }}>
            <Button variant="primary" onClick={() => exportToXLSX("liste-depot-client")}>Exporter en CSV</Button>
            <Button style={{ marginLeft: 10 }} variant="primary" onClick={handlePrint}>Imprimer</Button>
            {
              listeFacturation.length > 0 ?
                loadingBtn ?

                  <Spinner style={{ marginLeft: 10 }} variant="success"></Spinner>
                  :
                  <Button style={{ marginLeft: 10 }} variant="success" onClick={handleCreateInvoice}>Créer une facture</Button>
                :
                null
            }
          </div>

          <Alert style={{ margin: "20px 0" }} variant="danger" show={showErrorInvoice} onClose={() => setShowErrorInvoice(false)} dismissible>
            {errorInvoice}
          </Alert>

          <div ref={tableRef}>
            {
              loadingData ?
                <div className="loader-division" style={{ marginTop: 20 }}>
                  <Spinner variant="secondary"></Spinner>
                </div>
                :
                <DataTable
                  columns={columns}
                  data={searchResult.length > 0 ? searchResult : listeDevis}
                  pagination
                  highlightOnHover
                  responsive
                  noDataComponent={"Aucun dépot"}
                  onRowClicked={handleRowClicked}
                  title={"Liste des dépots"}
                  paginationComponentOptions={paginationOptions}
                  selectableRows
                  onSelectedRowsChange={handleSelectRow}
                />
            }
          </div>


          <Modal show={showModalValidation} onHide={() => setShowModalValidation(false)} fullscreen>
            <Modal.Header closeButton>
              <Modal.Title>Confirmer la signature EXUTOIRE - devis n° {selectedRow && "00" + selectedRow.numero} </Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <Card>
                <Card.Body>
                  <SignatureCanvas
                    ref={signatureExutoireRef}
                    penColor='black'
                    canvasProps={{ className: styles.sigCanvas }}
                    onEnd={() => uploadSignatureExutoire(signatureExutoireRef.current.toDataURL("image/png"))}
                  />
                </Card.Body>
              </Card>
            </Modal.Body>
            <Modal.Footer>

              <Button variant="secondary" onClick={() => { setShowModalValidation(false), setLoadingBtn(false), setSignatureExutoire(null) }}>
                Annuler
              </Button>
              {
                loadingBtn ?
                  <Spinner variant="primary"></Spinner>
                  :
                  signatureExutoire ?
                    <Button variant="primary" onClick={() => handleConfirmValidation()}>
                      Valider
                    </Button>
                    :
                    <Button variant="primary" disabled>
                      Valider
                    </Button>

              }

            </Modal.Footer>
          </Modal>



        </Container>
      </div>
    </>
  )
};

export default ProtectedRoute(ProfilClient);