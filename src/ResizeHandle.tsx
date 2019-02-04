import * as React from 'react';
import styled, { css } from 'styled-components';

export interface ResizeHandleProps
    extends React.HTMLAttributes<HTMLDivElement> {
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

export const ResizeHandle = styled.div<ResizeHandleProps>`
    ${props => css`
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
        transform-origin: center;

        &:hover {
            opacity: 1;
        }
    `};

    // Increase the size of the clickable area
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

type ResizeHandleCursor =
    | 'ns-resize'
    | 'nesw-resize'
    | 'ew-resize'
    | 'nwse-resize';

export const calculateLeft = (props: ResizeHandleProps) =>
    props.left ? '0%' : props.right ? '100%' : '50%';

export const calculateTop = (props: ResizeHandleProps) =>
    props.top ? '0%' : props.bottom ? '100%' : '50%';

export const calculateCursor = (
    props: ResizeHandleProps
): ResizeHandleCursor => {
    const startingCursor = calculateStartingCursor(props);
    return adjustCursorForRotation(startingCursor, props.rotation);
};

const CURSORS: ResizeHandleCursor[] = [
    'ns-resize',
    'nesw-resize',
    'ew-resize',
    'nwse-resize',
];

const calculateStartingCursor = (
    props: ResizeHandleProps
): ResizeHandleCursor => {
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

        default:
            return 'ns-resize';
    }
};

const adjustCursorForRotation = (
    direction: ResizeHandleCursor,
    rotation: number = 0
) => {
    const cursorIndex = CURSORS.indexOf(direction);
    const indexShift = Math.round(rotation / 45);
    const newIndex = (cursorIndex + indexShift) % CURSORS.length;

    return newIndex >= 0
        ? CURSORS[newIndex]
        : CURSORS[CURSORS.length + newIndex];
};
