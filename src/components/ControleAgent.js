import { useMyContext } from "@/context/Mycontext";
import styles from "@/styles/facturation.module.css";
import { Button, Form, Table, Modal, Toast, ToastContainer, Spinner, Card } from "react-bootstrap";
import { useEffect, useState, useRef } from "react";
import Select from 'react-select';
import makeAnimated from 'react-select/animated';
import axios from "axios";
import { getCookie } from "@/libs/clientCookie";
import TagsInput from 'react-tagsinput';
import 'react-tagsinput/react-tagsinput.css';
import Communes from "./Communes";



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


const Controle = ({ onHide }) => {

  const {
    facturation,
    setFacturation,
    setClientFacturation,
    clientFacturation,
    updateTotalControle,
    controleAcces,
    setControleAcces,
    agentData
  } = useMyContext();

  const animatedComponents = makeAnimated();

  const communesOptions = Communes();

  const entrepriseRef = useRef(null);
  const particulierRef = useRef(null);
  const formRef = useRef(null);
  const tableRef = useRef();

  const [selectedClient, setSelectedClient] = useState(null);

  const [selectedNewClient, setSelectedNewClient] = useState(null);

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
  const [listeMatieres, setListeMatieres] = useState([]);
  const [transformedClients, setTransformedClients] = useState([]);
  const [transformedMatieres, setTransformedMatieres] = useState([]);
  const [transformedDecheteries, setTransformedDecheteries] = useState([]);
  const [transformedAgents, setTransformedAgents] = useState([]);
  const [totals, setTotals] = useState({});
  const [listeAgent, setListeAgent] = useState([]);
  const [listeDecheteries, setListeDecheteries] = useState([]);


  const [agentSelect, setAgentSelected] = useState(null);
  const [dateSelected, setDateSelected] = useState("");
  const [heureSelected, setHeureSelected] = useState("");
  const [immatSelected, setImmatSelected] = useState("");
  const [communeSelected, setCommuneSelected] = useState("");

  const [dateMinEvacuation, setDateMinEvacuation] = useState("");

  const [formattedValue, setFormattedValue] = useState('');

  const [listeControles, setListeControles] = useState([]);

  const [tags, setTags] = useState([]);

  const [communeEvacuation, setCommuneEvacuation] = useState("");

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
    setFormattedValue(formatted);
    setImmatSelected(formatted);
  };

  const transformDecheterie = (decheteries) => {
    return decheteries.map(elt => ({
      value: elt.id,
      label: `${elt.commune}`,
    }));
  };

  const transformClients = (clients) => {
    return clients.map(client => ({
      value: client.id,
      label: client.societe ? client.nomSociete : client.nom + " " + client.prenom,
    }));
  };


  const transformMatiere = (matieres) => {
    return matieres.map(matiere => ({
      value: matiere.id,
      label: `${matiere.nom} (${matiere.prix} €/${matiere.unite})`,
    }));
  };


  const transformAgent = (agents) => {
    return agents.map(agent => ({
      value: agent.id,
      label: `${agent.nom} ${agent.prenom}`,
    }));
  };

  useEffect(() => {
    axios.get("/api/administrateur/clients")
      .then(response => {
        if (response.data.success) {

          let allClients = response.data.clients;
          allClients = allClients.filter(elt => elt.etat === "valide");
          setListeClients(allClients);
        }
      })
      .catch(e => {
        console.log(e)
      })

    axios.get("/api/administrateur/enregistrer-controle")
      .then(response => {
        if (response.data.success) {
          setListeControles(response.data.controles)
        }
      })
      .catch(e => {
        console.log(e)
      })

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
          setListeDecheteries(response.data.decheteries);
          //setLoadingData(false);
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

    setDateSelected(formattedToday);
    setHeureSelected(formattedTime);

    // Définir la date actuelle comme valeur par défaut et minimale
    setDateMinEvacuation(formattedToday);

    setAgentSelected({ value: agentData.id, label: agentData.nom + " " + agentData.prenom })
  }, []);

  useEffect(() => {

    const userData = getCookie("agent");
    const data = JSON.parse(userData);
    if (data) {
      const filteredClient = listeClients.filter(elt => elt.decheterieID === data.decheterieID)
      const options = [
        /*{ value: 'add-client', label: "Ajouter un client" },*/
        ...transformClients(filteredClient),
      ];
      setTransformedClients(options);

      axios.get("/api/administrateur/matiere")
        .then(response => {
          if (response.data.success) {

            let allMatieres = response.data.matieres;
            allMatieres = allMatieres.filter(elt => elt.etat === "valide" && elt.decheterieID === data.decheterieID);
            setListeMatieres(allMatieres);
          }
        })
        .catch(e => {
          console.log(e)
        })
    }


    const optionsMatieres = transformMatiere(listeMatieres);
    setTransformedMatieres(optionsMatieres);

    const optionsAgent = [
      { value: agentData.id, label: agentData.nom + " " + agentData.prenom },
      ...transformAgent(listeAgent),
    ]

    setTransformedAgents(optionsAgent);

    const transformDecheterieData = transformDecheterie(listeDecheteries);
    setTransformedDecheteries(transformDecheterieData);


    setLoadingData(false);

  }, [listeClients, listeMatieres, listeAgent]);


  useEffect(() => {
    const calculateTotals = () => {
      const newTotals = facturation.reduce((acc, res) => {
        let total = 0;
        if (res.quantite) {
          if (res.remise > 0) {
            const pourcentageVal = (res.remise / 100) * (res.produit.prix * res.quantite);
            total = (res.produit.prix * res.quantite) - pourcentageVal;
          } else {
            total = res.produit.prix * res.quantite;
          }
          total = parseFloat(total.toFixed(2));
        }
        acc[res.produit.id] = total;
        return acc;
      }, {});
      setTotals(newTotals);
    };

    calculateTotals();
  }, [facturation]);


  const formatOptionLabel = ({ label, value }) => {
    if (value === 'add-client') {
      return <Button variant="primary" onClick={() => setOpenClientModal(true)}>Ajouter un client</Button>;
    }
    return label;
  };

  const handleSubmitClient = (event) => {
    const form = event.currentTarget;
    if (form.checkValidity() === false) {
      event.preventDefault();
      event.stopPropagation();
    } else {
      setFormValidated(true);

      setLoadingBtn(true);
      const userData = getCookie("agent");
      const data = JSON.parse(userData);
      axios.post("/api/agent/clients", { id: data.id, isEntreprise, nomSociete, numSiret, nomGerant, prenomGerant, courriel, telephone, ville, codePostal, adresse, nomParticulier, prenomParticulier })
        .then(response => {
          setLoadingBtn(false);

          if (response.data.success) {
            formRef.current.reset();
            setFormValidated(false);
            setOpenClientModal(false);
            setShowToast(true);
            setListeClients([response.data.client, ...listeClients]);
            transformClients(listeClients);
            setSelectedNewClient(transformedClients[0]);
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

  const [showSelectClient, setShowSelectClient] = useState(true);

  const handleTypeClientChange = (event) => {
    setIsEntreprise(event.target.value === 'Entreprise');

    if (isEntreprise) {
      handleSelectClient(null);
      setShowSelectClient(false)
    } else {
      setShowSelectClient(true)
    }

  };

  const handleSelectClient = (e) => {
    if (e) {
      let allClients = [...listeClients];
      const client = allClients.find(elt => elt.id === e.value);
      setSelectedClient(client);
      setClientFacturation(client);
    } else {
      setSelectedClient(null);
      setClientFacturation(null);
      setFacturation([]);
    }
  }


  const handleCart = (e) => {
    if (e.length > 0) {
      let arrayData = [];
      e.forEach(element => {
        const data = listeMatieres.find(params => params.id === element.value);
        const contextProd = { produit: data, quantite: 1, remise: 0, total: parseFloat(data.prix) }
        arrayData.push(contextProd);
      });
      setControleAcces(arrayData);
    } else {
      setControleAcces([]);
    }

  };

  const handleChangeQuantite = (id, e, remise) => {

    const quantite = e.target.value;
    updateTotalControle(id, quantite, remise);
  };

  const handleControleSend = (event) => {

    event.preventDefault(event);
    const form = event.currentTarget;
    if (form.checkValidity() === false) {
      event.stopPropagation();
    } else {
      setLoadingBtn(true);
      setFormValidated(true);

      axios.post("/api/agent/enregistrer-controle", { communeEvacuation, tags, id: agentData.id, agent: agentSelect, client: clientFacturation, dateSelected, heureSelected, immatSelected, communeSelected, produits: controleAcces, isEntreprise })
        .then(response => {
          setLoadingBtn(false);

          if (response.data.success) {
            setShowToast(true);
            setFormValidated(false);
            setClientFacturation(null);
            setControleAcces(null);
            formRef.current.reset();
            onHide()


          } else {
            setErrorMsg(response.data.message);
            setTimeout(() => setErrorMsg(null), 5000);
          }

        })
        .catch(e => {
          setLoadingBtn(false);
          console.log(e);
        })
    }

  }

  const handleSelectedClient = (e) => {
    handleSelectClient(e);

    const client = listeClients.find(elt => elt.id === e.value);

    if (client.immatriculation) {
      // const formatted = formatInput(client.immatriculation);
      //setFormattedValue(formatted);
      setImmatSelected(client.immatriculation[0]);
      setTags(client.immatriculation);


    }

  }

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
    <div>
      <ToastContainer
        className="p-3"
        position={"top-end"}
        style={{ zIndex: 1 }}
      >
        <Toast bg="success" onClose={() => setShowToast(false)} show={showToast} delay={3000} autohide>
          <Toast.Header closeButton={false} style={{ color: "black", fontWeight: "bold" }}>
            Succès
          </Toast.Header>
          <Toast.Body style={{ color: "white" }}>Nouveau contrôle enregistré avec succès.</Toast.Body>
        </Toast>
      </ToastContainer>
      <Card>
        <Card.Header>
          <Card.Title>Contrôle d'accès</Card.Title>
        </Card.Header>
        <Card.Body>
          <Form ref={formRef} noValidate validated={formValidated}>
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


            <Form.Group>
              <Form.Label>Sélectionner la commune*</Form.Label>
              <Select
                className="basic-single"
                classNamePrefix="select"
                closeMenuOnSelect={true}
                components={animatedComponents}
                isLoading={loadingData ? true : false}
                isClearable={true}
                isSearchable={true}
                name="communes"
                options={transformedDecheteries}
                styles={customStyles}
                placeholder="Sélectionner une com..."
                noOptionsMessage={() => "Aucun résultat trouvé"}
                onChange={(e) => setCommuneSelected(e ? e.label : "")}
                required
              />
            </Form.Group>

            <Form.Group>
              <Form.Label>Sélectionner la commune*</Form.Label>
              <Select
                className="basic-single"
                classNamePrefix="select"
                closeMenuOnSelect={true}
                components={animatedComponents}
                isLoading={loadingData ? true : false}
                isClearable={true}
                isSearchable={true}
                name="communes"
                options={communesOptions}
                styles={customStyles}
                placeholder="Sélectionner une com..."
                noOptionsMessage={() => "Aucun résultat trouvé"}
                onChange={(e) => setCommuneEvacuation(e ? e.label : "")}
                required
              />
            </Form.Group>

            {
              showSelectClient ?
                <Form.Group>
                  <Form.Label>Sélectionner un client*</Form.Label>
                  <Select
                    className="basic-single"
                    classNamePrefix="select"
                    closeMenuOnSelect={true}
                    components={animatedComponents}
                    isLoading={loadingData ? true : false}
                    isClearable={true}
                    isSearchable={true}
                    name="client"
                    options={transformedClients}
                    styles={customStyles}
                    placeholder="Sélectionner un client..."
                    noOptionsMessage={() => "Aucun résultat trouvé"}
                    onChange={(e) => handleSelectedClient(e)}
                    formatOptionLabel={formatOptionLabel}
                    required
                  />
                </Form.Group>
                :
                null

            }


            <Form.Group>
              <Form.Label>Sélectionner la date*</Form.Label>
              <Form.Control defaultValue={dateSelected} required type="date" min={dateMinEvacuation} onInput={(e) => setDateSelected(e.target.value)} />
            </Form.Group>

            <Form.Group>
              <Form.Label>Sélectionner l"heure*</Form.Label>
              <Form.Control defaultValue={heureSelected} required type="time" onInput={e => setHeureSelected(e.target.value)} />
            </Form.Group>

            {/*<Form.Group>
              <Form.Label>Immatriculation du véhicule{!isEntreprise && communeSelected.toLowerCase() === "cayenne" ? null : "*"}</Form.Label>
              <Form.Control
                type="text"
                placeholder="Du type AB-123-BC"
                value={immatSelected}
                onInput={handleInputChangeImmat}
                required={!isEntreprise && communeSelected.toLowerCase() === "cayenne" ? false : true}
              />
            </Form.Group>*/}

            <Form.Group>
              <Form.Label>Immatriculations {!isEntreprise ? null : "*"} </Form.Label>
              <TagsInput
                value={tags}
                onChange={handleChange}
                inputProps={{ placeholder: 'Ajouter une immatriculation' }}
                inputValue={handleChangeInput}
                delimiters={['Enter', 'Tab', ',']}

              />
            </Form.Group>



            <Form.Group>
              <Form.Label>Sélectionner des articles*</Form.Label>
              <Select
                className="basic-single"
                classNamePrefix="select"
                closeMenuOnSelect={true}
                components={animatedComponents}
                isLoading={loadingData ? true : false}
                isClearable={true}
                isSearchable={true}
                isMulti={true}
                name="matieres"
                options={transformedMatieres}
                styles={customStyles}
                placeholder="Sélectionner un article..."
                noOptionsMessage={() => "Aucun résultat trouvé"}
                onChange={(e) => handleCart(e)}
                required
              />
            </Form.Group>


            <div className={styles.centeredButton}>
              <p className="error-display">{errorMsg && errorMsg}</p>
            </div>

          </Form>

          {
            controleAcces && controleAcces.length > 0 && isEntreprise ?
              <Table striped responsive>
                <thead>
                  <tr>
                    <th>#</th>
                    <th className={styles.noWrap}>Article</th>
                    <th className={styles.noWrap}>Unité de mésure</th>
                    <th className={styles.noWrap}>Quantité</th>
                  </tr>
                </thead>
                <tbody>
                  {
                    controleAcces.length > 0 ?
                      controleAcces.map((res, index) => {
                        const idList = index + 1;

                        return (
                          <tr key={res.id}>
                            <td>{idList}</td>
                            <td className={styles.noWrap}>{res.produit.nom}</td>
                            <td className={styles.noWrap}>{res.produit.unite}</td>
                            <td>
                              <Form.Control onInput={e => handleChangeQuantite(res.produit.id, e, res.quantite)} type="number" required placeholder="Quantité" defaultValue={res.quantite} />
                            </td>
                          </tr>
                        )
                      })

                      :
                      null
                  }

                </tbody>
              </Table>




              :
              null
          }
        </Card.Body>
        <Card.Footer>
          <div className={styles.alignRightButton}>
            <Button variant="secondary" onClick={onHide}>Annuler</Button>

            {
              loadingBtn ?
                <Spinner variant="success"></Spinner>
                :
                <Button variant="success" onClick={handleControleSend}>Enregistrer</Button>
            }

          </div>

        </Card.Footer>
      </Card>



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




    </div>
  )
};

export default Controle;