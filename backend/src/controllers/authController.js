const bcrypt = require('bcrypt');
const jwt    = require('jsonwebtoken');
const pool   = require('../db/pool');

async function seedAdmin() {
  const [rows] = await pool.query('SELECT COUNT(*) AS cnt FROM USUARIO');
  if (rows[0].cnt > 0) return; 

  const adminHash = await bcrypt.hash('Admin123!', 10);
  const empHash   = await bcrypt.hash('Empleado123!', 10);

  const usuarios = [
    ['Administrador Sistema', 'admin@tienda.com',  adminHash, 'admin'],
    ['Luis Ramírez',          'luis@tienda.com',   empHash,   'empleado'],
    ['Sofia Torres',          'sofia@tienda.com',  empHash,   'empleado'],
    ['Diego Castillo',        'diego@tienda.com',  empHash,   'empleado'],
    ['Valentina Ruiz',        'vale@tienda.com',   empHash,   'empleado'],
  ];

  const today = new Date().toISOString().split('T')[0];
  const contratoDates = ['2022-01-15','2022-03-01','2023-01-10','2023-06-15','2024-01-05'];
  const telefonos     = ['5555-0001','5555-0002','5555-0003','5555-0004','5555-0005'];
  const direcciones   = ['Zona 10','Zona 4','Mixco','Villa Nueva','Zona 18'];

  const empIds = [];
  for (let i = 0; i < usuarios.length; i++) {
    await pool.query(
      `INSERT INTO USUARIO (nombre, email, password_hash, rol) VALUES (?,?,?,?)`,
      usuarios[i]
    );
    const [[{id: uid}]] = await pool.query('SELECT LAST_INSERT_ID() AS id');
    await pool.query(
      `INSERT INTO EMPLEADO (id_usuario, telefono, direccion, fecha_contrato) VALUES (?,?,?,?)`,
      [uid, telefonos[i], direcciones[i], contratoDates[i]]
    );
    const [[{id: eid}]] = await pool.query('SELECT LAST_INSERT_ID() AS id');
    empIds.push(eid);
  }
  console.log('Usuarios y empleados creados. Admin: admin@tienda.com / Admin123!');

  await seedVentas(pool, empIds);
}

