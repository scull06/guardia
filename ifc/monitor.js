const LOW = 0;
const HIGH = 1;
const PARTIAL = 2;

const sinks = new WeakSet();

//Lattice Implementation
const join = (a, b) => {
  a = a || 0;
  b = b || 0;
  return Math.max(a, b);
};

const bottom = () => 0;

//Permissive upgrade
const permissive = (target, val, ctx) => {
  let oCtx = U(ctx, 0); // debe ser un numero
  let uCtx = U(val.label, ctx);

  if (target != undefined) {
    if (uCtx == 0) {
      return 0;
    }
    if (oCtx == 1 && target.label == 0) {
      return 2;
    }
    if (oCtx == 0 && target.label == 0) {
      return uCtx;
    }
    if (target.label == 1 && uCtx == 1) {
      return 1;
    }
    if (uCtx == 1 && target.label == 2) {
      return 2;
    }
  } else {
    //THE VARIABLE IS A NEW VARIABLE SO ITS LABEL IS THE LABEL OF THE JOIN CONTEXT
    return uCtx;
  }
};

const lift = (pc, label) => {
  if (pc === LOW) {
    return low;
  }
  if (pc === HIGH && label === HIGH) {
    return HIGH;
  }
  if (pc === HIGH && label !== HIGH) {
    return PARTIAL;
  }
};

//Monitor API

const assign = (pc, target, oldVal, newVal) => {
  return permissive();
};

//For the program context label
//I assume that the program starts in a LOW context
const PC = 0;
const EXC = 1;
const context = [[bottom()], []];

const pushContext = (type, label) => {
  context[type].push(label);
};

const popContext = type => {
  return context[type].pop();
};

const currentContext = type => {
  const ctx = context[type];
  return ctx[ctx.length - 1] || 0 ;
};

//TODO: add the rest of label contexts in a big join
const globalContext = () => {
  return join(currentContext(PC), currentContext(EXC));
};

const enforce = (fn, labels) => {
  if (sinks.has(fn) && labels.some(l => l > LOW)) throw new Error("IFC policy violation!");
};

const tagAsSource = label => val => {
  val.meta.label = label;
  return val;
};

const tagAsSink = fn => {
  sinks.add(fn);
};

exports.lift = lift;
exports.join = join;
exports.bootom = bottom;
exports.assign = assign;
exports.pushContext = pushContext;
exports.currentContext = currentContext;
exports.popContext = popContext;
exports.enforce = enforce;
exports.PC = PC;
exports.EXC = EXC;
exports.globalContext = globalContext;

//Better way to do this... sure!!
exports.init = g => {
  g.tagAsSource = tagAsSource(1);
  g.tagAsSink = tagAsSink;
};
