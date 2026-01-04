const Message = require("../models/message.model");
const AdoptionRequest = require("../models/adoptionRequest.model");

async function getChatHistory(req, res, next) {
  try {
    // requestId comes from the URL :requestId
    const { requestId } = req.params;
    const userId = res.locals.userId;

    // Call the model method we built earlier
    const messages = await Message.findByRequestId(requestId, userId);
    res.json(messages);
  } catch (err) {
    next(err);
  }
}

async function sendMessage(req, res, next) {
  try {
    const { adop_req_id, content } = req.body;
    const sender_id = res.locals.userId;

    // Optional: Security check - Is the request status allowed for chat?
    const request = await AdoptionRequest.findById(adop_req_id);
    if (!request) return res.status(404).json({ msg: "Request not found" });

    // Allow chat if status is not 'Pending' (unless you want pending chat too)
    if (request.status === "Pending" && request.adopter_id === sender_id) {
      return res
        .status(403)
        .json({ msg: "Wait for caretaker to initiate chat" });
    }

    const newMessage = new Message({ adop_req_id, sender_id, content });
    await newMessage.save();

    res.status(201).json({ success: true, msg: "Message sent" });
  } catch (err) {
    next(err);
  }
}

module.exports = { getChatHistory, sendMessage };
