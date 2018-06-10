import React from "react";

import { storiesOf } from "@storybook/react";
import { Positionable } from "./Positionable";
import { wInfo } from "../../utils";
import { text, boolean } from "@storybook/addon-knobs/react";

const Container = ({ children }) => (
    <div
        style={{
            backgroundColor: '#f7f7f7',
            height: '300px',
            overflow: 'hidden',
            position: 'relative',
            width: '100%',
        }}
    >
        {children}
    </div>
);

const Contained = () => (
    <div
        style={{
            backgroundColor: "#c0ffee",
            height: "100%",
            left: 0,
            position: "absolute",
            top: 0,
            width: "100%",
        }}
    />
);

storiesOf("Positionable", module).addWithJSX(
    "Basic usage",
    wInfo(`

    ### Notes

    Basic usage

    ### Usage
    ~~~js
    <Container>
        <Positionable
            draggable
            resizable
            rotatable
            position={{
                height: '25%',
                left: '0%',
                top: '0%',
                width: '25%',
            }}
            isSelected={true}
        >
            <Contained />
        </Positionable>
    </Container>
    ~~~`)(() => (
        <Container>
            <Positionable
                draggable
                resizable
                rotatable
                position={{
                    height: '25%',
                    left: '0%',
                    top: '0%',
                    width: '25%',
                }}
                isSelected={true}
            >
                <Contained />
            </Positionable>
        </Container>
    ))
);
