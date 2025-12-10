const NodeCache = require("node-cache");

// stdTTL: 600 seconds = 10 minutes
// checkperiod: 60 seconds (how often it checks for expired keys)
const otpCache = new NodeCache({ stdTTL: 600, checkperiod: 60 });

module.exports = otpCache;
