const { initiateSTKPush } = require('../services/mpesaService');
const {
  createPayment,
  updatePayment,
  getPayment,
} = require('../services/paymentStore');

const {
  sendPaymentConfirmationEmail,
} = require('../services/emailService');

async function stkPush(req, res) {
  try {
    const {
      phoneNumber,
      amount,
      orderId,
      customerName,
      customerEmail,
    } = req.body;

    if (!phoneNumber) {
      return res.status(400).json({
        success: false,
        message: 'Phone number is required',
      });
    }

    if (!customerName) {
      return res.status(400).json({
        success: false,
        message: 'Customer name is required',
      });
    }

    if (!customerEmail || !customerEmail.includes('@')) {
      return res.status(400).json({
        success: false,
        message: 'Valid customer email is required',
      });
    }



    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Valid amount is required',
      });
    }

    if (!orderId) {
      return res.status(400).json({
        success: false,
        message: 'Order ID is required',
      });
    }

    const result = await initiateSTKPush({
      phoneNumber,
      amount,
      accountReference: orderId,
      transactionDescription: `Payment for order ${orderId}`,
    });

    if (result.ResponseCode !== '0') {
      return res.status(400).json({
        success: false,
        message: result.ResponseDescription || 'STK Push failed',
        data: result,
      });
    }

    createPayment({
      orderId,
      checkoutRequestId: result.CheckoutRequestID,
      merchantRequestId: result.MerchantRequestID,
      amount,
      phoneNumber,
      customerName,
      customerEmail,
    });

    return res.status(200).json({
      success: true,
      message: 'STK Push initiated successfully',
      data: {
        checkoutRequestId: result.CheckoutRequestID,
        merchantRequestId: result.MerchantRequestID,
        customerMessage: result.CustomerMessage,
      },
    });
  } catch (error) {
    console.error(
      'M-Pesa STK Push Error:',
      error.response?.data || error.message
    );

    return res.status(500).json({
      success: false,
      message: 'Failed to initiate M-Pesa payment',
    });
  }
}

async function mpesaCallback(req, res) {
  try {
    console.log(
      'M-Pesa Callback:',
      JSON.stringify(req.body, null, 2)
    );

    const callback = req.body?.Body?.stkCallback;

    if (!callback) {
      return res.status(400).json({
        ResultCode: 1,
        ResultDesc: 'Invalid callback payload',
      });
    }

    const checkoutRequestId = callback.CheckoutRequestID;


    if (callback.ResultCode === 0) {
      const items = callback.CallbackMetadata?.Item || [];

      const getMetadata = (name) =>
        items.find((item) => item.Name === name)?.Value;

      const receiptNumber = getMetadata('MpesaReceiptNumber');
      const transactionDate = getMetadata('TransactionDate');

      // Get the existing payment before updating it.
      const existingPayment = getPayment(checkoutRequestId);

      if (!existingPayment) {
        console.error(
          'Payment not found for checkout request:',
          checkoutRequestId
        );

        return res.status(200).json({
          ResultCode: 0,
          ResultDesc: 'Callback received but payment was not found',
        });
      }

      // Prevent duplicate payment emails if Safaricom
      // sends the callback more than once.
      const alreadyPaid = existingPayment.status === 'paid';

      const payment = updatePayment(checkoutRequestId, {
        status: 'paid',
        message: 'Payment received successfully.',
        receiptNumber,
        transactionDate,
      });

      console.log('Payment successful:', payment);

      if (!alreadyPaid) {
        try {
          await sendPaymentConfirmationEmail({
            customerName: payment.customerName,
            customerEmail: payment.customerEmail,
            orderId: payment.orderId,
            total: payment.amount,
            receiptNumber,
          });

          console.log(
            `Payment confirmation email sent for order ${payment.orderId}`
          );
        } catch (emailError) {

          console.error(
            'Payment confirmation email failed:',
            emailError.message
          );
        }
      } else {
        console.log(
          `Duplicate callback ignored for order ${existingPayment.orderId}`
        );
      }
    }

    else {
      updatePayment(checkoutRequestId, {
        status: 'failed',
        message: callback.ResultDesc || 'M-Pesa payment failed.',
      });

      console.log('Payment failed:', callback.ResultDesc);
    }

    return res.status(200).json({
      ResultCode: 0,
      ResultDesc: 'Callback received successfully',
    });
  } catch (error) {
    console.error('Callback Error:', error.message);

    return res.status(500).json({
      ResultCode: 1,
      ResultDesc: 'Callback processing failed',
    });
  }
}

async function paymentStatus(req, res) {
  const { checkoutRequestId } = req.params;

  const payment = getPayment(checkoutRequestId);

  if (!payment) {
    return res.status(404).json({
      success: false,
      message: 'Payment not found',
    });
  }

  return res.status(200).json({
    success: true,
    data: payment,
  });
}

module.exports = {
  stkPush,
  mpesaCallback,
  paymentStatus,
};