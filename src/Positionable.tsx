import * as React from 'react';
import { Subject } from 'rxjs';

import { takeUntil } from 'rxjs/operators';
import {
    createDndObservable,
    createKeyboardMoveObservable,
    createResizeObservable,
    createRotateObservable,
} from './observables';
import { PositionAndRotationStrings, ResizableDirection } from './types';
import {
    calculateResizeObservablesAndPositions,
    objectsAreEqual,
} from './utils';

type PositionableState = PositionAndRotationStrings;

export interface PositionableProps {
    /**
     * Should all functionality be disabled? This property takes
     * precedence over `movable`, `resizable`, and `rotatable`.
     */
    disabled?: boolean;

    /** Should moving be enabled? */
    movable?: boolean;

    /** Callback to notify when Positioning has changed */
    onUpdate?: (sizing: PositionAndRotationStrings) => void;

    /** Current Positioning (left, top, width, height, zIndex) */
    position: PositionAndRotationStrings;

    /** Render Prop alternative to using `children` */
    render: RenderCallback;

    /** Snap drag and resize to pixels of this interval. */
    snap?: number;

    /** Should resizing be enabled? */
    resizable?: ResizableDirection;

    /** Should rotation be enabled? */
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
    public static defaultProps = {
        resizable: [],
    };

    public readonly state: PositionableState;

    private refHandlers = {
        container: React.createRef<HTMLElement>(),
        rotate: React.createRef<HTMLElement>(),
        nResize: React.createRef<HTMLElement>(),
        neResize: React.createRef<HTMLElement>(),
        eResize: React.createRef<HTMLElement>(),
        seResize: React.createRef<HTMLElement>(),
        sResize: React.createRef<HTMLElement>(),
        swResize: React.createRef<HTMLElement>(),
        wResize: React.createRef<HTMLElement>(),
        nwResize: React.createRef<HTMLElement>(),
    };

    private destroy$ = new Subject<void>();

    constructor(props: PositionableProps) {
        super(props);

        this.state = { ...props.position };
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
        const { disabled, movable, resizable, rotatable, snap } = this.props;
        const { left, width } = this.state;

        this.destroy$.next();

        if (disabled) {
            return;
        }

        if (!this.refHandlers.container.current) {
            console.error('No container ref found.');
            return;
        }

        if (movable) {
            createDndObservable({
                element: this.refHandlers.container.current,
                onComplete: this.handleUpdate,
                shouldConvertToPercent: left.includes('%'),
                snap,
            })
                .pipe(takeUntil(this.destroy$))
                .subscribe(newCoords => this.setState(newCoords));

            createKeyboardMoveObservable({
                element: this.refHandlers.container.current,
                onComplete: this.handleUpdate,
                shouldConvertToPercent: left.includes('%'),
            })
                .pipe(takeUntil(this.destroy$))
                .subscribe(newCoords => this.setState(newCoords));
        }

        if (resizable) {
            const resizeObservableConfigs = calculateResizeObservablesAndPositions(
                resizable
            );

            resizeObservableConfigs.forEach(config => {
                const handle = this.refHandlers[config.refHandlerName].current;

                if (!handle) {
                    console.error(
                        `Unable to find ref for ${config.refHandlerName}.`
                    );
                } else {
                    createResizeObservable({
                        element: this.refHandlers.container.current!,
                        handle,
                        onComplete: this.handleUpdate,
                        top: config.top,
                        right: config.right,
                        bottom: config.bottom,
                        left: config.left,
                        shouldConvertToPercent: width.includes('%'),
                        snap,
                    })
                        .pipe(takeUntil(this.destroy$))
                        .subscribe(newPosition => this.setState(newPosition));
                }
            });
        }

        if (rotatable) {
            if (this.refHandlers.rotate.current) {
                createRotateObservable({
                    element: this.refHandlers.container.current,
                    handle: this.refHandlers.rotate.current,
                    onComplete: this.handleUpdate,
                })
                    .pipe(takeUntil(this.destroy$))
                    .subscribe(newRotation => this.setState(newRotation));
            } else {
                console.error('No rotate handle ref found.');
            }
        }
    }
}

export default Positionable;
