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
    if (!tree.hasOwnProperty(nodeKey)) {
        tree[nodeKey] = {};
    }
    if (
        data.hasOwnProperty(nodeKey) &&
        typeof data[nodeKey] === "object" &&
        !Array.isArray(data[nodeKey]) &&
        JSON.stringify(data[nodeKey]).startsWith('{') &&
        data[nodeKey] !== null &&
        data[nodeKey] !== undefined
    ) {
        tree = await this.handleMap(tree, data, nodeKey, nodePath, nodeHandler);
    } else if (
        data.hasOwnProperty(nodeKey) &&
        Array.isArray(data[nodeKey]) &&
        data[nodeKey] !== null &&
        data[nodeKey] !== undefined
    ) {
        tree = await this.handleArray(tree, data, nodeKey, nodePath, nodeHandler);
    } else {
        tree = await this.processANode(tree, data, nodeKey, nodePath, nodeHandler);
    }
    delete tree._id;
    return tree;
}

/**
 *
 * @param data {object} - data to covert to tree
 * @param domain {string} - data namespace to use
 * @param nodeHandler {Function} - called when builder a node on each level `async ({name,node,path})=>any`
 * @returns {Promise<object>} - resolve to tree of nodes for that data
 */
TreeController.prototype.objectToTree = async function (
    data,
    domain,
    nodeHandler = async function ({name, path, node}) {
    }
) {
    let tree = {};
    if (typeof data === 'boolean' || !data) {
        throw errors.DATA_NOT_FOUND;
    }
    if (typeof domain === 'boolean' || !domain || domain === '') {
        throw errors.DOMAIN_NOT_FOUND;
    }
    for (const nodeKey of Object.keys(data)) {
        tree = await this.node(tree, data, nodeKey, `${domain}_${nodeKey}`, nodeHandler);
    }
    return tree;
}

/**
 *
 * @param tree {object}
 * @param data {object}
 * @param nodeKey {string}
 * @param nodePath {string}
 * @param nodeHandler {Function}
 * @returns {Promise<object>}
 */
TreeController.prototype.handleMap = async function (
    tree,
    data,
    nodeKey,
    nodePath,
    nodeHandler
) {
    for (const _key of Object.keys(data[nodeKey])) {
        data[nodeKey]._id = data._id;
        tree[nodeKey] = await this.node(
            tree[nodeKey],
            data[nodeKey],
            _key,
            `${nodePath}_${_key}`,
            nodeHandler
        );
    }
    return tree;
}

/**
 *
 * @param tree {object}
 * @param data {object}
 * @param nodeKey {string}
 * @param nodePath {string}
 * @param nodeHandler {Function}
 * @returns {Promise<object>}
 */
TreeController.prototype.handleArray = async function (
    tree,
    data,
    nodeKey,
    nodePath,
    nodeHandler
) {
    for (const arrayItem of data[nodeKey]) {
        if (typeof arrayItem === 'object' && !Array.isArray(arrayItem)) {
            tree = await this.handleMap(tree, {[nodeKey]: arrayItem, _id: data._id}, nodeKey, nodePath, nodeHandler);
        } else if (Array.isArray(arrayItem)) {
            tree = await this.handleArray(tree, {[nodeKey]: arrayItem, _id: data._id}, nodeKey, nodePath, nodeHandler);
        } else {
            const _data = {[arrayItem]: arrayItem, _id: data._id, _list: true};
            tree[nodeKey] = await this.node(
                tree[nodeKey],
                _data,
                arrayItem,
                `${nodePath}`,
                nodeHandler
            );
        }
    }
    return tree;
}

/**
 *
 * @param tree {object}
 * @param data {object}
 * @param nodeKey {string}
 * @param nodePath {string}
 * @param nodeHandler {Function}
 * @returns {Promise<object>}
 */
TreeController.prototype.processANode = async function (
    tree,
    data,
    nodeKey,
    nodePath,
    nodeHandler
) {
    if (!(tree.hasOwnProperty(nodeKey) && tree[nodeKey] !== undefined && tree[nodeKey] !== null)) {
        tree[nodeKey] = {};
    }
    if (!tree[nodeKey].hasOwnProperty(data[nodeKey])) {
        if (
            data[nodeKey]
            && data[nodeKey] !== data._id
            && !data.hasOwnProperty('_list')
        ) {
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
                node: {[nodeKey]: tree[nodeKey]},
                path: nodePath
            });
        } catch (e) {
            throw {...errors.NODE_HANDLER_ERROR, reason: e.toString()};
        }
    }
    return tree;
}

module.exports = {
    TreeController: TreeController
}
