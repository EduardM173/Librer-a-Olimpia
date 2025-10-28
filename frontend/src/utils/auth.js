// src/utils/auth.js
const readRole = (u) => {
  if (!u || typeof u !== 'object') return '';
  // Soporta distintas claves y formatos
  const raw =
    u.rol ??
    u.role ??
    u.Rol ??
    u.ROLE ??
    u.role_name ??
    u?.usuario?.rol ?? // por si viene anidado
    '';
  return String(raw).toUpperCase().trim();
};

export const isAdmin = (user) => readRole(user) === 'ADMIN';
export const getRole = (user) => readRole(user);
