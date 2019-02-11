import { Observable, Subject } from 'rxjs';
import {
    distinctUntilChanged,
    filter,
    map,
    pluck,
    switchMap,
    takeUntil,
} from 'rxjs/operators';

import { Offset, OffsetNumbers } from '../types';
import { offsetOfElement } from '../utils/dom';
import { convertOffsetToPercentOrPixels } from '../utils/misc';

interface AllMoveObservableOptions {
    // HTML element used as a basis for all calculations.
    element: HTMLElement;

    // Elements whose observables belong to the same
    // group will respond to each others movements.
    group: string;

    // Function to call once a movement interaction has completed.
    onComplete?: () => void;

    // Should px-based measurements be converted to a % of the parent size.
    shouldConvertToPercent?: boolean;
}

interface AllMovePayload {
    group: string;
    offset: OffsetNumbers;
}

export const allMoveStart$ = new Subject<any>();
export const allMoveEnd$ = new Subject<any>();
export const allMoveUpdate$ = new Subject<AllMovePayload>();

export const createAllMoveObservable = ({
    element,
    group,
    onComplete,
    shouldConvertToPercent = true,
}: AllMoveObservableOptions): Observable<Offset> =>
    allMoveStart$.pipe(
        switchMap(() => {
            const move$ = allMoveUpdate$.pipe(
                takeUntil(allMoveEnd$),
                filter(isMemberOfGroup(group)),
                pluck('offset'),
                translateMovementToPosition(element, shouldConvertToPercent)
            );

            move$.subscribe({
                complete: () => onComplete && onComplete(),
            });

            return move$;
        })
    );

/**
 * Do the payload group and observable group match?
 */
const isMemberOfGroup = (group: string) => (payload: AllMovePayload) =>
    payload.group === group;

const translateMovementToPosition = (
    element: HTMLElement,
    shouldConvertToPercent: boolean
) => (observable$: Observable<OffsetNumbers>) =>
    observable$.pipe(
        map(addOffsets(offsetOfElement(element))),
        distinctUntilChanged(),
        map(
            convertOffsetToPercentOrPixels(
                shouldConvertToPercent,
                element.parentElement!
            )
        )
    );

/**
 * Add the change in mouse position to an origin point.
 */
const addOffsets = (origin: OffsetNumbers) => (change: OffsetNumbers) => ({
    left: origin.left + change.left,
    top: origin.top + change.top,
});
