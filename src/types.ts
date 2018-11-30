export type Position = AsStrings<PositionNumbers>;
export type PositionNumbers = OffsetNumbers & SizeNumbers & RotationNumber;

export type OffsetAndSize = AsStrings<OffsetAndSizeNumbers>;
export type OffsetAndSizeNumbers = OffsetNumbers & SizeNumbers;

export type Offset = AsStrings<OffsetNumbers>;
export interface OffsetNumbers {
    left: number;
    top: number;
}

export interface SizeNumbers {
    height: number;
    width: number;
}

export interface RotationNumber {
    rotation: string;
}

export interface AngleAndDistanceNumbers {
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
