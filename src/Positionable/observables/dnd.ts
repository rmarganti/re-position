import { fromEvent, Observable } from 'rxjs';
import { filter, map, skipWhile, switchMap } from 'rxjs/operators';

import { requestAnimationFramesUntil } from './requestAnimationFramesUntil';
import { Coordinates, CoordinatesStrings } from './types';
import { round } from './utils';

/**
 * Create an Obvservable that enables drag-and-drop
 * and emits a stream of updated positions.
 *
 * @param element HTML Element for which to enable drag-and-drop
 */
export const createDndObservable = (
    element: HTMLElement,
    onComplete?: () => void,
    onStart?: () => void,
    shouldConvertToPercent: boolean = true
): Observable<CoordinatesStrings> => {
    const mouseDown$ = fromEvent(element, 'mousedown');
    const mouseMove$ = fromEvent(document, 'mousemove');
    const mouseUp$ = fromEvent(document, 'mouseup');

    return mouseDown$.pipe(
        filter((e: MouseEvent) => e.which === 1), // left clicks only
        switchMap((e: MouseEvent) => {
            e.preventDefault();
            e.stopPropagation();

            if (onStart) {
                onStart();
            }

            const move$ = mouseMove$.pipe(
                map(distanceFromPointToMouseEvent(e.clientX, e.clientY)),
                skipWhile(hasntMovedFivePixels),
                map(addDistanceTo(element.offsetLeft, element.offsetTop)),
                map(
                    convertPositionToPercent(
                        shouldConvertToPercent,
                        element.parentElement!
                    )
                )
            );

            return requestAnimationFramesUntil(move$, mouseUp$, onComplete);
        })
    );
};

/**
 * Calculates the distance from an origin point to a mouse event
 */
const distanceFromPointToMouseEvent = (originX: number, originY: number) => (
    e: MouseEvent
): Coordinates => ({
    left: e.clientX - originX,
    top: e.clientY - originY,
});

/**
 * Determine if the mouse has moved 5 pixels or more in any direction.
 */
const hasntMovedFivePixels = (change: Coordinates) =>
    Math.sqrt(change.top * change.top + change.left * change.left) < 5;

/**
 * Add the change in mouse position to an origin point.
 */
const addDistanceTo = (originX: number, originY: number) => (
    change: Coordinates
) => ({
    left: originX + change.left,
    top: originY + change.top,
});

/**
 * Convert new coordinates to a percentage of an (parent) element.
 * @param shouldConvertToPercent
 * @param parent
 */
const convertPositionToPercent = (
    shouldConvertToPercent: boolean,
    parent: HTMLElement
) => (position: Coordinates): CoordinatesStrings =>
    shouldConvertToPercent
        ? {
              left: `${round((position.left / parent.offsetWidth) * 100)}%`,
              top: `${round((position.top / parent.offsetHeight) * 100)}%`,
          }
        : {
              left: `${round(position.left)}px`,
              top: `${round(position.top)}px`,
          };
