const { firestore } = require('./firebaseAdmin');

// ============================================================
// CREATE PAYMENT
// ============================================================

async function createPayment({
  orderId,
  checkoutRequestId,
  merchantRequestId,
  amount,
  phoneNumber,
  customerName,
  customerEmail,
  customerUid,
}) {
  if (!checkoutRequestId) {
    throw new Error('Checkout Request ID is required');
  }

  const paymentRef = firestore
    .collection('payments')
    .doc(checkoutRequestId);

  await paymentRef.set({
    orderId,
    checkoutRequestId,
    merchantRequestId,
    amount,
    phoneNumber,
    customerName,
    customerEmail,
    customerUid,

    status: 'pending',

    message:
      'STK Push sent. Waiting for payment.',

    receiptNumber: null,
    transactionDate: null,

    createdAt:
      new Date(),

    updatedAt:
      new Date(),
  });

  console.log(
    `Payment ${checkoutRequestId} created in Firestore`
  );

  return true;
}

// ============================================================
// UPDATE PAYMENT
// ============================================================

async function updatePayment(
  checkoutRequestId,
  data,
) {
  if (!checkoutRequestId) {
    throw new Error(
      'Checkout Request ID is required'
    );
  }

  const paymentRef = firestore
    .collection('payments')
    .doc(checkoutRequestId);

  const snapshot =
    await paymentRef.get();

  if (!snapshot.exists) {
    console.log(
      `Payment not found: ${checkoutRequestId}`
    );

    return null;
  }

  await paymentRef.update({
    ...data,
    updatedAt:
      new Date(),
  });

  const updatedSnapshot =
    await paymentRef.get();

  const updatedPayment =
    updatedSnapshot.data();

  console.log(
    `Payment ${checkoutRequestId} updated: ${updatedPayment.status}`
  );

  return updatedPayment;
}

// ============================================================
// GET PAYMENT
// ============================================================

async function getPayment(
  checkoutRequestId,
) {
  if (!checkoutRequestId) {
    return null;
  }

  const paymentRef = firestore
    .collection('payments')
    .doc(checkoutRequestId);

  const snapshot =
    await paymentRef.get();

  if (!snapshot.exists) {
    return null;
  }

  return snapshot.data();
}

// ============================================================
// EXPORTS
// ============================================================

module.exports = {
  createPayment,
  updatePayment,
  getPayment,
};