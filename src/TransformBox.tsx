import * as React from 'react';
import { MdRotateLeft as IconRotate } from 'react-icons/lib/md';
import styled from 'styled-components';

import Handle from './Handle';
import { PositionableComponentProps } from './Positionable';

interface TransformBoxProps extends React.HTMLAttributes<HTMLDivElement> {
    position: PositionableComponentProps['position'];
    refHandlers: PositionableComponentProps['refHandlers'];
    resizable?: boolean;
    rotatable?: boolean;
}

const Wrapper = styled.div`
    box-sizing: border-box;
    outline: 1px dotted rgba(233, 30, 99, 0.5);
    position: absolute;
    z-index: 1000;
`;

const TransformBox: React.SFC<TransformBoxProps> = ({
    children,
    position,
    refHandlers,
    resizable,
    rotatable,
    style,
    ...rest
}) => (
    <Wrapper
        {...rest}
        innerRef={refHandlers.container}
        style={{
            ...style,
            height: `${position.height}`,
            left: `${position.left}`,
            position: 'absolute',
            top: `${position.top}`,
            transform: `rotate(${position.rotation})`,
            width: `${position.width}`,
        }}
    >
        <Handle
            innerRef={refHandlers.resizeHandle}
            visible={resizable}
            rotation={45}
            bottom
            right
        />
        <Handle
            innerRef={refHandlers.hResizeHandle}
            visible={resizable}
            right
        />
        <Handle
            innerRef={refHandlers.vResizeHandle}
            visible={resizable}
            bottom
            rotation={90}
        />
        <Handle
            Icon={IconRotate}
            innerRef={refHandlers.rotateHandle}
            right
            top
            visible={rotatable}
        />
    </Wrapper>
);

export default TransformBox;
