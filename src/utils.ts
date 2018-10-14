import { applyToPoint, fromString } from 'transformation-matrix';
import { Coordinates, CoordinatesStrings, Dimensions, Position } from './types';

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
 * Get the transform Matrix object of an element.
 */
export const transformMatrixOfElement = (element: HTMLElement): Matrix =>
    fromString(transformMatrixStringOfElement(element));

/**
 * Round a number to a given precision
 */
export const round = (value: number, precision: number = 1): number =>
    +value.toFixed(precision);

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

/**
 * Compares to objects to see if their values are equal.
 * Only compares a single level.
 *
 * @param a First object
 * @param b Second object
 */
export const objectsAreEqual = (a: {}, b: {}) => {
    // Create arrays of property names
    const aProps = Object.getOwnPropertyNames(a);
    const bProps = Object.getOwnPropertyNames(b);

    // If number of properties is different,
    // objects are not equivalent
    if (aProps.length !== bProps.length) {
        return false;
    }

    for (const prop of aProps) {
        // If values of same property are not equal,
        // objects are not equivalent
        if (a[prop] !== b[prop]) {
            return false;
        }
    }

    // If we made it this far, objects are considered equivalent
    return true;
};

/**
 * Convert new coordinates to a percentage of an (parent) element.
 */
export const convertPositionToPercent = (
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

/**
 * Get the px size of an element.
 */
export const sizeOfElement = (element: HTMLElement): Dimensions => ({
    height: element.offsetHeight,
    width: element.offsetWidth,
});

/**
 * Get the scale of an HTMLElement. Assumes x and y scale are equal.
 */
export const scaleOfElement = (element: HTMLElement): number => {
    const transformationMatrix = transformMatrixOfElement(element);
    const { a, c } = transformationMatrix;
    const scale = Math.sqrt(a * a + c * c);

    const scaleOfParent = element.parentElement
        ? scaleOfElement(element.parentElement)
        : 1;

    return scale * scaleOfParent;
};

/**
 * Snap/Restrict coordinates into a grid
 *
 * @param snapNumber grid gap
 */
export const snapObjectValues = (snapTo?: number) => <T extends {}>(
    input: T
): T => {
    if (!snapTo) {
        return input;
    }

    return Object.keys(input).reduce(
        (carrier, key) => {
            const inputValue = input[key];
            const outputValue =
                typeof inputValue === 'number'
                    ? snapTo * Math.round(inputValue / snapTo)
                    : inputValue;

            return Object.assign({}, carrier, {
                [key]: outputValue,
            });
        },
        {} as T
    );
};
