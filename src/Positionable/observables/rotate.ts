import { fromEvent, Observable } from 'rxjs';
import { filter, map, switchMap } from 'rxjs/operators';

import { requestAnimationFramesUntil } from './requestAnimationFramesUntil';
import { Rotation } from './types';
import { angleBetweenPoints, rotationOfElement, round } from './utils';

/**
 * Create an Obvservable that enables rotating an HTML element
 * and emits a stream of updated rotation.
 *
 * @param element HTML Element for which to enable rotatation.
 * @param handle HTML Element of the draggable handle
 */
export const createRotateObservable = (
    element: HTMLElement,
    handle: HTMLElement,
    onComplete: () => void
): Observable<Rotation> => {
    const mouseDown$ = fromEvent(handle, 'mousedown');
    const mouseMove$ = fromEvent(document, 'mousemove');
    const mouseUp$ = fromEvent(document, 'mouseup');

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

            const rotate$ = mouseMove$.pipe(
                map(translateRotate(angleFromAxis, initialAngle))
            );

            return requestAnimationFramesUntil(rotate$, mouseUp$, onComplete);
        })
    );
};

const translateRotate = (
    angleCalculator: (x: number, y: number) => number,
    initialAngle: number
) => (e: MouseEvent): Rotation => ({
    rotate: `${round(angleCalculator(e.clientX, e.clientY) - initialAngle)}deg`,
});
