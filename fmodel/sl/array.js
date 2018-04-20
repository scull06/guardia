const extlib = require("extlib");
const ps = extlib._t;
const union = extlib.union;
const stateValues = extlib.stateValues;

exports.setup = function() {
  // General approach of tainting the result by the join of all values of the call
  // sheck if all methods have this behavior.
  const arr = ["push","concat"];

  const props = Object.getOwnPropertyNames(Array.prototype);
  props
    .filter(p => !arr.some(x => x === p))
    .filter(prop => Array.prototype[prop] instanceof Function)
    .map(fnProp => {
      extlib.addFnModel(Array.prototype[fnProp], {
        getLabel: function() {
          let arr = stateValues(this.labelState);
          arr.push(this.self.label);
          return union(arr);
        }
      });
    });

  extlib.addFnModel(Array.prototype.push, {
    getLabel: function() {
      this.self.inner[this.self.inner.length - 1].label = this.labelState.get(
        ps["0"]
      ).label;
      return this.labelState.get(ps["0"]).label;
    }
  });

  extlib.addFnModel(Array.prototype.push, {
    getLabel: function() {
      this.self.inner[this.self.inner.length - 1].label = this.labelState.get(
        ps["0"]
      ).label;
      return this.labelState.get(ps["0"]).label;
    }
  });
};
