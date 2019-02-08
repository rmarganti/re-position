import * as React from 'react';

import { Positionable } from './Positionable';
import TransformBox from './TransformBox';
import { Position, ResizeHandleLocation } from './types';

export interface PositionableContainerProps {
    className?: string;

    /**
     * Should all functionality be disabled? This property takes
     * precedence over `movable`, `resizable`, and `rotatable`.
     */
    disabled?: boolean;

    /** Component or HTML element to use for the container. */
    Element?: React.ComponentType<any>;

    /**
     * By default, if `movable` is `true`, both mouse and keyboard movement
     * are enabled. This prop allows keyboard-based movement to be disabled.
     */
    disableKeyboardMovement?: boolean;
    /**
     * Members of the same group will respond
     * to each other's drag and drop events.
     */
    group?: string;

    /** Should moving be enabled? */
    movable?: boolean;

    /** Callback to notify when Positioning has changed */
    onUpdate?: (position: Position) => void;

    /** Current Positioning (left, top, width, height, rotation) */
    position: Position;

    /** Render Prop alternative to using `children` */
    render?: () => JSX.Element;

    /**
     * Either an array of directions (ie. `['n', 'e', 'se']`) or
     * `true` if you want enable all directions.
     */
    resizable?: ResizeHandleLocation[] | boolean;

    /** Should rotation be enabled? */
    rotatable?: boolean;

    /** Snap drag and resize to pixels of this interval. */
    snapTo?: number;

    style?: React.CSSProperties;
}

export const PositionableContainer: React.SFC<PositionableContainerProps> = ({
    children,
    disabled,
    disableKeyboardMovement,
    Element = 'div',
    group,
    movable,
    onUpdate,
    position,
    render,
    resizable,
    rotatable,
    snapTo,
    style,
    ...rest
}) => (
    <Positionable
        disabled={disabled}
        disableKeyboardMovement={disableKeyboardMovement}
        group={group}
        movable={movable}
        onUpdate={onUpdate}
        position={position}
        resizable={!!resizable}
        rotatable={rotatable}
        snapTo={snapTo}
        render={({ renderedPosition, refHandlers }) => (
            <React.Fragment>
                <Element
                    style={{
                        ...style,
                        height: `${renderedPosition.height}`,
                        left: `${renderedPosition.left}`,
                        position: 'absolute',
                        top: `${renderedPosition.top}`,
                        transform: `rotate(${renderedPosition.rotation})`,
                        width: `${renderedPosition.width}`,
                    }}
                    {...rest}
                >
                    {render ? render() : children}
                </Element>

                {!disabled && (resizable || rotatable || movable) && (
                    <TransformBox
                        position={renderedPosition}
                        refHandlers={refHandlers}
                        resizable={resizable}
                        rotatable={rotatable}
                    />
                )}
            </React.Fragment>
        )}
    />
);

export default PositionableContainer;
