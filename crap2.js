'use strict'
let G = require('./guardia');


const openPol = G.Or(G.And(G.Allow(['open']), G.ParamAt(isIn, g.getVType(0, String), whiteList)),
    G.Deny(['open']));
XMLHttpRequest = installPolicyCons(openPol, XMLHttpRequest);