
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

//Case 2: relying on 'property name' for write events!
 

obj = ac.installPolicy({ whenWrite: [ac.Deny(['secret'])] }).on(obj)

obj.secret = 'Changed'

console.log(obj.secret);
