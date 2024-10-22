import NavBarComp from "@/components/Navbar";
import SideNavBar from "@/components/SideNavBar";
import ProtectedRoute from "@/components/ProtectedRoute";
import { Container, ToastContainer, Button, Breadcrumb, Form, Spinner, Toast, Modal } from "react-bootstrap";
import { useState, useRef, useEffect } from "react";
import axios from "axios";
import styles from "@/styles/Agent.module.css";

import DataTable from 'react-data-table-component';
import { CSVLink } from 'react-csv';
import styled from 'styled-components';
import { useReactToPrint } from 'react-to-print';

import Departements from "@/libs/departements"

import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

import { format } from "date-fns";


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

const Decheteries = () => {

  const tableRef = useRef();

  const [show, setShow] = useState(false);
  const [nomDecheterie, setNomDecheterie] = useState("Déchèterie de ");
  const [departement, setDepartement] = useState("");
  const [commune, setCommune] = useState("");
  const [codePostal, setCodePostal] = useState("");
  const [loading, setLoading] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const [listeDecheteries, setListeDecheteries] = useState([]);
  const [filterText, setFilterText] = useState('');
  const [loadingData, setLoadingData] = useState(true);
  const [searchResult, setSearchResult] = useState([]);

  const [activationState, setActivationState] = useState(false);
  const [formValidated, setFormValidated] = useState(false);

  const [showModalModification, setShowModalModification] = useState(false);
  const [modificationElt, setModificationElt] = useState(null);
  const [showToastModification, setShowToastModification] = useState(false);

  useEffect(() => {
    axios.get("/api/administrateur/decheteries")
      .then(response => {
        if (response.data.success) {
          setListeDecheteries(response.data.decheteries);
          setLoadingData(false);
        }
      })
      .catch(e => {
        console.log(e)
      })

  }, []);

  const handleActivation = (id) => {

    axios.post("/api/administrateur/activation-decheterie", { id: id })
      .then(response => {

        if (response.data.success) {
          const updatedDecheterie = response.data.decheterie;

          // Mettre à jour la liste des agents
          setListeDecheteries((prevListeDecheteries) => {
            return prevListeDecheteries.map(decheterie =>
              decheterie.id === id ? updatedDecheterie : decheterie
            );
          });

        }
      })
      .catch(e => {
        console.log(e)
      })
  }

  const handleDesactivation = (id) => {

    axios.post("/api/administrateur/desactivation-decheterie", { id: id })
      .then(response => {

        if (response.data.success) {
          const updatedDecheterie = response.data.decheterie;

          // Mettre à jour la liste des agents
          setListeDecheteries((prevListeDecheteries) => {
            return prevListeDecheteries.map(decheterie =>
              decheterie.id === id ? updatedDecheterie : decheterie
            );
          });

        }
      })
      .catch(e => {
        console.log(e)
      })
  }



  const columns = [
    {
      name: <p style={{ fontWeight: "bold", fontSize: 16 }}>ID</p>,
      selector: (row, index) => index + 1,  // Génère un ID en fonction de l'index
      sortable: true,
    },
    {
      name: <p style={{ fontWeight: "bold", fontSize: 16 }}>Déchèterie</p>,
      selector: row => row.nom,
      sortable: true,
    },
    {
      name: <p style={{ fontWeight: "bold", fontSize: 16 }}>Département</p>,
      selector: row => row.departement,
      sortable: true,
    },
    {
      name: <p style={{ fontWeight: "bold", fontSize: 16 }}>Commune</p>,
      selector: row => row.commune,
      sortable: true,
    },
    {
      name: <p style={{ fontWeight: "bold", fontSize: 16 }}>Code postal</p>,
      selector: row => row.codePostal,
      sortable: true,
    },
    {
      name: <p style={{ fontWeight: "bold", fontSize: 16 }}>Etat</p>,
      selector: row => {
        if (row.etat === "invalid") {
          return <p className="enAttente">Désactivée</p>
        } else if (row.etat === "valide") {
          return <p className="valide">Valide</p>
        }
      },
      sortable: true,
    },
    {
      name: <p style={{ fontWeight: "bold", fontSize: 16 }}>Options</p>,
      selector: row => {
        if (row.etat === "invalid") {
          return (
            <div className="optionsButton">
              <Button variant="success" onClick={() => handleActivation(row.id)}>Activer</Button>
              <Button variant="warning" onClick={() => openModalModification(row.id)}>Modifier</Button>
            </div>

          )
        } else if (row.etat === "valide") {
          return (
            <div className="optionsButton">
              <Button variant="danger" onClick={() => handleDesactivation(row.id)}>Désactiver</Button>
              <Button variant="warning" onClick={() => openModalModification(row.id)}>Modifier</Button>
            </div>

          )
        }
      },
      sortable: true,
    },
  ];


  const handlePrint = useReactToPrint({
    content: () => tableRef.current,
  });

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const form = e.currentTarget;

    if (form.checkValidity() === false) {
      e.stopPropagation();
    } else {
      setFormValidated(true);
      setLoading(true);

      axios.post("/api/administrateur/decheteries", { nomDecheterie, departement, commune, codePostal })
        .then(response => {
          setLoading(false);

          if (response.data.success) {
            setListeDecheteries([response.data.decheterie, ...listeDecheteries]);
            setNomDecheterie("Déchèterie de ");
            setCommune("");
            setCodePostal("");
            setShow(false);
            setShowToast(true);
            setFormValidated(false);
          } else {
            setErrorMsg(response.data.message);
            setTimeout(() => setErrorMsg(null), 5000);
          }
        })
        .catch(e => {
          setLoading(false);
        })
    }



  };

  const paginationOptions = {
    rowsPerPageText: 'Lignes par page', // Texte personnalisé pour "Rows per page"
    rangeSeparatorText: 'de',
  };

  const handleSearch = (elt) => {
    const allData = [...listeDecheteries];
    if (elt.length > 0) {
      setFilterText(elt);
      const filteredData = allData.filter(item =>
        item.nom.toLowerCase().includes(elt.toLowerCase())
      );

      setSearchResult(filteredData);

    } else {
      setFilterText("");
    }

  }

  const handleRowClicked = row => {
    console.log("Row data:", row);
  };

  const openModalModification = (id) => {
    const modificationObjet = listeDecheteries.find(elt => elt.id === id);
    if (modificationObjet) {
      setModificationElt(modificationObjet);
      setNomDecheterie(modificationObjet.nom);
      setCommune(modificationObjet.commune);
      setCodePostal(modificationObjet.codePostal);
      setDepartement(modificationObjet.departement);
      setShowModalModification(true);
    }
  };

  const handleSubmitModification = (e) => {

    e.preventDefault();
    const form = e.currentTarget;

    if (form.checkValidity() === false) {
      e.stopPropagation();
    } else {

      setFormValidated(true);
      setLoading(true);

      axios.post("/api/administrateur/modifier-decheterie", { id: modificationElt.id, nomDecheterie, departement, commune, codePostal })
        .then(response => {
          setLoading(false);

          if (response.data.success) {

            const updatedDecheterie = response.data.decheterie;

            setListeDecheteries((prevListeDecheteries) => {
              return prevListeDecheteries.map(decheterie =>
                decheterie.id === modificationElt.id ? updatedDecheterie : decheterie
              );
            });

            setFormValidated(false);
            setShowModalModification(false);
            setShowToastModification(true)
          } else {
            setErrorMsg(response.data.message);
            setTimeout(() => setErrorMsg(null), 5000);
          }
        })
        .catch(e => {
          setLoading(false);
        })

    }

  }

  const exportToXLSX = (filename) => {

    let allDecheteries = [...listeDecheteries];

    // Transformation des données en format adapté à xlsx
    const worksheetData = allDecheteries.map((item, itemIndex) => {

      return ({
        ID: itemIndex + 1,
        Nom: item.nom,
        Departement: item.departement,
        Commune: item.commune,
        Code_postal: item.codePostal,
        Date_enregistrement: format(new Date(item.date), "dd-MM-yyyy à HH:mm"),
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
      <NavBarComp title="Gestion des déchèteries" />
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
              <Toast.Body style={{ color: "white" }}>Nouvelle déchèterie créée avec succès.</Toast.Body>
            </Toast>
          </ToastContainer>
          <ToastContainer
            className="p-3"
            position={"top-end"}
            style={{ zIndex: 1 }}
          >
            <Toast bg="success" onClose={() => setShowToastModification(false)} show={showToastModification} delay={3000} autohide>
              <Toast.Header closeButton={false} style={{ color: "black", fontWeight: "bold" }}>
                Succès
              </Toast.Header>
              <Toast.Body style={{ color: "white" }}>Déchèterie modifiée avec succès.</Toast.Body>
            </Toast>
          </ToastContainer>
          <Breadcrumb>
            <Breadcrumb.Item href="/dashboard/accueil">Accueil</Breadcrumb.Item>
            <Breadcrumb.Item active>Déchèteries</Breadcrumb.Item>
          </Breadcrumb>

          <div className="createButton">
            <Button variant="success" onClick={handleShow} >
              Créer une nouvelle déchèterie
            </Button>
          </div>

          <SearchInput
            type="text"
            placeholder="Rechercher par nom"
            onChange={e => handleSearch(e.target.value)}
          />
          <div style={{ marginTop: '20px' }}>
            <ExportButton onClick={() => exportToXLSX("liste-decheteries")}>Exporter en CSV</ExportButton>
            <PrintButton onClick={handlePrint}>Imprimer</PrintButton>
          </div>
          {
            loadingData ?
              <div className="loader-division" style={{ marginTop: 20 }}>
                <Spinner variant="secondary"></Spinner>
              </div>

              :
              <div ref={tableRef}>
                <DataTable
                  columns={columns}
                  data={filterText.length > 0 ? searchResult : listeDecheteries}
                  pagination
                  highlightOnHover
                  responsive
                  noDataComponent={"Aucune déchèterie"}
                  onRowClicked={handleRowClicked}
                  title={"Liste des déchèteries"}
                  paginationComponentOptions={paginationOptions}
                />
              </div>
          }


          <Modal show={show} onHide={handleClose} fullscreen>
            <Modal.Header closeButton>
              <Modal.Title>Nouvelle déchèterie</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <Form noValidate validated={formValidated} onSubmit={handleSubmit}>
                <Form.Group className="mb-3" controlId="">
                  <Form.Label>Nom de la déchèterie *</Form.Label>
                  <Form.Control required defaultValue={nomDecheterie} onInput={e => setNomDecheterie(e.target.value)} type="text" placeholder="Nom de la déchèterie" />
                </Form.Group>

                <Form.Group className="mb-3" controlId="">
                  <Form.Label>Département *</Form.Label>
                  <Form.Select required onChange={e => setDepartement(e.target.value)}>
                    <option value="">Sélectionner un département</option>
                    {
                      Departements.map((elt, index) => {
                        return (
                          <option key={elt.value} value={elt.label}>{elt.label}</option>
                        )
                      })
                    }
                  </Form.Select>
                </Form.Group>

                <Form.Group className="mb-3" controlId="">
                  <Form.Label>Commune *</Form.Label>
                  <Form.Control required onInput={e => setCommune(e.target.value)} type="text" placeholder="Commune" />
                </Form.Group>

                <Form.Group className="mb-3" controlId="">
                  <Form.Label>Code postal *</Form.Label>
                  <Form.Control required onInput={e => setCodePostal(e.target.value)} type="text" placeholder="Code postal" />
                </Form.Group>
                <div className={styles.centeredButton}>
                  <p className="error-display">{errorMsg && errorMsg}</p>
                </div>


                <Modal.Footer>
                  <Button variant="secondary" onClick={handleClose}>
                    Annuler
                  </Button>
                  {
                    loading ?
                      <Spinner variant="success"></Spinner>
                      :
                      <Button variant="success" type="submit" onClick={handleSubmit}>
                        Enregistrer
                      </Button>
                  }

                </Modal.Footer>
              </Form>
            </Modal.Body>

          </Modal>

          <Modal show={showModalModification} onHide={() => setShowModalModification(false)} fullscreen>
            <Modal.Header closeButton>
              <Modal.Title>{modificationElt ? "Modifier la " + modificationElt.nom : ""}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <Form noValidate validated={formValidated} onSubmit={handleSubmitModification}>
                <Form.Group className="mb-3" controlId="">
                  <Form.Label>Nom de la déchèterie *</Form.Label>
                  <Form.Control required defaultValue={modificationElt && modificationElt.nom} onInput={e => setNomDecheterie(e.target.value)} type="text" placeholder="Nom de la déchèterie" />
                </Form.Group>

                <Form.Group className="mb-3" controlId="">
                  <Form.Label>Département *</Form.Label>
                  <Form.Select required onChange={e => setDepartement(e.target.value)}>
                    <option value={modificationElt && modificationElt.departement}>{modificationElt && modificationElt.departement}</option>
                    {
                      Departements.map((elt, index) => {
                        return (
                          <option key={elt.value} value={elt.label}>{elt.label}</option>
                        )
                      })
                    }
                  </Form.Select>
                </Form.Group>

                <Form.Group className="mb-3" controlId="">
                  <Form.Label>Commune *</Form.Label>
                  <Form.Control required defaultValue={modificationElt && modificationElt.commune} onInput={e => setCommune(e.target.value)} type="text" placeholder="Commune" />
                </Form.Group>

                <Form.Group className="mb-3" controlId="">
                  <Form.Label>Code postal *</Form.Label>
                  <Form.Control required defaultValue={modificationElt && modificationElt.codePostal} onInput={e => setCodePostal(e.target.value)} type="text" placeholder="Code postal" />
                </Form.Group>
                <div className={styles.centeredButton}>
                  <p className="error-display">{errorMsg && errorMsg}</p>
                </div>


                <Modal.Footer>
                  <Button variant="secondary" onClick={handleClose}>
                    Annuler
                  </Button>
                  {
                    loading ?
                      <Spinner variant="success"></Spinner>
                      :
                      <Button variant="success" type="submit" onClick={handleSubmitModification}>
                        Modifier
                      </Button>
                  }

                </Modal.Footer>
              </Form>
            </Modal.Body>

          </Modal>



        </Container>
      </div>
    </>
  )
};

export default ProtectedRoute(Decheteries);