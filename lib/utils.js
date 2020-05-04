

const Utils = {
    routes: {},
    configs : {
        title: process.env.TITLE
    },
    getRoute(name){
        return Utils.routes[name] ? Utils.routes[name].path : null;
    },
    pick(k, o){
        return Object.keys(o).reduce((r, f) => {
            if(k.indexOf(f) !== -1) r[f] = o[f];
            return r;
        }, {})
    },
    findFirstValue(obj, stack=1, max=100){
        if(!stack) return false;
        stack++;
        console.log("Stack findFirstValue : " + stack);
        if(stack > max) return false;
        let result = Object.values(obj)[0];
        if(typeof result === "string") return result;
        else return Utils.findFirstValue(result, stack);
    },
    twig: require('./twig')
}

module.exports = Utils;