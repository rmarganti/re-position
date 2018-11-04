import { applyToPoint, fromString, Matrix } from 'transformation-matrix';
import { OffsetAndSize, Size } from '../types';

/**
 * Get the full offset (left, top, width,
 * height, rotation) of an HTML element.
 */
export const offsetAndSizeOfElement = (
    element: HTMLElement
): OffsetAndSize => ({
    left: element.offsetLeft,
    top: element.offsetTop,
    width: element.offsetWidth,
    height: element.offsetHeight,
});

/**
 * Get the px size of an HTML element.
 */
export const sizeOfElement = (element: HTMLElement): Size => ({
    width: element.offsetWidth,
    height: element.offsetHeight,
});

/**
 * Gets the current rotation of an HTML element.
 */
export const rotationOfElement = (element: HTMLElement): number => {
    const transform = transformMatrixOfElement(element);
    const radians = Math.atan2(transform.b, transform.a);

    return +(radians * (180 / Math.PI)).toFixed(1);
};

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
 * Get the transform Matrix object of an element.
 */
export const transformMatrixOfElement = (element: HTMLElement): Matrix =>
    fromString(transformMatrixStringOfElement(element));

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
        // Identity matrix.
        return 'matrix(1, 0, 0, 1, 0, 0)';
    }

    return result;
};

/**
 * Calculate where the four corners of an HTML Element
 * will be after applying CSS transformations.
 */
export const visualCorners = (offsetAndSize: OffsetAndSize, tm: Matrix) => {
    const halfWidth = offsetAndSize.width / 2;
    const halfHeight = offsetAndSize.height / 2;

    // Assume the center of the Element is (0, 0).
    const nw = { x: -halfWidth, y: -halfHeight };
    const ne = { x: halfWidth, y: -halfHeight };
    const sw = { x: -halfWidth, y: halfHeight };
    const se = { x: halfWidth, y: halfHeight };

    // New location of above points after applying transformation matrix.
    const tnw = applyToPoint(tm, nw);
    const tne = applyToPoint(tm, ne);
    const tsw = applyToPoint(tm, sw);
    const tse = applyToPoint(tm, se);

    // "Move" center of Element back to its original offset.
    return {
        nw: {
            x: tnw.x + halfWidth + offsetAndSize.left,
            y: tnw.y + halfHeight + offsetAndSize.top,
        },
        ne: {
            x: tne.x + halfWidth + offsetAndSize.left,
            y: tne.y + halfHeight + offsetAndSize.top,
        },
        sw: {
            x: tsw.x + halfWidth + offsetAndSize.left,
            y: tsw.y + halfHeight + offsetAndSize.top,
        },
        se: {
            x: tse.x + halfWidth + offsetAndSize.left,
            y: tse.y + halfHeight + offsetAndSize.top,
        },
    };
};
