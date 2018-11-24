export type PositionStrings = AsStrings<Position>;
export type Position = Offset & Size & Rotation;

export type OffsetAndSizeStrings = AsStrings<OffsetAndSize>;
export type OffsetAndSize = Offset & Size;

export type OffsetStrings = AsStrings<Offset>;
export interface Offset {
    left: number;
    top: number;
}

export interface Size {
    height: number;
    width: number;
}

export interface Rotation {
    rotation: string;
}

export interface AngleAndDistance {
    angle: number;
    distance: number;
}

export type ResizeHandleLocation =
    | 'n'
    | 'ne'
    | 'e'
    | 'se'
    | 's'
    | 'sw'
    | 'w'
    | 'nw';

// Utilities
export type Omit<T, K> = Pick<T, Exclude<keyof T, K>>;
type AsStrings<T> = { [P in keyof T]: string };
