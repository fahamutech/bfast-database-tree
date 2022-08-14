export class DataAdapter {
        /**
     * save data to any underlying implementation
     * data store / database
     * @param data {object}
     * @returns {Promise<*>}
     */
    async upsert(data) {
        return Promise.reject('#save method not implemented');
    };

    async delete() {
        return Promise.reject('#delete method not implemented');
    }
}