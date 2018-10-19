import { identity, rotateDEG } from 'transformation-matrix';

import { Position } from './types';
import { corners } from './utils';

describe('utils', () => {
    describe('corners', () => {
        it('calculate the visual corners of non-rotated element', () => {
            const centeredOnAxis: Position = {
                left: -10,
                top: -10,
                width: 20,
                height: 20,
            };

            const centeredOnAccessCorners = corners(centeredOnAxis, identity());

            expect(centeredOnAccessCorners.ne).toEqual({ x: 10, y: -10 });
            expect(centeredOnAccessCorners.se).toEqual({ x: 10, y: 10 });
            expect(centeredOnAccessCorners.sw).toEqual({ x: -10, y: 10 });
            expect(centeredOnAccessCorners.nw).toEqual({ x: -10, y: -10 });

            const allPositive: Position = {
                left: 10,
                top: 10,
                width: 20,
                height: 20,
            };

            const allPositiveCorners = corners(allPositive, identity());

            expect(allPositiveCorners.ne).toEqual({ x: 30, y: 10 });
            expect(allPositiveCorners.se).toEqual({ x: 30, y: 30 });
            expect(allPositiveCorners.sw).toEqual({ x: 10, y: 30 });
            expect(allPositiveCorners.nw).toEqual({ x: 10, y: 10 });
        });

        it('calculates the visual corners of a rotated element', () => {
            const centeredOnAxis: Position = {
                left: -10,
                top: -10,
                width: 20,
                height: 20,
            };

            const centeredOnAccessCorners = corners(
                centeredOnAxis,
                rotateDEG(90)
            );

            expect(centeredOnAccessCorners.ne).toEqual({ x: 10, y: 10 });
            expect(centeredOnAccessCorners.se).toEqual({ x: -10, y: 10 });
            expect(centeredOnAccessCorners.sw).toEqual({ x: -10, y: -10 });
            expect(centeredOnAccessCorners.nw).toEqual({ x: 10, y: -10 });

            const allPositive: Position = {
                left: 10,
                top: 10,
                width: 20,
                height: 20,
            };

            const allPositiveCorners = corners(allPositive, rotateDEG(90));

            expect(allPositiveCorners.ne).toEqual({ x: 30, y: 30 });
            expect(allPositiveCorners.se).toEqual({ x: 10, y: 30 });
            expect(allPositiveCorners.sw).toEqual({ x: 10, y: 10 });
            expect(allPositiveCorners.nw).toEqual({ x: 30, y: 10 });
        });
    });
});
