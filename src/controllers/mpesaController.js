const { initiateSTKPush } = require('../services/mpesaService');
const {
  createPayment,
  updatePayment,
  getPayment,
} = require('../services/paymentStore');

const {
  sendPaymentConfirmationEmail,
} = require('../services/emailService');

const {
  getUserFcmToken,
} = require('../services/userService');

const {
  sendPushNotification,
} = require('../services/notificationService');
const {
  markOrderAsPaid,
} = require('../services/orderService');

async function stkPush(req, res) {
  try {
    const {
      phoneNumber,
      amount,
      orderId,
      customerName,
      customerEmail,
      customerUid,
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

    if (!customerUid) {
      return res.status(400).json({
        success: false,
        message: 'Customer UID is required',
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
      customerUid,
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
      'M-Pesa Daraja Error Status:',
      error.response?.status
    );

    console.error(
      'M-Pesa Daraja Error Response:',
      JSON.stringify(
        error.response?.data,
        null,
        2
      )
    );

    console.error(
      'M-Pesa Error Message:',
      error.message
    );

    return res.status(500).json({
      success: false,
      message: 'Failed to initiate M-Pesa payment',
      error: error.response?.data || error.message,
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

    // ==========================================================
    // PAYMENT SUCCESSFUL
    // ==========================================================

    if (callback.ResultCode === 0) {
      const items =
        callback.CallbackMetadata?.Item || [];

      const getMetadata = (name) =>
        items.find(
          (item) => item.Name === name
        )?.Value;

      const receiptNumber =
        getMetadata('MpesaReceiptNumber');

      const transactionDate =
        getMetadata('TransactionDate');

      // --------------------------------------------------------
      // GET EXISTING PAYMENT
      // --------------------------------------------------------

      const existingPayment =
        getPayment(checkoutRequestId);

      if (!existingPayment) {
        console.error(
          'Payment not found for checkout request:',
          checkoutRequestId
        );

        return res.status(200).json({
          ResultCode: 0,
          ResultDesc:
            'Callback received but payment was not found',
        });
      }

      // --------------------------------------------------------
      // PREVENT DUPLICATE PROCESSING
      // --------------------------------------------------------

      const alreadyPaid =
        existingPayment.status === 'paid';

      if (alreadyPaid) {
        console.log(
          `Duplicate callback ignored for order ${existingPayment.orderId}`
        );

        return res.status(200).json({
          ResultCode: 0,
          ResultDesc: 'Callback already processed',
        });
      }

      // --------------------------------------------------------
      // UPDATE PAYMENT RECORD
      // --------------------------------------------------------

      const payment = updatePayment(
        checkoutRequestId,
        {
          status: 'paid',
          message: 'Payment received successfully.',
          receiptNumber,
          transactionDate,
        }
      );

      console.log(
        'Payment successful:',
        payment
      );

      // --------------------------------------------------------
      // UPDATE FIRESTORE ORDER
      // --------------------------------------------------------

      try {
        await markOrderAsPaid({
          userId: payment.customerUid,
          orderId: payment.orderId,
        });

        console.log(
          `Firestore order ${payment.orderId} updated successfully`
        );
      } catch (orderError) {
        console.error(
          'Firestore order update failed:',
          orderError.message
        );
      }

      // --------------------------------------------------------
      // SEND PAYMENT CONFIRMATION EMAIL
      // --------------------------------------------------------

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

      // --------------------------------------------------------
      // SEND FCM NOTIFICATION
      // --------------------------------------------------------

      try {
        const fcmToken =
          await getUserFcmToken(
            payment.customerUid
          );

        if (!fcmToken) {
          console.log(
            `No FCM token found for user ${payment.customerUid}`
          );
        } else {
          await sendPushNotification({
            token: fcmToken,
            title: 'Payment Successful',
            body:
              `Your payment of KES ${payment.amount} ` +
              `for order ${payment.orderId} ` +
              `has been received successfully.`,
            data: {
              type: 'payment_success',
              orderId: payment.orderId,
              receiptNumber: payment.receiptNumber,
            },
          });

          console.log(
            `Payment notification sent for order ${payment.orderId}`
          );
        }
      } catch (notificationError) {
        console.error(
          'Payment notification failed:',
          notificationError.message
        );
      }
    }

    // ==========================================================
    // PAYMENT FAILED
    // ==========================================================

    else {
      const existingPayment =
        getPayment(checkoutRequestId);

      if (existingPayment) {
        updatePayment(
          checkoutRequestId,
          {
            status: 'failed',
            message:
              callback.ResultDesc ||
              'M-Pesa payment failed.',
          }
        );

        console.log(
          'Payment failed:',
          callback.ResultDesc
        );
      } else {
        console.error(
          'Payment not found for failed callback:',
          checkoutRequestId
        );
      }
    }

    // ==========================================================
    // ACKNOWLEDGE CALLBACK TO SAFARICOM
    // ==========================================================

    return res.status(200).json({
      ResultCode: 0,
      ResultDesc: 'Callback received successfully',
    });

  } catch (error) {
    console.error(
      'Callback Error:',
      error.message
    );

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