import * as React from 'react';
import styled, { css } from 'styled-components';

interface RotateHandleProps extends React.HTMLAttributes<HTMLDivElement> {
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

const calculateLeft = (props: RotateHandleProps) =>
    props.left ? 'calc(0% - 10px)' : props.right ? 'calc(100% + 10px)' : '50%';

const calculateTop = (props: RotateHandleProps) =>
    props.top ? 'calc(0% - 10px)' : props.bottom ? 'calc(100% + 10px)' : '50%';

const RotateHandle = styled.div<RotateHandleProps>`
    ${(props: RotateHandleProps) => css`
        background-color: ${props.color};
        border: 1px solid ${props.borderColor};
        box-sizing: border-box;
        cursor: pointer;
        display: ${props.hidden ? 'none' : 'flex'};
        height: ${props.size}px;
        margin-left: ${props.size! / -2}px;
        margin-top: ${props.size! / -2}px;
        left: ${calculateLeft};
        opacity: 0;
        position: absolute;
        top: ${calculateTop};
        width: ${props.size}px;
        z-index: 100;
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

RotateHandle.defaultProps = {
    borderColor: '#0000ff',
    color: '#ffffff',
    size: 5,
};

export default RotateHandle;
