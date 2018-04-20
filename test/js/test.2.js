'use strict';
require('browser-env')();
var assert = require('assert');

var ac = require('../../guardia');
var enfc = require('../../enforcement/proxy')


let liar = {
    value: 'div',
    toString: function () {
        let temp = this.value;
        this.value = 'iframe';
        return temp;
    }
}

describe('Guardia Access Control [ParamAt]', function () {
    describe('#ParamAt', function () {

        document = enfc.installPolicy({
            whenRead: [ac.Not(ac.And(ac.Allow(['createElement']), ac.ParamAt((a, b) => {
                    return a === b
                }, ac.getVType(0,String), 'iframe')))]
        }).on(document);

        it('Should allow the execution with liar object as value but will take the first inv' +
                'ocation of toString',
        function () {
            let result = document.createElement(liar);
            console.log(result);
            assert.ok(console.log, 'The proxy is not working');
        });
    });
});