import companyModel from "../models/company.model.js";
import jobModel from "../models/job.model.js";

// Get a list of companies. Optional filters via query params.
export async function getCompanies(req, res) {
  try {
    const filters = {};

    if (req.query.type) filters.companyType = req.query.type;
    if (req.query.industry) filters.industry = new RegExp(req.query.industry, "i");
    if (req.query.location) filters.headquartersLocation = new RegExp(req.query.location, "i");
    if (req.query.stack) filters.techStack = req.query.stack;

    // Fetch companies using the filters.
    const companies = await companyModel.find(filters).sort({ createdAt: -1 });

    return res.json({
      count: companies.length,
      companies
    });
  } catch (error) {
    return res.status(500).json({ error: "Failed to fetch companies" });
  }
}

// Get one company by id. Add ?includeJobs=true to fetch jobs too.
export async function getCompanyById(req, res) {
  try {
    const { id } = req.params;
    const company = await companyModel.findById(id);

    if (!company) {
      return res.status(404).json({ error: "Company not found" });
    }

    if (req.query.includeJobs === "true") {
      // Optional: include jobs for this company.
      const jobs = await jobModel.find({ companyId: id }).sort({ postedDate: -1 });
      return res.json({ company, jobs });
    }

    return res.json({ company });
  } catch (error) {
    return res.status(500).json({ error: "Failed to fetch company" });
  }
}
