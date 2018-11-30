import { fromEvent, Observable } from 'rxjs';
import { distinctUntilChanged, filter, map, switchMap } from 'rxjs/operators';

import { Matrix } from 'transformation-matrix';
import {
    AngleAndDistanceNumbers,
    OffsetAndSize,
    OffsetAndSizeNumbers,
    SizeNumbers,
} from '../types';
import {
    offsetAndSizeOfElement,
    rotationOfElement,
    scaleOfElement,
    transformationMatrixOfElement,
    visualCorners,
} from '../utils/dom';
import {
    angleBetweenPoints,
    distanceBetweenPoints,
    round,
    snapObjectValues,
} from '../utils/misc';
import {
    documentMouseMove$,
    documentMouseUp$,
    requestAnimationFramesUntil,
} from './misc';

interface ResizeObservableOptions {
    element: HTMLElement;
    handle: HTMLElement;
    onComplete?: () => void;
    top?: boolean;
    right?: boolean;
    bottom?: boolean;
    left?: boolean;
    shouldConvertToPercent?: boolean;
    snapTo?: number;
}

/*
 * Create an Obvservable that enables resizing an HTML element
 * and emits a stream of updated size.
 *
 * @param element HTML Element for which to enable resizing
 * @param handle HTML Element of the movable handle
 */
export const createResizeObservable = ({
    element,
    handle,
    onComplete,
    shouldConvertToPercent = true,
    snapTo,
    top,
    right,
    bottom,
    left,
}: ResizeObservableOptions): Observable<OffsetAndSize> => {
    const mouseDown$ = fromEvent<MouseEvent>(handle, 'mousedown');

    return mouseDown$.pipe(
        filter((e: MouseEvent) => e.which === 1), // left clicks only
        switchMap((e: MouseEvent) => {
            e.preventDefault();
            e.stopPropagation();

            const oldOffsetAndSize = offsetAndSizeOfElement(element);
            const oldRotation = rotationOfElement(element);
            const transformationMatrix = transformationMatrixOfElement(element);
            const scale = scaleOfElement(element);

            const move$ = documentMouseMove$.pipe(
                map(
                    angleAndDistanceFromPointToMouseEvent(
                        e.clientX,
                        e.clientY,
                        scale
                    )
                ),
                map(horizontalAndVerticalChange(oldRotation)),
                map(
                    applyToOriginalSize(
                        oldOffsetAndSize,
                        top,
                        right,
                        bottom,
                        left
                    )
                ),
                map(limitToTwentyPxMinimum),
                map(snapObjectValues(snapTo)),
                distinctUntilChanged(),
                map(
                    lockAspectRatio(
                        e.shiftKey,
                        oldOffsetAndSize.width / oldOffsetAndSize.height
                    )
                ),
                map(
                    offsetForVisualConsistency(
                        oldOffsetAndSize,
                        transformationMatrix,
                        top,
                        right,
                        bottom,
                        left
                    )
                ),
                map(
                    convertSizeToPercent(
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
const angleAndDistanceFromPointToMouseEvent = (
    originX: number,
    originY: number,
    scale: number
) => (e: MouseEvent): AngleAndDistanceNumbers => ({
    angle: angleBetweenPoints(originX, originY)(e.clientX, e.clientY),
    distance:
        distanceBetweenPoints(originX, originY)(e.clientX, e.clientY) / scale,
});

/**
 * Translate angle and distance change of handle to change in x and y
 * (taking old rotation of the element into account).
 */
const horizontalAndVerticalChange = (oldRotation: number) => (
    angleAndDistanceChange: AngleAndDistanceNumbers
): SizeNumbers => {
    const angleRadians =
        ((angleAndDistanceChange.angle - oldRotation) * Math.PI) / 180;

    return {
        width: angleAndDistanceChange.distance * Math.cos(angleRadians),
        height: angleAndDistanceChange.distance * Math.sin(angleRadians),
    };
};

/**
 * Apply horizontal and vertical change to old element's Size.
 */
const applyToOriginalSize = (
    oldOffsetAndSize: OffsetAndSizeNumbers,
    top: boolean | undefined,
    right: boolean | undefined,
    bottom: boolean | undefined,
    left: boolean | undefined
) => (change: SizeNumbers): OffsetAndSizeNumbers => {
    const positionLeft = left
        ? oldOffsetAndSize.left + change.width
        : oldOffsetAndSize.left;

    const positionTop = top
        ? oldOffsetAndSize.top + change.height
        : oldOffsetAndSize.top;

    const positionWidth = left
        ? oldOffsetAndSize.width - change.width
        : right
        ? oldOffsetAndSize.width + change.width
        : oldOffsetAndSize.width;

    const positionHeight = top
        ? oldOffsetAndSize.height - change.height
        : bottom
        ? oldOffsetAndSize.height + change.height
        : oldOffsetAndSize.height;

    return {
        left: positionLeft,
        top: positionTop,
        width: positionWidth,
        height: positionHeight,
    };
};

/**
 * Limit the Size to a twenty pixel minimum height and width.
 */
const limitToTwentyPxMinimum = (
    position: OffsetAndSizeNumbers
): OffsetAndSizeNumbers => ({
    ...position,
    height: Math.max(20, position.height),
    width: Math.max(20, position.width),
});

/**
 * If `shouldLock` is `true`, the new Size
 * will be forced into the provided aspect ratio.
 */
const lockAspectRatio = (shouldLock: boolean, aspectRatio: number) => (
    position: OffsetAndSizeNumbers
): OffsetAndSizeNumbers => {
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
    oldOffsetAndSize: OffsetAndSizeNumbers,
    transformationMatrix: Matrix,
    top?: boolean,
    right?: boolean,
    bottom?: boolean,
    left?: boolean
) => (newOffsetAndSize: OffsetAndSizeNumbers): OffsetAndSizeNumbers => {
    const oldCorners = visualCorners(oldOffsetAndSize, transformationMatrix);
    const newCorners = visualCorners(newOffsetAndSize, transformationMatrix);

    let changeX: number;
    let changeY: number;

    if (bottom && left) {
        changeX = newCorners.ne.x - oldCorners.ne.x;
        changeY = newCorners.ne.y - oldCorners.ne.y;
    } else if (top && right) {
        changeX = newCorners.sw.x - oldCorners.sw.x;
        changeY = newCorners.sw.y - oldCorners.sw.y;
    } else if (top || left) {
        changeX = newCorners.se.x - oldCorners.se.x;
        changeY = newCorners.se.y - oldCorners.se.y;
    } else {
        changeX = newCorners.nw.x - oldCorners.nw.x;
        changeY = newCorners.nw.y - oldCorners.nw.y;
    }

    return {
        left: newOffsetAndSize.left - changeX,
        top: newOffsetAndSize.top - changeY,
        width: newOffsetAndSize.width,
        height: newOffsetAndSize.height,
    };
};

/**
 * Convert pixel Size to a percentage of the parent's Size.
 */
const convertSizeToPercent = (
    shouldConvertToPercent: boolean,
    parent: HTMLElement
) => (position: OffsetAndSizeNumbers): OffsetAndSize =>
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
