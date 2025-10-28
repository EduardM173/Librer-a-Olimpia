import React from "react";
import "./PaymentQRModal.css";

export default function PaymentQRModal({ open, total, onClose, onConfirm }) {
  if (!open) return null;
  return (
    <div className="qr-overlay" onClick={onClose}>
      <div className="qr-modal" onClick={(e) => e.stopPropagation()}>
        <h3>Paga con QR</h3>
        <p>Monto a pagar: <strong>Bs {Number(total).toFixed(2)}</strong></p>
        <img src="/IMG/QR.png" alt="QR de pago" className="qr-img" />
        <div className="qr-actions">
          <button className="qr-cancel" onClick={onClose}>Cancelar</button>
          <button className="qr-ok" onClick={onConfirm}>Ya pagué</button>
        </div>
      </div>
    </div>
  );
}
