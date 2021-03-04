import { fromEvent, Observable } from 'rxjs';
import { filter, map, skipWhile, switchMap, tap } from 'rxjs/operators';

import { Offset, OffsetNumbers } from '../types';
import { offsetOfElement, scaleOfElement } from '../utils/dom';
import {
    areBothSnapsUndefined,
    getSnapValues,
    snapPositionValues,
    SnapValues,
} from '../utils/misc';
import { allMoveEnd$, allMoveStart$, allMoveUpdate$ } from './allMove';
import {
    documentPointerMove$,
    documentPointerUp$,
    requestAnimationFramesUntil,
} from './misc';

interface DndObservableOptions {
    // HTML element used as a basis for all calculations.
    element: HTMLElement;

    // Elements whose observables belong to the same
    // group will respond to each others movements.
    group: string;

    // HTML element used as a target for pointer interactions.
    handle: HTMLElement;

    // Round position values to an interval of this number.
    snapTo?: number;

    // Round `left` value to an interval of this number.
    snapXTo?: number;

    // Round `top` value to an interval of this number.
    snapYTo?: number;
}

/**
 * Create an Obvservable that enables dragging an Element
 * and emits a stream of updated positions.
 */
export const createDndObservable = ({
    element,
    group,
    handle,
    snapTo,
    snapXTo,
    snapYTo,
}: DndObservableOptions): Observable<Offset> => {
    const pointerDown$ = fromEvent<PointerEvent>(handle, 'pointerdown');

    return pointerDown$.pipe(
        filter((e: PointerEvent) => e.which === 1), // left clicks only
        tap(allMoveStart$),
        switchMap((e: PointerEvent) => {
            e.preventDefault();
            e.stopPropagation();

            const originalOffset = offsetOfElement(element);

            // Account for CSS transform scale
            const scale = scaleOfElement(element);

            // consolidate snap values from snapTo, snapXTo, snapYTo
            const snapValues = getSnapValues(snapTo, snapXTo, snapYTo);

            const move$ = documentPointerMove$.pipe(
                map(changeFromPointToPointerEvent(e.clientX, e.clientY, scale)),
                skipWhile(hasntMovedFivePixels),
                map(adjustForSnap(originalOffset, snapValues)),
                tap(notifyListeners(group))
            );

            return requestAnimationFramesUntil(move$, documentPointerUp$, () =>
                allMoveEnd$.next()
            );
        })
    );
};

/**
 * Calculates the distance from an origin point to a pointer event.
 */
const changeFromPointToPointerEvent = (
    originX: number,
    originY: number,
    scale: number
) => (e: PointerEvent): OffsetNumbers => {
    const leftChange = (e.clientX - originX) / scale;
    const topChange = (e.clientY - originY) / scale;

    if (!e.shiftKey) {
        return {
            left: leftChange,
            top: topChange,
        };
    }

    const changeRatio = leftChange / topChange;
    const absChangeRatio = Math.abs(changeRatio);

    // Lock to diagonals
    if (0.333 < absChangeRatio && absChangeRatio < 3) {
        return {
            left: leftChange,
            top: topChange / leftChange > 0 ? leftChange : leftChange * -1,
        };
    }

    // Lock to horizontal
    if (Math.abs(leftChange) > Math.abs(topChange)) {
        return {
            left: leftChange,
            top: 0,
        };
    }

    // Lock to vertical
    return {
        left: 0,
        top: topChange,
    };
};

/**
 * Determine if the pointer has moved 5 pixels or more in any direction.
 * Change = √(a² + b²)
 */
const hasntMovedFivePixels = (change: OffsetNumbers) =>
    Math.sqrt(change.top * change.top + change.left * change.left) < 5;

/**
 * Adjusts the offset changes so that the element that is being moved
 * ends up in a position that is snapped to the given number.
 *
 * NOTE: If you have grouped elements (via the `group` param),
 * only the element that is being interacted with via pointer
 * will snap, with all other elements simply following along.
 */
const adjustForSnap = (original: OffsetNumbers, snapValues: SnapValues) => (
    change: OffsetNumbers
): OffsetNumbers => {
    if (areBothSnapsUndefined(snapValues)) {
        return change;
    }

    const unsnappedOffset: OffsetNumbers = {
        left: original.left + change.left,
        top: original.top + change.top,
    };

    const snapped = snapPositionValues(snapValues)(unsnappedOffset);

    const adjustedChange = {
        left: snapped.left - original.left,
        top: snapped.top - original.top,
    };

    return adjustedChange;
};

/**
 * Notify allMove observers that a change in pointer position
 * has occurred relative to the initial pointer-down offset.
 */
const notifyListeners = (group: string) => (offset: OffsetNumbers) =>
    allMoveUpdate$.next({ group, offset });
