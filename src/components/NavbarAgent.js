import { Navbar, Container, NavDropdown, Nav } from "react-bootstrap";
import { PersonFillGear, BoxArrowRight, Dropbox } from "react-bootstrap-icons";
import { HouseFill, PeopleFill, ArrowRightSquareFill, Sliders, Clipboard2Fill, MenuDown } from "react-bootstrap-icons";
import { useEffect, useState } from "react";
import { getCookie, removeCookie } from "@/libs/clientCookie";
import { useRouter } from "next/router";
import { useMyContext } from "@/context/Mycontext";
import styles from "@/styles/Navbar.module.css";

const NavBarComp = ({ title }) => {

 const router = useRouter();

 const { setAgentData, agentData } = useMyContext();

 const [user, setUser] = useState(null);

 useEffect(() => {
  const userData = getCookie("agent");

  if (userData) {
   const data = JSON.parse(userData);
   setAgentData(data);
   setUser(data);
  }

 }, []);

 const [isResponsive, setIsResponsive] = useState(false);

 useEffect(() => {
  const handleResize = () => {
   setIsResponsive(window.innerWidth < 992);
  };

  window.addEventListener('resize', handleResize);
  handleResize(); // Appel initial pour définir l'état en fonction de la taille initiale de la fenêtre

  return () => {
   window.removeEventListener('resize', handleResize);
  };
 }, []);


 const handleLogout = () => {
  setAgentData(null);
  removeCookie("agent");
  router.push("/");
 }

 return (
  <Navbar className="bg-body-tertiary" expand="lg">
   <Container fluid>
    <Navbar.Brand href="#">{title && title.length <= 25 ? title : title.slice(0, 22) + "..."}</Navbar.Brand>
    <Navbar.Toggle />

    {isResponsive && (
     <Navbar.Collapse id="navbarScroll">
      <Nav
       className="me-auto my-2 my-lg-0"
       style={{ maxHeight: '200px' }}
       navbarScroll
      >
       <Nav.Link href="/agent/accueil" className={styles.navLink}><HouseFill className={styles.icone} />Accueil</Nav.Link>
       <Nav.Link href="/agent/controle-acces" className={styles.navLink}><MenuDown className={styles.icone} /> Contrôles d'accès</Nav.Link>
       <Nav.Link href="/agent/evacuations" className={styles.navLink}><ArrowRightSquareFill className={styles.icone} />Evacuations</Nav.Link>
       <Nav.Link href="/agent/depots" className={styles.navLink}><Dropbox className={styles.icone} />Dépots Pro</Nav.Link>
       <Nav.Link href="/agent/client" className={styles.navLink}><Clipboard2Fill className={styles.icone} />Clients</Nav.Link>
       {/*<NavDropdown title={
        <span>
         <Clipboard2Fill className={styles.icone} /> Clients
        </span>
       } id=""
       >
        <NavDropdown.Item href="/agent/clients">Liste des clients</NavDropdown.Item>
        <NavDropdown.Divider />
        <NavDropdown.Item href="/agent/factures">Factures</NavDropdown.Item>
       </NavDropdown>*/}
       <Nav.Link href="/agent/parametres" className={styles.navLink}> <PersonFillGear className={styles.icone} /> Paramètres</Nav.Link>
       <Nav.Link href="#" onClick={handleLogout} className={styles.navLink}><BoxArrowRight className={styles.icone} />Déconnexion</Nav.Link>
      </Nav>
     </Navbar.Collapse>
    )

    }

    {!isResponsive && (
     <NavDropdown title={agentData ? agentData.nom + " " + agentData.prenom : ""} style={{ marginRight: 80 }}>
      <NavDropdown.Item href="/agent/parametres">
       <PersonFillGear size={20} />
       Paramètres
      </NavDropdown.Item>
      <NavDropdown.Divider />
      <NavDropdown.Item onClick={handleLogout}>
       <BoxArrowRight size={20} />
       Déconnexion
      </NavDropdown.Item>
     </NavDropdown>
    )}


   </Container>
  </Navbar>
 )
};

export default NavBarComp;