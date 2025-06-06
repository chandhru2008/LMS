import nodemailer from 'nodemailer';

export function getEmailHtml(): string {
    return `<p>Click the button below to open the app:</p>
    <a href="https://lms-zwod.onrender.com" style="padding:10px 20px;background:#007bff;color:#fff;text-decoration:none;border-radius:5px;">
    Go to App</a>`;
}


export const sendEmail = async (to: string, subject: string, text: string, html: string) => {
    const transporter = nodemailer.createTransport({
        service: 'gmail',
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

