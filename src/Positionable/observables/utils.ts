import { applyToPoint, fromString } from 'transformation-matrix';
import { Coordinates, Position } from './types';

/**
 * Calculate the angle between two points.
 */
export const angleBetweenPoints = (x1: number, y1: number) => (
    x2: number,
    y2: number
) => (Math.atan2(y2 - y1, x2 - x1) * 180) / Math.PI;

/**
 * Calculate the distance between two points
 */
export const distanceBetweenPoints = (x1: number, y1: number) => (
    x2: number,
    y2: number
) => {
    const xDiff = x2 - x1;
    const yDiff = y2 - y1;

    return Math.sqrt(xDiff * xDiff + yDiff * yDiff);
};

/**
 * Get the full positioning (left, top, width,
 * height, rotation) of an HTML element.
 */
export const positionOfElement = (element: HTMLElement): Position => ({
    left: element.offsetLeft,
    top: element.offsetTop,
    width: element.offsetWidth,
    height: element.offsetHeight,
});

/**
 * Gets the current rotation of an HTML Element
 *
 * @param element
 */
export const rotationOfElement = (element: HTMLElement) => {
    const transform = transformMatrixStringOfElement(element);

    if (transform === 'none') {
        return 0;
    }

    // Matches first two numbers in matrix
    // Ex: matrix(0.624384, 0.781117, -0.781117, 0.624384, 0, 0)
    const matches = transform.match(/\(([0-9.-]+), ([0-9.-]+)/);

    if (!matches) {
        return 0;
    }

    const a = +matches[1];
    const b = +matches[2];

    const radians = Math.atan2(b, a);

    return +(radians * (180 / Math.PI)).toFixed(1);
};

/**
 * Get the effectual coordinates of element's top-left corner,
 * given the position and transform matrix of that element.
 */
export const visualCoords = (position: Position, transformMatrix: Matrix) => {
    const originalOffsetFromCenter = {
        x: position.width / -2,
        y: position.height / -2,
    };

    const visualOffsetFromCenter = applyToPoint(
        transformMatrix,
        originalOffsetFromCenter
    );

    return {
        left:
            position.left +
            (visualOffsetFromCenter.x - originalOffsetFromCenter.x),
        top:
            position.top +
            (visualOffsetFromCenter.y - originalOffsetFromCenter.y),
    };
};

/**
 * Get the effectual position of an html element's top-left
 * corner after CSS transformations have been applied.
 */
export const visualCoordsOfElement = (element: HTMLElement): Coordinates =>
    visualCoords(positionOfElement(element), transformMatrixOfElement(element));

/**
 * Get the transform Matrix object of an element.
 */
export const transformMatrixOfElement = (element: HTMLElement): Matrix =>
    fromString(transformMatrixStringOfElement(element));

/**
 * Round a number to a given precision
 */
export const round = (value: number, precission: number = 1): number =>
    +value.toFixed(precission);

/*
 * Cross browser way to get the current transform matrix of an Element.
 */
const transformMatrixStringOfElement = (element: HTMLElement): string => {
    const style = window.getComputedStyle(element, null);

    const result =
        style.getPropertyValue('-webkit-transform') ||
        style.getPropertyValue('-moz-transform') ||
        style.getPropertyValue('-ms-transform') ||
        style.getPropertyValue('-o-transform') ||
        style.getPropertyValue('transform');

    if (result === 'none') {
        return 'matrix(1, 0, 0, 1, 0, 0)';
    }

    return result;
};
