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

const Bennes = () => {

 const router = useRouter();

 const tableRef = useRef();

 const formRef = useRef(null);

 const [openModal, setOpenModal] = useState(false);
 const [formValidated, setFormValidated] = useState(false);
 const [loadingBtn, setLoadingBtn] = useState(false);
 const [errorMsg, setErrorMsg] = useState(null);
 const [listeDechecheteries, setListeDecheteries] = useState([]);
 const [listeBennes, setListeBennes] = useState([]);
 const [filterText, setFilterText] = useState('');
 const [loadingData, setLoadingData] = useState(true);
 const [searchResult, setSearchResult] = useState([]);
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

  axios.get("/api/administrateur/bennes")
   .then(response => {
    if (response.data.success) {

     console.log(response.data.bennes)
     setListeBennes(response.data.bennes);
    }
   })
   .catch(e => {
    console.log(e)
   })



 }, []);

 useEffect(() => {
  setLoadingData(false);
 }, [listeDechecheteries, listeBennes]);

 const columns = [
  {
   name: <p style={{ fontWeight: "bold", fontSize: 16 }}>ID</p>,
   selector: (row, index) => index + 1,
   sortable: true,
  },
  {
   name: <p style={{ fontWeight: "bold", fontSize: 16 }}>Numéro de benne</p>,
   selector: (row, index) => row.numBenne,
   sortable: true,
  },
  {
   name: <p style={{ fontWeight: "bold", fontSize: 16 }}>Immatriculation</p>,
   selector: (row, index) => row.immatriculation,
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
       <Button variant="success" onClick={() => handleActivation({ benneID: row.id, action: "activation" })}>Activer</Button>
       <Button variant="warning" onClick={() => router.push(`/dashboard/bennes/modifier/${row.id}`)}>Modifier</Button>
      </div>

     )
    } else if (row.etat === "valide") {
     return (
      <div className="optionsButton">
       <Button variant="danger" onClick={() => handleActivation({ benneID: row.id, action: "desactivation" })}>Désactiver</Button>
       <Button variant="warning" onClick={() => router.push(`/dashboard/bennes/modifier/${row.id}`)}>Modifier</Button>
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

   axios.post("/api/administrateur/bennes", { decheterie, numeroBenne, immatSelected })
    .then(response => {
     setFormValidated(false);
     setLoadingBtn(false);

     if (response.data.success) {

      const benneListe = [...(listeBennes || []), response.data.benne];
      setListeBennes(benneListe);

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
  const allData = [...listeBennes];
  if (elt.length > 0) {
   setFilterText(elt);
   const filteredData = allData.filter(item =>
    item.numBenne.toLowerCase().includes(elt.toLowerCase())
   );

   setSearchResult(filteredData);
  } else {
   setFilterText("");
   setSearchResult(allData); // Revert to all data when search is cleared
  }
 }

 const exportToXLSX = (filename) => {

  let allBennes = [...listeBennes];

  // Transformation des données en format adapté à xlsx
  const worksheetData = allBennes.map((item, itemIndex) => {
   const decheterie = listeDechecheteries.find(elt => elt.id === item.decheterieID);

   return ({
    ID: itemIndex + 1,
    numero_benne: item.numBenne,
    immatriculation: item.immatriculation,
    decheterie: decheterie.nom,
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

  axios.patch("/api/administrateur/bennes", obj)
   .then(response => {
    setListeBennes((prevListe) => {
     return prevListe.map(prev =>
      prev.id === response.data.benne.id ? response.data.benne : prev
     );
    });
   })
   .catch(e => {
    console.log(e)
   })

 }



 return (

  <>
   <NavBarComp title="Gestion des bennes" />
   <div className="page-content">
    <SideNavBar />
    <Container>
     <Breadcrumb>
      <Breadcrumb.Item href="/dashboard/accueil">Accueil</Breadcrumb.Item>
      <Breadcrumb.Item active>Bennes</Breadcrumb.Item>
     </Breadcrumb>

     <Button variant="success" onClick={() => setOpenModal(true)}>Ajouter une benne</Button>

     <SearchInput
      type="text"
      placeholder="Rechercher par numéro"
      value={filterText}
      onChange={e => handleSearch(e.target.value)}
     />

     <div style={{ marginTop: '20px' }}>
      <ExportButton onClick={() => exportToXLSX("liste-bennes")}>Exporter en CSV</ExportButton>
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
         data={filterText.length > 0 ? searchResult : listeBennes}
         pagination
         highlightOnHover
         responsive
         noDataComponent={"Aucune benne"}
         title={"Liste des bennes"}
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
        <Form.Label>Numéro de benne *</Form.Label>
        <Form.Control onInput={e => setNumeroBenne(e.target.value)} type="number" placeholder="Numéro de la benne" required />
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
   </div>
  </>

 )
}

export default ProtectedRoute(Bennes);