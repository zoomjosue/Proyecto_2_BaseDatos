require('dotenv').config();
const express = require('express');
const cors    = require('cors');

const routes           = require('./routes');
const { seedAdmin }    = require('./controllers/authController');

const app  = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// API
app.use('/api', routes);

// Health check
app.get('/health', (_, res) => res.json({ status: 'ok' }));

// Error handler global
app.use((err, req, res, _next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Error interno del servidor' });
});

app.listen(PORT, async () => {
  console.log(`Backend corriendo en http://localhost:${PORT}`);
  try {
    await seedAdmin();
  } catch (e) {
    console.warn('Seed admin postponed:', e.message);
  }
});
