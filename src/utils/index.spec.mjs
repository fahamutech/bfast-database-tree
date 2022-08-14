import {expect, should} from "chai";
import {ifThrow} from "./index.mjs";

describe('Utilities', function () {
    describe('ifThrow', function () {
        it('should throw if condition is true', function () {
            try {
                should().not.exist(ifThrow(true, 'error'));
            } catch (e) {
                expect(e).eql('error');
            }
        });
        it('should return function if condition is not true', function () {
            [false, 1, '', 'a', [], {}, () => {
            }].forEach(x => {
                const otherwise = ifThrow(x, 'error');
                expect(otherwise.length).equal(1);
                expect(otherwise('a')).equal('a');
            })
        });
    });
    // describe('ifDo', function () {
    //     it('should return fn if true', function () {
    //         const increment = ifDo(true, x => 1 + x);
    //         expect(increment.length).equal(1);
    //         expect(increment(1)).eql(2);
    //     });
    //     it('should return echo function', function () {
    //         [false, 1, '', 'a', [], {}, () => {
    //         }].forEach(y => {
    //             const echo = ifDo(y, x => 1 + x);
    //             expect(echo.length).equal(1);
    //             expect(echo(1)).eql(1);
    //         });
    //     });
    // });
});