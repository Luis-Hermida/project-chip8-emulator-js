const express = require("express");
const path = require("path");

const app = express();

app.use(express.static(path.join(__dirname, "/client")));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname + "/client/index.html"));
});

const port = process.env.PORT || 5001;
app.listen(port);

console.log(`App listening on ${port}`);
