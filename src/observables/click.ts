import { fromEvent, Observable } from 'rxjs';
import {
    concatMap,
    elementAt,
    first,
    mapTo,
    takeUntil,
    tap,
} from 'rxjs/operators';
import { documentMouseMove$, documentMouseUp$ } from './misc';

interface ClickObservableOptions {
    // HTML element used as a basis for all calculations.
    element: HTMLElement;
}

/**
 * Create a click event listener for an element. Because actual click events
 * may be problematic for our other observables, this observable is based off
 * of `mousedown`, `mousemove`, and `mouseup` events. Therefore, the emitted
 * value is the element's `mousedown` event, not a `click` event.
 */
export const createClickObservable = ({
    element,
}: ClickObservableOptions): Observable<MouseEvent> => {
    const mouseDown$ = fromEvent<MouseEvent>(element, 'mousedown');

    return mouseDown$.pipe(
        concatMap(mouseDownEvent =>
            documentMouseUp$.pipe(
                first(),
                takeUntil(documentMouseMove$.pipe(elementAt(3))),
                tap(e => {
                    e.stopPropagation();
                    e.preventDefault();
                }),
                mapTo(mouseDownEvent)
            )
        )
    );
};
