const {
  sendOrderDispatchedEmail,
} = require('../services/emailService');

async function sendDispatchEmail(req, res) {
  try {
    const {
      customerName,
      customerEmail,
      orderId,
      total,
    } = req.body;

    if (!customerName) {
      return res.status(400).json({
        success: false,
        message: 'Customer name is required.',
      });
    }

    if (!customerEmail) {
      return res.status(400).json({
        success: false,
        message: 'Customer email is required.',
      });
    }

    if (!orderId) {
      return res.status(400).json({
        success: false,
        message: 'Order ID is required.',
      });
    }

    if (total === undefined || total === null) {
      return res.status(400).json({
        success: false,
        message: 'Order total is required.',
      });
    }

    await sendOrderDispatchedEmail({
      customerName,
      customerEmail,
      orderId,
      total,
    });

    return res.status(200).json({
      success: true,
      message: 'Dispatch email sent successfully.',
    });
  } catch (error) {
    console.error('SEND DISPATCH EMAIL ERROR:', error);

    return res.status(500).json({
      success: false,
      message: 'Failed to send dispatch email.',
    });
  }
}

module.exports = {
  sendDispatchEmail,
};