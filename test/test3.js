
'use strict'
// simple mock object
const ac = require('../guardia')
const u = require('../utils')

var obj = {

    dirtyMethod: function (a, b) {
        console.log('performing >> ' + (a + b));
    },

    cleanMethod: function () {
        console.log('Im performing well!!');
    },
    secret: 'Im top secret value'
}

//Case 3: Allow only correct parameters in specific function
obj = ac.installPolicy({
    whenRead: [ac.Or(
                   ac.And(
                       ac.Allow(['dirtyMethod']),
                       ac.ParamAt(u.isInstanceOf,0,'number'),ac.ParamAt(u.isInstanceOf,1,'number')),
                   ac.Not(ac.Allow(['dirtyMethod']))) ]
}).on(obj)


obj.cleanMethod()

obj.dirtyMethod(3,6)

obj.dirtyMethod('s',3)