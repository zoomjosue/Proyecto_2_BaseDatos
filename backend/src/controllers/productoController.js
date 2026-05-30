const pool = require('../db/pool');
const { Sequelize, Producto, Categoria, Marca, Deporte, Proveedor } = require('../db/orm');

async function getAll(req, res) {
  const { search, categoria, deporte } = req.query;
  const where = {};
  if (search) where.nombre = { [Sequelize.Op.like]: `%${search}%` };
  if (categoria) where.id_categoria = categoria;
  if (deporte) where.id_deporte = deporte;

  const rows = await Producto.findAll({
    where,
    include: [
      { model: Categoria, as: 'categoriaData', attributes: ['nombre'] },
      { model: Marca, as: 'marcaData', attributes: ['nombre'] },
      { model: Deporte, as: 'deporteData', attributes: ['nombre'] },
      { model: Proveedor, as: 'proveedorData', attributes: ['nombre'] },
    ],
    order: [['nombre', 'ASC']],
  });

  res.json(rows.map((p) => {
    const json = p.toJSON();
    return {
      ...json,
      categoria: json.categoriaData?.nombre,
      marca: json.marcaData?.nombre,
      deporte: json.deporteData?.nombre,
      proveedor: json.proveedorData?.nombre,
    };
  }));
}

async function getStockBajo(req, res) {
  const [rows] = await pool.query('SELECT * FROM vista_stock_bajo ORDER BY nombre');
  res.json(rows);
}

async function getMasVendidos(req, res) {
  const [rows] = await pool.query('CALL sp_producto_mas_vendido(?)', [10]);
  res.json(rows[0]);
}

async function updateStock(req, res) {
  const nuevoStock = Number(req.body.stock);
  if (!Number.isInteger(nuevoStock)) {
    return res.status(400).json({ error: 'stock debe ser entero' });
  }
  await pool.query('CALL sp_actualizar_stock(?, ?)', [req.params.id, nuevoStock]);
  res.json({ message: 'Stock actualizado con stored procedure' });
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

  await pool.query(
    `CALL sp_crear_producto_seguro(?,?,?,?,?,?,?,?,?,?,?, @nuevo_producto_id)`,
    [id_categoria, id_proveedor, id_marca, id_deporte,
     nombre, descripcion || null, talla || null, color || null,
     precio, stock ?? 0, stock_minimo ?? 5]
  );
  const [[out]] = await pool.query('SELECT @nuevo_producto_id AS id_producto');
  res.status(201).json({ id_producto: out.id_producto, message: 'Producto creado con stored procedure' });
}

async function update(req, res) {
  const { id_categoria, id_proveedor, id_marca, id_deporte,
          nombre, descripcion, talla, color, precio, stock, stock_minimo } = req.body;

  if (!nombre || !precio)
    return res.status(400).json({ error: 'Nombre y precio son obligatorios' });

  const producto = await Producto.findByPk(req.params.id);
  if (!producto) return res.status(404).json({ error: 'Producto no encontrado' });

  await producto.update({
    id_categoria,
    id_proveedor,
    id_marca,
    id_deporte,
    nombre,
    descripcion: descripcion || null,
    talla: talla || null,
    color: color || null,
    precio,
    stock,
    stock_minimo,
  });
  if (stock !== undefined) {
    await pool.query('CALL sp_actualizar_stock(?, ?)', [req.params.id, Number(stock)]);
  }
  res.json({ message: 'Producto actualizado con ORM' });
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

module.exports = { getAll, getById, getStockBajo, getMasVendidos, getSinVentas, create, update, updateStock, remove };
