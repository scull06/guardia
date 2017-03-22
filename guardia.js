'use strict';
const Trait = require('traits.js');
const _ = require('lodash');
//const Reflect = require('harmony-reflect');
const Utils = require('./utils');

const globalStates = new Map();

const getState = function (key) {
    return globalStates.get(key);
}

const setState = function (key, value) {
    globalStates.set(key, value);
}

function basePrototype() {
    return {};
}

// I dont know if I should use let or const for this.. I'll see implications
// later!!!
let TBase = Trait({filter: Trait.required});

let TAllow = Trait.compose(TBase, Trait({
    filter: function (tar, prop, rec, args) {
        return Utils.contains(this.allowedProperties, prop) !== undefined
    }
}));

let TParamAt = Trait.compose(TBase, Trait({

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
 * 
 * example of usage: ParamAt(equals, getVType(0,String), 'iframe')
 * 
 * Be sure that the type parameter returns a primitive object (string, number,...)
 */

const getVType = (idx, type) => {
    return (array) => {
        let val = type(array[idx]);
        array[idx] = val;
        return val;
    }
}

function ParamAt(fn, idx, other) {
    var paramPrototype = basePrototype();

    paramPrototype.operatorFn = fn;
    paramPrototype.idxParam = idx;
    paramPrototype.otherParam = other;

    return Trait.create(paramPrototype, TParamAt);
}

var TStateOverParams = Trait.compose(TBase, Trait({

    stateKey: Trait.required,
    operatorFn: Trait.required,
    otherParam: Trait.required,

    filter: function () { //TODO check the parameters...
        var obj = getState(this.stateKey);
        var res = this.operatorFn(obj, this.otherParam);
        return res;
    }
}));

function StateFnParam(fn, key, param) {

    var stateParamPrototype = basePrototype()

    stateParamPrototype.stateKey = key;
    stateParamPrototype.operatorFn = fn;
    stateParamPrototype.otherParam = param;

    return Trait.create(stateParamPrototype, TStateOverParams);
}

//Policy Combinators
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
    return ParamAt(Utils.inList, idx, list);
}

// *****************************************************************************
// * ********************************************************
// *****************************************************************************
// * ********************************************************
// ************************                CODE TO TAKE CARE OF BUT....;
// **************************************************
// *****************************************************************************
// * ********************************************************
// *****************************************************************************
// * ********************************************************

const findPropertyOwner = function (obj, prop) {
    do {
        if (obj.hasOwnProperty(prop)) {
            return obj;
        }
    } while (obj = Object.getPrototypeOf(obj));
}

const isBuiltin = function (obj) {
    if (global['window']) {
        return ((obj == window) || (obj == document) || (obj == location) && obj) //continue!!
    }
    return false;
}

const installPolicyX = function (policy) {

    let notify = (listeners, target, method, receiver, arglist) => {
        if (listeners) {
            for (let listener of listeners) {
                listener.notify(target, method, receiver, arglist)
            }
        }
    }

    return {
        on: function (target) {
            // !!!!!!!!!!!   iterar una sola vez cuando funcione las polizas en la
            // properties !!!!!!!!!!!!!!!...
            let methods = [];
            let properties = [];

            if (isBuiltin(target)) {
                for (let key in target) {
                    let data = target[key];
                    if (data instanceof Function) {
                        methods.push(key);
                    } else if (data) {
                        properties.push(key);
                    }
                }
                //still work todo here
               /* for (let x of properties) {
                    let owner = findPropertyOwner(target, x);
                    if (owner) {
                        var pd = Reflect.getOwnPropertyDescriptor(owner, x);
                        if (pd.configurable && pd.set && !pd.value) {
                            var m = Reflect.defineProperty(target, x, {
                                get: () => {
                                    return target.x;
                                },
                                set: (value) => {
                                    target.x = value
                                }
                            })
                        }
                    }
                }*/

                //proxy on methods
                for (let method of methods) {
                    let fnProxy = new Proxy(target[method], {
                        apply: function (targetFn, thisArg, arglist) {
                            //enforcing
                            if (policy['whenRead']) {
                                for (let pol of policy['whenRead']) {
                                    if (!pol.filter(target, method, undefined, arglist, 'call')) {
                                        throw new Error('[' + method + '] Not allowed!');
                                    }
                                }
                            }
                            //updating listeners
                            notify(policy['readListeners'], target, method, undefined, arglist);
                            return targetFn.apply(thisArg, arglist);
                        }
                    });

                    fnProxy.toString = Function
                        .prototype
                        .toString
                        .bind(target[method]) //Proxies invariants flaws!!!!
                    target[method] = fnProxy;
                }

                return target;

            } else {
                // console.log('no es built in!!'); install the policy in not builtin objects.
                return new Proxy(target, {
                    get: function (tar, property, receiver) {
                        if (tar[property]instanceof Function) {
                            return function (...args) {
                                if (policy['whenRead']) {
                                    for (let pol of policy['whenRead']) {
                                        if (!pol.filter(tar, property, receiver, args, 'call')) {
                                            throw new Error('Read of [' + property + '] is not allowed!');
                                        }
                                    }
                                }
                                notify(policy['readListeners'], tar, property, undefined, args);
                                return tar[property](...args)
                            }
                        } else {

                            if (policy['whenRead']) {
                                for (let pol of policy['whenRead']) {
                                    if (!pol.filter(tar, property, receiver, 'propertyRead')) {
                                        throw new Error('Read of [' + property + '] is not allowed!');
                                    }
                                }
                            }
                            notify(policy['readListeners'], tar, property, undefined, undefined);
                            return Reflect.get(tar, property, receiver);
                        }
                    },
                    set: function (target, property, value, receiver) {
                        if (policy['whenWrite']) {
                            for (let pol of policy['whenWrite']) {
                                if (!pol.filter(target, property, receiver, value, 'call')) {
                                    throw new Error('Write to [' + property + '] is not allowed!');
                                }
                            }
                        }
                        notify(policy['writesListeners'], target, property, undefined, value);
                        return Reflect.set(target, property, value, receiver);
                    }
                });
            }
        },
        onAll: function (targets) {
            for (let item of targets) {
                console.log('target: ' + item);
                this.on(item);
            }
        }
    }
}

var installPolicyCons = function (policy, targetFn) {
    if (targetFn instanceof Function) {
        var proxy = new Proxy(targetFn, {
            construct: function (target, params, newTarget) {
                let image = Reflect.construct(target, params, newTarget);
                image = installPolicyX(policy).on(image);
                return image;
            }
        });
        return proxy;
    } else {
        throw new Error('Target must be a contructor!');
    }
}



exports.installPolicy = installPolicyX;
exports.installPolicyCons = installPolicyCons;
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
