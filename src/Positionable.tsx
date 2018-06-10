import * as React from 'react';
import { MdRotateLeft as IconRotate } from 'react-icons/lib/md';
import { Subscription } from 'rxjs';

import Handle from './Handle';
import {
    createMoveObservable,
    createResizeObservable,
    createRotateObservable,
} from './observables';
import { objectsAreEqual } from './utils';

export interface BoxSizing {
    left: string;
    height: string;
    rotate: string;
    top: string;
    width: string;
}

export type PositionableState = BoxSizing;

export interface PositionableProps {
    /**
     * Should moving be enabled?
     * @default false
     */
    movable?: boolean;

    /** Callback to notify when Positioning has changed */
    onUpdate?: (sizing: BoxSizing) => void;

    /** Current Positioning (left, top, width, height, zIndex) */
    position: BoxSizing;

    /** Render Prop alternative to using `children` */
    render: RenderCallback;

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

export type RenderCallback = (args: PositionableComponentProps) => JSX.Element;
export interface PositionableComponentProps {
    coverAllStyle: typeof COVER_ALL_STYLE;
}

export const COVER_ALL_STYLE = {
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

    private container: HTMLDivElement;
    private resizeHandle: HTMLElement;
    private hResizeHandle: HTMLElement;
    private vResizeHandle: HTMLElement;
    private rotateHandle: HTMLElement;

    private move$: Subscription;
    private resize$: Subscription;
    private hResize$: Subscription;
    private vResize$: Subscription;
    private rotate$: Subscription;

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

    constructor(props: PositionableProps) {
        super(props);

        this.state = Object.assign({}, props.position);
    }

    public componentDidMount() {
        this.updateSubscriptions();
    }

    public componentWillUnmount() {
        [
            this.move$,
            this.resize$,
            this.hResize$,
            this.vResize$,
            this.rotate$,
        ].forEach(subscription => {
            if (subscription) {
                subscription.unsubscribe();
            }
        });
    }

    /**
     * Update subscriptions and interal Position if the props change.
     */
    public componentDidUpdate(prevProps: PositionableProps) {
        if (objectsAreEqual(this.props, prevProps)) {
            return;
        }

        if (!objectsAreEqual(this.props.position, prevProps.position)) {
            this.setState(this.props.position);
        }

        this.updateSubscriptions();
    }

    public render() {
        const {
            children,
            position,
            movable,
            render,
            resizable,
            rotatable,
            ...rest
        } = this.props;

        return (
            <div
                ref={this.refHandlers.container}
                style={{
                    height: `${this.state.height}`,
                    left: `${this.state.left}`,
                    position: 'absolute',
                    top: `${this.state.top}`,
                    transform: `rotate(${this.state.rotate})`,
                    width: `${this.state.width}`,
                }}
                {...rest}
            >
                {render && render({ coverAllStyle: COVER_ALL_STYLE })}

                {children}

                <Handle
                    innerRef={this.refHandlers.resizeHandle}
                    visible={resizable}
                    rotate={45}
                    bottom
                    right
                />
                <Handle
                    innerRef={this.refHandlers.hResizeHandle}
                    visible={resizable}
                    right
                />
                <Handle
                    innerRef={this.refHandlers.vResizeHandle}
                    visible={resizable}
                    bottom
                    rotate={90}
                />
                <Handle
                    Icon={IconRotate}
                    innerRef={this.refHandlers.rotateHandle}
                    right
                    top
                    visible={rotatable}
                />
            </div>
        );
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
    private updateSubscriptions() {
        if (this.props.movable && (!this.move$ || this.move$.closed)) {
            this.move$ = createMoveObservable(
                this.container,
                this.handleUpdate,
                this.state.left.includes('%')
            ).subscribe(newCoords => this.setState(newCoords));
        } else if (!this.props.movable && this.move$) {
            this.move$.unsubscribe();
        }

        if (this.props.resizable && (!this.resize$ || this.resize$.closed)) {
            this.resize$ = createResizeObservable(
                this.container,
                this.resizeHandle,
                this.handleUpdate,
                true,
                true,
                this.state.width.includes('%')
            ).subscribe(newPosition => this.setState(newPosition));

            this.hResize$ = createResizeObservable(
                this.container,
                this.hResizeHandle,
                this.handleUpdate,
                true,
                false
            ).subscribe(newPosition => this.setState(newPosition));

            this.vResize$ = createResizeObservable(
                this.container,
                this.vResizeHandle,
                this.handleUpdate,
                false,
                true
            ).subscribe(newPosition => this.setState(newPosition));
        } else if (!this.props.resizable && this.resize$) {
            this.resize$.unsubscribe();
            this.hResize$.unsubscribe();
            this.vResize$.unsubscribe();
        }

        if (this.props.rotatable && (!this.rotate$ || this.rotate$.closed)) {
            this.rotate$ = createRotateObservable(
                this.container,
                this.rotateHandle,
                this.handleUpdate
            ).subscribe(newRotation => this.setState(newRotation));
        } else if (!this.props.rotatable && this.rotate$) {
            this.rotate$.unsubscribe();
        }
    }
}

export default Positionable;
