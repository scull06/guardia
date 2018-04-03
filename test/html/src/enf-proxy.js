(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.enfc = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
(function (global){
/**
 *
 * Guardia enforcement with proxies
 */

const findPropertyOwner = function(obj, prop) {
  do {
    if (obj.hasOwnProperty(prop)) {
      return obj;
    }
  } while ((obj = Object.getPrototypeOf(obj)));
};

const isBuiltin = function(obj) {
  if (global["window"]) {
    return (
      obj == window || obj == document || obj == location || obj == navigator || (obj == navigator.geolocation && obj)
    ); //continue!!
  }
  return false;
};

const installPolicy = policy => {
  let notify = (listeners, target, method, receiver, arglist) => {
    if (listeners) {
      for (let listener of listeners) {
        listener.notify(target, method, receiver, arglist);
      }
    }
  };

  return {
    on: function(target) {
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
            apply: function(targetFn, thisArg, arglist) {
              //enforcing
              if (policy["whenRead"]) {
                for (let pol of policy["whenRead"]) {
                  if (!pol.filter(target, method, undefined, arglist, "call")) {
                    throw new Error("[" + method + "] Not allowed!");
                  }
                }
              }
              //updating listeners
              notify(policy["readListeners"], target, method, undefined, arglist);
              return targetFn.apply(thisArg, arglist);
            }
          });

          fnProxy.toString = Function.prototype.toString.bind(target[method]); //Proxies invariants flaws!!!!
          //This can affect transparency but 'figth' against re-attaching functions
          Object.defineProperty(target, method, {
            __proto__: null,
            configurable: false,
            writable: false,
            value: fnProxy
          });
        }

        return target;
      } else {
        // console.log('no es built in!!'); install the policy in not builtin objects.
        return new Proxy(target, {
          get: function(tar, property, receiver) {
            if (tar[property] instanceof Function) {
              return function(...args) {
                if (policy["whenRead"]) {
                  for (let pol of policy["whenRead"]) {
                    if (!pol.filter(tar, property, receiver, args, "call")) {
                      throw new Error("Read of [" + property + "] is not allowed!");
                    }
                  }
                }
                notify(policy["readListeners"], tar, property, undefined, args);
                return tar[property](...args);
              };
            } else {
              if (policy["whenRead"]) {
                for (let pol of policy["whenRead"]) {
                  if (!pol.filter(tar, property, receiver, "propertyRead")) {
                    throw new Error("Read of [" + property + "] is not allowed!");
                  }
                }
              }
              notify(policy["readListeners"], tar, property, undefined, undefined);
              return Reflect.get(tar, property, receiver);
            }
          },
          set: function(target, property, value, receiver) {
            if (policy["whenWrite"]) {
              for (let pol of policy["whenWrite"]) {
                if (!pol.filter(target, property, receiver, value, "call")) {
                  throw new Error("Write to [" + property + "] is not allowed!");
                }
              }
            }
            notify(policy["writeListeners"], target, property, undefined, value);
            return Reflect.set(target, property, value, receiver);
          }
        });
      }
    },
    onAll: function(targets) {
      for (let item of targets) {
        console.log("target: " + item);
        this.on(item);
      }
    }
  };
};

var installPolicyCons = function(policy, targetFn) {
  if (targetFn instanceof Function) {
    var proxy = new Proxy(targetFn, {
      construct: function(target, params, newTarget) {
        let image = Reflect.construct(target, params, newTarget);
        image = installPolicy(policy).on(image);
        return image;
      }
    });
    return proxy;
  } else {
    throw new Error("Target must be a contructor!");
  }
};

/**
 * This function is intended to be used for external enforcement mechanisms. The idea is that
 * the provided mechanism call it with the runtime information and guardia should take care of
 * determining the permissions.
 *
 * @param {Object | Function} tar
 * @param {String} prop
 * @param {Object} rec
 * @param {*} args
 * @param {String} hook
 */

const enforce = (tar, prop, rec, args, hook) => {
  if (targets.has(tar)) {
    // if we already have registered a secured object
    var pols = Array.from(targets.get(tar));
    for (var pol of pols) {
      for (var rpol of pol[hook]) {
        if (!rpol.filter(tar, prop, rec, args)) return false;
      }
    }
  }
  return true;
};

const install = (pol, tar) => {
  if (targets.has(tar)) {
    var x = targets.get(tar);
    x.add(pol);
    targets.set(tar, x);
  } else {
    var t = new Set();
    t.add(pol);
    targets.set(tar, t);
  }
};

/**
 * for installing policies on functions
 * pd should { listeners : [] , execPol: []}
 */
const installOnFunction = (pd, fn) => {
  if (tgt instanceof Function) {
    let fnProxy = new Proxy(fn, {
      apply: function(target, thisArg, argumentsList) {
        if (pd.enforce(target, thisArg, argumentsList)) {
          throw new Error("Not Allowed");
        }
        return Reflect.apply(target, thisArg, argumentsList);
      }
    });
    return fnProxy;
  }
  throw new Error("Not a function");
};

exports.installPolicy = installPolicy;
exports.installPolicyCons = installPolicyCons;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}]},{},[1])(1)
});