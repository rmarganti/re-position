import { fromEvent, Observable } from 'rxjs';
import { filter, map, switchMap } from 'rxjs/operators';

import { requestAnimationFramesUntil } from './requestAnimationFramesUntil';

import {
    AngleAndDistance,
    Dimensions,
    Position,
    PositionStrings,
} from './types';

import {
    angleBetweenPoints,
    distanceBetweenPoints,
    positionOfElement,
    rotationOfElement,
    round,
    transformMatrixOfElement,
    visualCoords,
} from './utils';

/*
 * Create an Obvservable that enables resizing an HTML element
 * and emits a stream of updated size.
 *
 * @param element HTML Element for which to enable resizing
 * @param handle HTML Element of the draggable handle
 */
export const createResizeObservable = (
    element: HTMLElement,
    handle: HTMLElement,
    onComplete?: () => void,
    width: boolean = true,
    height: boolean = true,
    shouldConvertToPercent: boolean = true
): Observable<PositionStrings> => {
    const mouseDown$ = fromEvent(handle, 'mousedown');
    const mouseMove$ = fromEvent(document, 'mousemove');
    const mouseUp$ = fromEvent(document, 'mouseup');

    return mouseDown$.pipe(
        filter((e: MouseEvent) => e.which === 1), // left clicks only
        switchMap((e: MouseEvent) => {
            e.preventDefault();
            e.stopPropagation();

            const oldPosition = positionOfElement(element);
            const oldRotation = rotationOfElement(element);
            const transformMatrix = transformMatrixOfElement(element);

            const move$ = mouseMove$.pipe(
                map(
                    angleAndDistanceFromPointToMouseEvent(e.clientX, e.clientY)
                ),
                map(horizontalAndVerticalChange(oldRotation)),
                map(applyToOriginalDimensions(oldPosition, width, height)),
                map(limitToTwentyPxMinimum),
                map(
                    lockAspectRatio(
                        e.shiftKey,
                        oldPosition.width / oldPosition.height
                    )
                ),
                map(offsetForVisualConsistency(oldPosition, transformMatrix)),
                map(
                    convertDimensionsToPercent(
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
const angleAndDistanceFromPointToMouseEvent = (
    originX: number,
    originY: number
) => (e: MouseEvent): AngleAndDistance => ({
    angle: angleBetweenPoints(originX, originY)(e.clientX, e.clientY),
    distance: distanceBetweenPoints(originX, originY)(e.clientX, e.clientY),
});

/**
 * Translate angle and distance change of handle to change in x and y
 * (taking old rotation of the element into account).
 */
const horizontalAndVerticalChange = (oldRotation: number) => (
    angleAndDistanceChange: AngleAndDistance
): Dimensions => {
    const angleRadians =
        ((angleAndDistanceChange.angle - oldRotation) * Math.PI) / 180;

    return {
        width: angleAndDistanceChange.distance * Math.cos(angleRadians),
        height: angleAndDistanceChange.distance * Math.sin(angleRadians),
    };
};

/**
 * Apply horizontal and vertical change to old element's dimensions.
 */
const applyToOriginalDimensions = (
    oldPosition: Position,
    width: boolean,
    height: boolean
) => (change: Dimensions): Position => ({
    ...oldPosition,
    width: width ? oldPosition.width + change.width : oldPosition.width,
    height: height ? oldPosition.height + change.height : oldPosition.height,
});

/**
 * Limit the dimensions to a twenty pixel mimum height and width.
 */
const limitToTwentyPxMinimum = (position: Position): Position => ({
    ...position,
    height: Math.max(20, position.height),
    width: Math.max(20, position.width),
});

/**
 * If `shouldLock` is `true`, the new dimensions
 * will be forced into the provided aspect ratio.
 */
const lockAspectRatio = (shouldLock: boolean, aspectRatio: number) => (
    position: Position
): Position => {
    if (!shouldLock) {
        return position;
    }

    if (position.width / position.height > aspectRatio) {
        return {
            ...position,
            height: position.width / aspectRatio,
        };
    }

    if (position.width / position.height < aspectRatio) {
        return {
            ...position,
            width: position.height * aspectRatio,
        };
    }

    return position;
};

/**
 * Fudge the left and top in order to keep
 * the perceived visual position the same.
 */
const offsetForVisualConsistency = (
    oldPosition: Position,
    transformMatrix: Matrix
) => (position: Position): Position => {
    const oldVisualCoords = visualCoords(oldPosition, transformMatrix);
    const newVisualCoords = visualCoords(position, transformMatrix);

    return {
        left: position.left - (newVisualCoords.left - oldVisualCoords.left),
        top: position.top - (newVisualCoords.top - oldVisualCoords.top),
        width: position.width,
        height: position.height,
    };
};

/**
 * Convert pixel dimensions to a percentage of the parent's dimensions.
 */
const convertDimensionsToPercent = (
    shouldConvertToPercent: boolean,
    parent: HTMLElement
) => (position: Position): PositionStrings =>
    shouldConvertToPercent
        ? {
              left: `${round((position.left / parent.offsetWidth) * 100)}%`,
              top: `${round((position.top / parent.offsetHeight) * 100)}%`,
              height: `${round(
                  (position.height / parent.offsetHeight) * 100
              )}%`,
              width: `${round((position.width / parent.offsetWidth) * 100)}%`,
          }
        : {
              left: `${round(position.left)}px`,
              top: `${round(position.top)}px`,
              height: `${round(position.height)}px`,
              width: `${round(position.width)}px`,
          };
