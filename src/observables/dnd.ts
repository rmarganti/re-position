import { fromEvent, Observable } from 'rxjs';
import { filter, map, skipWhile, switchMap, tap } from 'rxjs/operators';

import { Offset, OffsetNumbers } from '../types';
import { offsetOfElement, scaleOfElement } from '../utils/dom';
import { snapObjectValues } from '../utils/misc';
import { allMoveEnd$, allMoveStart$, allMoveUpdate$ } from './allMove';
import {
    documentMouseMove$,
    documentMouseUp$,
    requestAnimationFramesUntil,
} from './misc';

interface DndObservableOptions {
    // HTML element used as a basis for all calculations.
    element: HTMLElement;

    // Elements whose observables belong to the same
    // group will respond to each others movements.
    group: string;

    // HTML element used as a target for mouse interactions.
    handle: HTMLElement;

    // Round values to an interval of this number.
    snapTo?: number;
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
}: DndObservableOptions): Observable<Offset> => {
    const mouseDown$ = fromEvent(handle, 'mousedown');

    return mouseDown$.pipe(
        filter((e: MouseEvent) => e.which === 1), // left clicks only
        tap(allMoveStart$),
        switchMap((e: MouseEvent) => {
            e.preventDefault();
            e.stopPropagation();

            const originalOffset = offsetOfElement(element);

            // Account for CSS transform scale
            const scale = scaleOfElement(element);

            const move$ = documentMouseMove$.pipe(
                map(changeFromPointToMouseEvent(e.clientX, e.clientY, scale)),
                skipWhile(hasntMovedFivePixels),
                map(adjustForSnap(originalOffset, snapTo)),
                tap(notifyListeners(group))
            );

            return requestAnimationFramesUntil(move$, documentMouseUp$, () =>
                allMoveEnd$.next()
            );
        })
    );
};

/**
 * Calculates the distance from an origin point to a mouse event
 */
const changeFromPointToMouseEvent = (
    originX: number,
    originY: number,
    scale: number
) => (e: MouseEvent): OffsetNumbers => {
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
 * Determine if the mouse has moved 5 pixels or more in any direction.
 * Change = √(a² + b²)
 */
const hasntMovedFivePixels = (change: OffsetNumbers) =>
    Math.sqrt(change.top * change.top + change.left * change.left) < 5;

/**
 * Adjusts the offset changes so that the element that is being moved
 * ends up in a position that is snapped to the given number.
 *
 * NOTE: If you have grouped elements (via the `group` param),
 * only the element that is being interacted with via mouse
 * will snap, with all other elements simply following along.
 */
const adjustForSnap = (original: OffsetNumbers, snapTo?: number) => (
    change: OffsetNumbers
): OffsetNumbers => {
    if (!snapTo) {
        return change;
    }

    const unsnappedOffset: OffsetNumbers = {
        left: original.left + change.left,
        top: original.top + change.top,
    };

    const snapped = snapObjectValues(snapTo)(unsnappedOffset);

    const adjustedChange = {
        left: snapped.left - original.left,
        top: snapped.top - original.top,
    };

    return adjustedChange;
};

/**
 * Notify allMove observers that a change in mouse position
 * has occurred relative to the initial mouse-down offset.
 */
const notifyListeners = (group: string) => (offset: OffsetNumbers) =>
    allMoveUpdate$.next({ group, offset });
