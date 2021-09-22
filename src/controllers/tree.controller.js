const {errors} = require('../utils/errors.util');

function TreeController() {
}

/**
 * extract node(s) from object
 * @param tree {object} - try to append a node
 * @param data {object} - data target to extract nodes
 * @param nodeKey {string} - node key from main data
 * @param nodePath {string | null} - full path of that node
 * @param opts - options {
 *     nodeHandler: ({name, path, node})=>{}, // called each time node found;
       nodeIdHandler: ()=>{return null;} // called when want to process secondary data id;
 * }
 * @returns {Promise<object>} - tree after append a node
 */
TreeController.prototype.node = async function (
    tree,
    data,
    nodeKey,
    nodePath = null,
    opts = {
        nodeHandler: async ({name, path, node}) => {
        },
        nodeIdHandler: async () => {
            return null;
        }
    }
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
    if (!opts || typeof opts === "boolean") {
        opts = {};
    }
    if (typeof opts.nodeHandler === 'boolean' || !opts.nodeHandler) {
        opts.nodeHandler = async function ({node, name, tree, path}) {
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
        tree = await handleMap(tree, data, nodeKey, nodePath, opts);
    } else if (
        data.hasOwnProperty(nodeKey) &&
        Array.isArray(data[nodeKey]) &&
        data[nodeKey] !== null &&
        data[nodeKey] !== undefined
    ) {
        tree = await handleArray(tree, data, nodeKey, nodePath, opts);
    } else {
        tree = await processANode(tree, data, nodeKey, nodePath, opts);
    }
    delete tree._id;
    return tree;
}

/**
 *
 * @param data {object | Array<object>} - data to covert to tree
 * @param domain {string} - data namespace to use
 * @param opts - options {
 *     nodeHandler: ({name, path, node})=>{}, // called each time node found;
       nodeIdHandler: ()=>{return null;} // called when want to process secondary data id;
 * }
 * @returns {Promise<object>} - resolve to tree of nodes for that data
 */
TreeController.prototype.objectToTree = async function (
    data,
    domain,
    opts = {
        nodeHandler: async ({name, path, node}) => {
        },
        nodeIdHandler: async () => {
            return null;
        }
    }
) {
    let tree = {};
    const idNode = {};
    if (typeof domain === 'boolean' || !domain || domain === '') {
        throw errors.DOMAIN_NOT_FOUND;
    }

    const processTree = async (d) => {
        if (typeof d === 'boolean' || !d) {
            throw errors.DATA_NOT_FOUND;
        }
        for (const nodeKey of Object.keys(d)) {
            if (nodeKey && typeof nodeKey !== "boolean") {
                tree = await this.node(tree, d, nodeKey, `${domain}/${nodeKey}`, opts);
            } else {
                console.log('skip node key is malformed---->', nodeKey);
            }
        }
        idNode[d._id] = await opts.nodeIdHandler();
        await opts.nodeHandler({
            name: '_id',
            node: idNode,
            path: `${domain}/_id`
        });
    }

    if (Array.isArray(data)) {
        for (const _data of data) {
            await processTree(_data);
        }
    } else {
        await processTree(data);
    }
    tree._id = idNode;
    return tree;
}

/**
 *
 * @param domain {string} table/collection/domain where we want to execute query
 * @param query {object | Array<object>} query that we want to execute
 * @returns {Promise<{[key: string]:string} | Array<{[key: string]:string}>>}
 */
TreeController.prototype.query = async function (domain, query) {
    if (Array.isArray(query)) {
        const orQuery = [];
        for (const _query of query) {
            orQuery.push(await handleQueryMap({}, _query, [domain]));
        }
        return orQuery;
    }
    if (query && typeof query === "object" && JSON.stringify(query).startsWith('{')) {
        return handleQueryMap({}, query, [domain]);
    }
    throw errors.QUERY_NOT_FOUND;
}

/**
 *
 * @param tree {object}
 * @param data {object}
 * @param nodeKey {string}
 * @param nodePath {string}
 * @param opts - options {
 *     nodeHandler: ({name, path, node})=>{}, // called each time node found;
       nodeIdHandler: ()=>{return null;} // called when want to process secondary data id;
 * }
 * @returns {Promise<object>}
 */
async function handleMap(
    tree,
    data,
    nodeKey,
    nodePath,
    opts
) {
    for (const _key of Object.keys(data[nodeKey])) {
        if (_key && typeof _key !== "boolean") {
            data[nodeKey]._id = data._id;
            tree[nodeKey] = await TreeController.prototype.node(
                tree[nodeKey],
                data[nodeKey],
                _key,
                `${nodePath}/${_key}`,
                opts
            );
        } else {
            console.log('skip key node is malformed---->', _key?.toString());
        }
        delete data[nodeKey]._id;
    }
    return tree;
}

/**
 *
 * @param tree {object}
 * @param data {object}
 * @param pathParts {Array<string>}
 * @returns {Promise<object>}
 */
async function handleQueryMap(
    tree,
    data,
    pathParts,
) {
    for (const key of Object.keys(data)) {
        pathParts.push(key);
        if (
            typeof data[key] === "object" &&
            !Array.isArray(data[key]) &&
            JSON.stringify(data[key]).startsWith('{')
        ) {
            if (data[key].$fn && typeof data[key].$fn === "string") {
                tree[pathParts.join('/')] = {
                    $fn: data[key].$fn
                };
                if (data[key].hasOwnProperty('$orderBy')) {
                    tree[pathParts.join('/')] = Object.assign(tree[pathParts.join('/')], {
                        $orderBy: data[key].$orderBy
                    });
                }
                if (data[key].hasOwnProperty('$limit')) {
                    tree[pathParts.join('/')] = Object.assign(tree[pathParts.join('/')], {
                        $limit: data[key].$limit
                    });
                }
                if (data[key].hasOwnProperty('$skip')) {
                    tree[pathParts.join('/')] = Object.assign(tree[pathParts.join('/')], {
                        $skip: data[key].$skip
                    });
                }
            } else {
                tree = await handleQueryMap(tree, data[key], pathParts);
            }
        } else if (Array.isArray(data[key])) {
            throw errors.INNER_QUERY_DATA_INVALID;
        } else {
            tree[pathParts.join('/')] = data[key];
        }
        pathParts.splice(pathParts.length - 1, 1);
    }
    return tree;
}

/**
 *
 * @param tree {object}
 * @param data {object}
 * @param nodeKey {string}
 * @param nodePath {string}
 * @param opts - options {
 *     nodeHandler: ({name, path, node})=>{}, // called each time node found;
       nodeIdHandler: ()=>{return null;} // called when want to process secondary data id;
 * }
 * @returns {Promise<object>}
 */
async function handleArray(
    tree,
    data,
    nodeKey,
    nodePath,
    opts
) {
    for (const arrayItem of data[nodeKey]) {
        if (typeof arrayItem === 'object' && !Array.isArray(arrayItem)) {
            tree = await handleMap(tree, {[nodeKey]: arrayItem, _id: data._id}, nodeKey, nodePath, opts);
        } else if (Array.isArray(arrayItem)) {
            tree = await handleArray(tree, {[nodeKey]: arrayItem, _id: data._id}, nodeKey, nodePath, opts);
        } else {
            const _data = {[arrayItem]: arrayItem, _id: data._id, _list: true};
            if (arrayItem && typeof arrayItem !== "boolean") {
                tree[nodeKey] = await TreeController.prototype.node(
                    tree[nodeKey],
                    _data,
                    arrayItem,
                    `${nodePath}`,
                    opts
                );
            } else {
                console.log('skip node key in array item is malformed--->', arrayItem)
            }
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
 * @param opts - options {
 *     nodeHandler: ({name, path, node})=>{}, // called each time node found;
       nodeIdHandler: ()=>{return null;} // called when want to process secondary data id;
 * }
 * @returns {Promise<object>}
 */
async function processANode(
    tree,
    data,
    nodeKey,
    nodePath,
    opts
) {
    if (!opts || typeof opts === "boolean") {
        opts = {};
    }
    if (!opts.nodeIdHandler || typeof opts.nodeHandler !== 'function') {
        opts.nodeIdHandler = () => {
            return null;
        };
    }
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
        tree[nodeKey][data[nodeKey]][data._id] = await opts.nodeIdHandler();
        // tree._id[data._id] = await opts.nodeIdHandler();
        try {
            await opts.nodeHandler({
                name: nodeKey,
                node: tree[nodeKey],
                path: nodePath
            });
        } catch (e) {
            console.log(e);
            throw {...errors.NODE_HANDLER_ERROR, reason: e.toString()};
        }
    }
    if (data[nodeKey] && data[nodeKey] !== data._id && data.hasOwnProperty('_list')) {
        tree[nodeKey][data._id] = await opts.nodeIdHandler();
        // tree._id[data._id] = await opts.nodeIdHandler();
        try {
            await opts.nodeHandler({
                name: nodeKey,
                node: {[nodeKey]: tree[nodeKey]},
                path: nodePath
            });
        } catch (e) {
            console.log(e);
            throw {...errors.NODE_HANDLER_ERROR, reason: e.toString()};
        }
    }
    return tree;
}

module.exports = {
    TreeController,
}
