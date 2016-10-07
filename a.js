

var x = {
    pepe(params) {
        console.log('sfkjghskdjfksdjfkjh' + params);
    }
}

x.pepe('asdkjashdkjh')

var t  = new Proxy(x, {
    get: function (t,p,r) {
        if(t[p] instanceof Function ){
            return function(...args){
                    console.log('aqui');
                   return t[p](args)
            }
        }
        return Reflect.get(t,p,r)
    }
})

t.pepe('sssssss')
