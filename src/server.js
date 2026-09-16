require('dotenv').config();

const express = require('express');
const cors = require('cors');

const mpesaRoutes = require('./routes/mpesaRoutes');
const emailRoutes = require('./routes/emailRoutes');

const app = express();




// ============================================================
// MIDDLEWARE
// ============================================================

app.use(cors());

app.use(express.json());

app.use(express.urlencoded({
  extended: true,
}));


// ============================================================
// HEALTH CHECK
// ============================================================

app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'M-Pesa Payment Server is running',
  });
});


// ============================================================
// MPESA ROUTES
// ============================================================

app.use(
  '/api/payments/mpesa',
  mpesaRoutes
);
app.use('/api/email', emailRoutes);


// ============================================================
// SERVER
// ============================================================

const PORT = process.env.PORT || 10000;

const {
  verifyEmailConnection,
} = require('./services/emailService');

app.listen(
  PORT,
  '0.0.0.0',
  async () => {
    console.log(
      `Server running on port ${PORT}`
    );

    await verifyEmailConnection();
  }
);