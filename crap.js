'use strict'

require('browser-env')();
const ac = require('./guardia')
const Utils = require('./utils');

let liar = {
    value: 'div',
    toString: function () {
        let temp = this.value;
        this.value = 'iframe';
        return temp;
    }
}

document = ac.installPolicy({
    whenRead: [ac.Not(ac.And(ac.Allow(['createElement']), ac.ParamAt((a, b) => {
            return a === b
        }, ac.getVType(0, String), 'iframe')))]
}).on(document);

let obj = document.createElement(liar);

console.log(obj);

