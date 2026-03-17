import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_APP_PASSWORD,
    },
});

export const sendOrderConfirmation = async (
    userEmail,
    { orderId, deliveryName, deliveryPhone, deliveryAddress, products, totalPrice }
) => {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_APP_PASSWORD) {
        console.log("Email not configured — skipping email send for order", orderId);
        return;
    }

    const productRows = products
        .map(
            (p) =>
                `<tr>
          <td style="padding:8px 12px;border-bottom:1px solid #e0e0e0;">${p.product_name || `Product #${p.product_id}`}</td>
          <td style="padding:8px 12px;border-bottom:1px solid #e0e0e0;text-align:center;">${p.quantity}</td>
          <td style="padding:8px 12px;border-bottom:1px solid #e0e0e0;text-align:right;">$${(p.subtotal || 0).toFixed(2)}</td>
        </tr>`
        )
        .join("");

    const html = `
    <div style="font-family:'Segoe UI',Arial,sans-serif;max-width:600px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden;border:1px solid #e8e8e8;">
      <div style="background:#485935;padding:24px 32px;text-align:center;">
        <h1 style="color:#fff;margin:0;font-size:24px;">🥭 Manach Store</h1>
        <p style="color:#d4e4c0;margin:4px 0 0;font-size:14px;">Order Confirmation</p>
      </div>
      <div style="padding:24px 32px;">
        <p style="font-size:16px;color:#333;">Hi <strong>${deliveryName}</strong>,</p>
        <p style="color:#555;">Thank you for your order! Here are the details:</p>
        
        <div style="background:#f8faf5;border-radius:8px;padding:16px;margin:16px 0;">
          <p style="margin:4px 0;color:#485935;"><strong>Order #:</strong> ${orderId}</p>
          <p style="margin:4px 0;color:#485935;"><strong>Phone:</strong> ${deliveryPhone}</p>
          <p style="margin:4px 0;color:#485935;"><strong>Delivery Address:</strong> ${deliveryAddress}</p>
        </div>
        
        <table style="width:100%;border-collapse:collapse;margin:16px 0;">
          <thead>
            <tr style="background:#485935;color:#fff;">
              <th style="padding:10px 12px;text-align:left;">Product</th>
              <th style="padding:10px 12px;text-align:center;">Qty</th>
              <th style="padding:10px 12px;text-align:right;">Subtotal</th>
            </tr>
          </thead>
          <tbody>
            ${productRows}
          </tbody>
          <tfoot>
            <tr>
              <td colspan="2" style="padding:12px;font-weight:bold;font-size:16px;color:#485935;">Total</td>
              <td style="padding:12px;font-weight:bold;font-size:16px;text-align:right;color:#485935;">$${totalPrice.toFixed(2)}</td>
            </tr>
          </tfoot>
        </table>
        
        <p style="color:#555;font-size:14px;">We'll prepare your order for delivery soon. If you have any questions, feel free to reply to this email.</p>
        <p style="color:#888;font-size:12px;margin-top:24px;text-align:center;">© Manach Store — Fresh fruits, delivered to you.</p>
      </div>
    </div>
  `;

    const mailOptions = {
        from: `"Manach Store" <${process.env.EMAIL_USER}>`,
        to: userEmail,
        subject: `Order Confirmation #${orderId} — Manach Store`,
        html,
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`Confirmation email sent for order #${orderId} to ${userEmail}`);
    } catch (error) {
        console.error("Failed to send email:", error.message);
    }
};
