// prospeo.js
// https://prospeo.io/api-docs/enrich-person
import axios from "axios";
import dotenv from "dotenv";
import { enrichPersonEmail } from "./enrichPerson.js";
dotenv.config();

const sleep = (ms) => new Promise((res) => setTimeout(res, ms));

const headers = {
  "X-KEY": process.env.PROSPEO_API_KEY,
  "Content-Type": "application/json",
};

/** 
 * @param {string} domain
 * @returns {Promise<{full_name: string, linkedin_url: string, person_id: string, job_title: string, email: string, company_name: string, company_domain: string}|null>}
 */
export async function getDecisionMakers(domain) {
  await sleep(2000);

  try {
    const res = await axios.post(
      "https://api.prospeo.io/search-person",
      {
        page: 1,
        filters: {
          company: { websites: { include: [domain] } },
          person_seniority: { include: ["C-Suite", "Founder/Owner"] },
        },
      },
      { headers },
    );

    const first = res.data.results?.[0];
    if (!first) {
      console.warn("  no contact found for:", domain);
      return null;
    }

    const fullName = first.person?.full_name;
    if (!fullName) {
      console.warn("  contact found but name missing for:", domain);
      return null;
    }

    const email = await enrichPersonEmail(fullName, domain);

    return {
      full_name: fullName,
      linkedin_url: first.person?.linkedin_url || null,
      person_id: first.person?.person_id || null,
      job_title: first.person?.current_job_title || null,
      email,
      company_name: first.company?.name || null,
      company_domain: domain,
    };
  } catch (err) {
    const status = err.response?.status;
    const code = err.response?.data?.error_code;

    if (status === 429) {
      console.warn(
        "  [429] rate limited on search for:",
        domain,
        "waiting 5s...",
      );
      await sleep(5000);
    } else if (code === "NO_RESULTS") {
      console.warn("  no results for:", domain);
    } else {
      console.warn(`  search error for ${domain}: ${code || err.message}`);
    }

    return null;
  }
}
