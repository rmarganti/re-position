import { fromEvent, Observable } from 'rxjs';
import {
    concatMap,
    elementAt,
    first,
    mapTo,
    takeUntil,
    tap,
} from 'rxjs/operators';
import { documentPointerMove$, documentPointerUp$ } from './misc';

interface ClickObservableOptions {
    // HTML element used as a basis for all calculations.
    element: HTMLElement;
}

/**
 * Create a click event listener for an element. Because actual click events
 * may be problematic for our other observables, this observable is based off
 * of `pointerdown`, `pointermove`, and `pointerup` events. Therefore, the emitted
 * value is the element's `pointerdown` event, not a `click` event.
 */
export const createClickObservable = ({
    element,
}: ClickObservableOptions): Observable<PointerEvent> => {
    const pointerDown$ = fromEvent<PointerEvent>(element, 'pointerdown');

    return pointerDown$.pipe(
        concatMap(pointerDownEvent =>
            documentPointerUp$.pipe(
                first(),
                takeUntil(documentPointerMove$.pipe(elementAt(3))),
                tap(e => {
                    e.stopPropagation();
                    e.preventDefault();
                }),
                mapTo(pointerDownEvent)
            )
        )
    );
};
