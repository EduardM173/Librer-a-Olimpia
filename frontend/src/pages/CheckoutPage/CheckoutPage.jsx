import React, { useEffect, useState } from "react";
import "./CheckoutPage.css";
import { useCart } from "../../context/CartContext";
import { useAuth } from "../../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import PaymentQRModal from "../../components/PaymentQR/PaymentQRModal";

const money = (n) => `Bs ${Number(n || 0).toFixed(2)}`;

export default function CheckoutPage() {
  const { items, total, clear } = useCart();
  const { user, token, openLogin } = useAuth();
  const navigate = useNavigate();

  const [envio, setEnvio] = useState({ zona: "", calle: "", numero_casa: "" });
  const [factura, setFactura] = useState({ nit_ci: "", razon_social: "", celular: "" });
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");
  const [qrOpen, setQrOpen] = useState(false);

  // 🧩 Cargar datos del cliente logueado
  useEffect(() => {
    const load = async () => {
      if (!user || user.tipo !== "CLIENTE" || !token) return;
      try {
        const r = await fetch("http://localhost:3000/api/clientes/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (r.ok) {
          const c = await r.json();
          setEnvio({
            zona: c.zona || "",
            calle: c.calle || "",
            numero_casa: c.numero_casa || "",
          });
          setFactura((f) => ({ ...f, nit_ci: c.nit_ci || "" }));
        }
      } catch {}
    };
    load();
  }, [user, token]);

  const onChangeEnvio = (e) => setEnvio((s) => ({ ...s, [e.target.name]: e.target.value }));
  const onChangeFac = (e) => setFactura((s) => ({ ...s, [e.target.name]: e.target.value }));

  // 💳 Confirmar compra
  const confirmar = async () => {
    if (items.length === 0) {
      setMsg("No tienes productos en el carrito.");
      return;
    }
    if (!user || user.tipo !== "CLIENTE") {
      setMsg("Debes iniciar sesión.");
      openLogin();
      return;
    }
    if (!token) {
      setMsg("Sesión expirada. Inicia sesión nuevamente.");
      openLogin();
      return;
    }

    setLoading(true);
    setMsg("");
    try {
      const r = await fetch("http://localhost:3000/api/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          envio,
          factura,
          items: items.map((i) => ({ id: i.id, qty: i.qty })),
        }),
      });

      const data = await r.json();
      if (!r.ok) {
        if (data?.error === "stock_insuficiente") {
          setMsg(
            `Sin stock de "${data.detail?.nombre || data.detail?.id}". Disp.: ${data.detail?.stock}, Sol.: ${data.detail?.solicitado}`
          );
        } else if (data?.error === "only_clients") {
          setMsg("Debes iniciar sesión como cliente.");
          openLogin();
        } else {
          setMsg("No se pudo finalizar la compra. Intenta nuevamente.");
        }
        return;
      }

      clear();
      navigate(`/pedido-exitoso?pedido=${data.pedido_id}`);
    } catch (e) {
      setMsg("Error de red.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="CheckoutPage">
      <h1>FINALIZAR COMPRA</h1>
      {msg && <div className="ck-msg">{msg}</div>}

      {items.length === 0 && (
        <p>
          Tu carrito está vacío. <Link to="/catalogo">Ir al catálogo</Link>
        </p>
      )}

      <div className="ck-grid">
        {/* DATOS DE ENVÍO / FACTURA */}
        <section className="ck-card">
          <h2>Datos de Envío</h2>
          <div className="ck-form">
            <label>
              Zona
              <input name="zona" value={envio.zona} onChange={onChangeEnvio} required />
            </label>
            <div className="ck-row">
              <label>
                Calle
                <input name="calle" value={envio.calle} onChange={onChangeEnvio} required />
              </label>
              <label>
                N° vivienda
                <input
                  name="numero_casa"
                  value={envio.numero_casa}
                  onChange={onChangeEnvio}
                  required
                />
              </label>
            </div>
          </div>

          <h2>Datos para la Factura</h2>
          <div className="ck-form">
            <label>
              CI / NIT
              <input name="nit_ci" value={factura.nit_ci} onChange={onChangeFac} />
            </label>
            <label>
              Razón Social / Nombre
              <input name="razon_social" value={factura.razon_social} onChange={onChangeFac} />
            </label>
            <label>
              Nro de Celular
              <input name="celular" value={factura.celular} onChange={onChangeFac} />
            </label>
            <p className="ck-help">El pago se realiza mediante QR.</p>
          </div>
        </section>

        {/* RESUMEN */}
        <aside className="ck-card ck-summary">
          <h2>Pedido</h2>
          <div className="ck-list">
            {items.map((it) => (
              <div key={it.id} className="ck-item">
                <img src={it.imagen} alt={it.nombre} />
                <div className="ck-item-info">
                  <div className="name">{it.nombre}</div>
                  <div className="sub">
                    {it.qty} × {money(it.precio)}
                  </div>
                </div>
                <div className="ck-item-total">{money(it.qty * it.precio)}</div>
              </div>
            ))}
          </div>
          <div className="ck-total">
            <span>Total</span>
            <strong>{money(total)}</strong>
          </div>
        </aside>
      </div>

      {/* BOTONES */}
      <div style={{ display: "flex", gap: 12, justifyContent: "flex-end" }}>
        <button
          className="ck-secondary"
          onClick={() => setQrOpen(true)}
          disabled={items.length === 0}
        >
          Pagar con QR
        </button>
        <button
          className="ck-confirm"
          disabled={loading || items.length === 0}
          onClick={() => setQrOpen(true)}
        >
          {loading ? "Procesando..." : "CONFIRMAR COMPRA"}
        </button>
      </div>

      <PaymentQRModal
        open={qrOpen}
        total={Number(total) || 0}
        onClose={() => setQrOpen(false)}
        onConfirm={() => {
          setQrOpen(false);
          confirmar();
        }}
      />
    </div>
  );
}
