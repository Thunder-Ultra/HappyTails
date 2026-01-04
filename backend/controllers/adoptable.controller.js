const Adoptable = require("./../models/adoptable.model");
const User = require("./../models/user.model");

async function addAdoptable(req, res, next) {
  const userId = res.locals.userId;
  try {
    const user = await User.findById(userId);
    const imageFilenames = req.files ? req.files.map((f) => f.filename) : [];

    const newAdoptable = new Adoptable({
      ...req.body,
      caretaker_id: userId,
      address_id: user.address_id,
      images: imageFilenames,
    });

    await newAdoptable.save();
    res
      .status(201)
      .json({ success: true, message: "Adoptable listed successfully!" });
  } catch (err) {
    next(err);
  }
}

async function updateAdoptable(req, res, next) {
  const userId = res.locals.userId;
  const adoptableId = req.params.id;
  try {
    const imageFilenames = req.files ? req.files.map((f) => f.filename) : [];
    const adoptable = new Adoptable({
      ...req.body,
      id: adoptableId,
      caretaker_id: userId,
      images: imageFilenames,
    });

    await adoptable.save();
    res.json({ success: true, message: "Listing updated!" });
  } catch (err) {
    next(err);
  }
}

async function getMyAdoptables(req, res) {
  const userId = res.locals.userId || (req.user && req.user.id);
  if (!userId) return res.status(401).json({ message: "Unauthorized" });

  try {
    const result = await Adoptable.getMyAdoptablesByCaretakerId(userId);
    res.status(200).json(result);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch listings" });
  }
}

async function getAdoptable(req, res) {
  try {
    const result = await Adoptable.findById(req.params.id);
    if (!result) return res.status(404).json({ message: "Not found" });
    res.json(result);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Error" });
  }
}

async function deleteAdoptable(req, res, next) {
  try {
    const success = await Adoptable.deleteById(
      req.params.id,
      res.locals.userId
    );
    res.json({ success: true, msg: "Removed successfully" });
  } catch (err) {
    next(err);
  }
}

async function getAdoptables(req, res) {
  let {
    page = 1,
    limit = 20,
    search,
    type_id,
    gender,
    minAge,
    maxAge,
    vaccinated,
  } = req.query;
  const currentUser = res.locals.userId;
  // console.log(currentUser);

  try {
    const result = await Adoptable.getAdoptablesInPages(
      parseInt(page),
      parseInt(limit),
      { search, type_id, gender, minAge, maxAge, vaccinated },
      currentUser
    );
    res.json({ adoptables: result });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching listings" });
  }
}

module.exports = {
  addAdoptable,
  getMyAdoptables,
  getAdoptables,
  getAdoptable,
  updateAdoptable,
  deleteAdoptable,
};
