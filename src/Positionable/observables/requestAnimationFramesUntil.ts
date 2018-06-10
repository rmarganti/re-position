import { animationFrameScheduler, interval, Observable } from 'rxjs';
import { takeUntil, withLatestFrom } from 'rxjs/operators';

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
