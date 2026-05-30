const pool = require('../db/pool');

async function getAll(req, res) {
  const { estado, fecha_desde, fecha_hasta } = req.query;
  let sql = `
    SELECT v.id_venta, v.fecha_venta, v.total, v.estado,
           c.nombre  AS nombre_cliente,
           u.nombre  AS nombre_empleado
    FROM VENTA v
    JOIN CLIENTE  c ON v.id_cliente  = c.id_cliente
    JOIN EMPLEADO e ON v.id_empleado = e.id_empleado
    JOIN USUARIO  u ON e.id_usuario  = u.id_usuario
    WHERE 1=1
  `;
  const params = [];
  if (estado)      { sql += ' AND v.estado = ?';               params.push(estado); }
  if (fecha_desde) { sql += ' AND DATE(v.fecha_venta) >= ?';   params.push(fecha_desde); }
  if (fecha_hasta) { sql += ' AND DATE(v.fecha_venta) <= ?';   params.push(fecha_hasta); }
  sql += ' ORDER BY v.fecha_venta DESC';

  const [rows] = await pool.query(sql, params);
  res.json(rows);
}

async function getById(req, res) {
  const [venta] = await pool.query(
    `SELECT v.*, c.nombre AS nombre_cliente, u.nombre AS nombre_empleado
     FROM VENTA v
     JOIN CLIENTE  c ON v.id_cliente  = c.id_cliente
     JOIN EMPLEADO e ON v.id_empleado = e.id_empleado
     JOIN USUARIO  u ON e.id_usuario  = u.id_usuario
     WHERE v.id_venta = ?`,
    [req.params.id]
  );
  if (!venta.length) return res.status(404).json({ error: 'Venta no encontrada' });

  const [detalle] = await pool.query(
    `SELECT dv.*, p.nombre AS nombre_producto, p.talla, p.color,
            m.nombre AS marca
     FROM DETALLE_VENTA dv
     JOIN PRODUCTO p ON dv.id_producto = p.id_producto
     JOIN MARCA    m ON p.id_marca     = m.id_marca
     WHERE dv.id_venta = ?`,
    [req.params.id]
  );

  res.json({ ...venta[0], detalle });
}

async function create(req, res) {
  const { id_cliente, id_empleado, items } = req.body;

  if (!id_cliente || !id_empleado || !items?.length)
    return res.status(400).json({ error: 'id_cliente, id_empleado e items son requeridos' });

  try {
    await pool.query(
      'CALL sp_registrar_venta(?, ?, ?, @id_venta, @total_venta)',
      [id_cliente, id_empleado, JSON.stringify(items)]
    );
    const [[out]] = await pool.query('SELECT @id_venta AS id_venta, @total_venta AS total');
    res.status(201).json({
      id_venta: out.id_venta,
      total: out.total,
      message: 'Venta registrada correctamente con stored procedure',
    });
  } catch (err) {
    res.status(400).json({ error: err.sqlMessage || err.message || 'Error al procesar la venta' });
  }
}

async function anular(req, res) {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const [venta] = await conn.query(
      'SELECT * FROM VENTA WHERE id_venta = ? FOR UPDATE',
      [req.params.id]
    );
    if (!venta.length) throw new Error('Venta no encontrada');
    if (venta[0].estado === 'anulada') throw new Error('La venta ya está anulada');

    const [detalles] = await conn.query(
      'SELECT id_producto, cantidad FROM DETALLE_VENTA WHERE id_venta = ?',
      [req.params.id]
    );
    for (const d of detalles) {
      await conn.query(
        'UPDATE PRODUCTO SET stock = stock + ? WHERE id_producto = ?',
        [d.cantidad, d.id_producto]
      );
    }

    await conn.query(
      `UPDATE VENTA SET estado = 'anulada' WHERE id_venta = ?`,
      [req.params.id]
    );

    await conn.commit();
    res.json({ message: 'Venta anulada y stock restaurado' });
  } catch (err) {
    await conn.rollback();
    res.status(400).json({ error: err.message });
  } finally {
    conn.release();
  }
}

async function getReporte(req, res) {
  const { fecha_desde, fecha_hasta } = req.query;
  const desde = fecha_desde || '2000-01-01';
  const hasta = fecha_hasta || '2099-12-31';

  const [porEmpleadoResult] = await pool.query('CALL sp_reporte_ventas_por_fecha(?, ?)', [desde, hasta]);
  const porEmpleado = porEmpleadoResult[0];

  const [porCategoria] = await pool.query(`
    SELECT c.nombre AS categoria,
           SUM(dv.cantidad)  AS unidades_vendidas,
           SUM(dv.subtotal)  AS ingresos
    FROM DETALLE_VENTA dv
    JOIN VENTA    v  ON dv.id_venta     = v.id_venta
    JOIN PRODUCTO p  ON dv.id_producto  = p.id_producto
    JOIN CATEGORIA c ON p.id_categoria  = c.id_categoria
    WHERE v.estado = 'completada'
      AND DATE(v.fecha_venta) BETWEEN ? AND ?
    GROUP BY c.nombre
    ORDER BY ingresos DESC
  `, [desde, hasta]);

  const [ultimasVentas] = await pool.query(`
    SELECT * FROM vista_ventas_detalle
    WHERE DATE(fecha_venta) BETWEEN ? AND ?
    ORDER BY fecha_venta DESC
    LIMIT 20
  `, [desde, hasta]);

  res.json({ porEmpleado, porCategoria, ultimasVentas });
}

module.exports = { getAll, getById, create, anular, getReporte };
