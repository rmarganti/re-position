import { fromEvent, Observable } from 'rxjs';
import {
    distinctUntilChanged,
    filter,
    map,
    skipWhile,
    switchMap,
} from 'rxjs/operators';

import { Offset, OffsetStrings } from '../types';
import { scaleOfElement } from '../utils/dom';
import { convertOffsetToPercent, snapObjectValues } from '../utils/misc';
import {
    documentMouseMove$,
    documentMouseUp$,
    requestAnimationFramesUntil,
} from './misc';

interface DndObservableOptions {
    element: HTMLElement;
    onComplete?: () => void;
    shouldConvertToPercent: boolean;
    snapTo?: number;
}

/**
 * Create an Obvservable that enables dragging an Element
 * and emits a stream of updated positions.
 */
export const createDndObservable = ({
    element,
    onComplete,
    shouldConvertToPercent = true,
    snapTo,
}: DndObservableOptions): Observable<OffsetStrings> => {
    const mouseDown$ = fromEvent(element, 'mousedown');

    return mouseDown$.pipe(
        filter((e: MouseEvent) => e.which === 1), // left clicks only
        switchMap((e: MouseEvent) => {
            e.preventDefault();
            e.stopPropagation();

            // Account for CSS transform scale
            const scale = scaleOfElement(element);

            const move$ = documentMouseMove$.pipe(
                map(distanceFromPointToMouseEvent(e.clientX, e.clientY, scale)),
                skipWhile(hasntMovedFivePixels),
                map(addDistanceTo(element.offsetLeft, element.offsetTop)),
                map(snapObjectValues(snapTo)),
                distinctUntilChanged(),
                map(
                    convertOffsetToPercent(
                        shouldConvertToPercent,
                        element.parentElement!
                    )
                )
            );

            return requestAnimationFramesUntil(
                move$,
                documentMouseUp$,
                onComplete
            );
        })
    );
};

/**
 * Calculates the distance from an origin point to a mouse event
 */
const distanceFromPointToMouseEvent = (
    originX: number,
    originY: number,
    scale: number
) => (e: MouseEvent): Offset => {
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
 */
const hasntMovedFivePixels = (change: Offset) =>
    Math.sqrt(change.top * change.top + change.left * change.left) < 5;

/**
 * Add the change in mouse position to an origin point.
 */
const addDistanceTo = (originX: number, originY: number) => (
    change: Offset
) => ({
    left: originX + change.left,
    top: originY + change.top,
});
