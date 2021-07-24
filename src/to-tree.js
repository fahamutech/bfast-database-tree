const sales = require('./test.json');
const {writeFileSync} = require('fs');

/**
 *
 * @param tree {object}
 * @param data {*}
 * @param key {string}
 * @param node {string}
 * @returns {*}
 */
function treeBuilder(tree, data, key, node) {
    // tree = {};
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
            tree[key] = treeBuilder(tree[key], data[key], _key, `${node}_${_key}`);
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
    console.log(node);
    // console.log(tree,'---------');
    return tree;
}

const tf = sales.reduce((a, b) => {
    Object.keys(b).forEach(key => {
        a = treeBuilder(a, b, key,`test_${key}`);
    });
    return a;
}, {});
writeFileSync('./tree.json', JSON.stringify(tf));
