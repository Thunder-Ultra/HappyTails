const bcrypt = require("bcryptjs");

const SALT_ROUNDS = 10;

/**
 * Hashes a plain text string (password or OTP)
 * @param {string} data - The data to encrypt
 * @returns {Promise<string>} - The hashed string
 */
const hashData = async (data) => {
  try {
    const salt = await bcrypt.genSalt(SALT_ROUNDS);
    const hash = await bcrypt.hash(data, salt);
    return hash;
  } catch (error) {
    throw error;
  }
};

/**
 * Compares plain text data with a hash
 * @param {string} data - The plain text (e.g. input password/OTP)
 * @param {string} hash - The encrypted hash from DB/Memory
 * @returns {Promise<boolean>} - True if match, False otherwise
 */
const verifyHash = async (data, hash) => {
  try {
    return await bcrypt.compare(data, hash);
  } catch (error) {
    throw error;
  }
};

module.exports = { hashData, verifyHash };
