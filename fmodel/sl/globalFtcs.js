const extlib = require("extlib");
const ps = extlib._t;
const union = extlib.union;

let idModel = {
  getLabel: function() {
    return this.labelState.get(ps["0"]).label;
  }
};

exports.setup = function() {

  extlib.addFnModel(eval, idModel);
  extlib.addFnModel(isFinite, idModel);
  extlib.addFnModel(isNaN, idModel);
  extlib.addFnModel(parseFloat, idModel);
  extlib.addFnModel(decodeURI, idModel);
  extlib.addFnModel(decodeURIComponent, idModel);
  extlib.addFnModel(encodeURI, idModel);
  extlib.addFnModel(encodeURIComponent, idModel);

  extlib.addFnModel(parseInt, {
    getLabel: function() {
      const ls = this.labelState;
      return union([ls.get(ps["0"]).label, ls.get(ps["1"]).label]);
    }
  });
};
