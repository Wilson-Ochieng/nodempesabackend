const payments = new Map();

function createPayment({
  orderId,
  checkoutRequestId,
  merchantRequestId,
  amount,
  phoneNumber,
  customerName,
  customerEmail,
  customerUid,
}) {
  payments.set(checkoutRequestId, {
    orderId,
    checkoutRequestId,
    merchantRequestId,
    amount,
    phoneNumber,
    customerName,
    customerEmail,
    customerUid,
    status: 'pending',
    message: 'STK Push sent. Waiting for payment.',
    receiptNumber: null,
    transactionDate: null,
  });
}

function updatePayment(checkoutRequestId, data) {
  const payment = payments.get(checkoutRequestId);

  if (!payment) {
    return null;
  }

  const updatedPayment = {
    ...payment,
    ...data,
  };

  payments.set(
    checkoutRequestId,
    updatedPayment
  );

  return updatedPayment;
}

function getPayment(checkoutRequestId) {
  return payments.get(checkoutRequestId);
}

module.exports = {
  createPayment,
  updatePayment,
  getPayment,
};