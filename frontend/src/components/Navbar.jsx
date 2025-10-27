import "./Navbar.css";
import logo from "../assets/logo_olimpia.png";

export default function Navbar() {
  return (
    <nav className="navbar">
      <div className="navbar-left">
        <img src={logo} alt="Logo Librería Olimpia" className="navbar-logo" />
      </div>

      <div className="navbar-right">
        <a href="#">Productos</a>
        <a href="#">Pedidos</a>
        <a href="#">Reportes</a>
        <a href="#">Clientes</a>
        <span className="separator">|</span>
        <span className="admin-name">Admin</span>
        <button className="logout-btn">Cerrar sesión</button>
      </div>
    </nav>
  );
}
