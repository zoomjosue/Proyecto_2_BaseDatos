const bcrypt = require('bcrypt');
const crypto = require('crypto');
const pool = require('../db/pool');
const { sequelize, Usuario } = require('../db/orm');
const { ROLES } = require('../security/permissions');

function sha256(value) {
  return crypto.createHash('sha256').update(value).digest('hex');
}

async function passwordMatches(password, storedHash) {
  if (!storedHash) return false;
  if (storedHash.startsWith('sha256$')) {
    return sha256(password) === storedHash.replace('sha256$', '');
  }
  return bcrypt.compare(password, storedHash);
}

async function login(req, res) {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email y contrasena requeridos' });
  }

  const [rows] = await pool.query('SELECT * FROM USUARIO WHERE email = ?', [email]);
  if (!rows.length) return res.status(401).json({ error: 'Credenciales incorrectas' });

  const user = rows[0];
  const match = await passwordMatches(password, user.password_hash);
  if (!match) return res.status(401).json({ error: 'Credenciales incorrectas' });

  const sessionUser = {
    id: user.id_usuario,
    nombre: user.nombre,
    email: user.email,
    rol: user.rol,
  };

  req.session.user = sessionUser;
  res.json({ user: sessionUser });
}

function me(req, res) {
  res.json({ user: req.session?.user || null });
}

function logout(req, res) {
  req.session.destroy(() => {
    res.clearCookie('tienda.sid');
    res.json({ message: 'Sesion cerrada' });
  });
}

async function registerUser(req, res) {
  const { nombre, email, password = 'secret', rol, telefono, direccion, fecha_contrato } = req.body;
  const rolesValidos = Object.values(ROLES);
  if (!nombre || !email || !rol) {
    return res.status(400).json({ error: 'nombre, email y rol son obligatorios' });
  }
  if (!rolesValidos.includes(rol)) {
    return res.status(400).json({ error: 'Rol invalido' });
  }

  try {
    const password_hash = `sha256$${sha256(password)}`;
    const usuario = await sequelize.transaction(async (transaction) => {
      const created = await Usuario.create({ nombre, email, password_hash, rol }, { transaction });
      await sequelize.query(
        'INSERT INTO EMPLEADO (id_usuario, telefono, direccion, fecha_contrato) VALUES (?,?,?,?)',
        {
          replacements: [created.id_usuario, telefono || null, direccion || null, fecha_contrato || new Date()],
          transaction,
        }
      );
      return created;
    });
    res.status(201).json({ id_usuario: usuario.id_usuario, message: 'Usuario registrado con ORM' });
  } catch (err) {
    if (err.name === 'SequelizeUniqueConstraintError' || err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ error: 'Ya existe un usuario con ese email' });
    }
    throw err;
  }
}

async function getUsuarios(req, res) {
  const [rows] = await pool.query(`
    SELECT u.id_usuario, u.nombre, u.email, u.rol, u.created_at,
           e.id_empleado, e.telefono, e.direccion, e.fecha_contrato
    FROM USUARIO u
    LEFT JOIN EMPLEADO e ON e.id_usuario = u.id_usuario
    ORDER BY u.nombre
  `);
  res.json(rows);
}

async function seedDemoVentas() {
  const [[{ cnt }]] = await pool.query('SELECT COUNT(*) AS cnt FROM VENTA');
  if (cnt > 0) return;

  const [empleados] = await pool.query('SELECT id_empleado FROM EMPLEADO ORDER BY id_empleado');
  if (empleados.length < 5) return;
  const empIds = empleados.map((e) => e.id_empleado);
  await seedVentas(pool, empIds);
}

async function seedVentas(poolRef, empIds) {
  const [e1, e2, e3, e4, e5] = empIds;
  const ventas = [
    [1, e1, '2025-11-01 10:00:00', 1100.00, 'completada'],
    [2, e2, '2025-11-03 11:30:00', 470.00, 'completada'],
    [3, e1, '2025-11-05 09:15:00', 920.00, 'completada'],
    [4, e3, '2025-11-08 14:00:00', 1800.00, 'completada'],
    [5, e2, '2025-11-10 16:45:00', 360.00, 'completada'],
    [6, e4, '2025-11-12 10:30:00', 2050.00, 'completada'],
    [7, e1, '2025-11-15 11:00:00', 750.00, 'completada'],
    [8, e5, '2025-11-18 13:00:00', 540.00, 'completada'],
    [9, e3, '2025-11-20 09:45:00', 1900.00, 'completada'],
    [10, e2, '2025-11-22 15:30:00', 275.00, 'completada'],
  ];

  const ventaIds = [];
  for (const venta of ventas) {
    const [result] = await poolRef.query(
      'INSERT INTO VENTA (id_cliente, id_empleado, fecha_venta, total, estado) VALUES (?,?,?,?,?)',
      venta
    );
    ventaIds.push(result.insertId);
  }

  const detalles = [
    [[6, 1, 1100.00, 1100.00]],
    [[3, 1, 250.00, 250.00], [15, 1, 95.00, 95.00], [25, 2, 55.00, 110.00], [10, 1, 95.00, 95.00]],
    [[2, 1, 920.00, 920.00]],
    [[20, 1, 1800.00, 1800.00]],
    [[5, 2, 180.00, 360.00]],
    [[13, 1, 750.00, 750.00], [1, 1, 850.00, 850.00], [11, 1, 450.00, 450.00]],
    [[13, 1, 750.00, 750.00]],
    [[19, 1, 520.00, 520.00], [10, 1, 95.00, 95.00]],
    [[20, 1, 1800.00, 1800.00], [25, 2, 55.00, 110.00]],
    [[3, 1, 250.00, 250.00], [25, 1, 55.00, 55.00]],
  ];

  for (let i = 0; i < detalles.length; i++) {
    for (const [id_producto, cantidad, precio_unitario, subtotal] of detalles[i]) {
      await poolRef.query(
        'INSERT INTO DETALLE_VENTA (id_venta, id_producto, cantidad, precio_unitario, subtotal) VALUES (?,?,?,?,?)',
        [ventaIds[i], id_producto, cantidad, precio_unitario, subtotal]
      );
    }
  }
  console.log('Ventas y detalles de prueba insertados.');
}

module.exports = { login, logout, me, registerUser, getUsuarios, seedDemoVentas };
