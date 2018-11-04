import { timer } from 'rxjs';
import { filter, map, switchMap, takeUntil } from 'rxjs/operators';

import { Offset } from '../types';
import { offsetAndSizeOfElement, sizeOfElement } from '../utils/dom';
import { convertOffsetToPercentOrPixels } from '../utils/misc';
import { keyDowns$, keyUps$ } from './misc';

const ARROW_KEY_DIRECTIONS: { [index: string]: Offset } = {
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
    Object.keys(ARROW_KEY_DIRECTIONS).indexOf(e.key) !== -1;

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
                map(addToOffset(e, element)),
                map(
                    convertOffsetToPercentOrPixels(
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

/*
 * Adds 1% (10% if shift is pressed) to the offset of an HTML Element
 * in the direction of the currently-pressed arrow key.
 *
 */
const addToOffset = (e: KeyboardEvent, element: HTMLElement) => (): Offset => {
    const offsetAndSize = offsetAndSizeOfElement(element);
    const sizeOfParent = sizeOfElement(element.parentElement!);
    const onePercentHorizontal = sizeOfParent.width * 0.01;
    const onePercentVertical = sizeOfParent.height * 0.01;

    const movement = ARROW_KEY_DIRECTIONS[e.key];
    const multiplier = e.shiftKey ? 5 : 1;

    return {
        left:
            onePercentHorizontal * movement.left * multiplier +
            offsetAndSize.left,
        top: onePercentVertical * movement.top * multiplier + offsetAndSize.top,
    };
};
