import {
    applyToPoint,
    fromString,
    Matrix,
    transform,
} from 'transformation-matrix';

import { OffsetAndSizeNumbers, OffsetNumbers, SizeNumbers } from '../types';

/**
 * Get the full offset (left, top, width,
 * height, rotation) of an HTML element.
 */
export const offsetAndSizeOfElement = (
    element: HTMLElement
): OffsetAndSizeNumbers => ({
    left: element.offsetLeft,
    top: element.offsetTop,
    width: element.offsetWidth,
    height: element.offsetHeight,
});

/**
 * Get the left and top offsets of an HTML element, relative to its parent.
 */
export const offsetOfElement = (element: HTMLElement): OffsetNumbers => ({
    left: element.offsetLeft,
    top: element.offsetTop,
});

/**
 * Get the px size of an HTML element.
 */
export const sizeOfElement = (element: HTMLElement): SizeNumbers => ({
    width: element.offsetWidth,
    height: element.offsetHeight,
});

/**
 * Gets the current rotation of an HTML element.
 */
export const rotationOfElement = (element: HTMLElement): number => {
    const tM = transformationMatrixOfElement(element);
    const radians = Math.atan2(tM.b, tM.a);

    return +(radians * (180 / Math.PI)).toFixed(1);
};

/**
 * Get the scale of an HTMLElement. Takes all of its
 * ancestors into account. Assumes x and y scale are equal.
 */
export const scaleOfElement = (element: HTMLElement): number => {
    const tM = globalTransformationMatrixOfElement(element);
    const { a, c } = tM;
    const scale = Math.sqrt(a * a + c * c);

    return scale;
};

/**
 * Get the transform Matrix object of an element.
 */
export const transformationMatrixOfElement = (element: HTMLElement): Matrix =>
    fromString(transformationMatrixStringOfElement(element));

/**
 * The cumulative transformation matrix of an element's
 * transforms and all of its ancestors' transforms.
 */
export const globalTransformationMatrixOfElement = (
    element: HTMLElement
): Matrix => {
    const tM = transformationMatrixOfElement(element);

    if (element.parentElement) {
        const parentTM = globalTransformationMatrixOfElement(
            element.parentElement
        );
        return transform(tM, parentTM);
    }

    return tM;
};

/*
 * Cross browser way to get the current transformation matrix of an Element.
 */
const transformationMatrixStringOfElement = (element: HTMLElement): string => {
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
export const visualCorners = (
    offsetAndSize: OffsetAndSizeNumbers,
    tm: Matrix
) => {
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
