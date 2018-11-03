import { identity, rotateDEG } from 'transformation-matrix';

import { OffsetAndSize } from '../types';
import { visualCorners } from './dom';

describe('utils/dom', () => {
    describe('visualCorners', () => {
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
