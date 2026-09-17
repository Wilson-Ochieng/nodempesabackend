const { firestore } = require('./firebaseAdmin');

async function markOrderAsPaid({
  userId,
  orderId,
}) {
  if (!userId) {
    throw new Error('User ID is required');
  }

  if (!orderId) {
    throw new Error('Order ID is required');
  }

  const orderRef = firestore
    .collection('users')
    .doc(userId)
    .collection('orders')
    .doc(orderId);

  const orderSnapshot = await orderRef.get();

  if (!orderSnapshot.exists) {
    throw new Error(
      `Order not found: users/${userId}/orders/${orderId}`
    );
  }

  await orderRef.update({
    paymentStatus: 'paid',
    orderStatus: 'processing',
    updatedAt: new Date(),
  });

  console.log(
    `Order ${orderId} marked as paid and processing`
  );

  return true;
}

module.exports = {
  markOrderAsPaid,
};