import ProtectedRoute from "@/components/ProtectedRoute";
import NavBarComp from "@/components/Navbar";
import SideNavBar from "@/components/SideNavBar";
import { Container, Button, Modal, ToastContainer, Toast, Breadcrumb, Form, Spinner } from "react-bootstrap";
import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useRouter } from "next/router";
import DataTable from 'react-data-table-component';
import { useReactToPrint } from 'react-to-print';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { format } from "date-fns";
import styled from 'styled-components';


const SearchInput = styled.input`
  margin-bottom: 20px;
  padding: 10px;
  width: 100%;
  box-sizing: border-box;
  margin-top:20px;
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

const Chauffeurs = () => {

  const router = useRouter();

  const tableRef = useRef();

  const formRef = useRef(null);

  const [openModal, setOpenModal] = useState(false);
  const [formValidated, setFormValidated] = useState(false);
  const [loadingBtn, setLoadingBtn] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const [listeDechecheteries, setListeDecheteries] = useState([]);
  const [listeChauffeurs, setListeChauffeurs] = useState([]);
  const [filterText, setFilterText] = useState('');
  const [loadingData, setLoadingData] = useState(true);
  const [searchResult, setSearchResult] = useState([]);
  const [decheterie, setDecheterie] = useState("");
  const [nom, setNom] = useState("");
  const [prenom, setPrenom] = useState("");
  const [email, setEmail] = useState("");
  const [successMsg, setSuccessMsg] = useState(null);


  useEffect(() => {
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

    axios.get("/api/administrateur/chauffeurs")
      .then(response => {
        if (response.data.success) {
          setListeChauffeurs(response.data.chauffeurs);
        }
      })
      .catch(e => {
        console.log(e)
      })
  }, []);

  useEffect(() => {
    setLoadingData(false);
  }, [listeDechecheteries, listeChauffeurs])

  const columns = [
    {
      name: <p style={{ fontWeight: "bold", fontSize: 16 }}>ID</p>,
      selector: (row, index) => index + 1,
      sortable: true,
    },
    {
      name: <p style={{ fontWeight: "bold", fontSize: 16 }}>Nom & prénom</p>,
      selector: (row, index) => row.nom + " " + row.prenom,
      sortable: true,
    },
    {
      name: <p style={{ fontWeight: "bold", fontSize: 16 }}>E-mail</p>,
      selector: (row, index) => row.email,
      sortable: true,
    },
    {
      name: <p style={{ fontWeight: "bold", fontSize: 16 }}>Déchèterie</p>,
      selector: (row, index) => {
        const decheterie = listeDechecheteries.find(elt => elt.id === row.decheterieID);
        if (decheterie) {
          return decheterie.nom
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
              <Button variant="success" onClick={() => handleActivation({ chauffeurID: row.id, action: "activation" })}>Activer</Button>
              <Button variant="warning" onClick={() => router.push(`/dashboard/chauffeurs/modifier/${row.id}`)}>Modifier</Button>
            </div>

          )
        } else if (row.etat === "valide") {
          return (
            <div className="optionsButton">
              <Button variant="danger" onClick={() => handleActivation({ chauffeurID: row.id, action: "desactivation" })}>Désactiver</Button>
              <Button variant="warning" onClick={() => router.push(`/dashboard/chauffeurs/modifier/${row.id}`)}>Modifier</Button>
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


  const handleClose = () => {
    setOpenModal(false);
  };

  const handleSelectedDecheterie = (e) => {
    setDecheterie(e.target.value);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    if (form.checkValidity() === false) {
      event.stopPropagation();
    } else {
      setFormValidated(true);
      setLoadingBtn(true);
      axios.post("/api/administrateur/chauffeurs", { decheterie, nom, prenom, email })
        .then(response => {
          setFormValidated(false);
          setLoadingBtn(false);

          if (response.data.success) {

            const chauffeurList = [...(listeChauffeurs || []), response.data.chauffeur];
            setListeChauffeurs(chauffeurList);

            setSuccessMsg("Enregistrer avec succès");
            setTimeout(() => setSuccessMsg(null), 5000);
            setOpenModal(false);
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
          console.log(e)
        })
    }
  }

  const handleSearch = (elt) => {
    const allData = [...listeChauffeurs];
    if (elt.length > 0) {
      setFilterText(elt);
      const filteredData = allData.filter(item =>
        item.nom.toLowerCase().includes(elt.toLowerCase()) ||
        item.prenom.toLowerCase().includes(elt.toLowerCase())
      );

      setSearchResult(filteredData);
    } else {
      setFilterText("");
      setSearchResult(allData); // Revert to all data when search is cleared
    }
  }

  const exportToXLSX = (filename) => {

    let allChauffeurs = [...listeChauffeurs];

    // Transformation des données en format adapté à xlsx
    const worksheetData = allChauffeurs.map((item, itemIndex) => {

      return ({
        ID: itemIndex + 1,
        nom: item.nom,
        prenom: item.prenom,
        email: item.email,
        Date_enregistrement: format(new Date(item.date), "dd-MM-yyyy"),

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

  const handlePrint = useReactToPrint({
    content: () => tableRef.current,
  });

  const handleActivation = (obj) => {

    axios.patch("/api/administrateur/chauffeurs", obj)
      .then(response => {
        setListeChauffeurs((prevListe) => {
          return prevListe.map(prev =>
            prev.id === response.data.chauffeur.id ? response.data.chauffeur : prev
          );
        });
      })
      .catch(e => {
        console.log(e)
      })

  }




  return (
    <>
      <NavBarComp title="Gestion des chauffeurs" />
      <div className="page-content">
        <SideNavBar />
        <Container>
          <Breadcrumb>
            <Breadcrumb.Item href="/dashboard/accueil">Accueil</Breadcrumb.Item>
            <Breadcrumb.Item active>Chauffeurs</Breadcrumb.Item>
          </Breadcrumb>

          <Button variant="success" onClick={() => setOpenModal(true)}>Ajouter un chauffeur</Button>

          <SearchInput
            type="text"
            placeholder="Rechercher par nom"
            value={filterText}
            onChange={e => handleSearch(e.target.value)}
          />

          <div style={{ marginTop: '20px' }}>
            <ExportButton onClick={() => exportToXLSX("liste-chauffeurs")}>Exporter en CSV</ExportButton>
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
                  data={filterText.length > 0 ? searchResult : listeChauffeurs}
                  pagination
                  highlightOnHover
                  responsive
                  noDataComponent={"Aucun chauffeur"}
                  title={"Liste des chauffeurs"}
                  paginationComponentOptions={paginationOptions}
                />
              </div>
          }


        </Container>

        <Modal show={openModal} onHide={handleClose} fullscreen>
          <Modal.Header closeButton>
            <Modal.Title>Crée un nouveau chauffeur</Modal.Title>
          </Modal.Header>
          <Modal.Body>

            <Form ref={formRef} noValidate validated={formValidated}>

              <Form.Group className="mb-3" controlId="">
                <Form.Label>Sélectionner une décheterie *</Form.Label>
                <Form.Select onChange={e => handleSelectedDecheterie(e)} aria-label="Default decheterie" required>
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
                <Form.Label>Nom *</Form.Label>
                <Form.Control onInput={e => setNom(e.target.value)} type="text" placeholder="Nom du chauffeur" required />
              </Form.Group>

              <Form.Group className="mb-3" controlId="">
                <Form.Label>Prénom *</Form.Label>
                <Form.Control onInput={e => setPrenom(e.target.value)} type="text" placeholder="Prénom du chauffeur" required />
              </Form.Group>

              <Form.Group className="mb-3" controlId="">
                <Form.Label>E-mail *</Form.Label>
                <Form.Control onInput={e => setEmail(e.target.value)} type="email" placeholder="E-mail du chauffeur" required />
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
      </div>
    </>
  )
};

export default ProtectedRoute(Chauffeurs);