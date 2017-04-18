let a = {
    dosomethign() {
        return this; // return the proxy if a is passed as target
    },

    dotos() {
        console.log('doto doing stuff');
    }
}

aP = new Proxy(a, {
    get: function (t, p, r) {
        console.log(p)
        return Reflect.get(t, p, r);
    }
})


let d = aP.dosomethign()

console.log(d === aP)