const pool = require('../config/db');

/**
 * @route GET /api/categories
 * @desc Obtiene todas las categorías principales y subcategorías.
 * @access Public 
 */
exports.getAllCategories = async (req, res) => {
    try {
        // La consulta trae todas las categorías. 
        // Se puede añadir lógica para mostrar subcategorías si 'categoria_padre_id' no es NULL.
        // Por ahora, traemos la lista plana para el filtro del reporte.
        const sql = `
            SELECT 
                c1.id, 
                c1.nombre, 
                c2.nombre AS categoria_padre_nombre
            FROM categoria c1
            LEFT JOIN categoria c2 ON c1.categoria_padre_id = c2.id
            ORDER BY c1.nombre ASC;
        `;
        
        const [rows] = await pool.query(sql);
        
        // Transformar la respuesta para un formato más amigable
        const categories = rows.map(row => ({
            id: row.id,
            nombre: row.nombre,
            categoriaPadre: row.categoria_padre_nombre || 'N/A'
        }));

        res.json(categories);
        
    } catch (error) {
        console.error('❌ Error al obtener categorías:', error);
        res.status(500).json({ message: 'Error al obtener la lista de categorías' });
    }
};