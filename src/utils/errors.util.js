module.exports.errors = {
    ID_NOT_FOUND: {
        code: 1,
        message: '_id not found',
        toString: () => {
            `code: ${this.code}, message: ${this.message}`
        }
    },
    DATA_NOT_FOUND: {
        code: 2,
        message: 'data not found',
        toString: () => {
            `code: ${this.code}, message: ${this.message}`
        }
    },
    NODE_KEY_NOT_FOUND: {
        code: 4,
        message: 'node key not found',
        toString: () => {
            `code: ${this.code}, message: ${this.message}`
        }
    },
    TREE_NOT_FOUND: {
        code: 3,
        message: 'tree not found',
        toString: () => {
            `code: ${this.code}, message: ${this.message}`
        }
    },
    NODE_HANDLER_ERROR: {
        code: 5,
        message: 'error inside node function handler',
        toString: () => {
            `code: ${this.code}, message: ${this.message}`
        }
    },
    DOMAIN_NOT_FOUND: {
        code: 6,
        message: 'data domain/table/collection name not found',
        toString: () => {
            `code: ${this.code}, message: ${this.message}`
        }
    },
    DATA_ADAPTER_NOT_FOUND: {
        code: 7,
        message: 'data factory not found',
        toString: () => {
            `code: ${this.code}, message: ${this.message}`
        }
    }
}
