'use strict';
var _ = require('lodash');

// function operators
function eq(a, b, eqOp) {
    if (eqOp instanceof Function) {
        return eqOp(a, b);
    } else {
        return a === b;
    }
}


function leTh(a, b) {
    return a < b; //TODO fix me
}

function geTh(a, b) {
    return a > b;
}

function isInstanceOf(obj, type) {
    return (typeof obj) === type; // TODO: maybe that is not the better way! 
}


function contains(col, m) {
    return _.find(col, function (o) {
        return o === m
    })
};

//For white lists
function inList(el, collection) {
    return contains(collection, el) !== undefined;
}

function contains(col, m) {
    return _.find(col, function (o) {
        return o === m
    })
};

function inList(el, collection) {
    return contains(collection, el) !== undefined;
}

//enforcing types in policies
var StringOf = (x) => {
    return (args) => {
        var t = args[x].toString();
        args[x] = t;
        return t;
    }
}

exports.equals = eq;
exports.lessThan = leTh;
exports.greaterThan = geTh;
exports.isInstanceOf = isInstanceOf;
exports.contains = contains;
exports.inList = inList;