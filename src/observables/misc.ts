import { animationFrameScheduler, fromEvent, interval, Observable } from 'rxjs';
import {
    distinctUntilChanged,
    filter,
    map,
    merge,
    startWith,
    takeUntil,
    withLatestFrom,
} from 'rxjs/operators';

export const documentMouseMove$ = fromEvent<MouseEvent>(document, 'mousemove');
export const documentMouseUp$ = fromEvent<MouseEvent>(document, 'mouseup');

export const keyDowns$ = fromEvent<KeyboardEvent>(document, 'keydown');
export const keyUps$ = fromEvent<KeyboardEvent>(document, 'keyup');

/**
 * Throttle an Observable to available animation
 * frames until a second Observable omits a value.
 *
 * @param observable$ Observable to monitor
 * @param until$ Observable that triggers an end to monitoring
 * @param onComplete Callback function that signals monitoring has ending
 */
export const requestAnimationFramesUntil = (
    observable$: Observable<any>,
    until$: Observable<any>,
    onComplete?: () => void
) => {
    const animationFrame$ = interval(0, animationFrameScheduler);

    const throttled$ = animationFrame$.pipe(
        withLatestFrom(observable$, (_, observed) => observed),
        takeUntil(until$)
    );

    throttled$.subscribe({
        complete: () => onComplete && onComplete(),
    });

    return throttled$;
};

/**
 * Is the KeyboardEvent for a key down?
 */
const isKeydown = (e: KeyboardEvent) => e.type === 'keydown';

/**
 * Has the pressed state of a key changed between two events?
 */
const pressedStateHasChanged = (x: KeyboardEvent, y: KeyboardEvent) =>
    x.type === y.type;

/**
 * Observable of whether shift is currently being held down.
 */
const SHIFT_KEY_CODE = 16;
export const shiftIsPressed$: Observable<boolean> = keyDowns$.pipe(
    merge(keyUps$),
    filter(e => e.keyCode === SHIFT_KEY_CODE),
    distinctUntilChanged(pressedStateHasChanged),
    map(isKeydown),
    startWith(false)
);
