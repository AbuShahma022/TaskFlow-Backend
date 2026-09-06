import config from "../config";
import { transporter } from "../lib/nodemailer";

interface ISendEmail {
  to: string;
  subject: string;
  html: string;
}

const sendEmail = async ({
  to,
  subject,
  html,
}: ISendEmail) => {
  await transporter.sendMail({
    from: config.email_sender,
    to,
    subject,
    html,
  });
};

export default sendEmail;