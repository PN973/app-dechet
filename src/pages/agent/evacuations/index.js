import ProtectedRouteAgent from "@/components/ProtectedRouteAgent";
import SideNavBar from "@/components/SideBarNavAgent";
import NavBarComp from "@/components/NavbarAgent";
import { Container, Button, Breadcrumb, Form, Spinner, Modal, Toast, ToastContainer, Card, ProgressBar } from "react-bootstrap";
import { useState, useRef, useEffect } from "react";
import axios from "axios";
import DataTable from 'react-data-table-component';
import { CSVLink } from 'react-csv';
import styled from 'styled-components';
import { useReactToPrint } from 'react-to-print';
import styles from "@/styles/evacutions.module.css";
import SignatureCanvas from 'react-signature-canvas';
import { useMediaQuery } from 'react-responsive';
import { useMyContext } from "@/context/Mycontext";
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import firebaseApp from "@/libs/firebase";
import { v4 as uuidv4 } from 'uuid';
import { format } from "date-fns";
import { getCookie } from "@/libs/clientCookie";
import { useRouter } from "next/router";
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import Select from 'react-select';
import makeAnimated from 'react-select/animated';

const storage = getStorage(firebaseApp, "gs://numerisation-a1bed.appspot.com");



const customStyles = {
  control: (provided) => ({
    ...provided,
    backgroundColor: 'white',
  }),
  singleValue: (provided) => ({
    ...provided,
    color: 'black',
  }),
  option: (provided, state) => ({
    ...provided,
    backgroundColor: state.isSelected ? 'lightgray' : 'white',
    color: 'black',
  }),
  menu: (provided) => ({
    ...provided,
    backgroundColor: 'white',
  }),
};


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

