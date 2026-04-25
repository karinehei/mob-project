# Changelog

All notable changes to this project are documented in this file.

The format is based on Keep a Changelog and this project uses semantic versioning for release tags.

## [0.1.0] - 2026-04-25

First MVP-style documented release for the mobile food-study prototype.

### Added

- Dynamic questionnaire management in Admin UI (manual create + JSON import + activation flow).
- Result export flow in Admin UI with selectable scope (questionnaire/session) and format (CSV/XLS-compatible).
- Translation support with Finnish default and English fallback (`i18next` + `react-i18next`), plus in-app FI/EN toggle.
- Background information step at end of survey flow (age/gender) with response-session level aggregation.
- Wiki documentation set (architecture, UI flow, i18n, requirements mapping, release process docs).

### Changed

- Evaluation flow UI refreshed with clearer CTA hierarchy and updated design tokens (colors/typography/spacing).
- Sample navigation/app bar behavior improved with back navigation and accessibility labels.
- Export option loading and refresh behavior improved in Admin screen.

### Fixed

- Questionnaire draft sanitization and multiSelect handling fixes in service/utils layer.
- Multiple Admin and localization edge cases covered by tests and regression fixes.

### Quality

- CI pipeline runs lint, typecheck, tests and Android debug build on PRs and `main`.
- Service-layer and export-related test coverage expanded.

[0.1.0]: https://github.com/karinehei/mob-project/releases/tag/v0.1.0

