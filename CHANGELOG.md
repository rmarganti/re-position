# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.5.0] 2019-02-20
### Added
- `snapXTo` and `snapYTo` options to independently control
  horizontal and vertical snapping.

## [0.4.1] - 2019-02-11
### Changed
- When using `snapTo` with grouped elements, the element that is being
  interacted with via mouse will snap, with all other elements simply
  following along.

## [0.4.0] - 2019-02-08
### Added
- Keyboard-based movement can be disabled

## [0.3.3] - 2019-02-04
### Fixed
- Resize mouse cursor adjusts based on rotation of TransformBox.

## [0.3.2] - 2019-02-04
### Changed
- Resize's shift-to-lock-aspect ratio can be toggled mid-resize.

## [0.3.1] - 2019-02-01
### Added
- Expose Component prop interfaces.

## [0.3.0] - 2019-01-31
### Added
- Rotation can be snapped to 15° intervals by holding shift.

## [0.2.1] - 2018-12-27
### Changed
- `TransformBox` uses border instead of outline for consistency in Firefox.
- `TransformBox` border and handles scale inverse to their ancestors.
  This keeps their size consistent despite ancestor transforms.

## [0.1.0] - 2018-12-02
### Added
- Initial public release

