const { exportURL } = require("../config/index");

const retrieveExport = async (req, res) => {
  try {
    const file = `./exports/${req.params.filename}`;
    res.download(file).status(200).json({
      message: "Successfully exported file",
    });
  } catch (err) {
    res.status(500).json({
      error: "File not found or error encountered while downloading",
    });
  }
};

module.exports = { retrieveExport };
