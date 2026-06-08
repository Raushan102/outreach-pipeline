// enrichPerson.js
import axios from "axios";
import dotenv from "dotenv";
dotenv.config();

const sleep = (ms) => new Promise((res) => setTimeout(res, ms));

const headers = {
  "X-KEY": process.env.PROSPEO_API_KEY,
  "Content-Type": "application/json",
};

/**
 * @param {string} fullName - full name of the person
 * @param {string} domain - company domain e.g. razorpay.com
 * @returns {Promise<string|null>} verified email or null
 */
export async function enrichPersonEmail(fullName, domain) {
  await sleep(1000);

  try {
    const res = await axios.post(
      "https://api.prospeo.io/enrich-person",
      {
        only_verified_email: true,
        data: {
          full_name: fullName,
          company_website: domain,
        },
      },
      { headers },
    );

    const p = res.data.person;
    return p?.email?.revealed ? p.email.email : null;

  } catch (err) {
    const status = err.response?.status;
    const code = err.response?.data?.error_code;

    if (status === 401) {
      console.error("  [401] invalid api key, check PROSPEO_API_KEY in .env");
    } else if (status === 429) {
      console.warn("  [429] rate limited on enrich, waiting 5s...");
      await sleep(5000);
    } else if (status === 400) {
      console.warn(`  [400 ${code}] ${fullName} (${domain})`);
    } else {
      console.warn("  enrich error:", err.message);
    }

    return null;
  }
}
