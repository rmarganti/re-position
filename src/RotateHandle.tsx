import * as React from 'react';
import styled from 'styled-components';

export interface RotateHandleProps extends React.HTMLAttributes<SVGSVGElement> {
    borderColor?: string;
    bottom?: boolean;
    hidden?: boolean;
    innerRef?: React.RefObject<SVGSVGElement>;
    left?: boolean;
    right?: boolean;
    rotation?: number;
    size?: number;
    top?: boolean;
}

const Root = styled.svg<RotateHandleProps>`
    position: absolute;
    left: ${props => calculateLeft(props)};
    top: ${props => calculateTop(props)};
    width: 15px;
    height: 15px;
    opacity: 0;
    cursor: pointer;
    transform-origin: center;

    &:hover {
        opacity: 1;
    }

    &:after {
        content: '';
        position: absolute;
        top: -5px;
        bottom: -5px;
        left: -5px;
        right: -5px;
    }
`;

const OFFSET = 2;

const calculateLeft = (props: RotateHandleProps) =>
    props.left
        ? `calc(0% - ${OFFSET + 15}px)`
        : props.right
        ? `calc(100% + ${OFFSET}px)`
        : 'calc(50% - 7.5px)';

const calculateTop = (props: RotateHandleProps) =>
    props.top
        ? `calc(0% - ${OFFSET + 15}px)`
        : props.bottom
        ? `calc(100% + ${OFFSET}px)`
        : 'calc(50% - 7.5px)';

export const RotateHandle: React.SFC<RotateHandleProps> = props => (
    <Root viewBox="0 0 24 24" {...props}>
        <path
            fill="#000000"
            stroke="#ffffff"
            strokeOpacity="0.5"
            strokeWidth="1"
            d="M13,4.07V1L8.45,5.55L13,10V6.09C15.84,6.57 18,9.03 18,12C18,14.97 15.84,17.43 13,17.91V19.93C16.95,19.44 20,16.08 20,12C20,7.92 16.95,4.56 13,4.07M7.1,18.32C8.26,19.22 9.61,19.76 11,19.93V17.9C10.13,17.75 9.29,17.41 8.54,16.87L7.1,18.32M6.09,13H4.07C4.24,14.39 4.79,15.73 5.69,16.89L7.1,15.47C6.58,14.72 6.23,13.88 6.09,13M7.11,8.53L5.7,7.11C4.8,8.27 4.24,9.61 4.07,11H6.09C6.23,10.13 6.58,9.28 7.11,8.53Z"
        />
    </Root>
);

export default RotateHandle;
