import * as React from 'react';

import { Positionable, PositionableProps } from './Positionable';
import TransformBox from './TransformBox';
import { Omit } from './types';

type PositionableContainerProps = Omit<PositionableProps, 'render'> &
    React.HTMLAttributes<HTMLElement> & {
        Element: React.ComponentType<any>;
    };

const PositionableContainer: React.SFC<PositionableContainerProps> = ({
    children,
    disabled,
    Element = 'div',
    rotatable,
    resizable,
    movable,
    position,
    onUpdate,
    snap,
    style,
    ...rest
}) => (
    <Positionable
        disabled={disabled}
        movable={movable}
        onUpdate={onUpdate}
        position={position}
        resizable={resizable}
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
                    {children}
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
