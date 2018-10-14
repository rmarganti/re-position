import * as React from 'react';

import { Positionable, PositionableProps } from './Positionable';
import TransformBox from './TransformBox';
import { Omit } from './types';

type PositionableDivProps = Omit<PositionableProps, 'render'> &
    React.HTMLAttributes<HTMLDivElement>;

const PositionableDiv: React.SFC<PositionableDivProps> = ({
    children,
    disabled,
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
                <div
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
                </div>
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

export default PositionableDiv;
