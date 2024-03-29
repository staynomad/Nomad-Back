const Housekeeping = require("../models/housekeeping.model");

const getName = async (req, res) => {
  try {
    const { name } = req.params;
    const result = await Housekeeping.findOne({ name });
    /*This originally sent back the object with all the fields from the payload,
      but now returns an array of objects as the payload.*/
    res.status(200).json({ payload: result.payload });
  } catch (err) {
    res.status(500).json({
      errors: "There was an error getting the payload for " + req.params.name,
    });
  }
};

module.exports = { getName };
