import nodemailer from 'nodemailer';

export const sendEmail = async (to: string, subject: string, text: string, html: string) => {
  const transporter = nodemailer.createTransport({
    service:'gmail', 
    auth: {
      user: "gschandhru10@gmail.com",
      pass: "esfl gylg swjc pakv",
    },
  });

  const mailOptions = {
    from: `"LMS" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    text,
    html,
  };

  await transporter.sendMail(mailOptions);
};