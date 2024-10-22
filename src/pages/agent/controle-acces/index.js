import ProtectedRouteAgent from "@/components/ProtectedRouteAgent";
import NavBarComp from "@/components/NavbarAgent";
import SideNavBar from "@/components/SideBarNavAgent";
import { Container, Button, Breadcrumb, Spinner, Modal } from "react-bootstrap";
import { useState, useRef, useEffect } from "react";
import axios from "axios";
import DataTable from 'react-data-table-component';
import { CSVLink } from 'react-csv';
import styled from 'styled-components';
import { useReactToPrint } from 'react-to-print';
import { format } from "date-fns";
import { useMyContext } from "@/context/Mycontext";
import Controle from "@/components/ControleAgent";
import { getCookie, removeCookie } from "@/libs/clientCookie";

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


const ControleAcces = () => {

  const { agentData } = useMyContext();

  const tableRef = useRef(null);

  const [showControlModal, setShowControlModal] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [filterText, setFilterText] = useState('');
  const [searchResult, setSearchResult] = useState([]);

  const [listeControles, setListeControles] = useState([]);

  const handleHide = () => setShowControlModal(false);

  useEffect(() => {

    const userData = getCookie("agent");

    if (userData) {
      const data = JSON.parse(userData);
      axios.get("/api/administrateur/enregistrer-controle")
        .then(response => {
          if (response.data.success) {

            const filteredData = response.data.controles.filter(item => item.agent.value === data.id);
            const sortedControles = filteredData.sort((a, b) => b.numero - a.numero);
            setListeControles(sortedControles)
          }
        })
        .catch(e => {
          console.log(e)
        })

      setLoadingData(false);

    }




  }, [showControlModal]);

  const columns = [
    {
      name: <p style={{ fontWeight: "bold", fontSize: 16 }}>N°</p>,
      selector: (row, index) => row.numero,  // Génère un ID en fonction de l'index
      sortable: true,
    },
    {
      name: <p style={{ fontWeight: "bold", fontSize: 16 }}>Date & heure</p>,
      selector: (row, index) => format(new Date(row.dateOperation), "dd-MM-yyyy") + " à " + row.heure,  // Génère un ID en fonction de l'index
      sortable: true,
    },
    {
      name: <p style={{ fontWeight: "bold", fontSize: 16 }}>Immatriculation</p>,
      selector: (row, index) => {
        if (row.immatriculation && row.immatriculation.length > 0) {
          return row.immatriculation.map((elt, index) => (
            <p key={index}>{elt}</p>
          ));
        } else {
          return "Inconnue";
        }
      },  // Génère un ID en fonction de l'index
      sortable: true,
    },
    {
      name: <p style={{ fontWeight: "bold", fontSize: 16 }}>Commune</p>,
      selector: (row, index) => row.commune,  // Génère un ID en fonction de l'index
      sortable: true,
    },
    {
      name: <p style={{ fontWeight: "bold", fontSize: 16 }}>Client</p>,
      selector: (row, index) => {
        if (row.client) {
          return <p> {row.client.nomSociete}</p>
        } else {
          return <p> {"Particulier"}</p>
        }
      },  // Génère un ID en fonction de l'index
      sortable: true,
    },
    {
      name: <p style={{ fontWeight: "bold", fontSize: 16 }}>Articles</p>,
      selector: (row, index) => {
        const produitsArray = row.produits;

        return (
          <div>
            {produitsArray.map((elt, index) => (
              <p key={index}>{elt.produit.nom} ({elt.produit.prix}€/{elt.produit.unite}) </p>
            ))}
          </div>
        );
      }
    },
    {
      name: <p style={{ fontWeight: "bold", fontSize: 16 }}>Quantité</p>,
      selector: (row, index) => {
        const produitsArray = row.produits;

        return (
          <div>
            {produitsArray.map((elt, index) => (
              <p key={index}>{elt.quantite} </p>
            ))}
          </div>
        );
      }
    },
  ]

  const paginationOptions = {
    rowsPerPageText: 'Lignes par page', // Texte personnalisé pour "Rows per page"
    rangeSeparatorText: 'de',
  };


  const handlePrint = useReactToPrint({
    content: () => tableRef.current,
  });

  const handleRowClicked = row => {
    console.log("Row data:", row);
  };



  const handleSearch = (elt) => {
    const allData = [...listeControles];
    if (elt.length > 0) {
      setFilterText(elt);
      const filteredData = allData.filter(item =>
        item.dateOperation.toLowerCase().includes(elt.toLowerCase())
      );

      setSearchResult(filteredData);

    } else {
      setFilterText("");
    }

  }

  const exportToXLSX = (filename) => {

    let allControle = [...listeControles];

    // Transformation des données en format adapté à xlsx
    const worksheetData = allControle.map((item, itemIndex) => {

      return ({
        ID: itemIndex + 1,
        Date: format(new Date(item.dateOperation), "dd-MM-yyyy"),
        Heure: item.heure,
        Immatriculation: item.immatriculation,
        Commune: item.commune,
        Client: item.client ? item.client.nomSociete : "Particulier",
        Nom: item.client ? item.client.nom : "",
        Prénom: item.client ? item.client.prenom : "",
        Matières: item.produits.map(res => `${res.produit.nom}:${res.quantite}`).join(', '),
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
      <NavBarComp title="Contrôle d'accès des particuliers" />
      <div className="page-content">
        <SideNavBar />
        <Container>
          <Breadcrumb>
            <Breadcrumb.Item href="/agent/accueil">Accueil</Breadcrumb.Item>
            <Breadcrumb.Item active>Contrôle d'accès</Breadcrumb.Item>
          </Breadcrumb>

          <div style={{ marginTop: '20px', marginBottom: "20px" }}>
            <Button variant="success" onClick={() => setShowControlModal(true)}>Enregistrer un contrôle d'accès</Button>
          </div>

          <SearchInput
            type="text"
            placeholder="Rechercher par date"
            onChange={e => handleSearch(e.target.value)}
          />
          <div style={{ marginTop: '20px' }}>
            <ExportButton onClick={() => exportToXLSX("liste-controles-acces")}>Exporter en CSV</ExportButton>
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
                  data={filterText.length > 0 ? searchResult : listeControles}
                  pagination
                  highlightOnHover
                  responsive
                  noDataComponent={"Aucun controle"}
                  onRowClicked={handleRowClicked}
                  title={"Liste des contrôles d'accès particuliers"}
                  paginationComponentOptions={paginationOptions}
                  resizableColumns={true}
                />
              </div>
          }

          <Modal show={showControlModal} onHide={handleHide} fullscreen>
            <Modal.Header closeButton onHide={handleHide}>
              <Modal.Title>Nouveau contrôle d'accès</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <Controle onHide={handleHide} />
            </Modal.Body>
          </Modal>

        </Container>
      </div>
    </>
  )
}

export default ProtectedRouteAgent(ControleAcces);