var path = require("path");
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const port = "2711";

// Start up an instance of app
const app = express();

//Here we are configuring express to use body-parser as middle-ware.
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Cors for cross origin allowance
app.use(cors());

// Initialize the main project folder
app.use(express.static("dist"));

app.listen(port, listening);

function listening() {
  console.log(`server is running on port: ${port}`);
}

app.get("/", function(req, res) {
  res.sendFile(path.resolve("dist/index.html"));
});
