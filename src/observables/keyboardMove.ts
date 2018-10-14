import { timer } from 'rxjs';
import { filter, map, switchMap, takeUntil } from 'rxjs/operators';

import { Coordinates } from '../types';
import {
    convertPositionToPercent,
    positionOfElement,
    sizeOfElement,
} from '../utils';
import { keyDowns$, keyUps$ } from './misc';

const ARROW_KEYS: { [index: string]: Coordinates } = {
    ArrowLeft: { left: -1, top: 0 },
    ArrowRight: { left: 1, top: 0 },
    ArrowUp: { left: 0, top: -1 },
    ArrowDown: { left: 0, top: 1 },
};

interface KeyboardMoveObservableOptions {
    element: HTMLElement;
    onComplete?: () => void;
    shouldConvertToPercent: boolean;
}

const isArrowKey = (e: KeyboardEvent) =>
    Object.keys(ARROW_KEYS).indexOf(e.key) !== -1;

const arrowDown$ = keyDowns$.pipe(filter(isArrowKey));
const arrowUp$ = keyUps$.pipe(filter(isArrowKey));

/**
 * Create an Observable that enables drag-and-drop
 * and emits a stream of updated positions.
 */
export const createKeyboardMoveObservable = ({
    element,
    onComplete,
    shouldConvertToPercent = true,
}: KeyboardMoveObservableOptions) =>
    arrowDown$.pipe(
        // We're custom-handling repeating with a timer observable
        filter(e => !e.repeat),

        // Repeat until keyup
        switchMap(e => {
            const keyRepeat$ = timer(0, 200).pipe(
                takeUntil(arrowUp$),
                map(addToPosition(e, element)),
                map(
                    convertPositionToPercent(
                        shouldConvertToPercent,
                        element.parentElement!
                    )
                )
            );

            keyRepeat$.subscribe({
                complete: () => onComplete && onComplete(),
            });

            return keyRepeat$;
        })
    );

const addToPosition = (
    e: KeyboardEvent,
    element: HTMLElement
) => (): Coordinates => {
    const position = positionOfElement(element);
    const sizeOfParent = sizeOfElement(element.parentElement!);
    const onePercentHorizontal = sizeOfParent.width * 0.01;
    const onePercentVertical = sizeOfParent.height * 0.01;

    const movement = ARROW_KEYS[e.key];
    const multiplier = e.shiftKey ? 5 : 1;

    return {
        left: onePercentHorizontal * movement.left * multiplier + position.left,
        top: onePercentVertical * movement.top * multiplier + position.top,
    };
};
