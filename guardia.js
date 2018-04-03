'use strict';
const Trait = require('traits.js');

const globalStates = new Map();

const getState = (key) => {
    return globalStates.get(key);
}

const setState = (key, value) => {
    globalStates.set(key, value);
}

const basePrototype = () => {
    let proto = {}
    Object.setPrototypeOf(proto,null);
    return proto;
}

const targets = new WeakMap();

// I dont know if I should use let or const for this.. I'll see implications
// later!!!
const TBase = Trait({ filter: Trait.required });

Object.setPrototypeOf(TBase, basePrototype())

const TAllow = Trait.compose(TBase, Trait({
    filter: function (tar, prop, rec, args) {
        return this.allowedProperties.indexOf(prop) !== -1
    }
}));

const TParamAt = Trait.compose(TBase, Trait({

    idxParam: Trait.required,
    otherParam: Trait.required,
    operatorFn: Trait.required,

    filter: function (tar, prop, rec, args, opType) {
        //Policy NOT! applicable for property reads!!!
        if (opType === 'readProperty') {
            return true;
        }
        /**
         * document.createElement(stringOf(fakeDiv))
         * apply(p,t,args){
         *  if(policy.filter(...)) should change args to the desired type-value in the policy and use it subsequently
         *  return p.apply(t,args)
         * }
         */
        let newVal = this.idxParam(args);
        return this.operatorFn(newVal, this.otherParam);
    }
}));

/**
 * This function is used to prevent abusing toString and valueOf (we should look at other functions like that)
 * example of usage: ParamAt(equals, getVType(0,String), 'iframe')
 * Be sure that the type parameter returns a primitive object (string, number,...)
 */

const getVType = (idx, type) => {
    return (array) => {
        let val = type(array[idx]);
        array[idx] = val;
        return val;
    }
}

const ParamAt = (fn, idx, other) => {
    var paramPrototype = basePrototype();

    paramPrototype.operatorFn = fn;
    paramPrototype.idxParam = idx;
    paramPrototype.otherParam = other;

    return Trait.create(paramPrototype, TParamAt);
}

const TStateOverParams = Trait.compose(TBase, Trait({

    stateKey: Trait.required,
    operatorFn: Trait.required,
    otherParam: Trait.required,

    filter: function () { //TODO check the parameters...
        var obj = getState(this.stateKey);
        var res = this.operatorFn(obj, this.otherParam);
        return res;
    }
}));

const StateFnParam = (fn, key, param) => {

    var stateParamPrototype = basePrototype()

    stateParamPrototype.stateKey = key;
    stateParamPrototype.operatorFn = fn;
    stateParamPrototype.otherParam = param;

    return Trait.create(stateParamPrototype, TStateOverParams);
}


const And = function (...policies) {
    return Trait.create(basePrototype(), Trait.compose(TBase, Trait({
        filter: function (tar, prop, rec, args) {
            for (var policy of policies) {
                if (!policy.filter(tar, prop, rec, args)) {
                    return false;
                }
            }
            return true;
        }
    })))
}

const Not = function (p1) {

    return Trait.create(basePrototype(), Trait.compose(TBase, Trait({
        filter: function (tar, prop, rec, args) {
            return !p1.filter(tar, prop, rec, args);
        }
    })));
}

const Or = function (...policies) {
    return Trait.create(basePrototype(), Trait.compose(TBase, Trait({
        filter: function (tar, prop, rec, args) {
            // se puede mejorar empleando los operadores de JS
            for (var policy of policies) {
                if (policy.filter(tar, prop, rec, args)) {
                    return true;
                }
            }
            return false;
        }
    })))
}

const Allow = function (properties) {
    var proto = basePrototype();
    proto.allowedProperties = properties;
    var allowedPropPolicy = Trait.create(proto, TAllow);
    return allowedPropPolicy;
}

//Combined Policies

const Deny = function (properties) {
    return Not(Allow(properties))
}

const ParamInList = function (idx, list) {
    return ParamAt((y, xs) => {
        xs.indexOf(y) !== -1
    }, idx, list);
}


exports.Allow = Allow;
exports.Deny = Deny;
exports.And = And;
exports.Or = Or;
exports.Not = Not;
exports.ParamInList = ParamInList;
exports.ParamAt = ParamAt;
exports.StateFnParam = StateFnParam;
exports.setState = setState;
exports.getState = getState;
exports.getVType = getVType;


