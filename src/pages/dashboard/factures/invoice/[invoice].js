// Invoice.js
import React, { useRef, useState, useEffect } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useReactToPrint } from 'react-to-print';
import styles from '@/styles/Invoice.module.css';
import Logo from "@/images/logo.png";
import Cacl from "@/images/cacl.png";
import Image from 'next/image';
import axios from 'axios';
import { useRouter } from 'next/router';
import { Spinner, Card, ListGroup, Breadcrumb, Container, Button, Table, Form, Row, Col } from "react-bootstrap";
import { format } from 'date-fns';

const Invoice = () => {
  const componentRef = useRef();
  const router = useRouter();

  const [listeAgents, setListeAgents] = useState([]);
  const [listeClients, setListeClients] = useState([]);
  const [listeDevis, setListeDevis] = useState([]);
  const [listeFactures, setListeFactures] = useState([]);
  const [listeEvacuations, setListeEvacuations] = useState([]);
  const [listeDechecheteries, setListeDecheteries] = useState([]);
  const [listeControles, setListeControles] = useState([]);
  const [listeMatieres, setListeMatieres] = useState([]);
  const [factureData, setFactureData] = useState(null);
  const [cartProduct, setCartProduct] = useState([]);

  useEffect(() => {

    axios.get("/api/administrateur/agent")
      .then(response => {
        if (response.data.success) {
          setListeAgents(response.data.agents);
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

    axios.get("/api/administrateur/clients")
      .then(response => {
        if (response.data.success) {
          setListeClients(response.data.clients);
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

    axios.get("/api/administrateur/decheteries")
      .then(response => {
        if (response.data.success) {
          setListeDecheteries(response.data.decheteries);
        }
      })
      .catch(e => {
        console.log(e)
      })

    axios.get("/api/administrateur/devis")
      .then(response => {
        if (response.data.success) {
          setListeDevis(response.data.devis);
        }
      })
      .catch(e => console.log(e))

    axios.get("/api/administrateur/matiere")
      .then(response => {
        if (response.data.success) {
          setListeMatieres(response.data.matieres);
        }
      })
      .catch(e => {
        console.log(e)
      })


    axios.get("/api/administrateur/evacuations")
      .then(response => {
        setListeEvacuations(response.data.evacuations)
      })
      .catch(e => console.log(e))

    axios.get("/api/administrateur/invoice")
      .then(response => {
        if (response.data.success) {
          setListeFactures(response.data.factures);

          const facture = response.data.factures.find(elt => elt.id === router.query.invoice);
          let array = [];
          facture.data.forEach(element => {
            const products = element.produits;
            products.forEach(elt => {
              const obj = { dateEmission: element.date, data: elt }
              array.push(obj)
            })

          });

          setFactureData(facture);
          setCartProduct(array);
        }
      })
      .catch(e => console.log(e))


  }, []);



  const handlePrint = useReactToPrint({
    content: () => componentRef.current,

  });


  if (!factureData) return (
    <div className={styles.loaderComp}>
      <Spinner variant='primary'></Spinner>
    </div>
  )

  function trierParDateDecroissante(data) {
    return data.sort((a, b) => new Date(a.dateEmission) - new Date(b.dateEmission));
  }

  const listeCart = trierParDateDecroissante(cartProduct);

  let totalSum = listeCart.reduce((acc, curr) => acc + curr.data.total, 0);

  return (
    <Container>
      <Breadcrumb>
        <Breadcrumb.Item href="/dashboard/accueil">Accueil</Breadcrumb.Item>
        <Breadcrumb.Item href="/dashboard/factures">Factures</Breadcrumb.Item>
        <Breadcrumb.Item active>Facture n° 00{factureData && factureData.numero}</Breadcrumb.Item>
      </Breadcrumb>
      <Button variant='primary' className={styles.printButton} onClick={handlePrint}>Imprimer</Button>
      <div className={styles.invoice} ref={componentRef}>
        <div className={styles.header}>
          <ul className={styles.listeLeft}>
            <li>
              <Image src={Cacl} alt="Logo" width={187} height={60} />
            </li>
          </ul>
          <ul className={styles.listeRight}>
            <li>
              <h4>Facture n° 00{factureData && factureData.numero}</h4>
            </li>
            <li>
              <span>Du {format(new Date(factureData.periodeFacturationDu), "dd-MM-yyyy")} au {format(new Date(factureData.periodeFacturationAu), "dd-MM-yyyy")}</span>
            </li>
          </ul>
        </div>
        <div className={styles.header}>
          <Card>
            <Card.Body>
              <ul className={styles.listeLeft}>
                <li>
                  <span>CACL</span>
                </li>
                <li>
                  <span>4, Esplanade de la Cité d'Affaire </span>
                </li>
                <li>
                  <span>CS 36029 </span>
                </li>
                <li>
                  <span>97351 Matoury Cedex </span>
                </li>
                <li>
                  <span>France </span>
                </li>
                <li>
                  <span>0594 28 91 07 </span>
                </li>
              </ul>
            </Card.Body>
          </Card>

          <Card>
            <Card.Body>
              <ul className={styles.listeLeft}>
                <li>
                  <span>{factureData.data[0].client.societe ? factureData.data[0].client.nomSociete : factureData.data[0].client.nom + " " + factureData.data[0].client.prenom} </span>
                </li>
                <li>
                  <span>E-mail: {factureData.data[0].client.email}</span>
                </li>
                <li>
                  <span>Téléphone: {factureData.data[0].client.telephone}</span>
                </li>
                <li>
                  <span>Ville: {factureData.data[0].client.ville}</span>
                </li>
                <li>
                  <span>Code postal: {factureData.data[0].client.codePostal}</span>
                </li>
                <li>
                  <span>Adresse: {factureData.data[0].client.adresse}</span>
                </li>
              </ul>
            </Card.Body>
          </Card>

        </div>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Date</th>
              <th>Désignation</th>
              <th>Quantité</th>
              <th>Prix</th>
              <th>Remise</th>
              <th>Total HT</th>
              <th>Taux Taxe</th>
            </tr>
          </thead>
          <tbody>
            {
              listeCart.length > 0 ?
                listeCart.map((res, index) => {
                  return (
                    <tr>
                      <td>{format(new Date(res.dateEmission), "dd-MM-yyyy")}</td>
                      <td>{res.data.produit.nom} </td>
                      <td>{res.data.quantite.toFixed(2) + " " + res.data.produit.unite}</td>
                      <td>{res.data.total.toFixed(2)} €</td>
                      <td>{res.data.remise} %</td>
                      <td>{res.data.total.toFixed(2)} €</td>
                      <td>0.00 €</td>
                    </tr>
                  )
                })
                :
                null
            }

          </tbody>
        </table>
        <div className={styles.total}>
          <table className={styles.tableTotal}>
            <tr>
              <td style={{ background: "#f5f5f5", fontWeight: "bold" }} >Total HT</td>
              <td>{totalSum.toFixed(2)} €</td>
            </tr>
            <tr>
              <td style={{ background: "#f5f5f5", fontWeight: "bold" }}>Total TVA</td>
              <td>0.00 €</td>
            </tr>
            <tr>
              <td style={{ background: "#f5f5f5", fontWeight: "bold" }}>Total TTC</td>
              <td>{totalSum.toFixed(2)} €</td>
            </tr>
          </table>
        </div>
        <div>
          <p>Régles de facturation des professionnels de la déchèterie:</p>
          <ul>
            <li>La facturation est trimestrielle.</li>
            <li>Elle est calculé en fonction du volume total de déchets déposés à la<br />déchetterie durant le trimestre.</li>
          </ul>
        </div>
      </div>
    </Container>
  );
};

export default ProtectedRoute(Invoice);
