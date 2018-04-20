const extlib = require("softlab/extlib");
const ps = extlib._t;
const union = extlib.union;

const model = {
  getLabel: function() {
    let arr = [];
    for (const val of this.labelState.values()) {
      arr.push(val);
    }
    return union(arr);
  }
};

exports.setup = function() {
  Object.getOwnPropertyNames(Math)
    .filter(propName => Math[propName] instanceof Function)
    .map(funProp => {
      extlib.addFnModel(Math[funProp], model);
    });
};
