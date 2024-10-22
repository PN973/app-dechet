import NavBarComp from "@/components/Navbar";
import SideNavBar from "@/components/SideNavBar";
import ProtectedRoute from "@/components/ProtectedRoute";
import { Container, Row, Button, Breadcrumb, Form, Spinner, Modal, ToastContainer, Toast } from "react-bootstrap";
import { useState, useRef, useEffect } from "react";
import axios from "axios";
import styles from "@/styles/Agent.module.css";
import Link from "next/link";
import { Eye } from "react-bootstrap-icons";

import DataTable from 'react-data-table-component';
import { CSVLink } from 'react-csv';
import styled from 'styled-components';
import { useReactToPrint } from 'react-to-print';

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

const MatieresEvacuations = () => {

  const tableRef = useRef();

  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const [filterText, setFilterText] = useState('');
  const [loadingData, setLoadingData] = useState(true);
  const [searchResult, setSearchResult] = useState([]);

  const [decheterie, setDecheterie] = useState("");
  const [nomMatiere, setNomMatiere] = useState("");
  const [uniteMesure, setUniteMesure] = useState("");
  const [prixMatiere, setPrixMatiere] = useState("");
  const [consignes, setConsignes] = useState("");
  const [listeMatieres, setListeMatieres] = useState([]);
  const [listeDechecheteries, setListeDecheteries] = useState([]);

  const [formValidated, setFormValidated] = useState(false);

  const [showModalModification, setShowModalModification] = useState(false);
  const [modificationElt, setModificationElt] = useState(null);
  const [showToastModification, setShowToastModification] = useState(false);

  useEffect(() => {
    axios.get("/api/administrateur/matiere")
      .then(response => {
        if (response.data.success) {
          setListeMatieres(response.data.matieres);
          setLoadingData(false);
        }
      })
      .catch(e => {
        console.log(e)
      })


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



  const columns = [
    {
      name: <p style={{ fontWeight: "bold", fontSize: 16 }}>ID</p>,
      selector: (row, index) => index + 1,  // Génère un ID en fonction de l'index
      sortable: true,
    },
    {
      name: <p style={{ fontWeight: "bold", fontSize: 16 }}>Déchèterie</p>,
      selector: row => {
        const data = listeDechecheteries.find(elt => elt.id === row.decheterieID);
        if (data) {
          return data.nom;
        }
      },
      sortable: true,
    },
    {
      name: <p style={{ fontWeight: "bold", fontSize: 16 }}>Matière</p>,
      selector: row => row.nom,
      sortable: true,
    },
    {
      name: <p style={{ fontWeight: "bold", fontSize: 16 }}>U. Mésure</p>,
      selector: row => row.unite,
      sortable: true,
    },
    {
      name: <p style={{ fontWeight: "bold", fontSize: 16 }}>Prix (€)</p>,
      selector: row => row.prix + " €",
      sortable: true,
    },
    {
      name: <p style={{ fontWeight: "bold", fontSize: 16 }}>Consignes</p>,
      selector: row => row.consignes === "" || row.consignes === null ? "Aucune consigne" : row.consignes,
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


  const paginationOptions = {
    rowsPerPageText: 'Lignes par page', // Texte personnalisé pour "Rows per page"
    rangeSeparatorText: 'de',
  };


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

      axios.post("/api/administrateur/matiere", { decheterie, nomMatiere, uniteMesure, prixMatiere, consignes })
        .then(response => {
          setLoading(false);
          if (response.data.success) {

            const updatedMatiere = response.data.matiere;

            // Mettre à jour la liste des agents
            setListeMatieres([updatedMatiere, ...listeMatieres]);

            setNomMatiere("");
            setPrixMatiere("");
            setConsignes("");
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

  const handleSearch = (elt) => {
    const allData = [...listeMatieres];
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

  const handleDesactivation = (id) => {
    axios.post("/api/administrateur/desactivation-matiere", { id: id })
      .then(response => {
        if (response.data.success) {
          const updatedMatiere = response.data.matiere;

          // Mettre à jour la liste des agents
          setListeMatieres((prevListeMatieres) => {
            return prevListeMatieres.map(matiere =>
              matiere.id === id ? updatedMatiere : matiere
            );
          });

        }
      })
      .catch(e => {
        console.log(e)
      })
  }

  const handleActivation = (id) => {
    axios.post("/api/administrateur/activation-matiere", { id: id })
      .then(response => {
        if (response.data.success) {
          const updatedMatiere = response.data.matiere;

          // Mettre à jour la liste des agents
          setListeMatieres((prevListeMatieres) => {
            return prevListeMatieres.map(matiere =>
              matiere.id === id ? updatedMatiere : matiere
            );
          });

        }
      })
      .catch(e => {
        console.log(e)
      })
  }

  const openModalModification = (id) => {
    const modificationObjet = listeMatieres.find(elt => elt.id === id);
    if (modificationObjet) {
      setDecheterie(modificationObjet.decheterieID);
      setNomMatiere(modificationObjet.nom);
      setPrixMatiere(modificationObjet.prix);
      setUniteMesure(modificationObjet.unite);
      setConsignes(modificationObjet.consignes);

      setModificationElt(modificationObjet);
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

      axios.post("/api/administrateur/modification-matiere", { id: modificationElt.id, nomMatiere, uniteMesure, prixMatiere, consignes })
        .then(response => {
          setLoading(false);
          if (response.data.success) {

            const updatedMatiere = response.data.matiere;

            // Mettre à jour la liste des agents
            setListeMatieres((prevListeMatieres) => {
              return prevListeMatieres.map(matiere =>
                matiere.id === modificationElt.id ? updatedMatiere : matiere
              );
            });

            setNomMatiere("");
            setPrixMatiere("");
            setConsignes("");
            setShowModalModification(false);
            setModificationElt(null);
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

  }

  const exportToXLSX = (filename) => {

    let allMatieres = [...listeMatieres];

    // Transformation des données en format adapté à xlsx
    const worksheetData = allMatieres.map((item, itemIndex) => {
      const decheterie = listeDechecheteries.find(elt => elt.id === item.decheterieID);
      return ({
        ID: itemIndex + 1,
        Nom: item.nom,
        Dechetterie: decheterie.nom,
        Prix: item.prix + " €",
        Unite: item.unite,
        Consignes: item.consignes,
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
      <NavBarComp title="Gestion des matières" />
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
              <Toast.Body style={{ color: "white" }}>Nouvelle matière créée avec succès.</Toast.Body>
            </Toast>
          </ToastContainer>

          <Breadcrumb>
            <Breadcrumb.Item href="/dashboard/accueil">Accueil</Breadcrumb.Item>
            <Breadcrumb.Item active>Matières d'évacuations</Breadcrumb.Item>
          </Breadcrumb>

          <div className="createButton">
            <Button variant="success" onClick={handleShow} >
              Ajouter une nouvelle matière
            </Button>
          </div>

          <SearchInput
            type="text"
            placeholder="Rechercher par nom"
            onChange={e => handleSearch(e.target.value)}
          />
          <div style={{ marginTop: '20px' }}>
            <ExportButton onClick={() => exportToXLSX("liste-matieres")}>Exporter en CSV</ExportButton>
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
                  data={filterText.length > 0 ? searchResult : listeMatieres}
                  pagination
                  highlightOnHover
                  responsive
                  noDataComponent={"Aucune matière"}
                  onRowClicked={handleRowClicked}
                  title={"Liste des matières"}
                  paginationComponentOptions={paginationOptions}
                />
              </div>
          }

          <Modal show={show} onHide={handleClose} fullscreen>
            <Modal.Header closeButton>
              <Modal.Title>Nouvelle matière</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <Form onSubmit={handleSubmit} noValidate validated={formValidated}>

                <Form.Group className="mb-3" controlId="">
                  <Form.Label>Sélectionner une décheterie *</Form.Label>
                  <Form.Select onChange={e => setDecheterie(e.target.value)} aria-label="Default decheterie" required>
                    <option value="">Sélectionner</option>
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
                  <Form.Label>Nom de la matières *</Form.Label>
                  <Form.Control required value={nomMatiere} onInput={e => setNomMatiere(e.target.value)} type="text" placeholder="Nom de la matière" />
                </Form.Group>

                <Form.Group className="mb-3" controlId="">
                  <Form.Label>Unité de mesure *</Form.Label>
                  <Form.Select required onChange={e => setUniteMesure(e.target.value)}>
                    <option value="">Sélectionner</option>
                    <option value="m3">m3</option>
                    <option value="L">L</option>
                    <option value="Kg">Kg</option>
                  </Form.Select>
                </Form.Group>

                <Form.Group className="mb-3" controlId="">
                  <Form.Label>Prix en € *</Form.Label>
                  <Form.Control required value={prixMatiere} onInput={e => setPrixMatiere(e.target.value)} type="number" placeholder="Prix de la matière" />
                </Form.Group>

                <Form.Group className="mb-3" controlId="">
                  <Form.Label>Consignes</Form.Label>
                  <Form.Control
                    as="textarea"
                    placeholder="Consignes à respecter"
                    style={{ height: '100px' }}
                    onInput={e => setConsignes(e.target.value)}
                    value={consignes}
                  />
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
              <Modal.Title>Modifier la matière : {modificationElt && modificationElt.nom} </Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <Form onSubmit={handleSubmitModification} noValidate validated={formValidated}>
                <Form.Group className="mb-3" controlId="">
                  <Form.Label>Sélectionner une décheterie *</Form.Label>
                  <Form.Select onChange={e => setDecheterie(e.target.value)} aria-label="Default decheterie" required disabled>
                    {modificationElt ? (
                      (() => {
                        const decheterie = listeDechecheteries.find(decheterie => decheterie.id === modificationElt.decheterieID);
                        return (
                          <option value={decheterie ? decheterie.id : ''}>
                            {decheterie ? decheterie.nom : 'Sélectionner'}
                          </option>
                        );
                      })()
                    ) : null}
                  </Form.Select>
                </Form.Group>

                <Form.Group className="mb-3" controlId="">
                  <Form.Label>Nom de la matières *</Form.Label>
                  <Form.Control defaultValue={modificationElt && modificationElt.nom} onInput={e => setNomMatiere(e.target.value)} type="text" placeholder="Nom de la matière" />
                </Form.Group>

                <Form.Group className="mb-3" controlId="">
                  <Form.Label>Unité de mesure *</Form.Label>
                  <Form.Select onChange={e => setUniteMesure(e.target.value)}>
                    <option value={modificationElt && modificationElt.unite}>{modificationElt && modificationElt.unite}</option>
                    <option value="m3">m3</option>
                    <option value="L">L</option>
                    <option value="Kg">Kg</option>
                  </Form.Select>
                </Form.Group>

                <Form.Group className="mb-3" controlId="">
                  <Form.Label>Prix en € *</Form.Label>
                  <Form.Control defaultValue={modificationElt && modificationElt.prix} onInput={e => setPrixMatiere(e.target.value)} type="number" placeholder="Prix de la matière" />
                </Form.Group>

                <Form.Group className="mb-3" controlId="">
                  <Form.Label>Consignes</Form.Label>
                  <Form.Control
                    as="textarea"
                    placeholder="Consignes à respecter"
                    style={{ height: '100px' }}
                    onInput={e => setConsignes(e.target.value)}
                    defaultValue={modificationElt && modificationElt.consignes}
                  />
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

export default ProtectedRoute(MatieresEvacuations);