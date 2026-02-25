import nodemailer from "nodemailer";

// 1. Configure the Transporter (The Postman)
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER, // Your Gmail address
    pass: process.env.EMAIL_PASS, // Your App Password (NOT your login password)
  },

  tls: {
    rejectUnauthorized: false,
  },
});

// 2. The Function to Send Credentials
export const sendWelcomeEmail = async (
  email: string,
  name: string,
  password: string, // The raw password the admin just set
  role: string,
) => {
  try {
    const mailOptions = {
      from: `"Hostel Admin" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Welcome to Smart Hostel - Your Login Credentials",
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
          <h2 style="color: #2563EB;">Welcome to the Hostel App! 🏠</h2>
          <p>Hi <strong>${name}</strong>,</p>
          <p>Your account has been successfully created. You can now log in to the Smart Hostel app to manage gate passes, complaints, and mess meals.</p>
          
          <div style="background: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 5px 0;"><strong>Role:</strong> ${role}</p>
            <p style="margin: 5px 0;"><strong>Email:</strong> ${email}</p>
            <p style="margin: 5px 0;"><strong>Password:</strong> <span style="font-family: monospace; background: #e5e7eb; padding: 2px 6px; border-radius: 4px;">${password}</span></p>
          </div>

          <p><em>Please change your password after your first login for security.</em></p>
          <p>Regards,<br/>Hostel Management Team</p>
        </div>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("✅ Welcome email sent:", info.messageId);
    return true;
  } catch (error) {
    console.error("❌ Failed to send email:", error);
    return false;
  }
};
