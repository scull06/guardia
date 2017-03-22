# Guardia

Javascript library for the Specification and Enforcement of Security Policies at application level.

## Description
- TODO

## Install
GUARDIA depends on some external libraries. Make sure you include these libraries before guardia:

- lodash   @ npm
- trait.js @ npm
- utils.js (included in the guardia repo)
- guardia.js (included in the guardia repo)

## Usage

Guardia is an internal DSL as such you need an entry point to the features offered by the language. The next code snippet shows how to do it.

```javascript
'use strict';
const G = require('./guardia');
```

### Example # 1
Te first example aims to prevent the creation of boxes like ```alert()```.
 
 ```javascript
 const noAlert = G.Deny(['alert','prompt', 'confirm']);
 G.installPolicy({
     whenRead:[noAlert]
 }).on(window);

//then try to use alert method
window.alert('UPS!');
 ```
 ```Deny([...])``` have the same behavior as ```Not(Allow([...]))```. The next example how to use  ```Allow([...])``` for white list access to properties or methods of the target object.

```javascript

let account = {
      amount: 1000,
      balance(){
          return this.amount;
      },
      deposit(x){
          this.amount = this.amount + x;
      }
}

const justAllow = G.Allow(['balance','deposit']);
const noOverride = G.Not(G.Allow(['amount','balance','deposit']));
account = G.installPolicy({
      whenRead: [justAllow],
      whenWrite:[noOverride]
}).on(account);

protectedAccount.deposit(120);
protectedAccount.balance();

protectedAccount.amount = 1234; // throws an exception
console.log(protectedAccount.amount); // throws exception

```
In the previous example we are able to protect the ```account``` object. But we desire to prevent negative values flowing to ```deposit()```. For this knd of behavior GUARDIA provide us with ```ParamAt()```.

```javascript
const ge = (a,b) => { return a > b } 
const justAllow = G.Or(G.Allow(['balance']),
                        G.And(G.Allow(['deposit']),G.ParamAt(isPositive,G.getVType(0,Number),0)));
const noOverride = G.Not(G.Allow(['amount','balance','deposit']));

account = G.installPolicy({
      whenRead: [justAllow],
      whenWrite:[noOverride]
}).on(account);

account.deposit(-120); // throws an execption
```
