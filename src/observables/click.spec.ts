import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { createClickObservable } from './click';

describe('click observable', () => {
    it('emits on element click', done => {
        const element = document.createElement('div');
        const mouseDownEvent = new MouseEvent('mousedown');
        const mouseUpEvent = new MouseEvent('mouseup');

        createClickObservable({ element }).subscribe(e => {
            expect(e.target).toEqual(element);
            expect(e.type).toEqual('mousedown');
            done();
        });

        // `mousedown` and `mouseup` with no `mousemove`
        // in between is interpreted as a click.
        element.dispatchEvent(mouseDownEvent);
        document.dispatchEvent(mouseUpEvent);
    });

    it("doesn't emit when dragging", done => {
        const element = document.createElement('div');
        const mouseDownEvent = new MouseEvent('mousedown');
        const mouseMoveEvent = new MouseEvent('mousemove');
        const mouseUpEvent = new MouseEvent('mouseup');

        const stopListening$ = new Subject<void>();

        createClickObservable({ element })
            .pipe(takeUntil(stopListening$))
            .subscribe({
                next: e => {
                    // Should not get here.
                    expect(false).toBeTruthy();
                    done();
                },
                complete: () => done(),
            });

        // `mousedown` and `mouseup` with multiple `mousemove`
        // in between is not considered a click. Likely, it is
        // a drag-and-drop interaction.
        element.dispatchEvent(mouseDownEvent);
        document.dispatchEvent(mouseMoveEvent);
        document.dispatchEvent(mouseMoveEvent);
        document.dispatchEvent(mouseMoveEvent);
        document.dispatchEvent(mouseMoveEvent);
        document.dispatchEvent(mouseUpEvent);

        stopListening$.next();
    });
});
