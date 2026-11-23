# Cashle source plugins

Each directory under `plugins/` owns one source package and its catalog metadata. `npm run build` writes `dist/plugins/index.json` and the verified ZIPs with no compiler or third-party Node dependencies. Use `node build-catalog.mjs --release <directory>` to record a local release after editing a package.

The GitHub Actions workflow builds and publishes `/plugins/` on each push to `main`. Configure the repository's Pages source to **GitHub Actions**. The workflow keeps published versions for unchanged archives and assigns a new version to changed archives.

In Cashle, configure the published directory URL as `CASHLE_PLUGIN_CATALOG_URL`. Other catalogs can use the same directory layout and be added by URL from the Plugins page.
