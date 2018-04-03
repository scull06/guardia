var ac = require("../../guardia");
var enfc = require('../../enforcement/proxy')

function makeMock() {
  return {
    myfunction1() {
      return true;
    },

    myfunction2() {
      return true;
    },
    myfunctionParam(x) {
      return "create-element " + x;
    },
    myProp: "foo",
    myProp2: "bar"
  };
}

var mock1 = enfc
  .installPolicy({
    whenRead: [ac.Deny(["myfunction2"])],
    whenWrite: [ac.Deny(["myProp2"])]
  })
  .on(makeMock());

var mock2 = enfc
  .installPolicy({
    whenRead: [ac.Allow(["myfunction1", "myProp"])],
    whenWrite: [ac.Allow(["myProp"])]
  })
  .on(makeMock());

var mock3 = enfc
  .installPolicy({
    whenRead: [ac.Not(ac.Allow(["myfunction2", "myProp2"]))]
  })
  .on(makeMock());

exports.mock1 = mock1;
exports.mock2 = mock2;
exports.mock3 = mock3;
