const express = require("express");
const app = express();
const dotenv = require("dotenv");
const cors = require("cors");

app.use(cors());

dotenv.config();

require("./startup/routes")(app);
require("./startup/db")();

const PORT = process.env.PORT || 6000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
