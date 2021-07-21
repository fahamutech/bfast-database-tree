const sales = require('./sales.json');
const {writeFileSync} = require('fs');

function treeBuilder(tree, data, key) {
    if (
        typeof data[key] === "object" &&
        !Array.isArray(data[key]) &&
        data[key] !== null &&
        data[key] !== undefined
    ) {
        Object.keys(data[key]).forEach(_key => {
            if (tree[key]) {
            } else {
                tree[key] = {};
            }
            data[key]._id = data._id;
            tree[key] = treeBuilder(tree[key], data[key], _key);
        });
    } else {
        if (!tree.hasOwnProperty(key)) {
            tree[key] = {};
        }
        if (!tree[key].hasOwnProperty(data[key])) {
            if (data[key]!== data._id){
                tree[key][data[key]] = {};
            }
        }
        if (data[key] !== data._id){
            tree[key][data[key]][data._id] = null;
        }
    }
    return tree;
}

const tf = sales.reduce((a, b) => {
    Object.keys(b).forEach(key => {
        a.sales = treeBuilder(a.sales, b, key);
    });
    return a;
}, {sales: {}});
writeFileSync('./tree.json', JSON.stringify(tf));
