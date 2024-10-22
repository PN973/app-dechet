import NavBarComp from "@/components/Navbar";
import SideNavBar from "@/components/SideNavBar";
import ProtectedRoute from "@/components/ProtectedRoute";
import { Container, Button, Breadcrumb, Form, Spinner, Toast, ToastContainer, Modal } from "react-bootstrap";
import { useState, useRef, useEffect } from "react";
import axios from "axios";
import styles from "@/styles/Agent.module.css";
import DataTable from 'react-data-table-component';
import styled from 'styled-components';
import { useReactToPrint } from 'react-to-print';
import { usePlacesWidget } from "react-google-autocomplete";
import { useRouter } from "next/router";
import TagsInput from 'react-tagsinput';
import 'react-tagsinput/react-tagsinput.css';

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




const Clients = () => {

  const router = useRouter();

  const tableRef = useRef(null);
  const entrepriseRef = useRef(null);
  const particulierRef = useRef(null);
  const formRef = useRef(null);

  const [openClientModal, setOpenClientModal] = useState(false);
  const [formValidated, setFormValidated] = useState(false);

  const [isEntreprise, setIsEntreprise] = useState(true);
  const [nomSociete, setNomSociete] = useState("");
  const [numSiret, setNumSiret] = useState("");
  const [nomGerant, setNomGerant] = useState("");
  const [prenomGerant, setPrenomGerant] = useState("");
  const [courriel, setCourriel] = useState("");
  const [telephone, setTelephone] = useState("");
  const [ville, setVille] = useState("");
  const [codePostal, setCodePostal] = useState("");
  const [adresse, setAdresse] = useState("");
  const [nomParticulier, setNomParticulier] = useState("");
  const [prenomParticulier, setPrenomParticulier] = useState("");
  const [loadingBtn, setLoadingBtn] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const [showToast, setShowToast] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [listeClients, setListeClients] = useState([]);
  const [filterText, setFilterText] = useState('');
  const [searchResult, setSearchResult] = useState([]);

  const [listeDecheteries, setListeDecheteries] = useState([]);
  const [decheterie, setDecheterie] = useState("");

  //Immatriculation véhicule
  const [immatriculation, setImmatriculation] = useState("");
  const [tags, setTags] = useState([]);

  const [selectedRow, setSelectedRow] = useState(null);
  const [showModalModification, setShowModalModification] = useState(false);


  const { ref, autocompleteRef } = usePlacesWidget({
    apiKey: process.env.MAPS_API_KEY,
    onPlaceSelected: (place) => {
      console.log(place);
    }
  });

  useEffect(() => {
    axios.get("/api/administrateur/clients")
      .then(response => {
        if (response.data.success) {
          setListeClients(response.data.clients);
          setLoadingData(false);
        }
      })
      .catch(e => {
        console.log(e)
      })

    axios.get("/api/administrateur/decheteries")
      .then(response => {
        if (response.data.success) {
          setListeDecheteries(response.data.decheteries);
          //setLoadingData(false);
        }
      })
      .catch(e => {
        console.log(e)
      })

  }, []);

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
    setImmatriculation(formatted);
  };


  const columns = [
    {
      name: <p style={{ fontWeight: "bold", fontSize: 16 }}>ID</p>,
      selector: (row, index) => index + 1,  // Génère un ID en fonction de l'index
      sortable: true,
    },
    {
      name: <p style={{ fontWeight: "bold", fontSize: 16 }}>Société</p>,
      selector: row => {
        if (row.nomSociete) {
          return row.nomSociete;
        } else {
          return "Particulier";
        }
      },
      sortable: true,
    },

    {
      name: <p style={{ fontWeight: "bold", fontSize: 16 }}>Courriel</p>,
      selector: row => row.email,
      sortable: true,
    },
    {
      name: <p style={{ fontWeight: "bold", fontSize: 16 }}>Téléphone</p>,
      selector: row => row.telephone,
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
              <Button variant="warning" onClick={() => handleModification(row.id)} >Modifier</Button>
            </div>

          )
        } else if (row.etat === "valide") {
          return (
            <div className="optionsButton">
              <Button variant="primary" onClick={() => router.push("/dashboard/clients/depots/" + row.id)}>Dépots</Button>
              <Button variant="warning" onClick={() => handleModification(row.id)}>Modifier</Button>
              <Button variant="danger" onClick={() => handleDesactivation(row.id)} >Désactiver</Button>
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


  const handleTypeClientChange = (event) => {
    setIsEntreprise(event.target.value === 'Entreprise');
    if (isEntreprise) {
      entrepriseRef.current.style.display = "none";
      particulierRef.current.style.display = "block";
    } else {
      entrepriseRef.current.style.display = "block";
      particulierRef.current.style.display = "none";
    }
  }


  const handleSubmitClient = (event) => {
    const form = event.currentTarget;
    if (form.checkValidity() === false) {
      event.preventDefault();
      event.stopPropagation();
    } else {
      setFormValidated(true);

      setLoadingBtn(true);
      axios.post("/api/administrateur/clients", { tags, isEntreprise, decheterie, nomSociete, numSiret, nomGerant, prenomGerant, immatriculation, courriel, telephone, ville, codePostal, adresse, nomParticulier, prenomParticulier })
        .then(response => {
          setLoadingBtn(false);

          if (response.data.success) {
            formRef.current.reset();
            setFormValidated(false);
            setImmatriculation("");
            setOpenClientModal(false);
            setShowToast(true);
            setListeClients([response.data.client, ...listeClients]);
          } else {
            setErrorMsg(response.data.message);
            setTimeout(() => setErrorMsg(null), 5000);
          }
        })
        .catch(e => {
          setLoadingBtn(false);
        })

    }

  }

  const handleSearch = (elt) => {
    const allData = [...listeClients];
    if (elt.length > 0) {
      setFilterText(elt);
      const searchTerm = elt.toLowerCase();

      const filteredData = allData.filter(item => {
        const client = item;
        if (client.societe) {
          // Si le client est une société, recherche dans le nom de la société
          return client.nomSociete.toLowerCase().includes(searchTerm);
        } else {
          // Si le client est un particulier, recherche dans le nom et le prénom
          return (
            (client.nom && client.nom.toLowerCase().includes(searchTerm)) ||
            (client.prenom && client.prenom.toLowerCase().includes(searchTerm))
          );
        }
      });

      setSearchResult(filteredData);
    } else {
      setFilterText("");
      setSearchResult(allData); // Réinitialise le résultat de recherche lorsque le terme de recherche est vide
    }
  }


  const handleRowClicked = row => {
    console.log("Row data:", row);
  };


  const handleActivation = (id) => {

    axios.post("/api/administrateur/activer-client", { id })
      .then(response => {
        if (response.data.success) {
          const updatedClient = response.data.client;

          // Mettre à jour la liste des agents
          setListeClients((prevListeClient) => {
            return prevListeClient.map(client =>
              client.id === id ? updatedClient : client
            );
          });
        }
      })
      .catch(e => console.log(e))

  }

  const handleDesactivation = (id) => {
    axios.post("/api/administrateur/desactiver-client", { id })
      .then(response => {
        if (response.data.success) {
          const updatedClient = response.data.client;

          // Mettre à jour la liste des agents
          setListeClients((prevListeClient) => {
            return prevListeClient.map(client =>
              client.id === id ? updatedClient : client
            );
          });
        }
      })
      .catch(e => console.log(e))
  }


  const handleModification = (id) => {
    const data = listeClients.find(elt => elt.id === id);
    if (data) {

      if (data.societe) {

        setNomSociete(data.nomSociete);
        setNomGerant(data.nom);
        setPrenomGerant(data.prenom);
        setCourriel(data.email);
        setTelephone(data.telephone);
        setVille(data.ville);
        setCodePostal(data.codePostal);
        setAdresse(data.adresse);
        setImmatriculation(data.immatriculation);
        setTags(data.immatriculation);

        setSelectedRow(data);
        setShowModalModification(true);
      } else {

        setNomParticulier(data.nom);
        setPrenomParticulier(data.prenom);
        setCourriel(data.email);
        setTelephone(data.telephone);
        setVille(data.ville);
        setCodePostal(data.codePostal);
        setAdresse(data.adresse);
        setImmatriculation(data.immatriculation);
        setTags(data.immatriculation);

        setSelectedRow(data);
        setShowModalModification(true);
      }

    }
  }



  const handleModifSociete = (event) => {
    const form = event.currentTarget;
    if (form.checkValidity() === false) {
      event.preventDefault();
      event.stopPropagation();
    } else {
      setFormValidated(true);
      setLoadingBtn(true);

      axios.post("/api/administrateur/modifier-societe", { tags, id: selectedRow.id, nomSociete, prenomGerant, nomGerant, immatriculation, courriel, telephone, ville, codePostal, adresse })
        .then(response => {
          setLoadingBtn(false);
          if (response.data.success) {
            setFormValidated(false);

            const updatedClient = response.data.client;

            // Mettre à jour la liste des agents
            setListeClients((prevListeClient) => {
              return prevListeClient.map(client =>
                client.id === selectedRow.id ? updatedClient : client
              );
            });
            setShowModalModification(false);
            setSelectedRow(null);
          } else {
            setErrorMsg(response.data.message);
            setTimeout(() => setErrorMsg(null), 5000);
          }
        })
        .catch(e => console.log(e))
    }
  }

  const handleModifClient = (event) => {
    const form = event.currentTarget;
    if (form.checkValidity() === false) {
      event.preventDefault();
      event.stopPropagation();
    } else {
      setFormValidated(true);
      setLoadingBtn(true);

      axios.post("/api/administrateur/modifier-particulier", { tags, id: selectedRow.id, prenomParticulier, nomParticulier, immatriculation, courriel, telephone, ville, codePostal, adresse })
        .then(response => {
          setLoadingBtn(false);
          if (response.data.success) {
            setFormValidated(false);
            const updatedClient = response.data.client;

            // Mettre à jour la liste des agents
            setListeClients((prevListeClient) => {
              return prevListeClient.map(client =>
                client.id === selectedRow.id ? updatedClient : client
              );
            });
            setShowModalModification(false);
            setSelectedRow(null);
          } else {
            setErrorMsg(response.data.message);
            setTimeout(() => setErrorMsg(null), 5000);
          }
        })
        .catch(e => console.log(e))
    }
  }

  const exportToXLSX = (filename) => {

    let allCLients = [...listeClients];

    // Transformation des données en format adapté à xlsx
    const worksheetData = allCLients.map((item, itemIndex) => {

      return ({
        ID: itemIndex + 1,
        Nom_societe: item.nomSociete ? item.nomSociete : "Particulier",
        Nom_gerant: item.nom,
        Prenom_gerant: item.prenom,
        Numero_siret: item.numSiret,
        immatriculation: item.immatriculation ? item.immatriculation : "",
        Courriel: item.email,
        Telephone: item.telephone,
        Ville: item.ville,
        Adresse: item.adresse,
        Code_postal: item.codePostal,
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

  const handleChange = (newTags) => {
    const regex = /^[A-Z]{2}-\d{3}-[A-Z]{2}$/;
    const validTags = newTags.filter(tag => regex.test(tag));
    /*
   if (validTags.length !== newTags.length) {
     setError('Les immatriculations doivent avoir le format AB-123-BC');
   } else {
     setError(null);
   }
     */

    setTags(validTags);
  };

  const handleChangeInput = (tag) => {
    const regex = /^[A-Z]{2}-\d{3}-[A-Z]{2}$/;
    if (!regex.test(tag)) {
      //setError('Les immatriculations doivent avoir le format AB-123-BC');
      return '';
    }
    //setError(null);
    return tag;
  };


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
              <Toast.Body style={{ color: "white" }}>Nouveau client crée avec succès.</Toast.Body>
            </Toast>
          </ToastContainer>
          <Breadcrumb>
            <Breadcrumb.Item href="/dashboard/accueil">Accueil</Breadcrumb.Item>
            <Breadcrumb.Item active>Clients</Breadcrumb.Item>
          </Breadcrumb>
          <div style={{ marginTop: '20px', marginBottom: "20px" }}>
            <Button variant="success" onClick={() => setOpenClientModal(!openClientModal)}>Ajouter un nouveau client</Button>
          </div>

          <SearchInput
            type="text"
            placeholder="Rechercher par nom"
            value={filterText}
            onChange={e => handleSearch(e.target.value)}
          />
          <div style={{ marginTop: '20px' }}>
            <ExportButton onClick={() => exportToXLSX("liste-clients")}>Exporter en CSV</ExportButton>
            <PrintButton onClick={handlePrint}>Imprimer</PrintButton>
          </div>
          <div ref={tableRef}>
            {
              loadingData ?
                <div className="loader-division" style={{ marginTop: 20 }}>
                  <Spinner variant="secondary"></Spinner>
                </div>
                :
                <DataTable
                  columns={columns}
                  data={filterText.length > 0 ? searchResult : listeClients}
                  pagination
                  highlightOnHover
                  responsive
                  noDataComponent={"Aucun client"}
                  onRowClicked={handleRowClicked}
                  title={"Liste des clients"}
                  paginationComponentOptions={paginationOptions}
                />

            }

          </div>

          <Modal show={openClientModal} onHide={() => setOpenClientModal(false)} fullscreen>
            <Modal.Header closeButton>
              <Modal.Title>Ajouter un nouveau client</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <Form ref={formRef} noValidate validated={formValidated} onSubmit={handleSubmitClient}>
                <Form.Group className="mb-3" controlId="">
                  <Form.Label style={{ marginRight: "10px" }}>Type de client:</Form.Label>

                  <Form.Check
                    type="radio"
                    label="Société"
                    name="typeClient"
                    id="typeClientEntreprise"
                    value="Entreprise"
                    checked={isEntreprise}
                    inline
                    onChange={handleTypeClientChange}
                  />
                  <Form.Check
                    type="radio"
                    label="Particulier"
                    name="typeClient"
                    id="typeClientParticulier"
                    value="Particulier"
                    checked={!isEntreprise}
                    inline
                    onChange={handleTypeClientChange}
                  />

                </Form.Group>

                <Form.Group className="mb-3" controlId="">
                  <Form.Label>Sélectionner une décheterie *</Form.Label>
                  <Form.Select onChange={e => setDecheterie(e.target.value)} aria-label="Default decheterie" required>
                    <option value={""}>Sélectionner une déchèterie</option>
                    {
                      listeDecheteries.length > 0 && listeDecheteries.map((res, index) => {
                        return (
                          <option key={res.id} value={res.id}>{res.nom}</option>
                        )
                      })
                    }
                  </Form.Select>
                </Form.Group>

                <div ref={entrepriseRef}>
                  <Form.Group className="mb-3" controlId="">
                    <Form.Label>Nom de la société*</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="Entrer le nom de la société"
                      required={isEntreprise}
                      onInput={e => setNomSociete(e.target.value)}
                    />
                  </Form.Group>

                  <Form.Group className="mb-3" controlId="">
                    <Form.Label>N° de siret*</Form.Label>
                    <Form.Control
                      onInput={e => setNumSiret(e.target.value)}
                      required={isEntreprise}
                      type="text"
                      placeholder="Numéro de siret"
                    />
                  </Form.Group>

                  <Form.Group className="mb-3" controlId="">
                    <Form.Label>Nom du gérant*</Form.Label>
                    <Form.Control
                      onInput={e => setNomGerant(e.target.value)}
                      required={isEntreprise}
                      type="text"
                      placeholder="Nom du gérant"
                    />
                  </Form.Group>

                  <Form.Group className="mb-3" controlId="">
                    <Form.Label>Prénom du gérant*</Form.Label>
                    <Form.Control
                      required={isEntreprise}
                      type="text"
                      placeholder="Prénom du gérant"
                      onInput={e => setPrenomGerant(e.target.value)}
                    />
                  </Form.Group>
                </div>

                <div ref={particulierRef} style={{ display: "none" }}>
                  <Form.Group className="mb-3" controlId="">
                    <Form.Label>Nom*</Form.Label>
                    <Form.Control
                      required={!isEntreprise}
                      type="text"
                      placeholder="Nom du client"
                      onInput={e => setNomParticulier(e.target.value)}
                    />
                  </Form.Group>

                  <Form.Group className="mb-3" controlId="">
                    <Form.Label>Prénom*</Form.Label>
                    <Form.Control
                      required={!isEntreprise}
                      type="text"
                      placeholder="Prénom du client"
                      onInput={e => setPrenomParticulier(e.target.value)}
                    />
                  </Form.Group>
                </div>

                <Form.Group className="mb-3" controlId="">
                  <Form.Label>Immatriculations (du type AB-123-BC)</Form.Label>
                  <TagsInput
                    value={tags}
                    onChange={handleChange}
                    inputProps={{ placeholder: 'Ajouter' }}
                    inputValue={handleChangeInput}
                    delimiters={['Enter', 'Tab', ',']}
                  />
                </Form.Group>


                <Form.Group className="mb-3" controlId="">
                  <Form.Label>Courriel*</Form.Label>
                  <Form.Control
                    required
                    type="email"
                    placeholder="Entrer l'email"
                    onInput={e => setCourriel(e.target.value)}
                  />
                </Form.Group>

                <Form.Group className="mb-3" controlId="">
                  <Form.Label>Téléphone*</Form.Label>
                  <Form.Control
                    required
                    type="tel"
                    placeholder="Entrer le numéro de téléphone"
                    onInput={e => setTelephone(e.target.value)}
                  />
                </Form.Group>

                <Form.Group className="mb-3" controlId="">
                  <Form.Label>Ville*</Form.Label>
                  <Form.Control
                    ref={ref}
                    required
                    type="text"
                    placeholder="Entrer la ville"
                    onInput={e => setVille(e.target.value)}
                  />
                </Form.Group>

                <Form.Group className="mb-3" controlId="">
                  <Form.Label>Code postal*</Form.Label>
                  <Form.Control
                    required
                    type="text"
                    placeholder="Entrer le code postal"
                    onInput={e => setCodePostal(e.target.value)}
                  />
                </Form.Group>

                <Form.Group className="mb-3" controlId="">
                  <Form.Label>Adresse*</Form.Label>
                  <Form.Control
                    required
                    type="text"
                    placeholder="Entrer l'adresse"
                    onInput={e => setAdresse(e.target.value)}
                  />
                </Form.Group>
                <div className={styles.centeredButton}>
                  <p className="error-display">{errorMsg && errorMsg}</p>
                </div>

              </Form>
            </Modal.Body>
            <Modal.Footer>

              <Button variant="secondary" onClick={() => { setOpenClientModal(false), setLoadingBtn(false), setIsEntreprise(true) }}>
                Annuler
              </Button>
              {
                loadingBtn ?
                  <Spinner variant="success"></Spinner>
                  :
                  <Button variant="success" type="button" onClick={handleSubmitClient}>
                    Enregistrer
                  </Button>
              }

            </Modal.Footer>
          </Modal>

          {/* Modifier les informations d'un client */}

          <Modal show={showModalModification} onHide={() => setShowModalModification(false)} fullscreen>
            <Modal.Header closeButton>
              <Modal.Title>Modifier le client :
                {selectedRow && (
                  selectedRow.societe
                    ? " " + selectedRow.nomSociete
                    : ` ${selectedRow.nom} ${selectedRow.prenom}`
                )} </Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <Form ref={formRef} noValidate validated={formValidated} onSubmit={handleSubmitClient}>
                <Form.Group className="mb-3" controlId="">
                  <Form.Label style={{ marginRight: "10px" }}>Type de client:</Form.Label>

                  <Form.Check
                    type="radio"
                    label="Société"
                    name="typeClient"
                    id="typeClientEntreprise"
                    value="Entreprise"
                    checked={selectedRow && selectedRow.societe ? true : false}
                    inline
                    onChange={handleTypeClientChange}
                    disabled
                  />
                  <Form.Check
                    type="radio"
                    label="Particulier"
                    name="typeClient"
                    id="typeClientParticulier"
                    value="Particulier"
                    checked={selectedRow && !selectedRow.societe ? true : false}
                    inline
                    onChange={handleTypeClientChange}
                    disabled
                  />

                </Form.Group>
                <Form.Group className="mb-3" controlId="">
                  <Form.Label>Sélectionner une décheterie *</Form.Label>
                  <Form.Select onChange={e => setDecheterie(e.target.value)} aria-label="Default decheterie" required disabled>
                    {selectedRow ? (
                      (() => {
                        const decheterie = listeDecheteries.find(decheterie => decheterie.id === selectedRow.decheterieID);
                        return (
                          <option value={decheterie ? decheterie.id : ''}>
                            {decheterie ? decheterie.nom : 'Sélectionner'}
                          </option>
                        );
                      })()
                    ) : null}
                  </Form.Select>
                </Form.Group>
                {selectedRow && selectedRow.societe ?
                  <div>
                    <Form.Group className="mb-3" controlId="">
                      <Form.Label>Nom de la société*</Form.Label>
                      <Form.Control
                        type="text"
                        placeholder="Entrer le nom de la société"
                        required={selectedRow && selectedRow.societe ? true : false}
                        onInput={e => setNomSociete(e.target.value)}
                        defaultValue={selectedRow && selectedRow.nomSociete}
                      />
                    </Form.Group>

                    <Form.Group className="mb-3" controlId="">
                      <Form.Label>N° de siret*</Form.Label>
                      <Form.Control
                        onInput={e => setNumSiret(e.target.value)}
                        required={selectedRow && selectedRow.societe ? true : false}
                        type="text"
                        placeholder="Numéro de siret"
                        defaultValue={selectedRow && selectedRow.numSiret}
                      />
                    </Form.Group>

                    <Form.Group className="mb-3" controlId="">
                      <Form.Label>Nom du gérant*</Form.Label>
                      <Form.Control
                        onInput={e => setNomGerant(e.target.value)}
                        required={selectedRow && selectedRow.societe ? true : false}
                        type="text"
                        placeholder="Nom du gérant"
                        defaultValue={selectedRow && selectedRow.nom}
                      />
                    </Form.Group>

                    <Form.Group className="mb-3" controlId="">
                      <Form.Label>Prénom du gérant*</Form.Label>
                      <Form.Control
                        required={selectedRow && selectedRow.societe ? true : false}
                        type="text"
                        placeholder="Prénom du gérant"
                        onInput={e => setPrenomGerant(e.target.value)}
                        defaultValue={selectedRow && selectedRow.prenom}
                      />
                    </Form.Group>
                  </div>
                  :
                  <div >
                    <Form.Group className="mb-3" controlId="">
                      <Form.Label>Nom*</Form.Label>
                      <Form.Control
                        required={selectedRow && !selectedRow.societe ? true : false}
                        type="text"
                        placeholder="Nom du client"
                        onInput={e => setNomParticulier(e.target.value)}
                        defaultValue={selectedRow && selectedRow.nom}
                      />
                    </Form.Group>

                    <Form.Group className="mb-3" controlId="">
                      <Form.Label>Prénom*</Form.Label>
                      <Form.Control
                        required={selectedRow && !selectedRow.societe ? true : false}
                        type="text"
                        placeholder="Prénom du client"
                        onInput={e => setPrenomParticulier(e.target.value)}
                        defaultValue={selectedRow && selectedRow.prenom}
                      />
                    </Form.Group>
                  </div>
                }

                <Form.Group className="mb-3" controlId="">
                  <Form.Label>Immatriculations (du type AB-123-BC)</Form.Label>
                  <TagsInput
                    value={tags}
                    onChange={handleChange}
                    inputProps={{ placeholder: 'Ajouter' }}
                    inputValue={handleChangeInput}
                    delimiters={['Enter', 'Tab', ',']}
                  />
                </Form.Group>

                <Form.Group className="mb-3" controlId="">
                  <Form.Label>Courriel*</Form.Label>
                  <Form.Control
                    required
                    type="email"
                    placeholder="Entrer l'email"
                    onInput={e => setCourriel(e.target.value)}
                    defaultValue={selectedRow && selectedRow.email}
                  />
                </Form.Group>

                <Form.Group className="mb-3" controlId="">
                  <Form.Label>Téléphone*</Form.Label>
                  <Form.Control
                    required
                    type="tel"
                    placeholder="Entrer le numéro de téléphone"
                    onInput={e => setTelephone(e.target.value)}
                    defaultValue={selectedRow && selectedRow.telephone}
                  />
                </Form.Group>

                <Form.Group className="mb-3" controlId="">
                  <Form.Label>Ville*</Form.Label>
                  <Form.Control
                    ref={ref}
                    required
                    type="text"
                    placeholder="Entrer la ville"
                    onInput={e => setVille(e.target.value)}
                    defaultValue={selectedRow && selectedRow.ville}
                  />
                </Form.Group>

                <Form.Group className="mb-3" controlId="">
                  <Form.Label>Code postal*</Form.Label>
                  <Form.Control
                    required
                    type="text"
                    placeholder="Entrer le code postal"
                    onInput={e => setCodePostal(e.target.value)}
                    defaultValue={selectedRow && selectedRow.codePostal}
                  />
                </Form.Group>

                <Form.Group className="mb-3" controlId="">
                  <Form.Label>Adresse*</Form.Label>
                  <Form.Control
                    required
                    type="text"
                    placeholder="Entrer l'adresse"
                    onInput={e => setAdresse(e.target.value)}
                    defaultValue={selectedRow && selectedRow.adresse}
                  />
                </Form.Group>
                <div className={styles.centeredButton}>
                  <p className="error-display">{errorMsg && errorMsg}</p>
                </div>

              </Form>
            </Modal.Body>
            <Modal.Footer>

              <Button variant="secondary" onClick={() => { setShowModalModification(false), setLoadingBtn(false), setIsEntreprise(true) }}>
                Annuler
              </Button>
              {
                loadingBtn ?
                  <Spinner variant="success"></Spinner>
                  :
                  selectedRow && selectedRow.societe ?
                    <Button variant="success" type="button" onClick={handleModifSociete}>
                      Modifier la société
                    </Button>
                    :
                    <Button variant="success" type="button" onClick={handleModifClient}>
                      Modifier le client
                    </Button>

              }

            </Modal.Footer>
          </Modal>


        </Container>
      </div>
    </>
  )
};

export default ProtectedRoute(Clients);