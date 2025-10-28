const jwt = require("jsonwebtoken");
const SECRET = process.env.JWT_SECRET || "supersecret";

module.exports = (req, res, next) => {
  const header = req.headers.authorization;

  if (!header) {
    return res.status(403).json({ error: "no_token", message: "Token no proporcionado" });
  }

  try {
    const token = header.split(" ")[1];
    const decoded = jwt.verify(token, SECRET);

    // Normalizar campos
    decoded.kind = decoded.kind ? decoded.kind.toLowerCase() : null;
    decoded.rol = decoded.rol ? decoded.rol.toLowerCase() : null;

    // Si no tiene kind pero tiene rol=admin, lo tratamos como usuario interno
    if (!decoded.kind && decoded.rol === "admin") decoded.kind = "usuario";

    req.user = decoded;
    next();
  } catch (err) {
    console.error("❌ Error verificando token:", err.message);
    return res.status(403).json({ error: "invalid_token", message: "Token inválido o expirado" });
  }
};
