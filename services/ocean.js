// ocean.js
// https://app.ocean.io/docs/searchCompaniesV3
import axios from "axios";
import dotenv from "dotenv";
dotenv.config();

export async function getLookalikeDomains(seedDomain, count = 1) {
  const url = "https://api.ocean.io/v3/search/companies";

  const body = {
    size: count,
    companiesFilters: {
      lookalikeDomains: [seedDomain],
    },
  };

  const response = await axios
    .post(url, body, {
      headers: {
        "X-Api-Token": process.env.OCEAN_API_KEY,
        "Content-Type": "application/json",
      },
    })
    .catch((err) => {
      const msg = err.response
        ? `ocean.io error ${err.response.status}: ${JSON.stringify(err.response.data)}`
        : err.message;
      throw new Error(msg);
    });

  const entries = response.data.data || response.data.companies || [];

  const companies = entries
    .map((item) => {
      const target = item.company || item;

      const rawDomain =
        target.domain || target.rootUrl || target.domains?.[0] || null;
      const domain = rawDomain
        ? rawDomain
            .replace(/^(https?:\/\/)?(www\.)?/, "")
            .replace(/\/$/, "")
            .toLowerCase()
        : null;

      return {
        domain,
        name: target.name || target.companyName || null,
        industry: target.industry || target.industries?.[0] || null,
        employeeCount:
          target.employeeCount || target.employeeCountOcean || null,
        country: target.primaryCountry || target.country || null,
        linkedinUrl: target.linkedin || target.linkedinUrl || null,
      };
    })
    .filter((c) => c.domain && c.domain !== seedDomain.toLowerCase())
    .slice(0, count);

  if (companies.length === 0) {
    throw new Error("no lookalike companies found for: " + seedDomain);
  }

  // log what we got
  console.log("    results:");
  companies.forEach((c, i) =>
    console.log(
      `      ${i + 1}. ${c.domain} | ${c.name} | ${c.industry} | ${c.country}`,
    ),
  );

  return companies;
}
