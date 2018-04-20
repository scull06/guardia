import expose from "../expose.js";
const { __dirname } = expose;

import { convertPage } from "./processor.mjs";
import express from "express";
import fs from "fs";

const app = express();

//const consolidator = require("./processor");

const BASE_PATH = __dirname;

app.get("/page/:id", function(req, res) {
  fs.readFile(`${BASE_PATH}/test/ifc/html/${req.params.id}.html`, "utf8", (err, data) => {
    if (err) res.send(err);
    res.end(convertPage(data));
  });
});

app.use("/bower_components", express.static(BASE_PATH + "/bower_components"));
app.use("/generated", express.static(BASE_PATH + "/html-instrument/generated"));

app.listen(3400, function() {
  console.log("Starting HTML => ARAN + HTML server!");
  console.log("This server will transform html pages to Aran ready pages.");
  console.log("Running on port 3400...");
});
