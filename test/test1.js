
'use strict'
// simple mock object
const ac = require('../guardia')

var obj = {

    dirtyMethod: function () {
        console.log('doing dirty stuffs!!');
    },

    cleanMethod: function () {
        console.log('Im performing well!!');
    },
    secret: 'Im top secret value'
}

//Case 1: relying on 'property name' for read events!
obj.dirtyMethod();
obj.cleanMethod();

obj = ac.installPolicy({ whenRead: [ac.Deny(['dirtyMethod','secret'])] }).on(obj)

console.log(obj.secret);
obj.cleanMethod();
obj.dirtyMethod();