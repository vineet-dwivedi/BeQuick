import sourceModel from "../models/source.model.js";

function normalizeTags(tags) {
  if (!tags) return [];
  if (Array.isArray(tags)) return tags.filter(Boolean);
  if (typeof tags === "string") {
    return tags
      .split(",")
      .map((value) => value.trim())
      .filter(Boolean);
  }
  return [];
}

// Create a new source (company, job board, or directory).
export async function createSource(req, res) {
  try {
    const payload = {
      ...req.body,
      tags: normalizeTags(req.body.tags)
    };

    const source = await sourceModel.create(payload);
    return res.status(201).json({ source });
  } catch (error) {
    return res.status(500).json({ error: "Failed to create source" });
  }
}

// Get list of sources with optional filters.
export async function getSources(req, res) {
  try {
    const query = req.validatedQuery || req.query;
    const filters = {};

    if (query.active) filters.active = query.active === "true";
    if (query.type) filters.sourceType = query.type;
    if (query.region) filters.region = new RegExp(query.region, "i");
    if (query.tag) filters.tags = query.tag;

    const limit = Math.min(Number(query.limit || 50), 200);
    const sources = await sourceModel.find(filters).sort({ createdAt: -1 }).limit(limit);

    return res.json({
      count: sources.length,
      sources
    });
  } catch (error) {
    return res.status(500).json({ error: "Failed to fetch sources" });
  }
}

// Get a single source by id.
export async function getSourceById(req, res) {
  try {
    const source = await sourceModel.findById(req.params.id);

    if (!source) {
      return res.status(404).json({ error: "Source not found" });
    }

    return res.json({ source });
  } catch (error) {
    return res.status(500).json({ error: "Failed to fetch source" });
  }
}

// Update a source.
export async function updateSource(req, res) {
  try {
    const payload = {
      ...req.body,
      tags: normalizeTags(req.body.tags)
    };

    const source = await sourceModel.findByIdAndUpdate(req.params.id, payload, {
      new: true
    });

    if (!source) {
      return res.status(404).json({ error: "Source not found" });
    }

    return res.json({ source });
  } catch (error) {
    return res.status(500).json({ error: "Failed to update source" });
  }
}

// Delete a source.
export async function deleteSource(req, res) {
  try {
    const source = await sourceModel.findByIdAndDelete(req.params.id);

    if (!source) {
      return res.status(404).json({ error: "Source not found" });
    }

    return res.json({ message: "Source deleted" });
  } catch (error) {
    return res.status(500).json({ error: "Failed to delete source" });
  }
}
