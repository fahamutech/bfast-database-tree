const {errors} = require('../utils/errors.util');

function TreeController() {
}

/**
 * extract node(s) from object
 * @param tree {object} - try to append a node
 * @param data {object} - data target to extract nodes
 * @param nodeKey {string} - node key from main data
 * @param nodePath {string | null} - full path of that node
 * @param nodeHandler {Function} - function to handle a found node, async ({node, name, path})=>any
 * @returns {Promise<object>} - tree after append a node
 */
TreeController.prototype.node = async function (
    tree,
    data,
    nodeKey,
    nodePath = null,
    nodeHandler = null
) {
    if (typeof tree === 'boolean' || !tree) {
        throw errors.TREE_NOT_FOUND;
    }
    if (typeof data === 'boolean' || !data) {
        throw errors.DATA_NOT_FOUND;
    }
    if (typeof nodeKey === 'boolean' || !nodeKey) {
        throw errors.NODE_KEY_NOT_FOUND;
    }
    if (data.hasOwnProperty('_id') === false) {
        throw errors.ID_NOT_FOUND;
    }
    if (typeof nodePath === 'boolean' || !nodePath) {
        nodePath = nodeKey;
    }
    if (typeof nodeHandler === 'boolean' || !nodeHandler) {
        nodeHandler = async function ({node, name, tree, path}) {
        }
    }
    if (
        data.hasOwnProperty(nodeKey) &&
        typeof data[nodeKey] === "object" &&
        !Array.isArray(data[nodeKey]) &&
        JSON.stringify(data[nodeKey]).startsWith('{') &&
        data[nodeKey] !== null &&
        data[nodeKey] !== undefined
    ) {
        for (const _key of Object.keys(data[nodeKey])) {
            if (!tree.hasOwnProperty(nodeKey)) {
                tree[nodeKey] = {};
            }
            data[nodeKey]._id = data._id;
            tree[nodeKey] = await this.node(
                tree[nodeKey],
                data[nodeKey],
                _key,
                `${nodePath}_${_key}`,
                nodeHandler
            );
        }
    } else if (
        data.hasOwnProperty(nodeKey) &&
        Array.isArray(data[nodeKey]) &&
        data[nodeKey] !== null &&
        data[nodeKey] !== undefined
    ) {
        for (const value of data[nodeKey]) {
            if (!tree.hasOwnProperty(nodeKey)) {
                tree[nodeKey] = {};
            }
            tree[nodeKey] = await this.node(
                tree[nodeKey],
                {[value]: value, _id: data._id, _list: true},
                value,
                `${nodePath}_${value}`,
                nodeHandler
            );
        }
    } else {

        if (!(tree.hasOwnProperty(nodeKey) && tree[nodeKey] !== undefined && tree[nodeKey] !== null)) {
            tree[nodeKey] = {};
        }

        if (!tree[nodeKey].hasOwnProperty(data[nodeKey])) {
            if (data[nodeKey] && data[nodeKey] !== data._id && !data.hasOwnProperty('_list')) {
                tree[nodeKey][data[nodeKey]] = {};
            }
        }

        if (data[nodeKey] && data[nodeKey] !== data._id && !data.hasOwnProperty('_list')) {
            tree[nodeKey][data[nodeKey]][data._id] = null;
            try {
                await nodeHandler({
                    name: nodeKey,
                    node: tree[nodeKey],
                    path: nodePath
                });
            } catch (e) {
                throw {...errors.NODE_HANDLER_ERROR, reason: e.toString()};
            }
        }

        if (data[nodeKey] && data[nodeKey] !== data._id && data.hasOwnProperty('_list')) {
            tree[nodeKey][data._id] = null;
            try {
                await nodeHandler({
                    name: nodeKey,
                    node: tree[nodeKey],
                    path: nodePath
                });
            } catch (e) {
                throw {...errors.NODE_HANDLER_ERROR, reason: e.toString()};
            }
        }
    }
    delete tree._id;
    return tree;
}

TreeController.prototype.objectToTree = async function (data, domain) {
    let tree = {};
    for (const nodeKey of Object.keys(data)) {
        tree = await this.node(tree, data, nodeKey, `${domain}_${nodeKey}`);
    }
    return tree;
}

module.exports = {
    TreeController: TreeController
}

// writeFileSync('./tree.json', JSON.stringify(tf));

