import * as React from 'react';
import styled from 'styled-components';

import { PositionableProps, RenderCallbackArgs } from './Positionable';
import { PositionableContainerProps } from './PositionableContainer';
import ResizeHandle from './ResizeHandle';
import RotateHandle from './RotateHandle';
import { scaleOfElement } from './utils/dom';
import {
    calculateResizeObservableConfigs,
    calculateRotateObservableConfigs,
} from './utils/misc';

export interface TransformBoxProps
    extends React.HTMLAttributes<HTMLDivElement> {
    position: RenderCallbackArgs['renderedPosition'];
    refHandlers: RenderCallbackArgs['refHandlers'];
    resizable: PositionableContainerProps['resizable'];
    rotatable: PositionableProps['rotatable'];
}

interface TransformBoxState {
    scale: number;
}

const initialState: TransformBoxState = {
    scale: 1,
};

export class TransformBox extends React.Component<
    TransformBoxProps,
    TransformBoxState
> {
    public state = initialState;

    public componentDidMount() {
        this.calculateScale();
    }

    public componentDidCatch() {
        this.calculateScale();
    }

    public render() {
        const {
            position,
            refHandlers,
            resizable,
            rotatable,
            style,
            ...rest
        } = this.props;

        const { scale } = this.state;

        return (
            <Root
                {...rest}
                ref={refHandlers.dnd}
                scale={scale}
                style={{
                    ...style,
                    height: `${position.height}`,
                    left: `${position.left}`,
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
                            ref={
                                refHandlers[resizablePosition.refHandlerName]
                            }
                            top={resizablePosition.top}
                            right={resizablePosition.right}
                            bottom={resizablePosition.bottom}
                            left={resizablePosition.left}
                            rotation={parseInt(position.rotation, 10)}
                            style={{ transform: `scale(${scale})` }}
                        />
                    ))}
                {rotatable &&
                    calculateRotateObservableConfigs().map(
                        rotatablePosition => (
                            <RotateHandle
                                key={rotatablePosition.refHandlerName}
                                ref={
                                    refHandlers[
                                        rotatablePosition.refHandlerName
                                    ]
                                }
                                top={rotatablePosition.top}
                                right={rotatablePosition.right}
                                bottom={rotatablePosition.bottom}
                                left={rotatablePosition.left}
                                style={{ transform: `scale(${scale})` }}
                            />
                        )
                    )}
            </Root>
        );
    }

    /**
     * Determine how much visual elements like handles and borders need to be scaled
     * in order to nullify any scale done to the container or its ancestors.
     */
    private calculateScale = () => {
        const { refHandlers } = this.props;
        const { container: containerRef } = refHandlers;

        if (!containerRef.current) {
            return;
        }

        const containerScale = scaleOfElement(containerRef.current);
        const scale = 1 / containerScale;

        if (this.state.scale === scale) {
            return;
        }

        this.setState({ scale });
    };
}

interface RootProps {
    scale: number;
}
const Root = styled.div<RootProps>`
    box-sizing: border-box;
    border: ${props => props.scale}px dotted rgba(233, 30, 99, 0.5);
    position: absolute;
    z-index: 1000;
    touch-action: none;
`;

export default TransformBox;
