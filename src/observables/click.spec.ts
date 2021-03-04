import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { createClickObservable } from './click';

describe('click observable', () => {
    it('emits on element click', done => {
        const element = document.createElement('div');
        const pointerDownEvent = new PointerEvent('pointerdown');
        const pointerUpEvent = new PointerEvent('pointerup');

        createClickObservable({ element }).subscribe(e => {
            expect(e.target).toEqual(element);
            expect(e.type).toEqual('pointerdown');
            done();
        });

        // `pointerdown` and `pointerup` with no `pointermove`
        // in between is interpreted as a click.
        element.dispatchEvent(pointerDownEvent);
        document.dispatchEvent(pointerUpEvent);
    });

    it("doesn't emit when dragging", done => {
        const element = document.createElement('div');
        const pointerDownEvent = new PointerEvent('pointerdown');
        const pointerMoveEvent = new PointerEvent('pointermove');
        const pointerUpEvent = new PointerEvent('pointerup');

        const stopListening$ = new Subject<void>();

        createClickObservable({ element })
            .pipe(takeUntil(stopListening$))
            .subscribe({
                next: () => {
                    // Should not get here.
                    expect(false).toBeTruthy();
                    done();
                },
                complete: () => done(),
            });

        // `pointerdown` and `pointerup` with multiple `pointermove`
        // in between is not considered a click. Likely, it is
        // a drag-and-drop interaction.
        element.dispatchEvent(pointerDownEvent);
        document.dispatchEvent(pointerMoveEvent);
        document.dispatchEvent(pointerMoveEvent);
        document.dispatchEvent(pointerMoveEvent);
        document.dispatchEvent(pointerMoveEvent);
        document.dispatchEvent(pointerUpEvent);

        stopListening$.next();
    });
});
