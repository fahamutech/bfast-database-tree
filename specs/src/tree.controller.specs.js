const {assert, should, expect} = require("chai");
const {TreeController} = require('../../dist/index');
const {errors} = require('../../dist/utils/errors.util');
const stocks = require('../mocks/sales.json');
const {writeFileSync} = require('fs');

describe('TreeController', function () {
    const treeController = new TreeController();
    const domain = 'test';
    const data = {
        _id: 'id1',
        name: 'xps',
        price: 10,
        refs: ['a', 'b', 'c'],
        n: [1, 2],
        r: {
            ref: ['a', 'b']
        },
        ao: ['z', {a: 10}, ['c', ['f'], {y: ['iyo', {t: {'age': 20}}]}]],
        t: {
            a: 1,
            b: 2
        },
        meta: {
            a: {
                b: 2
            },
            b: 3
        }
    };

    describe('node', function () {
        it('should create a node from object for one level node', async function () {
            const node = await treeController.node({}, data, 'name', `${domain}/name`);
            assert(node !== undefined);
            assert(node !== null);
            assert(typeof node === "object");
            expect(node.name.xps.id1).eql(null);
            expect(node.name.xps).eql({id1: null});
        });
        it('should create a node from object with secondary id handler provided', async function () {
            const node = await treeController.node(
                {},
                data,
                'name',
                `${domain}/name`,
                {
                    nodeIdHandler: () => {
                        return 'abcde';
                    }
                }
            );
            // console.log(node);
            assert(node !== undefined);
            assert(node !== null);
            assert(typeof node === "object");
            expect(node.name.xps.id1).eql('abcde');
            expect(node.name.xps).eql({id1: 'abcde'});
        });
        it('should create a node from object with multiple level node', async function () {
            const node = await treeController.node({}, data, 'meta', `${domain}/meta`);
            assert(node !== undefined);
            assert(node !== null);
            assert(typeof node === "object");
            expect(node.meta.a.b['2'].id1).eql(null);
            expect(node.meta.a.b['2']).eql({id1: null});
            expect(node.meta.a.b).eql({2: {id1: null}});
            expect(node.meta.a).eql({
                b: {
                    2: {
                        id1: null
                    }
                }
            });
            expect(node.meta).eql({
                a: {
                    b: {
                        2: {
                            id1: null
                        }
                    }
                },
                b: {
                    3: {
                        id1: null
                    }
                }
            });
        });
        it('should not create a node if data has no _id field', async function () {
            try {
                const node = await treeController.node({}, {name: 'dell'}, 'name', `${domain}/name`);
                should().not.exist(node);
            } catch (e) {
                should().exist(e);
                should().exist(e.code);
                should().exist(e.message);
                expect(e.code).equal(errors.ID_NOT_FOUND.code);
            }
        });
        it('should not create a node if data is undefined or null', async function () {
            try {
                const node = await treeController.node({}, null, 'name', 'test_name');
                should().not.exist(node);
            } catch (e) {
                should().exist(e);
                should().exist(e.code);
                should().exist(e.message);
                expect(e.code).equal(errors.DATA_NOT_FOUND.code);
            }
        });
        it('should create a node if tree provided it has a node with null value', async function () {
            const node = await treeController.node({name: null}, data, 'name', `${domain}/name`);
            assert(node !== undefined);
            assert(node !== null);
            assert(typeof node === "object");
            expect(node.name.xps.id1).eql(null);
            expect(node.name.xps).eql({id1: null});
        });
        it('should create a node if tree provided it has a node with undefined value', async function () {
            const node = await treeController.node({name: undefined}, data, 'name', `${domain}/name`);
            assert(node !== undefined);
            assert(node !== null);
            assert(typeof node === "object");
            expect(node.name.xps.id1).eql(null);
            expect(node.name.xps).eql({id1: null});
        });
        it('should return empty node if node key provided is not in a data supplied', async function () {
            const node = await treeController.node({}, data, 'test');
            assert(node !== undefined);
            assert(node !== null);
            assert(typeof node === "object");
            should().exist(node.test);
            expect(node.test).to.eql({});
        });
        it('should throw error if initial tree is null', async function () {
            try {
                const node = await treeController.node(null, data, 'name', `${domain}/name`);
                should().not.exist(node);
            } catch (e) {
                should().exist(e);
                should().exist(e.code);
                should().exist(e.message);
                expect(e.code).to.equal(errors.TREE_NOT_FOUND.code);
            }
        });
        it('should throw error if node key is null', async function () {
            try {
                const node = await treeController.node({}, data, undefined);
                should().not.exist(node);
            } catch (e) {
                should().exist(e);
                should().exist(e.code);
                should().exist(e.message);
                expect(e.code).to.equal(errors.NODE_KEY_NOT_FOUND.code);
            }
        });
        it('should not return _id field in a node for single level', async function () {
            const node = await treeController.node({}, data, 'name', `${domain}/name`);
            assert(node !== undefined);
            assert(node !== null);
            assert(typeof node === "object");
            should().exist(node.name);
            should().not.exist(node._id);
            expect(node.name).to.eql({
                xps: {id1: null}
            });
        });
        it('should not return _id field in a node for multi level', async function () {
            const node = await treeController.node({}, data, 'meta', `${domain}/meta`);
            assert(node !== undefined);
            assert(node !== null);
            assert(typeof node === "object");
            should().exist(node.meta);
            should().not.exist(node.meta._id);
        });
        it('should convert an array of string field from data to object in node ', async function () {
            const node = await treeController.node({}, data, 'refs', `${domain}/refs`);
            assert(node !== undefined);
            assert(node !== null);
            assert(typeof node === "object");
            should().exist(node.refs);
            should().exist(node.refs.a);
            should().exist(node.refs.b);
            should().exist(node.refs.c);
            expect(node.refs).to.eql({
                a: {id1: null},
                b: {id1: null},
                c: {id1: null}
            });
        });
        it('should convert an array of number field from data to object in node ', async function () {
            const node = await treeController.node({}, data, 'n');
            assert(node !== undefined);
            assert(node !== null);
            assert(typeof node === "object");
            should().exist(node.n);
            should().exist(node.n['1']);
            should().exist(node.n['2']);
            expect(node.n).to.eql({
                '1': {id1: null},
                '2': {id1: null}
            });
        });
        it('should convert an array of object field from data to object in node ', async function () {
            let calledTime = 0;
            let isCalled = [];
            let paths = []
            const nodeHandler = ({name, path, node}) => {
                // console.log(path)
                paths.push(path);
                calledTime += 1;
                isCalled.push(true);
            }
            const node = await treeController.node({}, data, 'ao', null, {nodeHandler});
            // ['z', {a: 10}, ['c', ['f'], {y: ['iyo', {t: {'age': 20}}]}]],,
            assert(node !== undefined);
            assert(node !== null);
            assert(typeof node === "object");
            should().exist(node.ao);
            expect(isCalled.length).equal(6);
            expect(paths.length).equal(6);
            expect(calledTime).equal(6);
            expect(isCalled.reduce((a, b) => a && b, true)).equal(true);
            expect(paths).eql(['ao', 'ao/a', 'ao', 'ao', 'ao/y', 'ao/y/t/age'])
            expect(node.ao).to.eql({
                z: {id1: null},
                a: {
                    10: {id1: null},
                },
                c: {id1: null},
                f: {id1: null},
                y: {
                    'iyo': {id1: null},
                    t: {
                        age: {
                            20: {id1: null}
                        }
                    }
                }
            });
        });
        it('should convert multi document data with array field in embedded object to node ', async function () {
            const node = await treeController.node({}, data, 'r');
            assert(node !== undefined);
            assert(node !== null);
            assert(typeof node === "object");
            should().exist(node.r);
            should().exist(node.r.ref);
            should().exist(node.r.ref.a);
            should().exist(node.r.ref.b);
            expect(node.r).to.eql({
                ref: {
                    a: {id1: null},
                    b: {id1: null}
                }
            });
        });
        it('should return tree and call handler once if handler function provided and node in data is one level', async function () {
            let functionCalled = false;
            let calledTimes = 0;
            const nodeHandler = async ({name, node, path}) => {
                should().exist(name);
                should().exist(node);
                should().exist(path);
                expect(name).equal('name');
                expect(node).eql({
                    xps: {id1: null}
                });
                expect(path).equal('name');
                functionCalled = true;
                calledTimes += 1;
            }
            const node = await treeController.node(
                {},
                data,
                'name',
                null,
                {nodeHandler}
            );
            should().exist(node);
            expect(functionCalled).equal(true);
            expect(calledTimes).equal(1);
            expect(node).to.eql({
                name: {
                    xps: {id1: null}
                }
            });
        });
        it('should return tree and call handler twice if handler function provided and node in data has two nodes', async function () {
            let functionCalled = [];
            let calledTimes = 0;
            const nodeHandler = async ({name, node, path}) => {
                should().exist(name);
                should().exist(node);
                should().exist(path);
                expect(name).oneOf(['a', 'b']);
                expect([{'1': {id1: null}}, {'2': {id1: null}}]).to.deep.include(node);
                expect(path).oneOf(['t/a', 't/b']);
                functionCalled.push(true);
                calledTimes += 1;
            }
            const node = await treeController.node(
                {},
                data,
                't',
                null,
                {nodeHandler}
            );
            should().exist(node);
            expect(functionCalled).eql([true, true]);
            expect(calledTimes).equal(2);
            expect(node).to.eql({
                t: {
                    a: {
                        '1': {id1: null}
                    },
                    b: {
                        '2': {id1: null}
                    }
                }
            });
        });
        it('should return tree and call handler twice if handler function provided and node in data has two nodes and initial path provided', async function () {
            let functionCalled = [];
            let calledTimes = 0;
            const nodeHandler = async ({name, node, path}) => {
                expect(name).oneOf(['a', 'b']);
                expect([{'1': {id1: null}}, {'2': {id1: null}}]).to.deep.include(node);
                expect(path).oneOf(['test/t/a', 'test/t/b']);
                functionCalled.push(true);
                calledTimes += 1;
            }
            const node = await treeController.node(
                {},
                data,
                't',
                'test/t',
                {nodeHandler}
            );
            should().exist(node);
            expect(functionCalled).eql([true, true]);
            expect(calledTimes).equal(2);
            expect(node).to.eql({
                t: {
                    a: {
                        '1': {id1: null}
                    },
                    b: {
                        '2': {id1: null}
                    }
                }
            });
        });
        it('should handle error caused by handler function', async function () {
            let fcn = 0;
            let fc = false;
            const hf = ({name, path, node}) => {
                expect(name).equal('name');
                expect(path).equal('test/name');
                expect(node).eql({
                    xps: {id1: null}
                });
                fc = true;
                fcn += 1;
                throw new Error('error inside handler');
            };
            try {
                const node = await treeController.node(
                    {},
                    data,
                    'name',
                    'test/name',
                    {
                        nodeHandler: hf
                    }
                );
                should().exist(node);
                expect(node).eql({
                    name: {
                        xps: {id1: null}
                    }
                });
                expect(node.name).eql({
                    xps: {id1: null}
                });
                expect(node.name.xps).eql({id1: null});
                expect(node.name.xps.id1).equal(null);
            } catch (e) {
                should().exist(e);
                should().exist(e.code);
                should().exist(e.message);
                expect(e.code).equal(errors.NODE_HANDLER_ERROR.code);
            }
        });
    });

    describe('objectToTree', function () {
        const domain = 'test';
        const data = {
            _id: 'id2',
            name: 'hp',
            price: 10,
            tags: ['a', 'b'],
            offers: [{jan: 10}, {feb: 20}],
            meta: {
                a: {
                    b: 2
                },
                b: 3
            }
        };
        const datas = [
            {
                _id: 'id2',
                name: 'hp',
                price: 10,
                tags: ['a', 'b'],
                offers: [{jan: 10}, {feb: 20}],
                meta: {
                    a: {
                        b: 2
                    },
                    b: 3
                }
            },
            {
                _id: 'id1',
                name: 'xps',
                price: 10,
            }
        ]
        it('should convert object to tree', async function () {
            const tree = await treeController.objectToTree(data, domain);
            assert(tree !== undefined);
            assert(tree !== null);
            assert(typeof tree === "object");
            expect(tree).eql({
                _id: {
                    id2: null
                },
                name: {
                    hp: {id2: null}
                },
                price: {
                    '10': {id2: null}
                },
                tags: {
                    a: {id2: null},
                    b: {id2: null}
                },
                offers: {
                    jan: {
                        '10': {id2: null}
                    },
                    feb: {
                        '20': {id2: null}
                    }
                },
                meta: {
                    a: {
                        b: {
                            '2': {id2: null}
                        }
                    },
                    b: {
                        '3': {id2: null}
                    }
                }
            });
        });
        it('should convert object to tree with secondary id generator handler', async function () {
            const tree = await treeController.objectToTree(data, domain, {
                nodeIdHandler: async function () {
                    return 'b45'
                }
            });
            assert(tree !== undefined);
            assert(tree !== null);
            assert(typeof tree === "object");
            expect(tree).eql({
                _id: {
                    id2: 'b45'
                },
                name: {
                    hp: {id2: 'b45'}
                },
                price: {
                    '10': {id2: 'b45'}
                },
                tags: {
                    a: {id2: 'b45'},
                    b: {id2: 'b45'}
                },
                offers: {
                    jan: {
                        '10': {id2: 'b45'}
                    },
                    feb: {
                        '20': {id2: 'b45'}
                    }
                },
                meta: {
                    a: {
                        b: {
                            '2': {id2: 'b45'}
                        }
                    },
                    b: {
                        '3': {id2: 'b45'}
                    }
                }
            });
        });
        it('should not mutate object after tree traverse', async function () {
            await treeController.objectToTree(data, domain);
            expect(data).eql({
                _id: 'id2',
                name: 'hp',
                price: 10,
                tags: ['a', 'b'],
                offers: [{jan: 10}, {feb: 20}],
                meta: {
                    a: {
                        b: 2
                    },
                    b: 3
                }
            })
        });
        it('should return _id field in tree', async function () {
            const tree = await treeController.objectToTree(data, domain);
            assert(tree !== undefined);
            assert(tree !== null);
            assert(typeof tree === "object");
            should().exist(tree.meta);
            should().not.exist(tree.meta._id);
            should().exist(tree._id);
        });
        it('should convert objects to tree', async function () {
            let nodeCall = 0;
            const tree = await treeController.objectToTree(datas, domain, {
                nodeHandler: async function ({name, path, node}) {
                    nodeCall += 1;
                }
            });
            assert(tree !== undefined);
            assert(tree !== null);
            assert(typeof tree === "object");
            expect(nodeCall).equal(12);
            expect(tree).eql({
                _id: {
                    id2: null,
                    id1: null
                },
                name: {
                    hp: {id2: null},
                    xps: {id1: null},
                },
                price: {
                    '10': {id2: null, id1: null}
                },
                tags: {
                    a: {id2: null},
                    b: {id2: null}
                },
                offers: {
                    jan: {
                        '10': {id2: null}
                    },
                    feb: {
                        '20': {id2: null}
                    }
                },
                meta: {
                    a: {
                        b: {
                            '2': {id2: null}
                        }
                    },
                    b: {
                        '3': {id2: null}
                    }
                }
            });
        });
        it('should write a tree to external file', async function () {
            const tree = await treeController.objectToTree(stocks, 'sales');
            writeFileSync(__dirname + '/../mocks/tree.json', JSON.stringify(tree));
            expect(Array.from(stocks).length).equal(Object.keys(tree._id).length);
        });
    });

    describe('query', function () {
        const domain = 'test';
        it('should tree of path to id for query on the nodes when apply a simple object', async function () {
            const queryResponse = await treeController.query(domain, {
                name: 'xps',
            });
            expect(queryResponse).eql({'test/name': 'xps'});
        });
        it('should tree of path to id for query on the nodes when apply a complex object', async function () {
            const queryResponse = await treeController.query(domain, {
                name: 'xps',
                price: 10,
                tags: {
                    a: 'tz',
                    b: 'used',
                    c: {
                        age: 20
                    }
                }
            });
            expect(queryResponse).eql({
                'test/name': 'xps',
                'test/price': 10,
                'test/tags/a': 'tz',
                'test/tags/b': 'used',
                'test/tags/c/age': 20,
            });
        });
        it('should throw error if a map contain array any ware inside', async function () {
            try {
                const queryResponse = await treeController.query(domain, {
                    name: 'xps',
                    price: [10, 20, 30]
                });
                expect(queryResponse).eql(undefined);
            } catch (e) {
                expect(e).eql(errors.INNER_QUERY_DATA_INVALID);
            }
        });
        it('should return array of tree when provide array of objects for $or operation', async function () {
            const queryResponse = await treeController.query(domain, [
                {name: 'xps'},
                {
                    name: 'hp',
                    price: 10,
                    tags: {
                        a: 'tz',
                        b: 'used',
                        c: {
                            age: 20
                        }
                    }
                }
            ]);
            expect(queryResponse).eql([
                {'test/name': 'xps'},
                {
                    'test/name': 'hp',
                    'test/price': 10,
                    'test/tags/a': 'tz',
                    'test/tags/b': 'used',
                    'test/tags/c/age': 20,
                },
            ]);
        });
        it('should throw error if query data is invalid', async function () {
            for (const value of [1, '3', function () {
            }]) {
                try {
                    const queryResponse = await treeController.query(domain, value);
                    expect(queryResponse).equal(undefined);
                } catch (e) {
                    expect(e).eql(errors.QUERY_NOT_FOUND);
                }
            }
        });
        it('should return tree when include $fn object in query object', async function () {
            const queryResponse = await treeController.query(domain, {
                name: {
                    $fn: `return it > 10;`
                },
            });
            expect(queryResponse).eql({
                'test/name': {
                    $fn: `return it > 10;`
                }
            });
            expect(queryResponse['test/name']).eql({
                $fn: `return it > 10;`
            });
        });

        it('should return tree when include $fn object in query object with other field', async function () {
            const queryResponse = await treeController.query(domain, {
                name: {
                    $fn: `return it > 10;`,
                    nr: 23
                },
            });
            expect(queryResponse).eql({
                'test/name': {
                    $fn: `return it > 10;`
                }
            });
            expect(queryResponse['test/name']).eql({
                $fn: `return it > 10;`
            });
        });
    });

});
