const axios = require('axios');

const MPESA_ENV = process.env.MPESA_ENV || 'sandbox';

const BASE_URL =
  MPESA_ENV === 'production'
    ? 'https://api.safaricom.co.ke'
    : 'https://sandbox.safaricom.co.ke';


// ============================================================
// GENERATE ACCESS TOKEN
// ============================================================

async function generateAccessToken() {
  const consumerKey = process.env.MPESA_CONSUMER_KEY;
  const consumerSecret = process.env.MPESA_CONSUMER_SECRET;

  const auth = Buffer.from(
    `${consumerKey}:${consumerSecret}`
  ).toString('base64');

  const response = await axios.get(
    `${BASE_URL}/oauth/v1/generate?grant_type=client_credentials`,
    {
      headers: {
        Authorization: `Basic ${auth}`,
      },
    }
  );

  return response.data.access_token;
}


// ============================================================
// GENERATE TIMESTAMP
// ============================================================

function generateTimestamp() {
  const now = new Date();

  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');

  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');

  return `${year}${month}${day}${hours}${minutes}${seconds}`;
}


// ============================================================
// GENERATE PASSWORD
// ============================================================

function generatePassword(timestamp) {
  const shortcode = process.env.MPESA_SHORTCODE;
  const passkey = process.env.MPESA_PASSKEY;

  const data = `${shortcode}${passkey}${timestamp}`;

  return Buffer.from(data).toString('base64');
}


// ============================================================
// STK PUSH
// ============================================================

async function initiateSTKPush({
  phoneNumber,
  amount,
  accountReference,
  transactionDescription,
}) {
  const accessToken = await generateAccessToken();

  const timestamp = generateTimestamp();

  const password = generatePassword(timestamp);

  const shortcode = process.env.MPESA_SHORTCODE;

  const payload = {
    BusinessShortCode: shortcode,

    Password: password,

    Timestamp: timestamp,

    TransactionType: 'CustomerPayBillOnline',

    Amount: Math.round(amount),

    PartyA: phoneNumber,

    PartyB: shortcode,

    PhoneNumber: phoneNumber,

    CallBackURL: process.env.MPESA_CALLBACK_URL,

    AccountReference: accountReference,

    TransactionDesc: transactionDescription,
  };

  const response = await axios.post(
    `${BASE_URL}/mpesa/stkpush/v1/processrequest`,
    payload,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    }
  );

  return response.data;
}


module.exports = {
  generateAccessToken,
  initiateSTKPush,
};