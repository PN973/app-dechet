import { Nav, Dropdown, NavLink, NavItem } from "react-bootstrap";
import { HouseFill, PeopleFill, ArrowRightSquareFill, Sliders, Clipboard2Fill, MenuDown, Dropbox } from "react-bootstrap-icons";
import styles from "@/styles/sidenavbar.module.css";

const SideNavBar = () => {
 return (
  <Nav defaultActiveKey="/home" className={`flex-column ${styles.sideNav}`} style={{ width: "18%", minHeight: "100vh", backgroundColor: "#0B1426" }}>
   <Nav.Link href="/dashboard/accueil" className={styles.navLink}><HouseFill className={styles.icone} />  Accueil</Nav.Link>
   <Nav.Link href="/dashboard/agents" className={styles.navLink}> <PeopleFill className={styles.icone} />Agents</Nav.Link>

   <Nav.Link href="/dashboard/controle-acces" className={styles.navLink}><MenuDown className={styles.icone} />Contrôles d'accès</Nav.Link>

   <Nav.Link href="/dashboard/evacuations" className={styles.navLink}><ArrowRightSquareFill className={styles.icone} />Evacuations</Nav.Link>
   <Nav.Link href="/dashboard/depots" className={styles.navLink}><Dropbox className={styles.icone} />Dépots Pro</Nav.Link>
   <Dropdown as={NavItem}>
    <Dropdown.Toggle as={NavLink} className={styles.navLink}><Clipboard2Fill className={styles.icone} />Clients</Dropdown.Toggle>
    <Dropdown.Menu>
     <Nav.Link href="/dashboard/clients" className={styles.subNavLink} >Liste des clients</Nav.Link>
     {/*
     <Nav.Link href="/dashboard/devis" className={styles.subNavLink} >Devis</Nav.Link>
     */}
     <Nav.Link href="/dashboard/factures" className={styles.subNavLink}>Factures</Nav.Link>
    </Dropdown.Menu>
   </Dropdown>

   <Dropdown as={NavItem}>
    <Dropdown.Toggle as={NavLink} className={styles.navLink}><Sliders className={styles.icone} />Configuration</Dropdown.Toggle>
    <Dropdown.Menu>
     <Nav.Link href="/dashboard/chauffeurs" className={styles.subNavLink}>Chauffeurs</Nav.Link>
     <Nav.Link href="/dashboard/bennes" className={styles.subNavLink}>Bennes</Nav.Link>
     <Nav.Link href="/dashboard/decheteries" className={styles.subNavLink}>Déchèteries</Nav.Link>
     <Nav.Link href="/dashboard/matieres-evacuations" className={styles.subNavLink}>Matières d'évacuations</Nav.Link>
    </Dropdown.Menu>
   </Dropdown>
  </Nav>
 );
}

export default SideNavBar;