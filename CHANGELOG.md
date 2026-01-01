# Changelog

## 1.0.2 - 2025-11-10

### Added
- Full support for Orange Money Liberia payments (`orange` payment method)
- `reference_id` field in Payment response for tracking Orange Money transactions
- Comprehensive Orange Money examples in README with polling patterns
- Documentation for async payment method handling

### Fixed
- Payment status retrieval now properly returns `reference_id` from metadata
- Improved TypeScript types for Orange Money payment flows

### Changed
- Enhanced `pollPaymentStatus` method with better defaults for Orange Money (2s intervals, 30 attempts)
- Updated payment retrieval endpoint to use path parameters instead of query parameters

## 1.0.1 - (unreleased)

- Prepare package for republish; minor fixes and documentation updates.

