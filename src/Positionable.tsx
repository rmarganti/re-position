import * as React from 'react';
import { Subject } from 'rxjs';

import { takeUntil } from 'rxjs/operators';
import {
    createDndObservable,
    createKeyboardMoveObservable,
    createResizeObservable,
    createRotateObservable,
} from './observables';
import { PositionAndRotationStrings } from './types';
import { objectsAreEqual } from './utils';

type PositionableState = PositionAndRotationStrings;

export interface PositionableProps {
    /**
     * Should all functionality be disabled? This property takes
     * precedence over `movable`, `resizable`, and `rotatable.
     *
     */
    disabled?: boolean;

    /**
     * Should moving be enabled?
     * @default false
     */
    movable?: boolean;

    /** Callback to notify when Positioning has changed */
    onUpdate?: (sizing: PositionAndRotationStrings) => void;

    /** Current Positioning (left, top, width, height, zIndex) */
    position: PositionAndRotationStrings;

    /** Render Prop alternative to using `children` */
    render: RenderCallback;

    /** Snap drag and resize to pixels of this interval. */
    snap?: number;

    /**
     * Should resizing be enabled?
     * @default false
     */
    resizable?: boolean;

    /**
     * Should rotation be enabled?
     * @default false
     */
    rotatable?: boolean;
}

type RenderCallback = (args: PositionableComponentProps) => JSX.Element;

export interface PositionableComponentProps {
    coverAllStyle: typeof COVER_ALL_STYLE;
    position: PositionAndRotationStrings;
    refHandlers: Positionable['refHandlers'];
}

const COVER_ALL_STYLE = {
    left: '0%',
    top: '0%',
    width: '100%',
    height: '100%',
};

export class Positionable extends React.Component<
    PositionableProps,
    PositionableState
> {
    public readonly state: PositionableState;

    private refHandlers = {
        container: (container: HTMLDivElement) => (this.container = container),
        hResizeHandle: (hResizeHandle: HTMLElement) =>
            (this.hResizeHandle = hResizeHandle),
        resizeHandle: (resizeHandle: HTMLElement) =>
            (this.resizeHandle = resizeHandle),
        rotateHandle: (rotateHandle: HTMLElement) =>
            (this.rotateHandle = rotateHandle),
        vResizeHandle: (vResizeHandle: HTMLElement) =>
            (this.vResizeHandle = vResizeHandle),
    };

    private container: HTMLDivElement;
    private resizeHandle: HTMLElement;
    private hResizeHandle: HTMLElement;
    private vResizeHandle: HTMLElement;
    private rotateHandle: HTMLElement;

    private destroy$ = new Subject<void>();

    constructor(props: PositionableProps) {
        super(props);

        this.state = Object.assign({}, props.position);
    }

    public componentDidMount() {
        this.buildSubscriptions();
    }

    public componentWillUnmount() {
        this.destroy$.next();
    }

    /**
     * Update subscriptions and internal Position if the props change.
     */
    public componentDidUpdate(prevProps: PositionableProps) {
        if (objectsAreEqual(this.props, prevProps)) {
            return;
        }

        const { position, ...rest } = this.props;
        const { position: prevPosition, ...prevRest } = prevProps;

        if (!objectsAreEqual(position, prevPosition)) {
            this.setState(this.props.position);
        }

        if (!objectsAreEqual(rest, prevRest)) {
            this.buildSubscriptions();
        }
    }

    public render() {
        const { render } = this.props;

        return render({
            coverAllStyle: COVER_ALL_STYLE,
            position: this.state,
            refHandlers: this.refHandlers,
        });
    }

    /**
     * Call `onUpdate()` prop if position has changed.
     */
    private handleUpdate = () => {
        if (
            !this.props.onUpdate ||
            objectsAreEqual(this.state, this.props.position)
        ) {
            return;
        }

        this.props.onUpdate(this.state);
    };

    /**
     * Handle subscribing to and unsubscribing from Observables.
     */
    private buildSubscriptions() {
        this.destroy$.next();

        if (this.props.disabled) {
            return;
        }

        if (this.props.movable) {
            createDndObservable({
                element: this.container,
                onComplete: this.handleUpdate,
                shouldConvertToPercent: this.state.left.includes('%'),
                snap: this.props.snap,
            })
                .pipe(takeUntil(this.destroy$))
                .subscribe(newCoords => this.setState(newCoords));

            createKeyboardMoveObservable({
                element: this.container,
                onComplete: this.handleUpdate,
                shouldConvertToPercent: this.state.left.includes('%'),
            })
                .pipe(takeUntil(this.destroy$))
                .subscribe(newCoords => this.setState(newCoords));
        }

        if (this.props.resizable) {
            createResizeObservable({
                element: this.container,
                handle: this.resizeHandle,
                onComplete: this.handleUpdate,
                width: true,
                height: true,
                shouldConvertToPercent: this.state.width.includes('%'),
                snap: this.props.snap,
            })
                .pipe(takeUntil(this.destroy$))
                .subscribe(newPosition => this.setState(newPosition));

            createResizeObservable({
                element: this.container,
                handle: this.hResizeHandle,
                onComplete: this.handleUpdate,
                width: true,
                height: false,
                shouldConvertToPercent: this.state.width.includes('%'),
                snap: this.props.snap,
            })
                .pipe(takeUntil(this.destroy$))
                .subscribe(newPosition => this.setState(newPosition));

            createResizeObservable({
                element: this.container,
                handle: this.vResizeHandle,
                onComplete: this.handleUpdate,
                width: false,
                height: true,
                shouldConvertToPercent: this.state.width.includes('%'),
                snap: this.props.snap,
            })
                .pipe(takeUntil(this.destroy$))
                .subscribe(newPosition => this.setState(newPosition));
        }

        if (this.props.rotatable) {
            createRotateObservable({
                element: this.container,
                handle: this.rotateHandle,
                onComplete: this.handleUpdate,
            })
                .pipe(takeUntil(this.destroy$))
                .subscribe(newRotation => this.setState(newRotation));
        }
    }
}

export default Positionable;
