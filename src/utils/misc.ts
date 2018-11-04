import { Offset, OffsetStrings, ResizeHandleLocation } from '../types';

/**
 * Calculate the angle between two points..
 */
export const angleBetweenPoints = (x1: number, y1: number) => (
    x2: number,
    y2: number
) => (Math.atan2(y2 - y1, x2 - x1) * 180) / Math.PI;

/**
 * Calculate the distance between two points.
 */
export const distanceBetweenPoints = (x1: number, y1: number) => (
    x2: number,
    y2: number
) => {
    const xDiff = x2 - x1;
    const yDiff = y2 - y1;

    return Math.sqrt(xDiff * xDiff + yDiff * yDiff);
};

/**
 * Compares to objects to see if their values are equal.
 * Only compares a single level.
 *
 * @param a First object
 * @param b Second object
 */
export const objectsAreEqual = (a: {}, b: {}) => {
    // Create arrays of property names
    const aProps = Object.getOwnPropertyNames(a);
    const bProps = Object.getOwnPropertyNames(b);

    // If number of properties is different,
    // objects are not equivalent
    if (aProps.length !== bProps.length) {
        return false;
    }

    for (const prop of aProps) {
        // If values of same property are not equal,
        // objects are not equivalent
        if (a[prop] !== b[prop]) {
            return false;
        }
    }

    // If we made it this far, objects are considered equivalent
    return true;
};

/**
 * Convert new Offset to a percentage of an (parent) element.
 */
export const convertOffsetToPercentOrPixels = (
    shouldConvertToPercent: boolean,
    parent: HTMLElement
) => (offset: Offset): OffsetStrings =>
    shouldConvertToPercent
        ? {
              left: `${round((offset.left / parent.offsetWidth) * 100)}%`,
              top: `${round((offset.top / parent.offsetHeight) * 100)}%`,
          }
        : {
              left: `${round(offset.left)}px`,
              top: `${round(offset.top)}px`,
          };

/**
 * Snap/Restrict all of an object's numeric
 * values to multiple of a number.
 */
export const snapObjectValues = (snapTo?: number) => <T extends {}>(
    input: T
): T => {
    if (!snapTo) {
        return input;
    }

    return Object.keys(input).reduce(
        (carrier, key) => {
            const inputValue = input[key];
            const outputValue =
                typeof inputValue === 'number'
                    ? snapTo * Math.round(inputValue / snapTo)
                    : inputValue;

            return Object.assign({}, carrier, {
                [key]: outputValue,
            });
        },
        {} as T
    );
};

interface ObservableConfig {
    refHandlerName: string;
    top: boolean;
    right: boolean;
    bottom: boolean;
    left: boolean;
}

const RESIZE_HANDLE_LOCATIONS: ResizeHandleLocation[] = [
    'n',
    'ne',
    'e',
    'se',
    's',
    'sw',
    'w',
    'nw',
];

/**
 * Generates configuration values useful for building resize observables.
 * Configs are built for each side and corner (8 configs in total).
 */
export const calculateResizeObservableConfigs = (
    handleLocations: ResizeHandleLocation[] = RESIZE_HANDLE_LOCATIONS
): ObservableConfig[] =>
    handleLocations.map(direction => ({
        refHandlerName: `${direction}Resize`,
        top: /n/.test(direction),
        right: /e/.test(direction),
        bottom: /s/.test(direction),
        left: /w/.test(direction),
    }));

const ROTATE_HANDLE_LOCATIONS = ['ne', 'se', 'sw', 'nw'];

/**
 * Generates configuration values useful for building rotate observables.
 * Configs are built for each corner (4 configs in total).
 */
export const calculateRotateObservableConfigs = (): ObservableConfig[] =>
    ROTATE_HANDLE_LOCATIONS.map(direction => ({
        refHandlerName: `${direction}Rotate`,
        top: /n/.test(direction),
        right: /e/.test(direction),
        bottom: /s/.test(direction),
        left: /w/.test(direction),
    }));

/**
 * Round a number to a given precision.
 */
export const round = (value: number, precision: number = 1): number =>
    +value.toFixed(precision);

/**
 * Check if a variable is a function.
 */
export const isFunction = (f: any): f is Function =>
    f && {}.toString.call(f) === '[object Function]';
