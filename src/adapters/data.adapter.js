function DataAdapter() {
}

/**
 * save data to any underlying implementation
 * data store / database
 * @param data {object}
 * @returns {Promise<*>}
 */
DataAdapter.prototype.upsert = async function (data) {
    return Promise.reject('#save method not implemented');
};

DataAdapter.prototype.delete = async function(){
    return Promise.reject('#delete method not implemented');
}

module.exports = {
    DataAdapter,
}
