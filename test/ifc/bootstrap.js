const { expect, assert } = require("chai");
const _ = require("lodash");
const rewriter = require("./../../ifc/rewriter");
const childProcess = require("child_process");
const fs = require("fs");

const basePath = __dirname + "/js";

function runScript(scriptPath, args, callback) {
  // keep track of whether callback has been invoked to prevent multiple invocations
  var invoked = false;

  var process = childProcess.fork(scriptPath, args);

  // listen for errors as they may prevent the exit event from firing
  process.on("error", function(err) {
    if (invoked) return;
    invoked = true;
    callback(err);
  });

  // execute the callback once the process has finished running
  process.on("exit", function(code) {
    if (invoked) return;
    invoked = true;
    callback(code);
  });
}

const files = fs.readdirSync("test/ifc/js/");
files.forEach(f => {
  if (f.endsWith(".js")) {
    runScript("test/ifc/runner.js", [f], function(err) {});
  }
});
