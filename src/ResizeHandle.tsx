import * as React from 'react';
import styled, { css } from 'styled-components';

interface ResizeHandleProps extends React.HTMLAttributes<HTMLDivElement> {
    borderColor?: string;
    bottom?: boolean;
    color?: string;
    hidden?: boolean;
    innerRef?: React.RefObject<HTMLElement>;
    left?: boolean;
    right?: boolean;
    rotation?: number;
    size?: number;
    top?: boolean;
}

const calculateLeft = (props: ResizeHandleProps) =>
    props.left ? '0%' : props.right ? '100%' : '50%';

const calculateTop = (props: ResizeHandleProps) =>
    props.top ? '0%' : props.bottom ? '100%' : '50%';

const calculateCursor = (
    props: ResizeHandleProps
): React.CSSProperties['cursor'] => {
    const v = props.top ? 'n' : props.bottom ? 's' : '';
    const h = props.left ? 'w' : props.right ? 'e' : '';
    const direction = `${v}${h}`;

    switch (direction) {
        case 'ne':
        case 'sw':
            return 'nesw-resize';

        case 'nw':
        case 'se':
            return 'nwse-resize';

        case 'e':
        case 'w':
            return 'ew-resize';

        case 'n':
        case 's':
            return 'ns-resize';
    }

    return 'move';
};

const ResizeHandle = styled.div<ResizeHandleProps>`
    ${(props: ResizeHandleProps) => css`
        background-color: ${props.color};
        border: 1px solid ${props.borderColor};
        box-sizing: border-box;
        cursor: ${calculateCursor(props)};
        display: ${props.hidden ? 'none' : 'flex'};
        height: ${props.size}px;
        margin-left: ${props.size! / -2}px;
        margin-top: ${props.size! / -2}px;
        left: ${calculateLeft};
        opacity: 0.75;
        position: absolute;
        top: ${calculateTop};
        width: ${props.size}px;
        z-index: 100;

        &:hover {
            opacity: 1;
        }
    `};

    &:after {
        content: '';
        position: absolute;
        top: -5px;
        bottom: -5px;
        left: -5px;
        right: -5px;
    }
`;

ResizeHandle.defaultProps = {
    borderColor: '#0000ff',
    color: '#ffffff',
    size: 5,
};

export default ResizeHandle;
