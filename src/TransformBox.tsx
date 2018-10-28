import * as React from 'react';
import styled from 'styled-components';

import { PositionableComponentProps, PositionableProps } from './Positionable';
import { PositionableContainerProps } from './PositionableContainer';
import ResizeHandle from './ResizeHandle';
import RotateHandle from './RotateHandle';
import {
    calculateResizeObservableConfigs,
    calculateRotateObservableConfigs,
} from './utils';

interface TransformBoxProps extends React.HTMLAttributes<HTMLDivElement> {
    position: PositionableComponentProps['position'];
    refHandlers: PositionableComponentProps['refHandlers'];
    resizable: PositionableContainerProps['resizable'];
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
        {resizable &&
            calculateResizeObservableConfigs(
                Array.isArray(resizable) ? resizable : undefined
            ).map(resizablePosition => (
                <ResizeHandle
                    key={resizablePosition.refHandlerName}
                    innerRef={refHandlers[resizablePosition.refHandlerName]}
                    top={resizablePosition.top}
                    right={resizablePosition.right}
                    bottom={resizablePosition.bottom}
                    left={resizablePosition.left}
                />
            ))}
        {rotatable &&
            calculateRotateObservableConfigs().map(rotatablePosition => (
                <RotateHandle
                    key={rotatablePosition.refHandlerName}
                    innerRef={refHandlers[rotatablePosition.refHandlerName]}
                    top={rotatablePosition.top}
                    right={rotatablePosition.right}
                    bottom={rotatablePosition.bottom}
                    left={rotatablePosition.left}
                />
            ))}
    </Wrapper>
);

export default TransformBox;
