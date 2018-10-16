export type PositionAndRotationStrings = AsStrings<Position & Rotation>;

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
    rotation: string;
}

export type Omit<T, K> = Pick<T, Exclude<keyof T, K>>;
type AsStrings<T> = { [P in keyof T]: string };

export enum ResizableDirection {
    Horizontal = 'horizontal',
    Vertical = 'vertical',
    Both = 'both',
}
