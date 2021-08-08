const {errors} = require("../utils/errors.util");
const {TreeController} = require("./tree.controller");
const {DataAdapter} = require("../adapters/data.adapter");

const treeController = new TreeController();
let dataFactory;

function DataController({dataAdapter}) {
    if (!dataAdapter || typeof dataAdapter === "boolean" || !(dataAdapter instanceof DataAdapter)) {
        throw errors.DATA_ADAPTER_NOT_FOUND;
    }
    dataFactory = dataAdapter;
}

/**
 *
 * @param data
 * @returns {Promise<void>}
 */
DataController.prototype.upsert = async function (data,) {

}
