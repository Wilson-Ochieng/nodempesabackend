
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

// ============================================================
// SMTP CONNECTION VERIFICATION
// ============================================================

async function verifyEmailConnection() {
    try {
        await transporter.verify();

        console.log('Email SMTP connection verified successfully.');
    } catch (error) {
        console.error(
            'Email SMTP connection failed:',
            error.message
        );
    }
}

// ============================================================
// HELPER FUNCTIONS
// ============================================================

function escapeHtml(value) {
    return String(value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

// ============================================================
// DISPATCH EMAIL
// ============================================================

async function sendOrderDispatchedEmail({
    customerName,
    customerEmail,
    orderId,
    total,
}) {
    const safeCustomerName = escapeHtml(customerName);
    const safeCustomerEmail = escapeHtml(customerEmail);
    const safeOrderId = escapeHtml(orderId);

    const formattedTotal = Number(total).toLocaleString(
        'en-KE',
        {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }
    );

    // Your Duka Letu logo.
    //
    // IMPORTANT:
    // Replace this URL with your actual publicly accessible
    // logo URL after deploying your app.
    //
    const logoUrl =
        process.env.EMAIL_LOGO_URL ||
        'https://your-domain.com/assets/duka-letu-logo.png';

    // Support email that customers can reply to.
    const replyTo =
        process.env.SMTP_REPLY_TO ||
        process.env.SMTP_FROM;

    const mailOptions = {
        from: `"Duka Letu" <${process.env.SMTP_FROM}>`,

        to: customerEmail,

        // ====================================================
        // REPLY-TO
        // ====================================================
        //
        // When the customer clicks "Reply" in Gmail/Outlook,
        // their response will be sent to this address.
        //
        replyTo,

        subject: `Order #${orderId} has been dispatched 🚚`,

        // ====================================================
        // PLAIN TEXT VERSION
        // ====================================================

        text: `
Hello ${customerName},

Great news! Your order #${orderId} has been dispatched.

Order Details
-------------
Order ID: #${orderId}
Order Total: KES ${formattedTotal}

Your order is now on its way to you.

If you have any questions, simply reply to this email and our support team will assist you.

Thank you for shopping with Duka Letu.

Regards,
Duka Letu Team

${replyTo}
`,

        // ====================================================
        // HTML EMAIL
        // ====================================================

        html: `
<!DOCTYPE html>
<html lang="en">
<head>

<meta charset="UTF-8">

<meta
    name="viewport"
    content="width=device-width, initial-scale=1.0"
>

<title>Order Dispatched - Duka Letu</title>

<style>

    /* ======================================================
       EMAIL CLIENT SAFE STYLES
       ====================================================== */

    body {
        margin: 0;
        padding: 0;
        background-color: #f3f6f8;
        font-family: Arial, Helvetica, sans-serif;
        color: #1f2937;
    }

    table {
        border-spacing: 0;
        border-collapse: collapse;
    }

    img {
        border: 0;
        display: block;
        max-width: 100%;
    }

    a {
        text-decoration: none;
    }

    /* ======================================================
       ANIMATIONS
       Supported by some modern email clients.
       The email remains functional without them.
       ====================================================== */

    @keyframes fadeIn {
        from {
            opacity: 0;
            transform: translateY(10px);
        }

        to {
            opacity: 1;
            transform: translateY(0);
        }
    }

    @keyframes pulse {
        0% {
            transform: scale(1);
        }

        50% {
            transform: scale(1.05);
        }

        100% {
            transform: scale(1);
        }
    }

    .email-wrapper {
        animation: fadeIn 0.7s ease-out;
    }

    .truck-icon {
        animation: pulse 2s ease-in-out infinite;
    }

    .action-button {
        transition:
            transform 0.2s ease,
            box-shadow 0.2s ease;
    }

    .action-button:hover {
        transform: translateY(-2px);
        box-shadow:
            0 8px 18px rgba(24, 144, 89, 0.25);
    }

    /* ======================================================
       MOBILE
       ====================================================== */

    @media only screen and (max-width: 600px) {

        .container {
            width: 100% !important;
        }

        .content {
            padding: 25px 20px !important;
        }

        .hero-title {
            font-size: 25px !important;
        }

        .order-table td {
            display: block !important;
            width: 100% !important;
            box-sizing: border-box;
        }

    }

</style>

</head>

<body>

<!-- =======================================================
     OUTER BACKGROUND
     ======================================================= -->

<table
    width="100%"
    cellpadding="0"
    cellspacing="0"
    border="0"
    style="
        background-color:#f3f6f8;
        padding:35px 15px;
    "
>

<tr>

<td align="center">

<!-- =======================================================
     MAIN CONTAINER
     ======================================================= -->

<table
    class="container email-wrapper"
    width="600"
    cellpadding="0"
    cellspacing="0"
    border="0"
    style="
        max-width:600px;
        width:100%;
        background:#ffffff;
        border-radius:18px;
        overflow:hidden;
        box-shadow:
            0 12px 35px rgba(0,0,0,0.08);
    "
>

<!-- =======================================================
     HEADER / BRAND
     ======================================================= -->

<tr>

<td
    align="center"
    style="
        padding:28px 20px;
        background:
            linear-gradient(
                135deg,
                #0f5132 0%,
                #189059 50%,
                #20b26b 100%
            );
    "
>

<img
    src="${logoUrl}"
    alt="Duka Letu"
    width="150"
    style="
        width:150px;
        max-width:150px;
        margin:0 auto 12px;
    "
>

<p
    style="
        margin:0;
        color:#e9fff3;
        font-size:13px;
        letter-spacing:1px;
        text-transform:uppercase;
    "
>
    Simple shopping. Reliable delivery.
</p>

</td>

</tr>


<!-- =======================================================
     HERO
     ======================================================= -->

<tr>

<td
    align="center"
    style="
        padding:38px 30px 25px;
    "
>

<div
    class="truck-icon"
    style="
        width:70px;
        height:70px;
        line-height:70px;
        margin:0 auto 20px;
        border-radius:50%;
        background:
            linear-gradient(
                135deg,
                #e7f8ef,
                #c8f0dc
            );
        font-size:34px;
        text-align:center;
    "
>
    🚚
</div>

<h1
    class="hero-title"
    style="
        margin:0 0 12px;
        color:#12372a;
        font-size:29px;
        line-height:1.3;
    "
>
    Your order is on its way!
</h1>

<p
    style="
        margin:0;
        color:#667085;
        font-size:15px;
        line-height:1.7;
    "
>
    Great news, ${safeCustomerName}! Your order has
    been successfully dispatched and is now on its way
    to you.
</p>

</td>

</tr>


<!-- =======================================================
     ORDER CARD
     ======================================================= -->

<tr>

<td
    class="content"
    style="
        padding:10px 35px 30px;
    "
>

<table
    width="100%"
    cellpadding="0"
    cellspacing="0"
    border="0"
    style="
        background:#f8faf9;
        border:1px solid #e5eee9;
        border-radius:14px;
    "
>

<tr>

<td
    colspan="2"
    style="
        padding:20px 20px 12px;
        color:#12372a;
        font-size:16px;
        font-weight:bold;
    "
>
    Order Summary
</td>

</tr>


<tr>

<td
    style="
        padding:12px 20px;
        color:#667085;
        font-size:14px;
        border-top:1px solid #edf2ef;
    "
>
    Order ID
</td>

<td
    align="right"
    style="
        padding:12px 20px;
        color:#12372a;
        font-size:14px;
        font-weight:bold;
        border-top:1px solid #edf2ef;
    "
>
    #${safeOrderId}
</td>

</tr>


<tr>

<td
    style="
        padding:12px 20px;
        color:#667085;
        font-size:14px;
        border-top:1px solid #edf2ef;
    "
>
    Order Total
</td>

<td
    align="right"
    style="
        padding:12px 20px;
        color:#189059;
        font-size:18px;
        font-weight:bold;
        border-top:1px solid #edf2ef;
    "
>
    KES ${formattedTotal}
</td>

</tr>

</table>

</td>

</tr>


<!-- =======================================================
     STATUS SECTION
     ======================================================= -->

<tr>

<td
    style="
        padding:0 35px 30px;
    "
>

<table
    width="100%"
    cellpadding="0"
    cellspacing="0"
    border="0"
>

<tr>

<td
    align="center"
    width="33%"
    style="
        color:#189059;
        font-size:22px;
    "
>
    ✓
</td>

<td
    align="center"
    width="33%"
    style="
        color:#189059;
        font-size:22px;
    "
>
    ✓
</td>

<td
    align="center"
    width="33%"
    style="
        color:#189059;
        font-size:22px;
    "
>
    🚚
</td>

</tr>

<tr>

<td
    align="center"
    style="
        padding-top:7px;
        font-size:11px;
        color:#667085;
    "
>
    Order Confirmed
</td>

<td
    align="center"
    style="
        padding-top:7px;
        font-size:11px;
        color:#667085;
    "
>
    Processing
</td>

<td
    align="center"
    style="
        padding-top:7px;
        font-size:11px;
        color:#189059;
        font-weight:bold;
    "
>
    Dispatched
</td>

</tr>

</table>

</td>

</tr>


<!-- =======================================================
     SUPPORT MESSAGE
     ======================================================= -->

<tr>

<td
    style="
        padding:0 35px 30px;
    "
>

<table
    width="100%"
    cellpadding="0"
    cellspacing="0"
    border="0"
    style="
        background:
            linear-gradient(
                135deg,
                #f0faf5,
                #f8fcfa
            );
        border-left:4px solid #189059;
        border-radius:10px;
    "
>

<tr>

<td
    style="
        padding:18px 20px;
    "
>

<p
    style="
        margin:0 0 7px;
        color:#12372a;
        font-weight:bold;
        font-size:14px;
    "
>
    Need help with your order?
</p>

<p
    style="
        margin:0;
        color:#667085;
        font-size:13px;
        line-height:1.6;
    "
>
    Simply reply to this email and our support team
    will be happy to assist you.
</p>

</td>

</tr>

</table>

</td>

</tr>


<!-- =======================================================
     CALL TO ACTION
     ======================================================= -->

<tr>

<td
    align="center"
    style="
        padding:0 35px 35px;
    "
>

<a
    href="mailto:${replyTo}?subject=Order%20%23${encodeURIComponent(orderId)}%20Support"
    class="action-button"
    style="
        display:inline-block;
        padding:13px 25px;
        border-radius:9px;
        background:
            linear-gradient(
                135deg,
                #0f5132,
                #189059
            );
        color:#ffffff;
        font-size:14px;
        font-weight:bold;
        box-shadow:
            0 5px 14px rgba(24,144,89,0.20);
    "
>
    Contact Duka Letu Support
</a>

</td>

</tr>


<!-- =======================================================
     FOOTER
     ======================================================= -->

<tr>

<td
    align="center"
    style="
        padding:25px 20px;
        background:#f7f9f8;
        border-top:1px solid #edf1ef;
    "
>

<p
    style="
        margin:0 0 8px;
        color:#12372a;
        font-size:14px;
        font-weight:bold;
    "
>
    Duka Letu
</p>

<p
    style="
        margin:0 0 8px;
        color:#8a939b;
        font-size:12px;
        line-height:1.6;
    "
>
    Thank you for shopping with us.
</p>

<p
    style="
        margin:0;
        color:#a0a7ad;
        font-size:11px;
    "
>
    This is an automated order notification.
    Please reply to this email if you need assistance.
</p>

</td>

</tr>

</table>

<!-- =======================================================
     OUTSIDE FOOTER
     ======================================================= -->

<p
    style="
        margin:18px 0 0;
        color:#98a2b3;
        font-size:11px;
        text-align:center;
    "
>
    © ${new Date().getFullYear()} Duka Letu. All rights reserved.
</p>

</td>

</tr>

</table>

</body>
</html>
`,
    };

    const info = await transporter.sendMail(mailOptions);

    console.log(
        `Dispatch email sent to ${customerEmail}. Message ID: ${info.messageId}`
    );

    console.log('SMTP HOST:', process.env.SMTP_HOST);
    console.log('SMTP PORT:', process.env.SMTP_PORT);
    console.log('SMTP USER:', process.env.SMTP_USER);
    console.log('REPLY TO:', replyTo);

    return info;
}

module.exports = {
    transporter,
    verifyEmailConnection,
    sendOrderDispatchedEmail,
};

