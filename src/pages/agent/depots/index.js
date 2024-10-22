import NavBarComp from "@/components/NavbarAgent";
import SideNavBar from "@/components/SideBarNavAgent";
import ProtectedRoute from "@/components/ProtectedRouteAgent";
import { Container, Row, Button, Breadcrumb, Form, Spinner, Card, Modal } from "react-bootstrap";
import { useState, useRef, useEffect } from "react";
import axios from "axios";
import { format } from "date-fns";
import DataTable from 'react-data-table-component';
import { CSVLink } from 'react-csv';
import styled from 'styled-components';
import { useReactToPrint } from 'react-to-print';
import { useRouter } from "next/router";
import { getCookie } from "@/libs/clientCookie";
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

const Depots = () => {

  const router = useRouter();

  const tableRef = useRef();

  const signatureExutoireRef = useRef(null);

  const [filterText, setFilterText] = useState('');
  const [loadingData, setLoadingData] = useState(true);
  const [searchResult, setSearchResult] = useState([]);
  const [listeAgent, setListeAgent] = useState([]);
  const [listeDevis, setListeDevis] = useState([]);
  const [listeDechecheteries, setListeDecheteries] = useState([]);

  const [selectedRow, setSelectedRow] = useState(null);

  const [showModalValidation, setShowModalValidation] = useState(false);
  const [loadingBtn, setLoadingBtn] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  const [signatureExutoire, setSignatureExutoire] = useState(null);

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

    const userData = getCookie("agent");

    if (userData) {
      const data = JSON.parse(userData);

      axios.get("/api/administrateur/devis")
        .then(response => {
          if (response.data.success) {

            const filteredData = response.data.devis.filter(item => item.agentID === data.id);

            const sortedDevis = filteredData.sort((a, b) => b.numero - a.numero);
            setListeDevis(sortedDevis);
          }
        })
        .catch(e => console.log(e))

    }

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


  const columns = [
    {
      name: <p style={{ fontWeight: "bold", fontSize: 16 }}>N°</p>,
      selector: row => "00" + row.numero,
      sortable: true,
    },
    {
      name: <p style={{ fontWeight: "bold", fontSize: 16 }}>Date</p>,
      selector: row => format(new Date(row.date), "dd-MM-yyyy"),
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
      name: <p style={{ fontWeight: "bold", fontSize: 16 }}>Société</p>,
      selector: row => {
        if (row.client.societe) {
          return row.client.nomSociete;
        } else {
          return "Particulier"
        }
      },
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
              <Button variant="warning" onClick={() => router.push("/agent/depots/details/" + row.id)} >Détails</Button>
              <Button variant="danger" onClick={() => handleAnnule(row.id)}>Annuler</Button>
            </div>

          )
        } else if (row.etat === "valide") {
          return (
            <div className="optionsButton">
              <Button variant="primary" onClick={() => router.push("/agent/depots/details/" + row.id)}>Imprimer</Button>
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
      const searchTerm = elt.toLowerCase();

      const filteredData = allData.filter(item => {
        const client = item.client;
        if (client.societe) {
          console.log("societe:" + client)
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
      <NavBarComp title="Gestions des dépots" />
      <div className="page-content">
        <SideNavBar />
        <Container>
          <Breadcrumb>
            <Breadcrumb.Item href="/dashboard/accueil">Accueil</Breadcrumb.Item>
            <Breadcrumb.Item active>Dépots Pro</Breadcrumb.Item>
          </Breadcrumb>

          <div style={{ marginTop: '20px', marginBottom: "20px" }}>
            <Button variant="success" onClick={() => router.push("/agent/nouveau-devis")} >Ajouter un nouveau dépot</Button>
          </div>


          <SearchInput
            type="text"
            placeholder="Rechercher par client"
            value={filterText}
            onInput={e => handleSearch(e.target.value)}
          />
          <div style={{ marginTop: '20px' }}>
            <ExportButton onClick={() => exportToXLSX("liste-depots")}>Exporter en CSV</ExportButton>
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
                  data={filterText.length > 0 ? searchResult : listeDevis}
                  pagination
                  highlightOnHover
                  responsive
                  noDataComponent={"Aucun dépot"}
                  onRowClicked={handleRowClicked}
                  title={"Liste des dépots"}
                  paginationComponentOptions={paginationOptions}
                />
            }
          </div>


          <Modal show={showModalValidation} onHide={() => setShowModalValidation(false)} fullscreen>
            <Modal.Header closeButton>
              <Modal.Title>Confirmer la signature EXUTOIRE - dépots n° {selectedRow && "00" + selectedRow.numero} </Modal.Title>
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

export default ProtectedRoute(Depots);