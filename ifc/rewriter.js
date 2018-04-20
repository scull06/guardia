const Acorn = require("acorn");
const Aran = require("aran");
const Astring = require("astring");
const Linvail = require("linvail");
const monitor = require("./monitor");

monitor.init(global);

const aran = Aran({ namespace: "META", sandbox: true });
const instrument = (script, parent) => Astring.generate(aran.weave(Acorn.parse(script), pointcut, parent));

const linvail = Linvail(instrument, {
  /**TODO: enter must be the (PC u EXC u RET) */
  enter: value => ({ base: value, meta: { label: monitor.currentContext(monitor.PC) } }),
  leave: value => value.base
});

global.META = Object.create(linvail.traps);
META.GLOBAL = linvail.sandbox;

/**************************************
 *************** TRAPS ****************
 **************************************/

//this is a work around to the problem of
let contextTemp = undefined;
const toNextContext = label => {
  contextTemp = label;
};

const enterContext = contextType => {
  monitor.pushContext(contextType, contextTemp);
  contextTemp = undefined; //resetting the contextTemp!!!
};

META.test = (val, serial) => {
  toNextContext(val.meta.label);
  return linvail.traps.test(val, serial);
};

META.block = serial => {
  enterContext(monitor.PC);
};

META.leave = (type, serial) => {
  debugger;
  monitor.popContext(monitor.PC);
};

META.invoke = (value1, value2, values, serial) => {
  //add the contexts labels
  const labels = values.map(v => v.meta.label);
  labels.push(monitor.globalContext());
  monitor.enforce(linvail.leave(value1)[linvail.leave(value2)], labels);

  return linvail.traps.invoke(value1, value2, values, serial);
};

META.apply = (fn, ths, args, serial) => {
  if (linvail.leave(fn) === global.tagAsSource) {
    return linvail.leave(fn)(...args);
  }

  if (linvail.leave(fn) === global.taint) {
    return linvail.leave(fn)(linvail.leave(args[0]));
  }

  return linvail.traps.apply(fn, ths, args, serial);
};

META.write = (identifier, val, serial) => {
   
  return val
};

META.binary = (op, left, rigth, serial) => {
  const res = linvail.traps.binary(op, left, rigth, serial);
  res.meta.label = monitor.join(monitor.join(left.meta.label, rigth.meta.label, monitor.globalContext()));
  return res;
};

META.unary = (op, val, serial) => {
  const res = linvail.traps.unary(op, val, serial);
  res.meta.label = val.meta.label;
  return res;
};

const pointcut = Object.keys(linvail.traps);
pointcut.push("block", "leave","write");

exports.setup = () => {
  return Astring.generate(aran.setup(pointcut));
};

exports.instrument = () => {
  return instrument;
};
