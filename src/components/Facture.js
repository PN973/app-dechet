import { useMyContext } from "@/context/Mycontext";
import styles from "@/styles/facturation.module.css";
import { Button, Form, Table, Modal, Toast, ToastContainer, Spinner, Card } from "react-bootstrap";
import { useEffect, useState, useRef } from "react";
import Select from 'react-select';
import makeAnimated from 'react-select/animated';
import axios from "axios";


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


const Facturation = () => {

  const {
    facturation, setFacturation,
    clientFacturation, setClientFacturation,
    updateTotal,
    immatriculationDepot, setImmatriculationDepot,
    observationsDepot, setObservationsDepot
  } = useMyContext();

  const animatedComponents = makeAnimated();

  const tableRef = useRef(null);
  const entrepriseRef = useRef(null);
  const particulierRef = useRef(null);
  const formRef = useRef(null);

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
  const [filterText, setFilterText] = useState('');
  const [searchResult, setSearchResult] = useState([]);
  const [listeMatieres, setListeMatieres] = useState([]);
  const [transformedClients, setTransformedClients] = useState([]);
  const [transformedMatieres, setTransformedMatieres] = useState([]);
  const [totals, setTotals] = useState({});

  const [immatSelected, setImmatSelected] = useState("");

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
    setImmatriculationDepot(formatted);
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

    axios.get("/api/administrateur/matiere")
      .then(response => {
        if (response.data.success) {

          let allMatieres = response.data.matieres;
          allMatieres = allMatieres.filter(elt => elt.etat === "valide");
          setListeMatieres(allMatieres);
        }
      })
      .catch(e => {
        console.log(e)
      })

  }, []);

  useEffect(() => {

    const options = [
      /*{ value: 'add-client', label: "Ajouter un client" },*/
      ...transformClients(listeClients),
    ];
    setTransformedClients(options);

    const optionsMatieres = transformMatiere(listeMatieres);
    setTransformedMatieres(optionsMatieres);

    setLoadingData(false);

  }, [listeClients, listeMatieres]);


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
      axios.post("/api/administrateur/clients", { isEntreprise, nomSociete, numSiret, nomGerant, prenomGerant, courriel, telephone, ville, codePostal, adresse, nomParticulier, prenomParticulier })
        .then(response => {
          setLoadingBtn(false);
          console.log(response.data)

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

  const handleTypeClientChange = (event) => {
    setIsEntreprise(event.target.value === 'Entreprise');
    if (isEntreprise) {
      entrepriseRef.current.style.display = "none";
      particulierRef.current.style.display = "block";
    } else {
      entrepriseRef.current.style.display = "block";
      particulierRef.current.style.display = "none";
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
      setFacturation(arrayData);
    } else {
      setFacturation([]);
    }

  };

  const handleChangeQuantite = (id, quantite, remise) => {
    updateTotal(id, quantite, remise);
  };

  const handleChangeRemise = (id, remise, quantite) => {
    updateTotal(id, quantite, remise);
  };

  const handleSelectedClient = (e) => {
    handleSelectClient(e);
    if (e.value) {
      const client = listeClients.find(elt => elt.id === e.value);

      if (client.immatriculation) {
        //const formatted = formatInput(client.immatriculation);
        //setFormattedValue(formatted);
        setImmatSelected(client.immatriculation[0]);
        setImmatriculationDepot(client.immatriculation[0]);

      }

      const filteredMatieres = listeMatieres.filter(elt => elt.decheterieID === client.decheterieID);
      const optionsMatieres = [...transformMatiere(filteredMatieres)];
      setTransformedMatieres(optionsMatieres);

    }

  }


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
          <Toast.Body style={{ color: "white" }}>Nouveau client crée avec succès.</Toast.Body>
        </Toast>
      </ToastContainer>
      <Card>
        <Card.Header>
          <Card.Title>Nouveau dépot</Card.Title>
        </Card.Header>
        <Card.Body>
          <Form.Group>
            <Form.Label>Sélectionner un client</Form.Label>
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
            />
          </Form.Group>
          <Form.Group>
            <Form.Label>Immatriculation (du type AB-123-BC)*</Form.Label>
            <Form.Control
              type="text"
              placeholder="Du type AB-123-BC"
              value={immatSelected}
              onInput={handleInputChangeImmat}
              required
            />
          </Form.Group>
          {
            selectedClient && immatriculationDepot.length > 0 ?

              <Form.Group>
                <Form.Label>Sélectionner des articles</Form.Label>
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
                />
              </Form.Group>
              :
              null
          }

          {
            selectedClient && facturation.length > 0 && immatriculationDepot.length > 0 ?
              <Table striped responsive>
                <thead>
                  <tr>
                    <th>#</th>
                    <th className={styles.noWrap}>Article</th>
                    <th className={styles.noWrap}>Prix unitaire</th>
                    <th className={styles.noWrap}>Quantité</th>
                    <th className={styles.noWrap}>Remise (%)</th>
                    <th className={styles.noWrap}>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {
                    facturation.length > 0 ?
                      facturation.map((res, index) => {
                        const idList = index + 1;

                        return (
                          <tr key={res.id}>
                            <td>{idList}</td>
                            <td className={styles.noWrap}>{res.produit.nom}</td>
                            <td className={styles.noWrap}>{res.produit.prix} €/{res.produit.unite}</td>
                            <td>
                              <Form.Control onInput={e => handleChangeQuantite(res.produit.id, e.target.value, res.quantite)} type="number" required placeholder="Quantité" defaultValue={res.quantite} />
                            </td>
                            <td>
                              <Form.Control onInput={e => handleChangeRemise(res.produit.id, e.target.value, res.quantite)} type="number" required placeholder="Remise en %" defaultValue={0} />
                            </td>
                            <td className={styles.noWrap}>{res.total} €</td>
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
          <Form.Group className="mb-3" controlId="">
            <Form.Label>Observations</Form.Label>
            <Form.Control
              as="textarea"
              placeholder="Ajouter une observation"
              style={{ height: '100px' }}
              onInput={e => setObservationsDepot(e.target.value)}
            />
          </Form.Group>
        </Card.Body>
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

export default Facturation;