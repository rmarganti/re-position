export type AsStrings<T> = { [P in keyof T]: string };

export type Position = Coordinates & Dimensions;
export type PositionStrings = AsStrings<Position>;

export interface AngleAndDistance {
    angle: number;
    distance: number;
}

export interface Coordinates {
    left: number;
    top: number;
}

export type CoordinatesStrings = AsStrings<Coordinates>;

export interface Dimensions {
    height: number;
    width: number;
}

export interface Rotation {
    rotate: string;
}
