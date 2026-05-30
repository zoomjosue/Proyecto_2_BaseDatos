const pool = require('../db/pool');
const { Cliente } = require('../db/orm');

async function getAll(req, res) {
  const { search } = req.query;
  let sql = `SELECT * FROM CLIENTE WHERE 1=1`;
  const params = [];
  if (search) { sql += ' AND (nombre LIKE ? OR email LIKE ?)'; params.push(`%${search}%`, `%${search}%`); }
  sql += ' ORDER BY nombre';
  const [rows] = await pool.query(sql, params);
  res.json(rows);
}

// Clientes con su historial de compras 
async function getConHistorial(req, res) {
  const sql = `
    SELECT c.id_cliente, c.nombre, c.email, c.telefono,
           COUNT(v.id_venta)  AS total_ventas,
           COALESCE(SUM(v.total), 0) AS monto_total,
           MAX(v.fecha_venta) AS ultima_compra
    FROM CLIENTE c
    LEFT JOIN VENTA v ON c.id_cliente = v.id_cliente AND v.estado = 'completada'
    GROUP BY c.id_cliente, c.nombre, c.email, c.telefono
    HAVING total_ventas >= 0
    ORDER BY monto_total DESC
  `;
  const [rows] = await pool.query(sql);
  res.json(rows);
}

// Clientes que han comprado de un deporte específico 
async function getPorDeporte(req, res) {
  const { id_deporte } = req.params;
  const sql = `
    SELECT DISTINCT c.id_cliente, c.nombre, c.email, c.telefono
    FROM CLIENTE c
    WHERE c.id_cliente IN (
      SELECT v.id_cliente
      FROM VENTA v
      JOIN DETALLE_VENTA dv ON v.id_venta    = dv.id_venta
      JOIN PRODUCTO      p  ON dv.id_producto = p.id_producto
      WHERE p.id_deporte = ? AND v.estado = 'completada'
    )
    ORDER BY c.nombre
  `;
  const [rows] = await pool.query(sql, [id_deporte]);
  res.json(rows);
}

async function getById(req, res) {
  const [rows] = await pool.query('SELECT * FROM CLIENTE WHERE id_cliente = ?', [req.params.id]);
  if (!rows.length) return res.status(404).json({ error: 'Cliente no encontrado' });
  res.json(rows[0]);
}

async function create(req, res) {
  const { nombre, email, telefono, direccion } = req.body;
  if (!nombre) return res.status(400).json({ error: 'El nombre es obligatorio' });

  try {
    const cliente = await Cliente.create({
      nombre,
      email: email || null,
      telefono: telefono || null,
      direccion: direccion || null,
    });
    res.status(201).json({ id_cliente: cliente.id_cliente, message: 'Cliente creado con ORM' });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY' || err.name === 'SequelizeUniqueConstraintError')
      return res.status(409).json({ error: 'Ya existe un cliente con ese email' });
    throw err;
  }
}

async function update(req, res) {
  const { nombre, email, telefono, direccion } = req.body;
  if (!nombre) return res.status(400).json({ error: 'El nombre es obligatorio' });

  try {
    const [r] = await pool.query(
      `UPDATE CLIENTE SET nombre=?, email=?, telefono=?, direccion=? WHERE id_cliente=?`,
      [nombre, email || null, telefono || null, direccion || null, req.params.id]
    );
    if (r.affectedRows === 0) return res.status(404).json({ error: 'Cliente no encontrado' });
    res.json({ message: 'Cliente actualizado' });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY')
      return res.status(409).json({ error: 'Ya existe un cliente con ese email' });
    throw err;
  }
}

async function remove(req, res) {
  const [check] = await pool.query(
    `SELECT EXISTS(SELECT 1 FROM VENTA WHERE id_cliente = ?) AS tiene_ventas`,
    [req.params.id]
  );
  if (check[0].tiene_ventas)
    return res.status(409).json({ error: 'No se puede eliminar: el cliente tiene ventas registradas' });

  const [r] = await pool.query('DELETE FROM CLIENTE WHERE id_cliente = ?', [req.params.id]);
  if (r.affectedRows === 0) return res.status(404).json({ error: 'Cliente no encontrado' });
  res.json({ message: 'Cliente eliminado' });
}

module.exports = { getAll, getById, getConHistorial, getPorDeporte, create, update, remove };
