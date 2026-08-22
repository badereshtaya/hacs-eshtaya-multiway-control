# GitHub + HACS Publishing Checklist

Suggested repository:

```text
https://github.com/badereshtaya/hacs-eshtaya-multiway-control
```

## 1. Create the GitHub repository

- Visibility: **Public**.
- Description: `Professional virtual 2-way / 3-way / multi-way switch control for Home Assistant.`
- Enable **Issues**.
- Suggested topics:
  - `home-assistant`
  - `hacs`
  - `smart-home`
  - `multi-way-switch`
  - `2-way-switch`
  - `homeassistant-custom-component`

Upload the **contents of this repository package to the repository root**, so the structure is:

```text
custom_components/eshtaya_multiway/...
.github/workflows/...
hacs.json
README.md
LICENSE
```

Do not upload a parent directory that contains these files one level deeper.

## 2. Push to `main`

Wait for GitHub Actions:

- HACS validation
- Hassfest
- Ruff
- Tests

Resolve any failure before release.

## 3. Create the first release

Create and push the version tag:

```bash
git tag v3.3.1
git push origin v3.3.1
```

The included **Release** GitHub Action verifies that the tag matches `manifest.json`, builds the integration ZIP, and creates the actual GitHub Release automatically.

## 4. Test as a HACS Custom Repository

In HACS:

1. Integrations → three-dot menu → Custom repositories.
2. Repository: `https://github.com/badereshtaya/hacs-eshtaya-multiway-control`
3. Category: Integration.
4. Download and restart Home Assistant.
5. Add **Eshtaya Multi-Way Control** from Settings → Devices & services.

## 5. Optional: submit to the default HACS store

After the repository is stable, public, has passing HACS/Hassfest Actions, brand assets and at least one release, submit it to `hacs/default` under the integration category.
