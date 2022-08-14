export const ID_NOT_FOUND = {
    code: 1,
    message: '_id not found',
    toString: () => {
        `code: ${this.code}, message: ${this.message}`
    }
};

export const DATA_NOT_FOUND = {
    code: 2,
    message: 'data not found',
    toString: () => {
        `code: ${this.code}, message: ${this.message}`
    }
}

export const NODE_KEY_NOT_FOUND = {
    code: 4,
    message: 'node key not found',
    toString: () => {
        `code: ${this.code}, message: ${this.message}`
    }
}

export const TREE_NOT_FOUND = {
    code: 3,
    message: 'tree not found',
    toString: () => {
        `code: ${this.code}, message: ${this.message}`
    }
}

export const NODE_HANDLER_ERROR = {
    code: 5,
    message: 'error inside node function handler',
    toString: () => {
        `code: ${this.code}, message: ${this.message}`
    }
}

export const DOMAIN_NOT_FOUND = {
    code: 6,
    message: 'data domain/table/collection name not found',
    toString: () => {
        `code: ${this.code}, message: ${this.message}`
    }
}

export const DATA_ADAPTER_NOT_FOUND = {
    code: 7,
    message: 'data factory not found',
    toString: () => {
        `code: ${this.code}, message: ${this.message}`
    }
}

export const QUERY_NOT_FOUND = {
    code: 8,
    message: 'query data supplied are not known',
    toString: () => {
        `code: ${this.code}, message: ${this.message}`
    }
}

export const INNER_QUERY_DATA_INVALID = {
    code: 9,
    message: 'inner query data must be object or primitive or function only',
    toString: () => {
        `code: ${this.code}, message: ${this.message}`
    }
}
