import * as React from 'react';

import { Positionable } from './Positionable';
import TransformBox from './TransformBox';
import { PositionAndRotationStrings, ResizableHandleLocation } from './types';

export interface PositionableContainerProps {
    className?: string;

    /**
     * Should all functionality be disabled? This property takes
     * precedence over `movable`, `resizable`, and `rotatable`.
     */
    disabled?: boolean;

    /** Component or HTML element to use for the container. */
    Element?: React.ComponentType<any>;

    /** Should moving be enabled? */
    movable?: boolean;

    /** Callback to notify when Positioning has changed */
    onUpdate?: (sizing: PositionAndRotationStrings) => void;

    /** Current Positioning (left, top, width, height, rotation) */
    position: PositionAndRotationStrings;

    /** Render Prop alternative to using `children` */
    render: () => JSX.Element;

    /**
     * Either an array of directions (ie. `['n', 'e', 'se']`) or
     * `true` if you want enable all directions.
     */
    resizable: ResizableHandleLocation[] | boolean;

    /** Should rotation be enabled? */
    rotatable?: boolean;

    /** Snap drag and resize to pixels of this interval. */
    snap?: number;

    style: React.CSSProperties;
}

const PositionableContainer: React.SFC<PositionableContainerProps> = ({
    children,
    disabled,
    Element = 'div',
    rotatable,
    resizable,
    movable,
    position,
    onUpdate,
    render,
    snap,
    style,
    ...rest
}) => (
    <Positionable
        disabled={disabled}
        movable={movable}
        onUpdate={onUpdate}
        position={position}
        resizable={!!resizable}
        rotatable={rotatable}
        snap={snap}
        render={({ position: currentPosition, refHandlers }) => (
            <>
                <Element
                    style={{
                        ...style,
                        height: `${currentPosition.height}`,
                        left: `${currentPosition.left}`,
                        position: 'absolute',
                        top: `${currentPosition.top}`,
                        transform: `rotate(${currentPosition.rotation})`,
                        width: `${currentPosition.width}`,
                    }}
                    {...rest}
                >
                    {render ? render() : children}
                </Element>
                {!disabled &&
                    (resizable || rotatable || movable) && (
                        <TransformBox
                            position={currentPosition}
                            refHandlers={refHandlers}
                            resizable={resizable}
                            rotatable={rotatable}
                        />
                    )}
            </>
        )}
    />
);

export default PositionableContainer;
