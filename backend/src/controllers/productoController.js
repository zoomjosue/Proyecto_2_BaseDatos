const pool = require('../db/pool');

async function getAll(req, res) {
  const { search, categoria, deporte } = req.query;
  let sql = `
    SELECT p.id_producto, p.nombre, p.descripcion, p.talla, p.color,
           p.precio, p.stock, p.stock_minimo,
           c.nombre  AS categoria,
           m.nombre  AS marca,
           d.nombre  AS deporte,
           pr.nombre AS proveedor,
           p.id_categoria, p.id_marca, p.id_deporte, p.id_proveedor
    FROM PRODUCTO p
    JOIN CATEGORIA c  ON p.id_categoria = c.id_categoria
    JOIN MARCA     m  ON p.id_marca     = m.id_marca
    JOIN DEPORTE   d  ON p.id_deporte   = d.id_deporte
    JOIN PROVEEDOR pr ON p.id_proveedor = pr.id_proveedor
    WHERE 1=1
  `;
  const params = [];
  if (search)    { sql += ' AND p.nombre LIKE ?';       params.push(`%${search}%`); }
  if (categoria) { sql += ' AND p.id_categoria = ?';    params.push(categoria); }
  if (deporte)   { sql += ' AND p.id_deporte = ?';      params.push(deporte); }
  sql += ' ORDER BY p.nombre';

  const [rows] = await pool.query(sql, params);
  res.json(rows);
}

async function getStockBajo(req, res) {
  const [rows] = await pool.query('SELECT * FROM vista_stock_bajo ORDER BY nombre');
  res.json(rows);
}

async function getMasVendidos(req, res) {
  const sql = `
    WITH ventas_por_producto AS (
      SELECT dv.id_producto,
             SUM(dv.cantidad)  AS total_vendido,
             SUM(dv.subtotal)  AS ingresos_totales,
             COUNT(DISTINCT dv.id_venta) AS num_ventas
      FROM DETALLE_VENTA dv
      JOIN VENTA v ON dv.id_venta = v.id_venta
      WHERE v.estado = 'completada'
      GROUP BY dv.id_producto
      HAVING SUM(dv.cantidad) > 0
    )
    SELECT p.id_producto, p.nombre, p.precio,
           m.nombre AS marca,
           d.nombre AS deporte,
           vpp.total_vendido,
           vpp.ingresos_totales,
           vpp.num_ventas
    FROM ventas_por_producto vpp
    JOIN PRODUCTO p ON vpp.id_producto = p.id_producto
    JOIN MARCA    m ON p.id_marca      = m.id_marca
    JOIN DEPORTE  d ON p.id_deporte    = d.id_deporte
    ORDER BY vpp.total_vendido DESC
    LIMIT 10
  `;
  const [rows] = await pool.query(sql);
  res.json(rows);
}

async function getSinVentas(req, res) {
  const sql = `
    SELECT p.id_producto, p.nombre, p.precio, p.stock,
           m.nombre AS marca, c.nombre AS categoria
    FROM PRODUCTO p
    JOIN MARCA     m ON p.id_marca     = m.id_marca
    JOIN CATEGORIA c ON p.id_categoria = c.id_categoria
    WHERE p.id_producto NOT IN (
      SELECT DISTINCT id_producto FROM DETALLE_VENTA
    )
    ORDER BY p.nombre
  `;
  const [rows] = await pool.query(sql);
  res.json(rows);
}

async function getById(req, res) {
  const [rows] = await pool.query(
    `SELECT p.*, c.nombre AS categoria, m.nombre AS marca,
            d.nombre AS deporte, pr.nombre AS proveedor
     FROM PRODUCTO p
     JOIN CATEGORIA c  ON p.id_categoria = c.id_categoria
     JOIN MARCA     m  ON p.id_marca     = m.id_marca
     JOIN DEPORTE   d  ON p.id_deporte   = d.id_deporte
     JOIN PROVEEDOR pr ON p.id_proveedor = pr.id_proveedor
     WHERE p.id_producto = ?`,
    [req.params.id]
  );
  if (!rows.length) return res.status(404).json({ error: 'Producto no encontrado' });
  res.json(rows[0]);
}

async function create(req, res) {
  const { id_categoria, id_proveedor, id_marca, id_deporte,
          nombre, descripcion, talla, color, precio, stock, stock_minimo } = req.body;

  if (!nombre || !precio || !id_categoria || !id_proveedor || !id_marca || !id_deporte)
    return res.status(400).json({ error: 'Campos obligatorios: nombre, precio, categoria, proveedor, marca, deporte' });

  const [r] = await pool.query(
    `INSERT INTO PRODUCTO
       (id_categoria, id_proveedor, id_marca, id_deporte, nombre, descripcion, talla, color, precio, stock, stock_minimo)
     VALUES (?,?,?,?,?,?,?,?,?,?,?)`,
    [id_categoria, id_proveedor, id_marca, id_deporte,
     nombre, descripcion || null, talla || null, color || null,
     precio, stock ?? 0, stock_minimo ?? 5]
  );
  res.status(201).json({ id_producto: r.insertId, message: 'Producto creado' });
}

async function update(req, res) {
  const { id_categoria, id_proveedor, id_marca, id_deporte,
          nombre, descripcion, talla, color, precio, stock, stock_minimo } = req.body;

  if (!nombre || !precio)
    return res.status(400).json({ error: 'Nombre y precio son obligatorios' });

  const [r] = await pool.query(
    `UPDATE PRODUCTO SET id_categoria=?, id_proveedor=?, id_marca=?, id_deporte=?,
       nombre=?, descripcion=?, talla=?, color=?, precio=?, stock=?, stock_minimo=?
     WHERE id_producto=?`,
    [id_categoria, id_proveedor, id_marca, id_deporte,
     nombre, descripcion || null, talla || null, color || null,
     precio, stock, stock_minimo, req.params.id]
  );
  if (r.affectedRows === 0) return res.status(404).json({ error: 'Producto no encontrado' });
  res.json({ message: 'Producto actualizado' });
}

async function remove(req, res) {
  const [check] = await pool.query(
    `SELECT EXISTS(SELECT 1 FROM DETALLE_VENTA WHERE id_producto = ?) AS tiene_ventas`,
    [req.params.id]
  );
  if (check[0].tiene_ventas)
    return res.status(409).json({ error: 'No se puede eliminar: el producto tiene ventas registradas' });

  const [r] = await pool.query('DELETE FROM PRODUCTO WHERE id_producto = ?', [req.params.id]);
  if (r.affectedRows === 0) return res.status(404).json({ error: 'Producto no encontrado' });
  res.json({ message: 'Producto eliminado' });
}

module.exports = { getAll, getById, getStockBajo, getMasVendidos, getSinVentas, create, update, remove };
