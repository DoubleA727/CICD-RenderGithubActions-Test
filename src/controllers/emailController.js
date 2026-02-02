const { sendEmail } = require('../services/email/email');
const { generatePDF, generateQRCODE } = require('../services/pdf + qrcode/pdf_QRcode_Service');
const pool = require("../services/db");

/* ===========================
   SEND ORDER RECEIPT
=========================== */
exports.sendReceipt = async (req, res, next) => {
  try {
    // retrieve data
    const orderData = res.data;
    const orderId = orderData[0].id;
    const email = orderData[0].email;
    const totalPrice = orderData[0].totalPrice;
    const spinnerDiscount = totalPrice * res.discount;
    const discountedPrice = totalPrice - spinnerDiscount;
    console.log("discounted: ", discountedPrice)

    // generate pdf
    const pdfBuffer = await generatePDF({
      orderId,
      email,
      items: orderData,
      total: discountedPrice
    });

    // SEND EMAIL (awaited)
    await sendEmail({
      to: email,
      subject: 'Order Receipt',
      html: `
        <h2>Thank you for your order!</h2>
        <p><strong>Email:</strong> ${email}</p>
        <p>Total Price: <strong>$${totalPrice}</strong></p>

        <h3>Items</h3>
        <ul>
          ${orderData.map(i => `
            <li>${i.quantity} × ${i.name} — $${i.subtotal}</li>
          `).join("")}
        </ul>

        <p>Your order will arrive shortly.</p>
        <p>We hope to see you again soon!</p>
      `,
      attachments: [
        {
          filename: `receipt-${orderId}.pdf`,
          content: pdfBuffer,
          contentType: 'application/pdf'
        }
      ]
    });

    // QR Code data
    res.qrcode = JSON.stringify({
      orderId,
      email,
      items: orderData,
      total: discountedPrice
    });

    next();
  } catch (error) {
    console.error("Error sending receipt:", error);
    res.status(500).json({
      success: false,
      message: "Error sending receipt."
    });
  }
};

/* ===========================
   GET ALL USER EMAILS
=========================== */
function getAllUserEmails() {
  return new Promise((resolve, reject) => {
    const SQL = `
      SELECT email
      FROM "Users"
      WHERE email IS NOT NULL
    `;
    pool.query(SQL, (err, result) => {
      if (err) return reject(err);
      resolve(result.rows || []);
    });
  });
}

/* ===========================
   SEND PROMOTIONAL EMAIL
=========================== */
exports.sendPromotionalEmail = async (req, res) => {
  const { subject, htmlContent } = req.body;

  if (!subject || !htmlContent) {
    return res.status(400).json({
      success: false,
      message: "Subject and email content are required."
    });
  }

  try {
    const users = await getAllUserEmails();

    if (!users.length) {
      return res.status(404).json({
        success: false,
        message: "No users found to send emails to."
      });
    }

    console.log(`[PROMO EMAIL] Sending to ${users.length} users...`);

    let sentCount = 0;

    for (const user of users) {
      if (!user.email) continue;

      await sendEmail({
        to: user.email,
        subject,
        html: htmlContent
      });

      sentCount++;
    }

    return res.status(200).json({
      success: true,
      message: `Promotional email sent to ${sentCount} users.`
    });
  } catch (error) {
    console.error("Error sending promotional email:", error);
    return res.status(500).json({
      success: false,
      message: "Error sending promotional email."
    });
  }
};
