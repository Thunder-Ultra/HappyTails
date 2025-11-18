const Adoptable = require("./../models/adoptable.model");

async function getAdoptables(req, res) {
  let { page = 1, limit = 20, search = "" } = req.query;

  page = parseInt(page);
  limit = parseInt(limit);

  const result = await Adoptable.getAdoptablesInPages(page, limit, search);

  // console.log(result);

  res.json(result);
}

module.exports = { getAdoptables };
