import * as readline from "readline";
import { getLookalikeDomains } from "./services/ocean.js";
import { getDecisionMakers } from "./services/prospeo.js";
import { sendOutreachEmail } from "./services/brevo.js";

const seedDomain = process.argv[2];

if (!seedDomain) {
  console.error("Usage: node index.js <company.domain>");
  process.exit(1);
}

console.log("Finding lookalike companies for: " + seedDomain);
const companies = await getLookalikeDomains(seedDomain, 2);
console.log("Got " + companies.length + " companies\n");

const contacts = [];

for (const company of companies) {
  console.log("Checking " + company.domain + "...");
  const person = await getDecisionMakers(company.domain);

  if (!person || !person.email) {
    console.log("  skipped (no email)\n");
    continue;
  }

  console.log("  " + person.full_name + " | " + person.job_title);
  console.log("  " + person.email);
  console.log();
  contacts.push(person);
}

if (contacts.length === 0) {
  console.log("No contacts found, nothing to send.");
  process.exit(0);
}

console.log("--- ready to send ---");
contacts.forEach((c, i) => {
  console.log((i + 1) + ". " + c.full_name + " <" + c.email + "> @ " + c.company_name);
});

console.log("\nSend to " + contacts.length + " people? Type YES to confirm: ");

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

rl.question("", async (answer) => {
  rl.close();

  if (answer.trim() !== "YES") {
    console.log("Aborted.");
    process.exit(0);
  }

  let sent = 0;
  for (const contact of contacts) {
    const ok = await sendOutreachEmail(contact);
    if (ok) {
      sent++;
      console.log("  sent -> " + contact.email);
    } else {
      console.log("  failed -> " + contact.email);
    }
  }

  console.log("\nDone. " + sent + "/" + contacts.length + " emails sent.");
});
