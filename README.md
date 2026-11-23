# Cashle source plugins

Each directory under `plugins/` owns one source package and its catalog metadata. `npm run build` writes `dist/plugins/index.json` and the verified ZIPs with no compiler or third-party Node dependencies. Use `node build-catalog.mjs --release <directory>` to record a local release after editing a package.

Keep `catalog.json`'s `name` as the canonical name. Add `names.en` and `names.sv` for the display names in Cashle. These fields appear in the catalog index, so editing a display name leaves the ZIP and package version unchanged.

The GitHub Actions workflow builds and publishes `/plugins/` when catalog
inputs change on `main` or when started manually. Configure the repository's
Pages source to **GitHub Actions**. The workflow keeps published versions for
unchanged archives and assigns a new version to changed archives.

In Cashle, configure the published directory URL as `CASHLE_PLUGIN_CATALOG_URL`. Other catalogs can use the same directory layout and be added by URL from the Plugins page.

[SDK-underlag för ett svenskt amorteringskravsplugin](docs/swedish-amortization-requirement.md)
