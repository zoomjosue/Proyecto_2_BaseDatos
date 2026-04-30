const pool = require('../db/pool');

function makeCatalogController(table, idField, orderBy = 'nombre') {
  return {
    async getAll(req, res) {
      const [rows] = await pool.query(`SELECT * FROM \`${table}\` ORDER BY ${orderBy}`);
      res.json(rows);
    },
    async getById(req, res) {
      const [rows] = await pool.query(
        `SELECT * FROM \`${table}\` WHERE ${idField} = ?`, [req.params.id]
      );
      if (!rows.length) return res.status(404).json({ error: 'No encontrado' });
      res.json(rows[0]);
    },
    async create(req, res) {
      const fields = Object.keys(req.body).filter(k => k !== idField);
      const values = fields.map(f => req.body[f]);
      const sql = `INSERT INTO \`${table}\` (${fields.join(',')}) VALUES (${fields.map(() => '?').join(',')})`;
      const [r] = await pool.query(sql, values);
      res.status(201).json({ [idField]: r.insertId });
    },
    async update(req, res) {
      const fields = Object.keys(req.body).filter(k => k !== idField);
      const values = fields.map(f => req.body[f]);
      const sql = `UPDATE \`${table}\` SET ${fields.map(f => `${f}=?`).join(',')} WHERE ${idField}=?`;
      const [r] = await pool.query(sql, [...values, req.params.id]);
      if (r.affectedRows === 0) return res.status(404).json({ error: 'No encontrado' });
      res.json({ message: 'Actualizado' });
    },
    async remove(req, res) {
      try {
        const [r] = await pool.query(`DELETE FROM \`${table}\` WHERE ${idField}=?`, [req.params.id]);
        if (r.affectedRows === 0) return res.status(404).json({ error: 'No encontrado' });
        res.json({ message: 'Eliminado' });
      } catch (err) {
        if (err.code === 'ER_ROW_IS_REFERENCED_2')
          return res.status(409).json({ error: 'No se puede eliminar: tiene registros relacionados' });
        throw err;
      }
    }
  };
}

// Empleados
async function getEmpleados(req, res) {
  const [rows] = await pool.query(`
    SELECT e.id_empleado, u.nombre, u.email, u.rol,
           e.telefono, e.direccion, e.fecha_contrato
    FROM EMPLEADO e
    JOIN USUARIO u ON e.id_usuario = u.id_usuario
    ORDER BY u.nombre
  `);
  res.json(rows);
}

module.exports = {
  categoriaCtrl: makeCatalogController('CATEGORIA', 'id_categoria'),
  marcaCtrl:     makeCatalogController('MARCA',     'id_marca'),
  deporteCtrl:   makeCatalogController('DEPORTE',   'id_deporte'),
  proveedorCtrl: makeCatalogController('PROVEEDOR', 'id_proveedor'),
  getEmpleados,
};
