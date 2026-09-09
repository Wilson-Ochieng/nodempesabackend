const {
  initiateSTKPush,
} = require('../services/mpesaService');


// ============================================================
// STK PUSH
// ============================================================

async function stkPush(req, res) {
  try {
    const {
      phoneNumber,
      amount,
      orderId,
    } = req.body;

    // --------------------------------------------------------
    // VALIDATION
    // --------------------------------------------------------

    if (!phoneNumber) {
      return res.status(400).json({
        success: false,
        message: 'Phone number is required',
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

    // --------------------------------------------------------
    // INITIATE PAYMENT
    // --------------------------------------------------------

    const result = await initiateSTKPush({
      phoneNumber,
      amount,
      accountReference: orderId,
      transactionDescription: `Payment for order ${orderId}`,
    });

    return res.status(200).json({
      success: true,
      message: 'STK Push initiated successfully',
      data: result,
    });

  } catch (error) {
    console.error(
      'M-Pesa STK Push Error:',
      error.response?.data || error.message
    );

    return res.status(500).json({
      success: false,
      message: 'Failed to initiate M-Pesa payment',
      error: error.response?.data || error.message,
    });
  }
}


// ============================================================
// CALLBACK
// ============================================================

async function mpesaCallback(req, res) {
  try {
    console.log(
      'M-Pesa Callback:',
      JSON.stringify(req.body, null, 2)
    );

    const callback =
      req.body?.Body?.stkCallback;

    if (!callback) {
      return res.status(400).json({
        ResultCode: 1,
        ResultDesc: 'Invalid callback payload',
      });
    }

    const resultCode = callback.ResultCode;

    if (resultCode === 0) {
      console.log('Payment successful');

      console.log(
        'Callback Metadata:',
        callback.CallbackMetadata
      );

      // TODO:
      // Save payment to database
      // Update order status
      // Mark payment as completed
    } else {
      console.log(
        'Payment failed:',
        callback.ResultDesc
      );

      // TODO:
      // Update payment status to failed
    }

    // Safaricom expects a response
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


module.exports = {
  stkPush,
  mpesaCallback,
};