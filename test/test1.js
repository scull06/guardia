
'use strict'
// simple mock object
const ac = require('../guardia')
const u = require('../utils')
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

ac.installPolicy({
    whenRead: [ac.Not(ac.And(ac.Allow(['createElement']), ac.ParamAt(u.equals, 0, 'img')))] 
}).on(document)

var whiteURLs =null;

ac.installPolicy({
    whenWrite: [ac.Or(ac.And(ac.Allow(['src']), ac.ParamInList(0,whiteURLs)), ac.Not(ac.Allow(['src'])))]
}).onAll(documents.images)


console.log(obj.secret);
obj.cleanMethod();
obj.dirtyMethod();

