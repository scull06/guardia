const rewriter = require("./../../ifc/rewriter");
const fs = require("fs");

const basePath = __dirname + "/js";

const loadFile = file => {
  return fs.readFileSync(file, "utf8");
};

//console.log(`TESTING: ${process.argv[1]}: ${process.argv[2]}.js`)

eval(rewriter.setup());

const program = loadFile(`${basePath}/${process.argv[2]}`);
try {
  const p = rewriter.instrument()(program, null);
  eval(p);
  //IF we reach this point the program bypassed the policy
  console.log(`FAIL: ${process.argv[2]}`);
} catch (error) {
  console.error(`${process.argv[2]} ==> ${error.message}`);
}
