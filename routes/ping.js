const express = require("express");
const router = express.Router();
const mongoose = require('mongoose');

router.get(
  '/',
  async (req,res) => {
    try {
      res.json({
        state: 'up',
        dbState: mongoose.STATES[mongoose.connection.readyState]
      })
    }
    catch (error) {
      console.log(error);
      res.status(500).json({
        "errors": "Unsuccessful ping."
      });
    }
  }
)

module.exports = router
