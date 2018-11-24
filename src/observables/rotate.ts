import { fromEvent, Observable } from 'rxjs';
import { filter, map, switchMap } from 'rxjs/operators';

import { Rotation } from '../types';
import { rotationOfElement } from '../utils/dom';
import { angleBetweenPoints, round } from '../utils/misc';
import {
    documentMouseMove$,
    documentMouseUp$,
    requestAnimationFramesUntil,
} from './misc';

interface RotateObservableOptions {
    element: HTMLElement;
    handle: HTMLElement;
    onComplete: () => void;
}

/**
 * Create an Obvservable that enables rotating an HTML element
 * and emits a stream of updated rotation.
 *
 * @param element HTML Element for which to enable rotation.
 * @param handle HTML Element of the movable handle
 */
export const createRotateObservable = ({
    element,
    handle,
    onComplete,
}: RotateObservableOptions): Observable<Rotation> => {
    const mouseDown$ = fromEvent(handle, 'mousedown');

    return mouseDown$.pipe(
        filter((e: MouseEvent) => e.which === 1), // left clicks only
        switchMap((e: MouseEvent) => {
            e.preventDefault();
            e.stopPropagation();

            // Use the center of the Element as a rotation point
            const position = element.getBoundingClientRect();
            const axisX = (element.offsetWidth + position.left * 2) / 2;
            const axisY = (element.offsetHeight + position.top * 2) / 2;

            // Create a function that calculates the angle of a
            // line starting at the center of the Element
            const angleFromAxis = angleBetweenPoints(axisX, axisY);

            const currentRotation = rotationOfElement(element);
            const initialAngle =
                angleFromAxis(e.clientX, e.clientY) - currentRotation;

            const rotate$ = documentMouseMove$.pipe(
                map(translateRotation(angleFromAxis, initialAngle))
            );

            return requestAnimationFramesUntil(
                rotate$,
                documentMouseUp$,
                onComplete
            );
        })
    );
};

/**
 * A function that calculates the angle from a non-exposed point
 * to the point provided as parameters when calling the function.
 */
type AngleFromPointCalculator = (x: number, y: number) => number;

/**
 * Calculate the final rotation based on the mouse's angle from
 * the center axis and original rotation of the html element.
 */
const translateRotation = (
    angleCalculator: AngleFromPointCalculator,
    initialAngle: number
) => (e: MouseEvent): Rotation => ({
    rotation: `${round(
        angleCalculator(e.clientX, e.clientY) - initialAngle
    )}deg`,
});
