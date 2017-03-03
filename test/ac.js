require('browser-env')();
var assert = require('assert')
var ac = require('../guardia')




function makeMock() {
    return {

        myfunction1() {
            return true
        },

        myfunction2() {
            return true
        },
        myfunctionParam(x) {
            return 'create-element ' + x
        },
        myProp: 'foo',
        myProp2: 'bar'
    }
}
var mock = makeMock();


/** DENY */
describe('Guardia Access Control', function () {
    describe('#Deny', function () {


        mock = ac.installPolicy({
            whenRead: [ac.Deny(['myfunction2'])],
            whenWrite: [ac.Deny(['myProp2'])]
        }).on(mock)

        it('Should Allow myfunction1', function () {
            assert.equal(mock.myfunction1(), true, 'The proxy is not working')
        })

        it('Should block myfunction2', function () {
            assert.throws(() => { mock.myfunction2() }, 'The proxy is not working')
        })

        it('Should allow read myProp', function () {
            assert.equal(mock.myProp, 'foo', 'The proxy is not working')
        })

        it('Should allow assign to myProp', function () {
            mock.myProp = 'Lorem'
            assert.equal(mock.myProp, 'Lorem', 'The proxy is not working')
        })

        it('Should block assign to myProp2', function () {
            assert.throws(() => {
                mock.myProp2 = 'Lorem'
            }, 'The proxy is not working')
        })
    })
})

/*  ALLOW */
var mock2 = makeMock();
describe('Guardia Access Control', function () {
    describe('#Allow', function () {


        mock2 = ac.installPolicy({
            whenRead: [ac.Allow(['myfunction1', 'myProp'])],
            whenWrite: [ac.Allow(['myProp'])]
        }).on(mock2)

        it('Should Allow myfunction1', function () {
            assert.equal(mock2.myfunction1(), true, 'The proxy is not working')
        })

        it('Should block myfunction2', function () {
            assert.throws(() => { mock2.myfunction2() }, 'The proxy is not working')
        })
        it('Should allow read myProp', function () {
            assert.equal(mock2.myProp, 'foo', 'The proxy is not working')
        })

        it('Should allow assign to myProp', function () {
            mock2.myProp = 'Lorem'
            assert.equal(mock2.myProp, 'Lorem', 'The proxy is not working')
        })

        it('Should block assign to myProp2', function () {
            assert.throws(() => {
                mock2.myProp2 = 'Lorem'
            }, 'The proxy is not working')
        })

        it('Should block assign to myfunction1', function () {
            assert.throws(() => {
                mock2.myfunction1 = function () { }
            }, 'The proxy is not working')
        })
    })
})

/*  NOT */
mock3 = makeMock()
describe('Guardia Access Control', function () {
    describe('#Not Allow', function () {

        mock3 = ac.installPolicy({
            whenRead: [ac.Not(ac.Allow(['myfunction2', 'myProp2']))]
        }).on(mock3)

        it('Should Allow myfunction1', function () {
            assert.equal(mock3.myfunction1(), true, 'The proxy is not working')
        })

        it('Should block myfunction2', function () {
            assert.throws(() => { mock3.myfunction2() }, 'The proxy is not working')
        })

        it('Should allow read myProp', function () {
            assert.equal(mock3.myProp, 'foo', 'The proxy is not working')
        })

        it('Should block read myProp2', function () {
            assert.equal(mock3.myProp, 'foo', 'The proxy is not working')
        })
    })
})


describe('Guardia Access Control', function () {
    var mock4 = makeMock();
    function equals(a, b) {
        return a === b
    }
    mock4 = ac.installPolicy({
        whenRead: [ac.And(ac.Allow(['myfunctionParam']), ac.ParamAt(equals, 0, 'div'))]
    }).on(mock4);

    describe('#ParamAt', function () {
        it('Should allow createElement on document with param div', function () {
            assert.equal(mock4.myfunctionParam('div'), 'create-element div', 'The proxy is not working')
        })

        it('Should deny createElement on document with param iframe', function () {
            assert.throws(function () { mock4.myfunctionParam('iframe') }, 'The proxy is not working')
        })
    })
})


describe('Guardia Access Control', function () {

    var mock5 = makeMock();
    ac.setState('count',1);

    mock5 = ac.installPolicy({
        whenRead: [ac.StateFnParam((a, b) => {
            return a <= b
        }, 'count', 3)],
        readListeners: [{
            notify: function (target, method, receiver, arglist) {
                if (method === 'myfunction1') {
                    var t = ac.getState('count')
                    t += 1
                    ac.setState('count', t);
                }
            }
        }]

    }).on(mock5);

    mock5.myfunction1()
    mock5.myfunction1()

    console.log(ac.getState('count'))
    describe('#StateParam', function () {
        it('Should allow the execution of myfunction1', function(){
            assert.ok(mock5.myfunction1(),'The proxy is not working')
        })
        it('Should deny the execution of myfunction1 during the 4th call', function(){
            assert.throws(function() {
                mock5.myfunction1();
            },'The proxy is not working')
        })

    })
})

