import * as React from 'react';
import { MdChevronRight as Chevron } from 'react-icons/lib/md';
import styled, { css } from 'styled-components';

export interface HandleProps {
    backgroundColor?: string;
    bottom?: boolean;
    color?: string;
    Icon?: React.ComponentClass<any>;
    innerRef?: (input: HTMLElement) => any;
    left?: boolean;
    right?: boolean;
    rotate?: number;
    size?: number;
    top?: boolean;
    visible?: boolean;
}

const calculateLeft = (props: HandleProps) =>
    props.left ? '0%' : props.right ? '100%' : '50%';

const calculateTop = (props: HandleProps) =>
    props.top ? '0%' : props.bottom ? '100%' : '50%';

const Container = styled.div`
    ${(props: HandleProps) => css`
        align-items: center;
        background-color: ${props.backgroundColor};
        border-radius: 3px;
        box-shadow: 0px 2px 4px -1px rgba(0, 0, 0, 0.05),
            0px 4px 5px 0px rgba(0, 0, 0, 0.05),
            0px 1px 2px 0px rgba(0, 0, 0, 0.05);
        color: ${props.color};
        display: ${props.visible ? 'flex' : 'none'};
        height: ${props.size}px;
        justify-content: center;
        margin-left: ${props.size! / -2}px;
        margin-top: ${props.size! / -2}px;
        left: ${calculateLeft};
        position: absolute;
        top: ${calculateTop};
        width: ${props.size}px;
        z-index: 100;

        & > svg,
        & > div,
        & > span {
            transform: rotate(${props.rotate}deg);
            transform-origin: center;
            opacity: 0.2;
        }

        &:hover {
            & > svg,
            & > div,
            & > span {
                opacity: 1;
            }
        }
    `};
`;

const Handle: React.SFC<HandleProps> = ({
    backgroundColor = 'white',
    bottom,
    color = '#24292e',
    Icon = Chevron,
    innerRef,
    left,
    right,
    rotate = 0,
    size = 12,
    top,
    visible,
}) => (
    <Container
        backgroundColor={backgroundColor}
        bottom={bottom}
        color={color}
        innerRef={innerRef}
        left={left}
        right={right}
        rotate={rotate}
        size={size}
        top={top}
        visible={visible}
    >
        <Icon />
    </Container>
);

export default Handle;
