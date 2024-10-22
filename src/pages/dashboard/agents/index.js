import NavBarComp from "@/components/Navbar";
import SideNavBar from "@/components/SideNavBar";
import ProtectedRoute from "@/components/ProtectedRoute";
import { Container, Button, Breadcrumb, InputGroup, Form, Spinner, Toast, ToastContainer, Modal } from "react-bootstrap";
import { useState, useRef, useEffect } from "react";
import axios from "axios";
import styles from "@/styles/Agent.module.css";
import generateDefaultPassword from "@/libs/generatePassword";
import { EyeSlash, Eye } from "react-bootstrap-icons";
import { useRouter } from "next/router";

import DataTable from 'react-data-table-component';
import styled from 'styled-components';
import { useReactToPrint } from 'react-to-print';

import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';



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



const Agents = () => {


  const tableRef = useRef();

  const formRef = useRef(null);

  const router = useRouter();

  const [openClientModal, setOpenClientModal] = useState(false);
  const [formValidated, setFormValidated] = useState(false);

  const [showToast, setShowToast] = useState(false);
  const [filterText, setFilterText] = useState('');
  const [loadingData, setLoadingData] = useState(true);
  const [searchResult, setSearchResult] = useState([]);

  const [listeAgent, setListeAgent] = useState([]);
  const [listeDechecheteries, setListeDecheteries] = useState([]);

  const [loadingBtn, setLoadingBtn] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  const [openPass, setOpenPass] = useState(false);
  const [password, setPassword] = useState("");
  const [nom, setNom] = useState("");
  const [prenom, setPrenom] = useState("");
  const [telephone, setTelephone] = useState("");
  const [email, setEmail] = useState("");
  const [decheterie, setDecheterie] = useState("");
  const [sendPass, setSendPass] = useState(false);

  const [showDesactivationModal, setShowDesactivationModal] = useState(false);
  const [showActivationModal, setShowActivationModal] = useState(false);
  const [desactivationAgent, setDesactivationAgent] = useState(null);



  useEffect(() => {
    axios.get("/api/administrateur/agent")
      .then(response => {
        if (response.data.success) {
          setListeAgent(response.data.agents);
          setLoadingData(false);
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

  const handleActivation = (id) => {
    const agent = listeAgent.find(elt => elt.id === id);
    if (agent) {
      setShowActivationModal(true);
      setDesactivationAgent(agent);
    }
  }

  const handleDesactivation = (id) => {
    const agent = listeAgent.find(elt => elt.id === id);
    if (agent) {
      setShowDesactivationModal(true);
      setDesactivationAgent(agent);
    }
  }




  const columns = [
    {
      name: <p style={{ fontWeight: "bold", fontSize: 16 }}>ID</p>,
      selector: (row, index) => index + 1,  // Génère un ID en fonction de l'index
      sortable: true,
    },
    {
      name: <p style={{ fontWeight: "bold", fontSize: 16 }}>Nom & Prénom</p>,
      selector: row => row.nom + " " + row.prenom,
      sortable: true,
    },
    {
      name: <p style={{ fontWeight: "bold", fontSize: 16 }}>E-mail</p>,
      selector: row => row.email,
      sortable: true,
    },
    {
      name: <p style={{ fontWeight: "bold", fontSize: 16 }}>Téléphone</p>,
      selector: row => row.telephone,
      sortable: true,
    },
    {
      name: <p style={{ fontWeight: "bold", fontSize: 16 }}>Déchèterie</p>,
      selector: row => {
        const decheterie = listeDechecheteries.find(d => d.id === row.decheterieID);
        return decheterie ? decheterie.nom : 'Déchèterie désactivée';
      },
      sortable: true,
    },
    {
      name: <p style={{ fontWeight: "bold", fontSize: 16 }}>Etat</p>,
      selector: row => {
        if (row.etat === "invalid") {
          return <p className="enAttente">Désactivé</p>
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
              <Button variant="warning" onClick={() => router.push(`/dashboard/agents/profil/${row.id}`)}>Modifier</Button>
            </div>

          )
        } else if (row.etat === "valide") {
          return (
            <div className="optionsButton">
              <Button variant="danger" onClick={() => handleDesactivation(row.id)}>Désactiver</Button>
              <Button variant="warning" onClick={() => router.push(`/dashboard/agents/profil/${row.id}`)}>Modifier</Button>
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
    const allData = [...listeAgent];
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

  const handleSubmit = async (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    if (form.checkValidity() === false) {
      event.stopPropagation();
    } else {
      setLoadingBtn(true);
      setFormValidated(true);
      try {
        const response = await axios.post("/api/administrateur/agent", {
          nom,
          prenom,
          telephone,
          email,
          password,
          decheterie,
          sendPass
        });
        setLoadingBtn(false);
        if (response.data.success) {
          const agentList = [...listeAgent, response.data.agent];
          setListeAgent(agentList);

          setNom('');
          setPrenom('');
          setTelephone('');
          setEmail('');
          setPassword('');
          setDecheterie('');
          setSendPass(false);
          setFormValidated(false);
          setShowToast(true);
          setOpenClientModal(false);
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

  const handleRowClicked = row => {
    console.log("Row data:", row);
  };

  const confirmDesactivation = async () => {

    axios.post("/api/administrateur/desactivation-agent", { agent: desactivationAgent })
      .then(response => {
        if (response.data.success) {
          const updatedAgent = response.data.agent;

          // Mettre à jour la liste des agents
          setListeAgent((prevListeAgent) => {
            return prevListeAgent.map(agent =>
              agent.id === desactivationAgent.id ? updatedAgent : agent
            );
          });

          setShowDesactivationModal(false);
          setDesactivationAgent(null);
        }
      })
      .catch(e => {
        console.log(e)
      })
  }

  const confirmActivation = async () => {
    axios.post("/api/administrateur/activation-agent", { agent: desactivationAgent })
      .then(response => {
        if (response.data.success) {
          const updatedAgent = response.data.agent;

          // Mettre à jour la liste des agents
          setListeAgent((prevListeAgent) => {
            return prevListeAgent.map(agent =>
              agent.id === desactivationAgent.id ? updatedAgent : agent
            );
          });

          setShowActivationModal(false);
          setDesactivationAgent(null);
        }
      })
      .catch(e => {
        console.log(e)
      })
  }

  const exportToXLSX = (filename) => {

    const allAgents = [...listeAgent];
    // Transformation des données en format adapté à xlsx
    const worksheetData = allAgents.map((item, itemIndex) => {
      const id = itemIndex + 1;
      const decheterie = listeDechecheteries.find(elt => elt.id === item.decheterieID);
      return ({
        ID: id,
        Nom: item.nom,
        Prénom: item.prenom,
        Email: item.email,
        Téléphone: item.telephone,
        Déchèterie: decheterie.nom,
        Etat: item.etat === "valide" ? "Activé" : "Désactivé"
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

  const dataTest = [
    { name: 'John Doe', age: 28, email: 'john.doe@example.com' },
    { name: 'Jane Smith', age: 32, email: 'jane.smith@example.com' },
    // ajoutez d'autres objets ici
  ];






  return (
    <>
      <NavBarComp title="Gestions des agents" />
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
              <Toast.Body style={{ color: "white" }}>Nouveau agent enregistré avec succès.</Toast.Body>
            </Toast>
          </ToastContainer>
          <Breadcrumb>
            <Breadcrumb.Item href="/dashboard/accueil">Accueil</Breadcrumb.Item>
            <Breadcrumb.Item active>Agents</Breadcrumb.Item>
          </Breadcrumb>

          <div style={{ marginTop: '20px', marginBottom: "20px" }}>
            <Button variant="success" onClick={() => setOpenClientModal(!openClientModal)}>Ajouter un nouveau agent</Button>
          </div>


          <SearchInput
            type="text"
            placeholder="Rechercher par nom"
            onChange={e => handleSearch(e.target.value)}
          />
          <div style={{ marginTop: '20px' }}>
            <ExportButton onClick={() => exportToXLSX("liste-agents")}>Exporter en CSV</ExportButton>
            <PrintButton onClick={handlePrint}>Imprimer</PrintButton>
          </div>

          {
            loadingData ?
              <div className="loader-division" style={{ marginTop: 20 }}>
                <Spinner variant="secondary"></Spinner>
              </div>
              :
              <DataTable
                columns={columns}
                data={filterText.length > 0 ? searchResult : listeAgent}
                pagination
                highlightOnHover
                responsive
                noDataComponent={"Aucun agent"}
                onRowClicked={handleRowClicked}
                title={"Liste des agents"}
                paginationComponentOptions={paginationOptions}
                resizableColumns={true}
                ref={tableRef}
              />
          }

          <Modal show={openClientModal} onHide={() => setOpenClientModal(false)} fullscreen>
            <Modal.Header closeButton>
              <Modal.Title>Ajouter un nouveau agent</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <Form ref={formRef} noValidate validated={formValidated} onSubmit={handleSubmit}>
                <Form.Group className="mb-3" controlId="">
                  <Form.Label>Nom *</Form.Label>
                  <Form.Control required value={nom} onInput={e => setNom(e.target.value)} type="text" placeholder="Nom de l'agent" />
                </Form.Group>

                <Form.Group className="mb-3" controlId="">
                  <Form.Label>Prénom *</Form.Label>
                  <Form.Control required value={prenom} onInput={e => setPrenom(e.target.value)} type="text" placeholder="Prénom de l'agent" />
                </Form.Group>

                {/*
                  <Form.Group className="mb-3" controlId="">
                  <Form.Label>Téléphone *</Form.Label>
                  <Form.Control required value={telephone} onInput={e => setTelephone(e.target.value)} type="tel" placeholder="Téléphone de l'agent" />
                </Form.Group>
                */}
                <Form.Group className="mb-3" controlId="">
                  <Form.Label>E-mail *</Form.Label>
                  <Form.Control required value={email} onInput={e => setEmail(e.target.value)} type="email" placeholder="Adresse email" />
                </Form.Group>

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




                <Form.Label>Mot de passe *</Form.Label>
                <InputGroup className="mb-3">
                  <Form.Control required onInput={e => setPassword(e.target.value)} aria-label="Configuration mot de passe" type={openPass ? "text" : "password"} placeholder="Mot de passe" value={password} />
                  <InputGroup.Text onClick={() => setOpenPass(!openPass)} >
                    {openPass ? <Eye /> : <EyeSlash />}
                  </InputGroup.Text>
                </InputGroup>


                <Button variant="secondary" type="button" onClick={generatePass}>
                  Générer un mot de passe
                </Button>

                <Form.Group className="mb-3" controlId="formBasicCheckbox">
                  <Form.Check type="checkbox" onClick={() => setSendPass(!sendPass)} label="Envoyer le mot de passe par mail" />
                </Form.Group>

                <div className={styles.centeredButton}>
                  <p className="error-display">{errorMsg && errorMsg}</p>
                </div>

              </Form>
            </Modal.Body>
            <Modal.Footer>

              <Button variant="secondary" onClick={() => { setOpenClientModal(false), setLoadingBtn(false) }}>
                Annuler
              </Button>
              {
                loadingBtn ?
                  <Spinner variant="success"></Spinner>
                  :
                  <Button variant="success" type="button" onClick={handleSubmit}>
                    Enregistrer
                  </Button>
              }

            </Modal.Footer>
          </Modal>

          <Modal show={showDesactivationModal} onHide={() => setShowDesactivationModal(false)}>
            <Modal.Header closeButton>
              <Modal.Title>Désactiver un agent</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              Voulez vous désactiver le compte de l'agent <strong> {desactivationAgent ? desactivationAgent.nom + " " + desactivationAgent.prenom : ""} </strong> ?
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={() => setShowDesactivationModal(false)}>
                Annuler
              </Button>
              <Button variant="primary" onClick={() => confirmDesactivation()}>
                Désactiver
              </Button>
            </Modal.Footer>
          </Modal>

          <Modal show={showActivationModal} onHide={() => setShowActivationModal(false)}>
            <Modal.Header closeButton>
              <Modal.Title>Activer un agent</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              Voulez vous activer le compte de l'agent <strong> {desactivationAgent ? desactivationAgent.nom + " " + desactivationAgent.prenom : ""} </strong> ?
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={() => setShowActivationModal(false)}>
                Annuler
              </Button>
              <Button variant="primary" onClick={() => confirmActivation()}>
                Activer
              </Button>
            </Modal.Footer>
          </Modal>



        </Container>
      </div>
    </>
  )
};

export default ProtectedRoute(Agents);