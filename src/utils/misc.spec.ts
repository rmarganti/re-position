import {
    angleBetweenPoints,
    convertOffsetToPercentOrPixels,
    distanceBetweenPoints,
    getSnapValues,
    objectsAreEqual,
    round,
    snapPositionValues,
} from './misc';
import { defineOffsetGetters } from './testing';

describe('utils/misc', () => {
    describe('angleBetweenPoints()', () => {
        it('calculates the angle between two points', () => {
            const angle1 = angleBetweenPoints(5, 5)(10, 10);
            expect(angle1).toEqual(45);

            const angle2 = angleBetweenPoints(5, 5)(10, 5);
            expect(angle2).toEqual(0);

            const angle3 = angleBetweenPoints(5, 5)(-5, -5);
            expect(angle3).toEqual(-135);

            const angle4 = angleBetweenPoints(5, 5)(5, -5);
            expect(angle4).toEqual(-90);

            const angle5 = angleBetweenPoints(5, 5)(5, 5);
            expect(angle5).toEqual(0);
        });
    });

    describe('distanceBetweenPoints()', () => {
        it('calculates the distance` between two points', () => {
            const distance1 = distanceBetweenPoints(5, 5)(10, 5);
            expect(distance1).toEqual(5);

            const distance2 = distanceBetweenPoints(5, 5)(5, 10);
            expect(distance2).toEqual(5);

            const distance3 = distanceBetweenPoints(5, 5)(-5, -5);
            expect(distance3).toEqual(Math.sqrt(10 * 10 + 10 * 10));

            const distance4 = distanceBetweenPoints(5, 5)(5, -5);
            expect(distance4).toEqual(10);

            const distance5 = distanceBetweenPoints(5, 5)(5, 5);
            expect(distance5).toEqual(0);
        });
    });

    describe('objectsAreEqual()', () => {
        it('identifies (non-recursively) equal objects', () => {
            const object1 = { a: 1, b: '2', c: true };
            const object2 = { a: 1, b: '2', c: true };

            const object3 = { a: 1, b: '2', c: object1 };
            const object4 = { a: 1, b: '2', c: object1 };

            expect(objectsAreEqual(object1, object2)).toBeTruthy();
            expect(objectsAreEqual(object3, object4)).toBeTruthy();
        });

        it('identifies (non-recursively) unequal objects', () => {
            const object1 = { a: 1, b: '2', c: true };
            const object2 = { a: 1, b: '2', c: false };

            const object3 = { a: 1, b: '2', c: object1 };
            const object4 = { a: 1, b: '2', c: object2 };

            expect(objectsAreEqual(object1, object2)).toBeFalsy();
            expect(objectsAreEqual(object3, object4)).toBeFalsy();
        });
    });

    describe('convertOffsetToPercentOrPixels()', () => {
        beforeAll(() => {
            defineOffsetGetters();
        });

        it("converts an Offset to a percentage of the element's parent", () => {
            const offset = { left: 20, top: 20 };

            const parent = document.createElement('div');
            parent.style.width = '200px';
            parent.style.height = '200px';

            const result = convertOffsetToPercentOrPixels(true, parent)(offset);

            expect(result).toEqual({
                left: '10%',
                top: '10%',
            });
        });
    });

    describe('snapPositionValues()', () => {
        it("rounds an object's position properties to a multiple of a number", () => {
            const input = {
                left: 10.6,
                top: -4,
                width: 71,
                height: 50.3,
            };

            const output = snapPositionValues({ x: 5, y: 5 })(input);

            expect(output).toEqual({
                left: 10,
                top: -5,
                width: 70,
                height: 50,
            });
        });

        it("doesn't touch non-position properties or non-numbers", () => {
            const input = {
                left: 'string',
                five: { left: 'value' },
                bana: 7,
            };

            const output = snapPositionValues({ x: 5, y: 5 })(input);
            expect(output).toEqual(input);
        });

        it('applies snapXTo and snapYTo properly on the different position keys', () => {
            const input = {
                left: 10.6,
                width: 71,
                top: -4,
                height: 50.3,
            };

            const output = snapPositionValues({ x: 5, y: 100 })(input);

            expect(output).toEqual({
                left: 10,
                width: 70,
                top: 0,
                height: 100,
            });

            const output2 = snapPositionValues({ x: 100, y: 5 })(input);

            expect(output2).toEqual({
                left: 0,
                width: 100,
                top: -5,
                height: 50,
            });
        });
    });

    describe('round()', () => {
        it('rounds to integer intervals', () => {
            expect(round(10, 15)).toEqual(15);
            expect(round(5, 15)).toEqual(0);
            expect(round(-10, 15)).toEqual(-15);
            expect(round(-5, 15)).toEqual(0);
        });

        it('rounds to decimal intervals', () => {
            expect(round(5.12, 0.1)).toEqual(5.1);
            expect(round(5.19, 0.1)).toEqual(5.2);
            expect(round(-5.12, 0.1)).toEqual(-5.1);
            expect(round(-5.19, 0.1)).toEqual(-5.2);
        });
    });

    describe('getSnapValues()', () => {
        it('gets correct snap value from snapTo', () => {
            expect(getSnapValues(10)).toEqual({ x: 10, y: 10 });
        });

        it('gets correct snap value from snapXTo, snapYTo', () => {
            expect(getSnapValues(undefined, 10, 20)).toEqual({
                x: 10,
                y: 20,
            });
        });

        it('gets snapXTo, snapYTo and overwrites snapTo', () => {
            expect(getSnapValues(50, 10, 20)).toEqual({
                x: 10,
                y: 20,
            });
        });

        it('gets snapXTo from snapTo', () => {
            expect(getSnapValues(50, undefined, 20)).toEqual({
                x: 50,
                y: 20,
            });
        });

        it('gets snapYTo from snapTo', () => {
            expect(getSnapValues(50, 10)).toEqual({
                x: 10,
                y: 50,
            });
        });
    });
});
