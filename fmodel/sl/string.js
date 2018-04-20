const extlib = require("softlab/extlib");
const ps = extlib._t;
const union = extlib.union;

const stateValues = extlib.stateValues;

exports.setup = function() {
  //static methods of String
  extlib.addFnModel(String.fromCharCode, {
    getLabel: function() {
      let lbs = this.labelState.get(ps["0"]).pLabel;
      lbs.push(this.labelState.get(ps["0"]).oLabel);
      return union(lbs);
    }
  });

  // String.fromCodePoint([...])
  extlib.addFnModel(String.fromCodePoint, {
    getLabel: function() {
      let lbs = this.labelState.get(ps["0"]).pLabel;
      lbs.push(this.labelState.get(ps["0"]).oLabel);
      return union(lbs);
    }
  });

  // General approach of tainting the result by the join of all values of the call
  // sheck if all methods have this behavior.
  const props = Object.getOwnPropertyNames(String.prototype);
  props.filter(prop => String.prototype[prop] instanceof Function).map(fnProp => {
    extlib.addFnModel(String.prototype[fnProp], {
      getLabel: function() {
        let arr = stateValues(this.labelState);
        arr.push(this.self.label);
        return union(arr);
      }
    });
  });
};
