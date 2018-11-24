import {
    identity,
    rotate,
    rotateDEG,
    scale,
    toCSS,
} from 'transformation-matrix';

import { OffsetAndSize } from '../types';
import { rotationOfElement, scaleOfElement, visualCorners } from './dom';

describe('utils/dom', () => {
    describe('rotationOfElement()', () => {
        it('correctly calculates the rotation of an HTML element', () => {
            const div = document.createElement('div');
            div.style.width = '100px';
            div.style.height = '100px';
            div.style.left = '100px';
            div.style.top = '100px';
            div.style.transform = toCSS(rotateDEG(45));

            const degreeRotation = rotationOfElement(div);
            expect(degreeRotation).toEqual(45);

            div.style.transform = toCSS(rotate(3.14159));
            const radianRotation = rotationOfElement(div);
            expect(radianRotation).toEqual(180);
        });
    });

    describe('scaleOfElement()', () => {
        it('calculates the global scale of an HTML element', () => {
            const grandParent = document.createElement('div');
            grandParent.style.width = '100px';
            grandParent.style.height = '100px';
            grandParent.style.left = '100px';
            grandParent.style.top = '100px';
            grandParent.style.transform = toCSS(scale(0.5));

            const parent = document.createElement('div');
            parent.style.width = '100px';
            parent.style.height = '100px';
            parent.style.left = '100px';
            parent.style.top = '100px';
            parent.style.transform = toCSS(scale(3));

            const child = document.createElement('div');
            child.style.width = '100px';
            child.style.height = '100px';
            child.style.left = '100px';
            child.style.top = '100px';
            child.style.transform = toCSS(scale(2));

            grandParent.appendChild(parent);
            parent.appendChild(child);

            const scaleAmount = scaleOfElement(child);
            expect(scaleAmount).toEqual(3); // 0.5 x 3 x 2
        });
    });

    describe('visualCorners()', () => {
        it('calculate the visual corners of non-rotated element', () => {
            const centeredOnAxis: OffsetAndSize = {
                left: -10,
                top: -10,
                width: 20,
                height: 20,
            };

            const centeredOnAccessCorners = visualCorners(
                centeredOnAxis,
                identity()
            );

            expect(centeredOnAccessCorners.ne).toEqual({ x: 10, y: -10 });
            expect(centeredOnAccessCorners.se).toEqual({ x: 10, y: 10 });
            expect(centeredOnAccessCorners.sw).toEqual({ x: -10, y: 10 });
            expect(centeredOnAccessCorners.nw).toEqual({ x: -10, y: -10 });

            const allPositive: OffsetAndSize = {
                left: 10,
                top: 10,
                width: 20,
                height: 20,
            };

            const allPositiveCorners = visualCorners(allPositive, identity());

            expect(allPositiveCorners.ne).toEqual({ x: 30, y: 10 });
            expect(allPositiveCorners.se).toEqual({ x: 30, y: 30 });
            expect(allPositiveCorners.sw).toEqual({ x: 10, y: 30 });
            expect(allPositiveCorners.nw).toEqual({ x: 10, y: 10 });
        });

        it('calculates the visual corners of a rotated element', () => {
            const centeredOnAxis: OffsetAndSize = {
                left: -10,
                top: -10,
                width: 20,
                height: 20,
            };

            const centeredOnAccessCorners = visualCorners(
                centeredOnAxis,
                rotateDEG(90)
            );

            expect(centeredOnAccessCorners.ne).toEqual({ x: 10, y: 10 });
            expect(centeredOnAccessCorners.se).toEqual({ x: -10, y: 10 });
            expect(centeredOnAccessCorners.sw).toEqual({ x: -10, y: -10 });
            expect(centeredOnAccessCorners.nw).toEqual({ x: 10, y: -10 });

            const allPositive: OffsetAndSize = {
                left: 10,
                top: 10,
                width: 20,
                height: 20,
            };

            const allPositiveCorners = visualCorners(
                allPositive,
                rotateDEG(90)
            );

            expect(allPositiveCorners.ne).toEqual({ x: 30, y: 30 });
            expect(allPositiveCorners.se).toEqual({ x: 10, y: 30 });
            expect(allPositiveCorners.sw).toEqual({ x: 10, y: 10 });
            expect(allPositiveCorners.nw).toEqual({ x: 30, y: 10 });
        });
    });
});