async function seedVentas(pool, empIds) {
  const [e1,e2,e3,e4,e5] = empIds;

  const ventas = [
    [1,e1,'2025-11-01 10:00:00',1100.00,'completada'],
    [2,e2,'2025-11-03 11:30:00',470.00,'completada'],
    [3,e1,'2025-11-05 09:15:00',920.00,'completada'],
    [4,e3,'2025-11-08 14:00:00',1800.00,'completada'],
    [5,e2,'2025-11-10 16:45:00',360.00,'completada'],
    [6,e4,'2025-11-12 10:30:00',2050.00,'completada'],
    [7,e1,'2025-11-15 11:00:00',750.00,'completada'],
    [8,e5,'2025-11-18 13:00:00',540.00,'completada'],
    [9,e3,'2025-11-20 09:45:00',1900.00,'completada'],
    [10,e2,'2025-11-22 15:30:00',275.00,'completada'],
    [11,e1,'2025-12-01 10:00:00',850.00,'completada'],
    [12,e4,'2025-12-03 11:00:00',620.00,'completada'],
    [13,e2,'2025-12-05 14:30:00',980.00,'completada'],
    [14,e3,'2025-12-08 09:00:00',430.00,'completada'],
    [15,e5,'2025-12-10 16:00:00',1100.00,'completada'],
    [1,e1,'2025-12-12 10:15:00',520.00,'completada'],
    [2,e2,'2025-12-15 11:45:00',380.00,'completada'],
    [3,e4,'2025-12-18 13:30:00',1050.00,'completada'],
    [4,e1,'2026-01-05 10:00:00',250.00,'pendiente'],
    [5,e3,'2026-01-10 14:00:00',950.00,'pendiente'],
    [6,e2,'2026-01-12 09:30:00',195.00,'completada'],
    [7,e5,'2026-01-15 11:00:00',840.00,'anulada'],
    [8,e1,'2026-01-18 15:45:00',1800.00,'completada'],
    [9,e4,'2026-01-20 10:30:00',120.00,'completada'],
    [10,e2,'2026-01-22 14:15:00',470.00,'completada'],
  ];

  const ventaIds = [];
  for (const v of ventas) {
    await pool.query(
      `INSERT INTO VENTA (id_cliente, id_empleado, fecha_venta, total, estado) VALUES (?,?,?,?,?)`, v
    );
    const [[{id}]] = await pool.query('SELECT LAST_INSERT_ID() AS id');
    ventaIds.push(id);
  }

  const detalles = [
    [[6,1,1100.00,1100.00]],                                          
    [[3,1,250.00,250.00],[15,1,95.00,95.00],[25,2,55.00,110.00],[10,1,95.00,95.00]], 
    [[2,1,920.00,920.00]],                                            
    [[20,1,1800.00,1800.00]],                                         
    [[5,2,180.00,360.00]],                                            
    [[13,1,750.00,750.00],[1,1,850.00,850.00],[11,1,450.00,450.00]],  
    [[13,1,750.00,750.00]],                                           
    [[19,1,520.00,520.00],[10,1,95.00,95.00]],                        
    [[20,1,1800.00,1800.00],[25,2,55.00,110.00]],                     
    [[3,1,250.00,250.00],[25,1,55.00,55.00]],                         
    [[1,1,850.00,850.00]],                                            
    [[16,1,620.00,620.00]],                                           
    [[8,1,980.00,980.00]],                                            
    [[18,1,380.00,380.00],[25,1,55.00,55.00]],                        
    [[6,1,1100.00,1100.00]],                                          
    [[19,1,520.00,520.00]],                                           
    [[18,1,380.00,380.00]],                                           
    [[26,1,1050.00,1050.00]],                                         
    [[3,1,250.00,250.00]],                                            
    [[21,1,950.00,950.00]],                                           
    [[27,1,195.00,195.00]],                                           
    [[12,1,85.00,85.00],[5,1,180.00,180.00],[4,1,220.00,220.00],[10,2,95.00,190.00],[3,1,250.00,250.00]], // v22
    [[20,1,1800.00,1800.00]],                                         
    [[7,1,120.00,120.00]],                                            
    [[2,1,920.00,920.00],[3,1,250.00,250.00]],                        
  ];

  for (let i = 0; i < detalles.length; i++) {
    const id_venta = ventaIds[i];
    for (const [id_producto, cantidad, precio_unitario, subtotal] of detalles[i]) {
      await pool.query(
        `INSERT INTO DETALLE_VENTA (id_venta, id_producto, cantidad, precio_unitario, subtotal) VALUES (?,?,?,?,?)`,
        [id_venta, id_producto, cantidad, precio_unitario, subtotal]
      );
    }
  }
  console.log('✅ Ventas y detalles de prueba insertados.');
}

async function login(req, res) {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ error: 'Email y contraseña requeridos' });

  const [rows] = await pool.query(
    'SELECT * FROM USUARIO WHERE email = ?', [email]
  );
  if (!rows.length)
    return res.status(401).json({ error: 'Credenciales incorrectas' });

  const user = rows[0];
  const match = await bcrypt.compare(password, user.password_hash);
  if (!match)
    return res.status(401).json({ error: 'Credenciales incorrectas' });

  const token = jwt.sign(
    { id: user.id_usuario, nombre: user.nombre, email: user.email, rol: user.rol },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '8h' }
  );

  res.json({ token, user: { id: user.id_usuario, nombre: user.nombre, email: user.email, rol: user.rol } });
}

module.exports = { login, seedAdmin };
