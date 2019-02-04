import { calculateCursor } from './ResizeHandle';

describe('ResizeHandle', () => {
    it('adjusts the cursor based on rotation', () => {
        expect(calculateCursor({ top: true, rotation: 45 })).toEqual(
            'nesw-resize'
        );

        expect(calculateCursor({ top: true, rotation: 90 })).toEqual(
            'ew-resize'
        );

        expect(calculateCursor({ top: true, rotation: 135 })).toEqual(
            'nwse-resize'
        );

        expect(calculateCursor({ top: true, rotation: 180 })).toEqual(
            'ns-resize'
        );

        expect(calculateCursor({ top: true, rotation: 225 })).toEqual(
            'nesw-resize'
        );

        expect(calculateCursor({ top: true, rotation: 360 })).toEqual(
            'ns-resize'
        );

        expect(calculateCursor({ top: true, rotation: -45 })).toEqual(
            'nwse-resize'
        );
    });
});
