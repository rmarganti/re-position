import * as React from 'react';
import styled from 'styled-components';

import { PositionableComponentProps, PositionableProps } from './Positionable';
import ResizeHandle from './ResizeHandle';
import { calculateResizeObservablesAndPositions } from './utils';

interface TransformBoxProps extends React.HTMLAttributes<HTMLDivElement> {
    position: PositionableComponentProps['position'];
    refHandlers: PositionableComponentProps['refHandlers'];
    resizable: PositionableProps['resizable'];
    rotatable: PositionableProps['rotatable'];
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
        {calculateResizeObservablesAndPositions(resizable).map(
            resizablePosition => (
                <ResizeHandle
                    key={resizablePosition.refHandlerName}
                    innerRef={refHandlers[resizablePosition.refHandlerName]}
                    top={resizablePosition.top}
                    right={resizablePosition.right}
                    bottom={resizablePosition.bottom}
                    left={resizablePosition.left}
                />
            )
        )}
        <ResizeHandle
            innerRef={refHandlers.rotate}
            right
            top
            hidden={!rotatable}
        />
    </Wrapper>
);

export default TransformBox;
