
// doc Referance = https://developers.brevo.com/guides/node-js

import { BrevoClient } from "@getbrevo/brevo";
import dotenv from "dotenv";
dotenv.config();
console.log(process.env.BREVO_API_KEY)

const client = new BrevoClient({ apiKey: process.env.BREVO_API_KEY });

export async function sendOutreachEmail(person) {
  try {
    await client.transactionalEmails.sendTransacEmail({
      sender: {
        name: process.env.BREVO_SENDER_NAME,
        email: process.env.BREVO_SENDER_EMAIL,
      },
      to: [
        {
          name: person.full_name,
          email: person.email,
        },
      ],
      subject: "Quick question about " + person.company_name,
      htmlContent: `
        <p>Hi ${person.full_name},</p>

        <p>I came across ${person.company_name} and was impressed by what you're building.</p>

        <p>I'm reaching out because we help companies like yours streamline outreach and growth using automation — saving hours of manual work every week.</p>

        <p>Would you be open to a quick 15-minute call this week to explore if there's a fit?</p>

        <p>
          Best regards,<br>
          Raushan Kumar Saw<br>
          ${process.env.BREVO_SENDER_EMAIL}
        </p>
      `,
    });

    console.log("  Email sent to: " + person.email);
    return true;

  } catch (err) {
    console.warn("  Failed to send email: " + (err.message || err));
    return false;
  }
}
