// contexts/MyContext.js
import { createContext, useState, useContext } from 'react';

const MyContext = createContext();

export const MyContextProvider = ({ children }) => {
 const [admin, setAdmin] = useState(null);
 const [matieresEvacuees, setMatieresEvacuees] = useState([]);
 const [facturation, setFacturation] = useState([]);
 const [clientFacturation, setClientFacturation] = useState(null);
 const [controleAcces, setControleAcces] = useState([]);
 const [agentData, setAgentData] = useState(null);
 const [immatriculationDepot, setImmatriculationDepot] = useState("");
 const [observationsDepot, setObservationsDepot] = useState("");

 const updateTotal = (id, newQuantite, newRemise) => {
  setFacturation(prevFacturation =>
   prevFacturation.map(item => {
    if (item.produit.id === id) {
     const quantite = parseFloat(newQuantite) || 0;
     const remise = parseFloat(newRemise) || 0;
     let total = quantite * item.produit.prix;
     if (remise > 0) {
      total -= (remise / 100) * total;
     }
     return { ...item, quantite, remise, total: parseFloat(total.toFixed(2)) };
    }
    return item;
   })
  );
 };

 const updateTotalControle = (id, newQuantite) => {
  setControleAcces(prevFacturation =>
   prevFacturation.map(item => {
    if (item.produit.id === id) {
     const quantite = parseFloat(newQuantite) || 0;

     return { ...item, quantite };
    }
    return item;
   })
  );
 };




 return (
  <MyContext.Provider value={{
   admin, setAdmin,
   matieresEvacuees, setMatieresEvacuees,
   facturation, setFacturation,
   clientFacturation, setClientFacturation,
   updateTotal,
   controleAcces, setControleAcces,
   updateTotalControle,
   agentData, setAgentData,
   immatriculationDepot, setImmatriculationDepot,
   observationsDepot, setObservationsDepot
  }}>
   {children}
  </MyContext.Provider>
 );
};

export const useMyContext = () => useContext(MyContext);
