import { Offset } from '../types';
import { defineOffsetGetters } from '../utils/testing';
import { addToOffset } from './keyboardMove';

describe('keyboardMove', () => {
    beforeAll(() => {
        defineOffsetGetters();
    });

    describe('addToOffset()', () => {
        it('adds keyboard movement offset to an HTML element', () => {
            const arrowDown = {
                key: 'ArrowDown',
                shiftKey: false,
            } as KeyboardEvent;

            // The element upon which we are basing our calculations.
            const element = document.createElement('div');
            element.style.left = '0px';
            element.style.top = '0px';
            element.style.width = '10px';
            element.style.height = '10px';

            // Keyboard moves are based on a percentage of the parent.
            const parentElement = document.createElement('div');
            parentElement.style.width = '100px';
            parentElement.style.height = '100px';
            parentElement.appendChild(element);

            const result: Offset = addToOffset(arrowDown, element)();

            expect(result).toEqual({ left: 0, top: 1 });
        });

        it('multiplies the number by 5 when shift is pressed', () => {
            const arrowDown = {
                key: 'ArrowRight',
                shiftKey: true,
            } as KeyboardEvent;

            // The element upon which we are basing our calculations.
            const element = document.createElement('div');
            element.style.left = '0px';
            element.style.top = '0px';
            element.style.width = '10px';
            element.style.height = '10px';

            // Keyboard moves are based on a percentage of the parent.
            const parentElement = document.createElement('div');
            parentElement.style.width = '100px';
            parentElement.style.height = '100px';
            parentElement.appendChild(element);

            const result: Offset = addToOffset(arrowDown, element)();

            expect(result).toEqual({ left: 5, top: 0 });
        });
    });
});
