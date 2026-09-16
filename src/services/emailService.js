const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: process.env.SMTP_SECURE === 'true',

    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});

async function verifyEmailConnection() {
    try {
        await transporter.verify();

        console.log('Email SMTP connection verified successfully.');
    } catch (error) {
        console.error('Email SMTP connection failed:', error.message);
    }
}

async function sendOrderDispatchedEmail({
    customerName,
    customerEmail,
    orderId,
    total,
}) {
    const mailOptions = {
        from: `"Duka Letu" <${process.env.SMTP_FROM}>`,
        to: customerEmail,

        subject: `Order #${orderId} has been dispatched`,

        text: `
Hello ${customerName},

Your order #${orderId} has been dispatched.

Order Total: KES ${Number(total).toFixed(2)}

Thank you for shopping with Duka Letu.

Regards,
Duka Letu Team
`,

        html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6;">
        <h2>Order Dispatched</h2>

        <p>Hello ${customerName},</p>

        <p>
          Your order
          <strong>#${orderId}</strong>
          has been dispatched.
        </p>

        <p>
          <strong>Order Total:</strong>
          KES ${Number(total).toFixed(2)}
        </p>

        <p>
          Thank you for shopping with Duka Letu.
        </p>

        <p>
          Regards,<br>
          <strong>Duka Letu Team</strong>
        </p>
      </div>
    `,
    };

    const info = await transporter.sendMail(mailOptions);

    console.log(
        `Dispatch email sent to ${customerEmail}. Message ID: ${info.messageId}`
    );

    console.log('SMTP HOST:', process.env.SMTP_HOST);
    console.log('SMTP PORT:', process.env.SMTP_PORT);
    console.log('SMTP USER:', process.env.SMTP_USER);
    return info;
}

module.exports = {
    transporter,
    verifyEmailConnection,
    sendOrderDispatchedEmail,
};