const Evacuations = () => {

  const router = useRouter();

  const animatedComponents = makeAnimated();

  const { matieresEvacuees, setMatieresEvacuees, agentData } = useMyContext();

  const tableRef = useRef();

  const formRef = useRef(null);

  const signatureOptimomRef = useRef(null);
  const signatureExutoireRef = useRef(null);

  const isDesktopOrLaptop = useMediaQuery({ query: '(min-width: 1224px)' });
  const isBigScreen = useMediaQuery({ query: '(min-width: 1824px)' });
  const isTabletOrMobile = useMediaQuery({ query: '(max-width: 1224px)' });


  const [openClientModal, setOpenClientModal] = useState(false);
  const [formValidated, setFormValidated] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [showToastEnvoi, setShowToastEnvoi] = useState(false);
  const [loadingBtn, setLoadingBtn] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const [filterText, setFilterText] = useState('');
  const [loadingData, setLoadingData] = useState(true);
  const [searchResult, setSearchResult] = useState([]);
  const [dateMinEvacuation, setDateMinEvacuation] = useState('');

  const [listeMatieres, setListeMatieres] = useState([]);
  const [listeDechecheteries, setListeDecheteries] = useState([]);
  const [listeEvacuations, setListeEvacuations] = useState([]);
  const [sortedEvacuations, setSortedEvacuations] = useState([]);

  const [decheterie, setDecheterie] = useState("");
  const [dateEvacuation, setDateEvacuation] = useState("");
  const [heureEvacuation, setHeureEvacuation] = useState("");
  const [immatriculation, setImmatriculation] = useState("");
  const [nomChauffeur, setNomChauffeur] = useState("");
  const [numBenne, setNumBenne] = useState("");
  const [peseeEnEntree, setPeseeEnEntree] = useState("");
  const [peseeEnSortie, setPeseeEnSortie] = useState("");
  const [peseeNet, setPeseeNet] = useState("");
  const [observations, setObservations] = useState("");
  const [peseeExutoire, setPeseeExutoire] = useState(null);
  const [typePesee, setTypePesee] = useState("");
  const [listeImagesObservations, setListeImagesObservations] = useState([]);
  const [signatureOptimom, setSignatureOptimom] = useState(null);
  const [signatureExutoire, setSignatureExutoire] = useState(null);

  const [selectedRow, setSelectedRow] = useState(null);

  const [showModalRetour, setShowModalRetour] = useState(false);
  const [showModalValidation, setShowModalValidation] = useState(false);

  const [bennesListe, setBennesListe] = useState([]);
  const [transformedBenneListe, setTransformedBenneListe] = useState([]);
  const [chauffeurListe, setChauffeurListe] = useState([]);
  const [transformedChauffeurListe, setTransformedChauffeurListe] = useState([]);

  const [typeEvacuation, setTypeEvacuation] = useState(true); // mode benne activé

  const [imageRecapitulatif, setImageRecapitulatif] = useState("");

  const [startUpload, setStartUpload] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

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


  const customSort = (data) => {
    return data.sort((a, b) => {
      if (a.etat === 'attente' && b.etat !== 'attente') {
        return -1;
      } else if (a.etat !== 'attente' && b.etat === 'attente') {
        return 1;
      } else {
        return 0;
      }
    });
  };

  const transformBenne = (bennes) => {
    return bennes.map((item) => ({
      id: item.id,
      label: item.numBenne
    }))
  }

  const transformChauffeur = (chauffeurs) => {
    return chauffeurs.map(elt => ({
      id: elt.id,
      label: elt.nom + " " + elt.prenom
    }))
  };

  useEffect(() => {
    const userData = getCookie("agent");

    if (userData) {
      const data = JSON.parse(userData);

      axios.get("/api/administrateur/evacuations")
        .then(response => {
          const filteredData = response.data.evacuations.filter(item => item.agentID === data.id);

          setListeEvacuations(filteredData)
        })
        .catch(e => console.log(e))
    }

    axios.get("/api/administrateur/matiere")
      .then(response => {
        const valideMatieres = response.data.matieres.filter(elt => elt.etat === "valide");
        setListeMatieres(valideMatieres);
      })
      .catch(e => console.log(e))

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

    // Obtenir la date actuelle
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0'); // Les mois commencent à 0
    const dd = String(today.getDate()).padStart(2, '0');
    const hh = String(today.getHours()).padStart(2, '0');
    const min = String(today.getMinutes()).padStart(2, '0');

    // Formater la date pour l'input de type date
    const formattedToday = `${yyyy}-${mm}-${dd}`;
    const formattedTime = `${hh}:${min}`;

    setDateEvacuation(formattedToday);
    setHeureEvacuation(formattedTime);
    // Définir la date actuelle comme valeur par défaut et minimale
    setDateMinEvacuation(formattedToday);

    axios.get("/api/administrateur/bennes")
      .then(response => {
        if (response.data.success) {
          const valideBennes = response.data.bennes.filter(elt => elt.etat === "valide");
          const transformedData = transformBenne(valideBennes);
          setBennesListe(response.data.bennes);
          setTransformedBenneListe(transformedData);
        }
      })
      .catch(e => {
        console.log(e)
      })

    axios.get("/api/administrateur/chauffeurs")
      .then(response => {
        const valideChauffeurs = response.data.chauffeurs.filter(elt => elt.etat === "valide");
        const transformedData = transformChauffeur(valideChauffeurs);
        setChauffeurListe(response.data.chauffeurs);
        setTransformedChauffeurListe(transformedData);
      })
      .catch(e => {
        console.log(e)
      })


  }, []);

  useEffect(() => {
    // Fonction de tri pour placer les éléments "attente" en premier
    setSortedEvacuations(customSort([...listeEvacuations]));

  }, [listeEvacuations]);

  useEffect(() => {
    setLoadingData(false);
  }, [listeEvacuations])


  const handlePeseeExutoire = (event) => {
    setPeseeExutoire(event.target.value);
  };

  const handleTypePesee = (event) => {
    setTypePesee(event.target.value)
  }

  const handleSelectMatiere = (event) => {
    const matiereID = event.target.value;
    const matiereArray = [...listeMatieres];
    const isMatiereExist = matieresEvacuees.find(elt => elt.id === matiereID);
    if (isMatiereExist) {
      const updatedContextMatiere = matieresEvacuees.filter(elt => elt.id !== matiereID);
      setMatieresEvacuees(updatedContextMatiere);
    } else {
      const matiere = matiereArray.find(elt => elt.id === matiereID);
      const updateContextMatiere = [...matieresEvacuees, matiere]
      setMatieresEvacuees(updateContextMatiere);
    }
  }

  const handleFileUpload = (event) => {
    const files = event.target.files;
    // Boucle à travers les fichiers sélectionnés
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const nomOfficiel = uuidv4(); // Mettez le nom officiel désiré ici
      uploadFile(file, nomOfficiel);
    }
  };

  const uploadFile = (file, nomOfficiel) => {
    setStartUpload(true);
    const path = `images-evacuations/${nomOfficiel}`;
    const storageRef = ref(storage, path);
    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on("state_changed",
      (snapshot) => {
        // Gère la progression du téléchargement
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        setUploadProgress(progress);
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
            setListeImagesObservations((prevListe) => [...prevListe, uploadUrl]);
            setStartUpload(false);
          })
          .catch((error) => {
            //console.error("Erreur lors de l'obtention de l'URL du fichier :", error);
          });
      }
    );
  };

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
    const path = `signatures-evacuations-optimom/${nomOfficiel}`;
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
    const path = `signatures-evacuations-exutoire/${nomOfficiel}`;
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

  const handleEnvoyerValidationEvacuation = async (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    if (form.checkValidity() === false) {
      event.stopPropagation();
    } else {
      setLoadingBtn(true);
      setFormValidated(true);

      axios.post("/api/agent/envoi-evacuations", { typeEvacuation, id: agentData.id, decheterie, dateEvacuation, heureEvacuation, immatriculation, nomChauffeur, numBenne, matieresEvacuees, peseeExutoire, typePesee, peseeEnEntree, peseeEnSortie, peseeNet, observations, listeImagesObservations, signatureOptimom })
        .then(response => {

          setLoadingBtn(false);
          setFormValidated(false);
          if (response.data.success) {
            setSignatureExutoire(null);
            setSignatureOptimom(null);
            setSortedEvacuations([...sortedEvacuations, response.data.evacuation]);
            customSort(sortedEvacuations);
            formRef.current.reset();
            setFormValidated(false);
            setOpenClientModal(false);
            setShowToastEnvoi(true);

          } else {
            setLoadingBtn(false);
            setErrorMsg("Echec de connexion. Veuillez réessayer");
            setTimeout(() => setErrorMsg(null), 5000);
          }

        })
        .catch(e => {
          setLoadingBtn(false);
          setLoadingBtn(false);
          setErrorMsg("Echec de connexion. Veuillez réessayer");
          setTimeout(() => setErrorMsg(null), 5000);
          console.log(e)
        })
    }
  }

  const handleValiderEvacuation = async (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    if (form.checkValidity() === false) {
      event.stopPropagation();
    } else {
      setLoadingBtn(true);
      setFormValidated(true);

      axios.post("/api/administrateur/valider-evacuations", { typeEvacuation, decheterie, dateEvacuation, heureEvacuation, immatriculation, nomChauffeur, numBenne, matieresEvacuees, peseeExutoire, typePesee, peseeEnEntree, peseeEnSortie, peseeNet, observations, listeImagesObservations, signatureOptimom, signatureExutoire })
        .then(response => {
          setLoadingBtn(false);
          if (response.data.success) {
            setSignatureExutoire(null);
            setSignatureOptimom(null);
            const updatedEvacuation = response.data.evacuation;

            // Mettre à jour la liste des agents
            setSortedEvacuations((prevListeEvacuations) => {
              return prevListeEvacuations.map(evacuation =>
                evacuation.id === updatedEvacuation.id ? updatedEvacuation : evacuation
              );
            });

            customSort(sortedEvacuations);

            formRef.current.reset();
            setFormValidated(false);
            setOpenClientModal(false);
            setShowToast(true);

          } else {
            setLoadingBtn(false);
            setErrorMsg("Echec de connexion. Veuillez réessayer");
            setTimeout(() => setErrorMsg(null), 5000);
          }

        })
        .catch(e => {
          setLoadingBtn(false);
          setErrorMsg("Echec de connexion. Veuillez réessayer");
          setTimeout(() => setErrorMsg(null), 5000);
        })
    }
  };


  const columns = [
    {
      name: <p style={{ fontWeight: "bold", fontSize: 16 }}>N°</p>,
      selector: row => row.numEvacuation,
      sortable: true,
    },
    {
      name: <p style={{ fontWeight: "bold", fontSize: 16 }}>Type évactuation</p>,
      selector: row => {
        if (row.typeEvacuation) {
          return "Bennes"
        } else {
          return "Association"
        }
      },
      sortable: true,
    },
    {
      name: <p style={{ fontWeight: "bold", fontSize: 16 }}>Déchèterie</p>,
      selector: row => {
        const decheterieFind = listeDechecheteries.find(elt => elt.id === row.decheterieID);

        if (decheterieFind) {
          return decheterieFind.nom;
        } else {
          return "Aucune"
        }
      },
      sortable: true,
    },

    {
      name: <p style={{ fontWeight: "bold", fontSize: 16 }}>Date & heure de sortie</p>,
      selector: row => format(new Date(row.dateEvacuation), "dd-MM-yyyy") + " à " + row.heureEvacuation,
      sortable: true,
    },
    {
      name: <p style={{ fontWeight: "bold", fontSize: 16 }}>Date & heure de retour</p>,
      selector: row => {

        if (row.dateEvacuationRetour) {
          return format(new Date(row.dateEvacuationRetour), "dd-MM-yyyy") + " à " + row.heureEvacuationRetour
        } else {
          return (
            <div className="optionsButton">
              <Button variant="warning" onClick={() => handleConfirmRetour(row.id)}>Confirmer</Button>
            </div>
          )
        }
      },
      sortable: true,
    },
    {
      name: <p style={{ fontWeight: "bold", fontSize: 16 }}>Pesée Net</p>,
      selector: row => row.peseeNet ? row.peseeNet + " tonnes" : "Non défini",
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
          return <p className="annule">Annulée</p>
        }
      },
      sortable: true,
    },
    {
      name: <p style={{ fontWeight: "bold", fontSize: 16 }}>Options</p>,
      selector: row => {

        if (row.typeEvacuation) {
          if (row.etat === "attente") {
            return (
              <div className="optionsButton">
                {/* <Button variant="success" onClick={() => handleValidation(row.id)}>Valider</Button>*/}
                <Button variant="warning" onClick={() => router.push(`/agent/evacuations/details/${row.id}`)}>Détails</Button>
                <Button variant="danger" onClick={() => handleAnnule(row.id)}>Annuler</Button>
              </div>

            )
          } else if (row.etat === "valide") {
            return (
              <div className="optionsButton">
                <Button variant="primary" onClick={() => router.push(`/agent/evacuations/details/${row.id}`)}>Imprimer</Button>
              </div>

            )
          }
        } else {
          if (row.etat === "attente") {
            return (
              <div className="optionsButton">
                {/* <Button variant="success" onClick={() => handleValidation(row.id)}>Valider</Button>*/}
                <Button variant="danger" onClick={() => handleAnnule(row.id)}>Annuler</Button>
              </div>

            )
          }
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
    const allData = [...sortedEvacuations];
    if (elt.length > 0) {
      setFilterText(elt);
      const filteredData = allData.filter(item =>
        item.dateEvacuation.toLowerCase().includes(elt.toLowerCase())
      );

      setSearchResult(filteredData);

    } else {
      setFilterText("");
    }

  }

  const handleRowClicked = row => {
    console.log("Row data:", row);
  };

  const handleConfirmRetour = (id) => {
    const data = listeEvacuations.find(elt => elt.id === id);
    if (data) {
      setSelectedRow(data);
      setShowModalRetour(true);
    }
  }

  const handleEnrDateRetour = (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    if (form.checkValidity() === false) {
      event.stopPropagation();
    } else {
      setLoadingBtn(true);
      setFormValidated(true);

      axios.post("/api/administrateur/confirmer-retour", { id: selectedRow.id, dateEvacuation, heureEvacuation })
        .then(response => {
          setLoadingBtn(false);

          if (response.data.success) {
            setShowModalRetour(false);
            setSelectedRow(null);

            const updatedEvacuation = response.data.evacuation;

            // Mettre à jour la liste des agents
            setSortedEvacuations((prevListeEvacuations) => {
              return prevListeEvacuations.map(evacuation =>
                evacuation.id === selectedRow.id ? updatedEvacuation : evacuation
              );
            });

            customSort(sortedEvacuations);

          } else {
            setLoadingBtn(false);
            setErrorMsg(response.data.message);
            setTimeout(() => setErrorMsg(null), 5000);
          }

        })
        .catch(e => {
          setLoadingBtn(false);
        })
    }
  }

  const handleAnnule = (id) => {
    axios.post("/api/administrateur/annuler-evacuation", { id })
      .then(response => {
        if (response.data.success) {
          const updatedEvacuation = response.data.evacuation;

          // Mettre à jour la liste des agents
          setSortedEvacuations((prevListeEvacuations) => {
            return prevListeEvacuations.map(evacuation =>
              evacuation.id === id ? updatedEvacuation : evacuation
            );
          });

          customSort(sortedEvacuations);
        }
      })
      .catch(e => {
        console.log(e)
      })
  }


  const handleValidation = (id) => {
    const data = listeEvacuations.find(elt => elt.id === id);
    if (data) {
      setSelectedRow(data);
      setShowModalValidation(true);
    }
  };

  const handleConfirmValidation = () => {

    setLoadingBtn(true);

    axios.post("/api/administrateur/signer-evacuation", { id: selectedRow.id, signatureExutoire })
      .then(response => {
        if (response.data.success) {
          const updatedEvacuation = response.data.evacuation;

          // Mettre à jour la liste des agents
          setSortedEvacuations((prevListeEvacuations) => {
            return prevListeEvacuations.map(evacuation =>
              evacuation.id === selectedRow.id ? updatedEvacuation : evacuation
            );
          });

          customSort(sortedEvacuations);

          setLoadingBtn(false);
          setShowModalValidation(false);
        }
      })
      .catch(e => {
        console.log(e)
      })
  }

  const handleSelectedDecheterie = (e) => {
    setDecheterie(e.target.value);
    const filtered = listeMatieres.filter(elt => elt.decheterieID === e.target.value);
    const transform = [...filtered];
    setListeMatieres(transform);
  }

  const calculatePeseNet = () => {
    if (peseeEnSortie && peseeEnEntree) {
      let total = parseFloat(peseeEnEntree) - parseFloat(peseeEnSortie);
      total = parseFloat(total);
      total = total.toFixed(2);
      setPeseeNet(total);
    } else {
      setPeseeNet(null);
      console.error("Les valeurs de pesée en entrée ou en sortie sont invalides.");
    }
  };

  useEffect(() => {
    calculatePeseNet();
  }, [peseeEnEntree, peseeEnSortie]);

  const exportToXLSX = (filename) => {

    let allEvacuations = [...listeEvacuations];

    // Transformation des données en format adapté à xlsx
    const worksheetData = allEvacuations.map((item, itemIndex) => {

      return ({
        ID: itemIndex + 1,
        Date: format(new Date(item.dateEvacuation), "dd-MM-yyyy"),
        Heure: item.heureEvacuation,
        Date_retour: item.dateEvacuationRetour ? format(new Date(item.dateEvacuationRetour), "dd-MM-yyyy") : "Non confirmé",
        Heure_retour: item.heureEvacuationRetour ? item.heureEvacuationRetour : "Non confirmé",
        Immatriculation: item.immatriculation,
        Nom_chauffeur: item.nomChauffeur,
        Numero_benne: item.numBenne,
        Pesee_en_entree: item.peseeEnEntree + " /tonnes",
        Pesee_en_sortie: item.peseeEnEntree + " /tonnes",
        Pesee_net: item.peseeNet + " /tonnes",
        Matières: item.matieresEvacuees.map(res => `${res.nom}(${res.prix} € / ${res.unite})`).join(', '),
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


  const handleBenne = (e) => {

    const benneData = bennesListe.find(elt => elt.id === e);

    if (benneData) {
      setImmatriculation(benneData.immatriculation);
      setNumBenne(benneData ? benneData.numBenne : "");
      //console.log(benneData);
    }

  }

  const handleTypeEvacuationChange = (event) => {
    setTypeEvacuation(event.target.value === 'true');
  };

  const handleFileUploadRecapitulatif = (event) => {
    const files = event.target.files;
    // Boucle à travers les fichiers sélectionnés
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const nomOfficiel = uuidv4(); // Mettez le nom officiel désiré ici
      uploadFileRecapitulatif(file, nomOfficiel);
    }
  };

  const uploadFileRecapitulatif = (file, nomOfficiel) => {
    const path = `images-recapitulatif/${nomOfficiel}`;
    const storageRef = ref(storage, path);
    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on("state_changed",
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
            setImageRecapitulatif(uploadUrl)
          })
          .catch((error) => {
            //console.error("Erreur lors de l'obtention de l'URL du fichier :", error);
          });
      }
    );
  };

  return (
    <>
      <NavBarComp title="Gestions des évacuations" />
      <div className="page-content">
        <SideNavBar />
        <Container>
          <ToastContainer
            className="p-3"
            position={"top-end"}
            style={{ zIndex: 1 }}
          >
            <Toast bg="success" onClose={() => setShowToastEnvoi(false)} show={showToastEnvoi} delay={3000} autohide>
              <Toast.Header closeButton={false} style={{ color: "black", fontWeight: "bold" }}>
                Succès
              </Toast.Header>
              <Toast.Body style={{ color: "white" }}>Nouvelle évacuation envoyée avec succès.</Toast.Body>
            </Toast>
          </ToastContainer>
          <ToastContainer
            className="p-3"
            position={"top-end"}
            style={{ zIndex: 1 }}
          >
            <Toast bg="success" onClose={() => setShowToast(false)} show={showToast} delay={3000} autohide>
              <Toast.Header closeButton={false} style={{ color: "black", fontWeight: "bold" }}>
                Succès
              </Toast.Header>
              <Toast.Body style={{ color: "white" }}>Nouvelle évacuation validée avec succès.</Toast.Body>
            </Toast>
          </ToastContainer>
          <Breadcrumb>
            <Breadcrumb.Item href="/agent/accueil">Accueil</Breadcrumb.Item>
            <Breadcrumb.Item active>Evacuations</Breadcrumb.Item>
          </Breadcrumb>

          <div style={{ marginTop: '20px', marginBottom: "20px" }}>
            <Button variant="success" onClick={() => setOpenClientModal(!openClientModal)}>Ajouter une nouvelle évacuation</Button>
          </div>

          <SearchInput
            type="text"
            placeholder="Rechercher par date de sortie"
            value={filterText}
            onChange={e => handleSearch(e.target.value)}
          />

          <div style={{ marginTop: '20px' }}>
            <ExportButton onClick={() => exportToXLSX("liste-evacuations")}>Exporter en CSV</ExportButton>
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
                  data={filterText.length > 0 ? searchResult : sortedEvacuations}
                  pagination
                  highlightOnHover
                  responsive
                  noDataComponent={"Aucune évacuation"}
                  onRowClicked={handleRowClicked}
                  title={"Liste des évacuations"}
                  paginationComponentOptions={paginationOptions}
                />

            }

          </div>

          <Modal show={openClientModal} onHide={() => { setOpenClientModal(false), setLoadingBtn(false), setSignatureExutoire(null), setSignatureOptimom(null) }} fullscreen>
            <Modal.Header closeButton>
              <Modal.Title>Ajouter une évacuation</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <Form ref={formRef} noValidate validated={formValidated} >

                <Form.Group className="mb-3" controlId="">
                  <Form.Label style={{ marginRight: "10px" }}>Type de client:</Form.Label>
                  <Form.Check
                    type="radio"
                    label="Evacuation bennes"
                    name="typeEvacuation"
                    id="evacuationBennes"
                    value={true}
                    checked={typeEvacuation === true}
                    inline
                    onChange={handleTypeEvacuationChange}
                  />
                  <Form.Check
                    type="radio"
                    label="Evacuation association"
                    name="typeEvacuation"
                    id="evacuationAutre"
                    value={false}
                    checked={typeEvacuation === false}
                    inline
                    onChange={handleTypeEvacuationChange}
                  />
                </Form.Group>


                <Form.Group className="mb-3" controlId="">
                  <Form.Label>Date du transfert *</Form.Label>
                  <Form.Control
                    required
                    type="date"
                    placeholder="Date du transfert"
                    onInput={e => setDateEvacuation(e.target.value)}
                    min={dateMinEvacuation}
                  />
                </Form.Group>

                <Form.Group className="mb-3" controlId="">
                  <Form.Label>Heure de départ *</Form.Label>
                  <Form.Control
                    required
                    type="time"
                    placeholder="Heure de départ"
                    onInput={e => setHeureEvacuation(e.target.value)}
                  />
                </Form.Group>

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
                {
                  !typeEvacuation ?
                    null
                    :
                    <>
                      {/*<Form.Group className="mb-3" controlId="">
                        <Form.Label>Numéro benne évacuée *</Form.Label>
                        <Select
                          className="basic-single"
                          classNamePrefix="select"
                          closeMenuOnSelect={true}
                          components={animatedComponents}
                          isLoading={loadingData ? true : false}
                          isClearable={true}
                          isSearchable={true}
                          name="benneselect"
                          options={transformedBenneListe}
                          styles={customStyles}
                          placeholder="Recherhcher..."
                          noOptionsMessage={() => "Aucun résultat trouvé"}
                          onChange={(e) => handleBenne(e)}
                        />
                      </Form.Group>*/}



                      <Form.Group className="mb-3" controlId="">
                        <Form.Label>Immatriculation du véhicule *</Form.Label>
                        <Form.Select onChange={(e) => handleBenne(e.target.value)}>
                          <option >Sélectionner</option>
                          {
                            bennesListe.map((res) => {
                              return (
                                <option key={res.id} value={res.id}>{"N° " + res.numBenne + " - " + res.immatriculation}</option>
                              )
                            })
                          }

                        </Form.Select>
                      </Form.Group>

                      <Form.Group className="mb-3" controlId="">
                        <Form.Label>Nom du chauffeur *</Form.Label>
                        <Select
                          className="basic-single"
                          classNamePrefix="select"
                          closeMenuOnSelect={true}
                          components={animatedComponents}
                          isLoading={loadingData ? true : false}
                          isClearable={true}
                          isSearchable={true}
                          name="chauffeurSelect"
                          options={transformedChauffeurListe}
                          styles={customStyles}
                          placeholder="Recherhcher..."
                          noOptionsMessage={() => "Aucun résultat trouvé"}
                          onChange={(e) => setNomChauffeur(e ? e.label : "")}
                          required
                        />
                      </Form.Group>


                      {/*
                      <Form.Group className="mb-3" controlId="">
                        <Form.Label style={{ marginRight: 10 }}>Pesée exutoire *:</Form.Label>

                        <Form.Check
                          type="radio"
                          id={"peseExutoireOui"}
                          label={"Oui"}
                          inline
                          value={"Oui"}
                          name="peseExutoire"
                          onChange={(event) => handlePeseeExutoire(event)}
                        />
                        <Form.Check
                          type="radio"
                          id={"peseExutoireNon"}
                          label={"Non"}
                          inline
                          value={false}
                          name="peseExutoire"
                          onChange={(event) => handlePeseeExutoire(event)}
                        />

                      </Form.Group>
                  
                      <Form.Group className="mb-3" controlId="">
                        <Form.Label style={{ marginRight: 10 }}>Pesée *:</Form.Label>

                        <Form.Check
                          type="radio"
                          id={"pesemanuelle"}
                          label={"Manuelle"}
                          inline
                          value={"Manuelle"}
                          name="typePese"
                          onChange={(e) => handleTypePesee(e)}
                        />
                     <Form.Check
                    type="radio"
                    id={"pesebadge"}
                    label={"Badge"}
                    inline
                    value={"Badge"}
                    name="typePese"
                    onChange={(e) => handleTypePesee(e)}
                 
                      </Form.Group>
                       />*/}


                      <Form.Group className="mb-3" controlId="">
                        <Form.Label>{typeEvacuation ? "Flux *" : "Type de déchets évacuer"}</Form.Label>
                      </Form.Group>

                      <div style={{ margin: "20px 0" }}>
                        {
                          listeMatieres.length > 0 && decheterie.length > 0 ?
                            listeMatieres.map((res, index) => {
                              return (
                                <Form.Check
                                  key={res.id}
                                  type="checkbox"
                                  id={res.id}
                                  label={res.nom}
                                  inline
                                  value={res.id}
                                  onChange={e => handleSelectMatiere(e)}
                                />
                              )
                            })
                            :
                            <p style={{ fontSize: 13, color: "red" }}>"Veuillez sélectionner une déchèterie ci dessus"</p>
                        }
                      </div>


                      <Form.Group className="mb-3" controlId="">
                        <Form.Label>Pesée 1 (en entrée / Tonnes) *</Form.Label>
                        <Form.Control
                          required
                          type="number"
                          placeholder="Pesée en entrée par Tonnes"
                          onInput={e => setPeseeEnEntree(e.target.value)}
                        />
                      </Form.Group>

                      <Form.Group className="mb-3" controlId="">
                        <Form.Label>Pesée 2 (en sortie / Tonnes) *</Form.Label>
                        <Form.Control
                          required
                          type="number"
                          placeholder="Pesée en sortie par Tonnes"
                          onInput={e => setPeseeEnSortie(e.target.value)}
                        />
                      </Form.Group>

                      <Form.Group className="mb-3" controlId="">
                        <Form.Label>Pesée Net (Tonnes) *</Form.Label>
                        <Form.Control
                          required
                          type="number"
                          placeholder="Pesée Net par Tonnes"
                          //onInput={e => setPeseeNet(e.target.value)}
                          disabled
                          value={peseeNet}
                        />
                      </Form.Group>
                    </>
                }



                <Form.Group className="mb-3" controlId="">
                  <Form.Label>Observations</Form.Label>
                  <Form.Control
                    as="textarea"
                    placeholder="Ajouter une observation"
                    style={{ height: '100px' }}
                    onInput={e => setObservations(e.target.value)}
                  />
                </Form.Group>

                {
                  typeEvacuation &&

                  <Form.Group className="mb-3" controlId="">
                    <Form.Label>Photo du recapitulatif</Form.Label>
                    <Form.Control
                      type="file"
                      onChange={(e) => handleFileUploadRecapitulatif(e)}
                    />
                  </Form.Group>

                }


                <Form.Group className="mb-3" controlId="">
                  <Form.Label>Image du ticket</Form.Label>
                  {
                    startUpload && <ProgressBar striped variant="info" now={uploadProgress} />
                  }
                  <Form.Control
                    type="file"
                    multiple
                    onChange={(e) => handleFileUpload(e)}
                    accept="image/*"
                    capture="environment"
                  />
                </Form.Group>

                <Card>
                  <Card.Header>Signature OPTIM'OM</Card.Header>
                  <Card.Body>
                    <SignatureCanvas
                      ref={signatureOptimomRef}
                      penColor='black'
                      canvasProps={{ className: styles.sigCanvas }}
                      onEnd={() => uploadSignatureOptimom(signatureOptimomRef.current.toDataURL("image/png"))}
                    />
                  </Card.Body>
                  <Card.Footer>
                    <Button variant="danger" onClick={() => { signatureOptimomRef.current.clear(); setSignatureOptimom(null) }}>Effacer</Button>
                  </Card.Footer>
                </Card>


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
                  !signatureExutoire && signatureOptimom ?

                    <Button variant="primary" type="button" onClick={handleEnvoyerValidationEvacuation}>
                      Envoyer pour validation
                    </Button>
                    :
                    signatureExutoire && signatureOptimom ?
                      <Button variant="success" type="button" onClick={handleValiderEvacuation}>
                        Valider l'évacuation
                      </Button>
                      :
                      <Button variant="secondary" type="button" disabled>
                        Enregistrer
                      </Button>
              }

            </Modal.Footer>
          </Modal>

          <Modal show={showModalRetour} onHide={() => setShowModalRetour(false)} fullscreen>
            <Modal.Header closeButton>
              <Modal.Title>Confirmer la date de retour</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <Form noValidate validated={formValidated} onSubmit={handleEnrDateRetour} >
                <Form.Group className="mb-3" controlId="">
                  <Form.Label>Date de retour *</Form.Label>
                  <Form.Control
                    required
                    type="date"
                    placeholder="Date de retour"
                    onInput={e => setDateEvacuation(e.target.value)}
                    min={dateMinEvacuation}
                  />
                </Form.Group>

                <Form.Group className="mb-3" controlId="">
                  <Form.Label>Heure de retour *</Form.Label>
                  <Form.Control
                    required
                    type="time"
                    placeholder="Heure de retour"
                    onInput={e => setHeureEvacuation(e.target.value)}
                  />
                </Form.Group>

              </Form>
            </Modal.Body>

            <Modal.Footer>

              <Button variant="secondary" onClick={() => { setShowModalRetour(false), setLoadingBtn(false) }}>
                Annuler
              </Button>
              {
                loadingBtn ?
                  <Spinner variant="success"></Spinner>
                  :
                  <Button variant="primary" type="button" onClick={handleEnrDateRetour}>
                    Confirmer la date
                  </Button>
              }

            </Modal.Footer>
          </Modal>

          <Modal show={showModalValidation} onHide={() => setShowModalValidation(false)} fullscreen>
            <Modal.Header closeButton>
              <Modal.Title>Confirmer la signature CHAUFFEUR - évacuation n° {selectedRow && "00" + selectedRow.numEvacuation} </Modal.Title>
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
      </div >
    </>
  )
};

export default ProtectedRouteAgent(Evacuations);