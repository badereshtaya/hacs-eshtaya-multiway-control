# Contributing

1. Fork the repository and create a focused branch.
2. Keep the integration domain `eshtaya_multiway` stable after the first public release.
3. Run Python compile checks, Ruff, tests, Hassfest and HACS validation before opening a pull request.
4. Avoid breaking the persistent storage schema. Add explicit migration logic when a schema change is necessary.
5. Keep control logic event-driven; the watchdog is a safety layer, not the primary trigger mechanism.
6. Never log credentials, tokens or sensitive Home Assistant data.
7. Update `CHANGELOG.md` for user-visible changes.
