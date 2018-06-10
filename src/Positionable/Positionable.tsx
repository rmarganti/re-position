import * as React from 'react';
import { MdRotateLeft as IconRotate } from 'react-icons/lib/md';
import { Subscription } from 'rxjs';

import Handle from './Handle';
import {
    createDndObservable,
    createResizeObservable,
    createRotateObservable,
} from './observables';

export interface BoxSizing {
    left: string;
    height: string;
    rotate: string;
    top: string;
    width: string;
}

export type PositionableState = BoxSizing;

export interface Props {
    /**
     * Should drag and drop be enabled?
     * @default false
     */
    draggable?: boolean;

    /** Callback to notify when Positioning has changed */
    onUpdate?: (sizing: BoxSizing) => void;

    /** Callback to notify when a non-selected Positionable is clicked */
    onSelect?: () => void;

    /** Current Positioning (left, top, width, height, zIndex) */
    position: BoxSizing;

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

    /**
     * Is this component selected? Determines if handles are shown.
     * @default false
     */
    isSelected?: boolean;
}

export class Positionable extends React.Component<Props, PositionableState> {
    public readonly state: PositionableState;

    private container: HTMLElement;
    private resizeHandle: HTMLElement;
    private hResizeHandle: HTMLElement;
    private vResizeHandle: HTMLElement;
    private rotateHandle: HTMLElement;

    private dnd$: Subscription;
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

    constructor(props: Props) {
        super(props);

        this.state = Object.assign({}, props.position);
    }

    public componentDidMount() {
        if (this.props.draggable) {
            this.dnd$ = createDndObservable(
                this.container,
                this.handleUpdate,
                this.handleStart,
                this.state.left.includes('%')
            ).subscribe(newCoords => this.setState(newCoords));
        }

        if (this.props.resizable) {
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
        }

        if (this.props.rotatable) {
            this.rotate$ = createRotateObservable(
                this.container,
                this.rotateHandle,
                this.handleUpdate
            ).subscribe(newRotation => this.setState(newRotation));
        }
    }

    public componentWillUnmount() {
        if (this.dnd$) {
            this.dnd$.unsubscribe();
        }
        if (this.resize$) {
            this.resize$.unsubscribe();
        }
        if (this.hResize$) {
            this.hResize$.unsubscribe();
        }
        if (this.vResize$) {
            this.vResize$.unsubscribe();
        }
        if (this.rotate$) {
            this.rotate$.unsubscribe();
        }
    }

    public componentWillReceiveProps(nextProps: Props) {
        this.setState(nextProps.position);
    }

    public render() {
        const { children, isSelected, resizable, rotatable } = this.props;

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
            >
                {children}

                {resizable && (
                    <>
                        <Handle
                            innerRef={this.refHandlers.resizeHandle}
                            visible={isSelected}
                            rotate={45}
                            bottom
                            right
                        />

                        <Handle
                            innerRef={this.refHandlers.hResizeHandle}
                            visible={isSelected}
                            right
                        />

                        <Handle
                            innerRef={this.refHandlers.vResizeHandle}
                            visible={isSelected}
                            bottom
                            rotate={90}
                        />
                    </>
                )}

                {rotatable && (
                    <Handle
                        Icon={IconRotate}
                        innerRef={this.refHandlers.rotateHandle}
                        right
                        top
                        visible={isSelected}
                    />
                )}
            </div>
        );
    }

    private handleUpdate = () => {
        if (
            !this.props.onUpdate ||
            equalObjects(this.state, this.props.position)
        ) {
            return;
        }

        this.props.onUpdate(this.state);
    };

    /**
     * Fires `onSelect()` on initial mouse down of
     * Positionable that is not currently selected.
     */
    private handleStart = () => {
        if (!this.props.isSelected && this.props.onSelect) {
            this.props.onSelect();
        }
    };
}

const equalObjects = (a: {}, b: {}) => {
    // Create arrays of property names
    const aProps = Object.getOwnPropertyNames(a);
    const bProps = Object.getOwnPropertyNames(b);

    // If number of properties is different,
    // objects are not equivalent
    if (aProps.length !== bProps.length) {
        return false;
    }

    for (const prop of aProps) {
        // If values of same property are not equal,
        // objects are not equivalent
        if (a[prop] !== b[prop]) {
            return false;
        }
    }

    // If we made it this far, objects
    // are considered equivalent
    return true;
};

export default Positionable;
