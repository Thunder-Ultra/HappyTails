const AdoptionRequest = require("../models/adoptionRequest.model");
const { getDb } = require("../data/database");

/**
 * 1. Submit an Adoption Request (Adopter Action)
 */
async function applyForPet(req, res, next) {
  const { adoptable_id, message } = req.body;
  const adopter_id = res.locals.userId;

  try {
    const db = getDb();

    // 1. Ownership Check: Can't adopt own pet
    const petRows = await db.query(
      "SELECT caretaker_id FROM Adoptables WHERE id = ?",
      [adoptable_id]
    );
    if (petRows.length === 0)
      return res.status(404).json({ msg: "Pet not found." });
    if (petRows[0].caretaker_id === adopter_id) {
      return res.status(400).json({ msg: "You cannot adopt your own pet." });
    }

    // 2. Duplicate Check
    const alreadyApplied = await AdoptionRequest.exists(
      adopter_id,
      adoptable_id
    );
    if (alreadyApplied) {
      return res
        .status(400)
        .json({ msg: "You have already applied for this pet." });
    }

    // 3. Create Request via Model
    const newRequest = new AdoptionRequest({
      adoptable_id,
      adopter_id,
      message,
    });
    await newRequest.save();

    res
      .status(201)
      .json({ success: true, msg: "Application submitted successfully!" });
  } catch (err) {
    next(err);
  }
}

/**
 * 2. Get My Applications (Adopter Action)
 */
async function getMyApplications(req, res, next) {
  try {
    const applications = await AdoptionRequest.findByAdopter(res.locals.userId);
    res.json(applications);
  } catch (err) {
    next(err);
  }
}

/**
 * 3. Get Incoming Requests (Caretaker Action)
 */
async function getIncomingRequests(req, res, next) {
  try {
    const requests = await AdoptionRequest.findIncomingRequests(
      res.locals.userId
    );
    res.json(requests);
  } catch (err) {
    next(err);
  }
}

/**
 * 4. Get Full Request Details + Applicant Profile
 */
async function getRequestDetails(req, res, next) {
  // console.log("Got a request from the user ", res.locals.userId);
  try {
    const request = await AdoptionRequest.findById(req.params.id);
    if (!request) return res.status(404).json({ msg: "Request not found" });

    // Security: Only Adopter or Caretaker can view
    const currentUserId = res.locals.userId;
    if (
      request.adopter_id !== currentUserId &&
      request.caretaker_id !== currentUserId
    ) {
      return res.status(403).json({ msg: "Unauthorized access." });
    }

    res.json(request);
  } catch (err) {
    next(err);
  }
}

/**
 * 5. Update Request Status (Caretaker Action)
 */
async function updateStatus(req, res, next) {
  const { status } = req.body;
  const requestId = req.params.id;
  const caretaker_id = res.locals.userId;

  try {
    const success = await AdoptionRequest.updateStatus(
      requestId,
      caretaker_id,
      status
    );

    if (!success) {
      return res
        .status(403)
        .json({ msg: "Update failed: Unauthorized or invalid request." });
    }

    res.json({
      success: true,
      msg: `Application status updated to ${status}.`,
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  applyForPet,
  getMyApplications,
  getIncomingRequests,
  getRequestDetails,
  updateStatus,
};
