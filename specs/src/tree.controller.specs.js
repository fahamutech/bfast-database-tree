const {assert, should, expect} = require("chai");
const {TreeController} = require('../../src/controllers/tree.controller');
const {errors} = require('../../src/utils/errors.util');

describe('Tree Controller', function () {
    const treeController = new TreeController();
    const domain = 'test';
    const data = {
        _id: 'id1',
        name: 'xps',
        price: 10,
        refs: ['a', 'b', 'c'],
        r: {
            ref: ['a', 'b']
        },
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
            const node = await treeController.node({}, data, 'name', `${domain}_name`);
            assert(node !== undefined);
            assert(node !== null);
            assert(typeof node === "object");
            expect(node.name.xps.id1).eql(null);
            expect(node.name.xps).eql({id1: null});
        });
        it('should create a node from object with multiple level node', async function () {
            const node = await treeController.node({}, data, 'meta', `${domain}_meta`);
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
                const node = await treeController.node({}, {name: 'dell'}, 'name', `${domain}_name`);
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
            const node = await treeController.node({name: null}, data, 'name', `${domain}_name`);
            assert(node !== undefined);
            assert(node !== null);
            assert(typeof node === "object");
            expect(node.name.xps.id1).eql(null);
            expect(node.name.xps).eql({id1: null});
        });
        it('should create a node if tree provided it has a node with undefined value', async function () {
            const node = await treeController.node({name: undefined}, data, 'name', `${domain}_name`);
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
                const node = await treeController.node(null, data, 'name', `${domain}_name`);
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
            const node = await treeController.node({}, data, 'name', `${domain}_name`);
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
            const node = await treeController.node({}, data, 'meta', `${domain}_meta`);
            assert(node !== undefined);
            assert(node !== null);
            assert(typeof node === "object");
            should().exist(node.meta);
            should().not.exist(node.meta._id);
        });
        it('should convert a array field from data to object in node ', async function () {
            const node = await treeController.node({}, data, 'refs', `${domain}_refs`);
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
                nodeHandler
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
                expect(path).oneOf(['t_a', 't_b']);
                functionCalled.push(true);
                calledTimes += 1;
            }
            const node = await treeController.node(
                {},
                data,
                't',
                null,
                nodeHandler
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
                expect(path).oneOf(['test_t_a', 'test_t_b']);
                functionCalled.push(true);
                calledTimes += 1;
            }
            const node = await treeController.node(
                {},
                data,
                't',
                'test_t',
                nodeHandler
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
                expect(path).equal('test_name');
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
                    'test_name',
                    hf
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
        it('should convert object to tree', async function () {
            const tree = await treeController.objectToTree(data);
            assert(tree !== undefined);
            assert(tree !== null);
            assert(typeof tree === "object");
            expect(tree.name.xps).eql({'id1': null});
            expect(tree.price['10']).eql({'id1': null});
            expect(tree.meta.a.b['2']).eql({'id1': null});
        });
        it('should not return _id field in tree', async function () {
            const tree = await treeController.objectToTree(data, domain);
            assert(tree !== undefined);
            assert(tree !== null);
            assert(typeof tree === "object");
            should().exist(tree.meta);
            should().not.exist(tree.meta._id);
            should().not.exist(tree._id);
        });
    });

    describe('objectsToTree', function () {

    });

});
