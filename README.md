# pnpmc

[![Version][npm-version-src]][npm-version-href]
[![CI][ci-src]][ci-href]

<p align="center">
  <img src="./assets/pnpmc.gif" alt="PNPMC Demo">
</p>

PNPM Catalogs Tooling

## 🌟 Features

- Show catalogs
- Detect catalogable dependencies in workspace
- Register the dependency to the catalog

## 💿 Installation

```sh
pnpm add -D pnpmc
```

<!-- eslint-disable markdown/no-missing-label-refs -->

> [!IMPORTANT]
> Notice that this tool is for pnpm workspace feature only.

<!-- eslint-enable markdown/no-missing-label-refs -->

## 🚀 Usage

### Display of defined catalogs and Detect catalogable dependencies

You can show the defined catalogs and catalogable dependencies on your pnpm workspace projects (`pnpm-workspace.yaml`):

```sh
pnpx pnpmc # or `pnpx pnpm show`

# PNPM Catalogs Tooling (pnpmc v0.4.0)
#
# 📙 Defined catalogs in pnpm-workspace.yaml:
#   (none)
#
# 📦 Catalogable Dependencies (1):
#   typescript:
#     /packages/package1 (package1) : ^5.7.3
#     /packages/package2 (package2) : ^5.6.0
#
```

### Register the dependency to the catalog

You can register the dependency to the catalog on your pnpm workspace projects (`pnpm-workspace.yaml`):

```sh
pnpx pnpmc register --dependency typescript --alias ^5.7.0 --catalog tools

# PNPM Catalogs Tooling (pnpmc v0.1.2)
#
# 📙 Registered 'typescript' as '5.7.0' in Catalog 'tools'
#
# 📦 Overridden 'typescript' alias on /packages/package1 (package1) : ^5.7.3 -> catalog:tools
# 📦 Overridden 'typescript' alias on /packages/package2 (package2) : ^5.6.0 -> catalog:tools
```

## 🙌 Contributing guidelines

If you are interested in contributing to `pnpmc`, I highly recommend checking out [the contributing guidelines](/CONTRIBUTING.md) here. You'll find all the relevant information such as [how to make a PR](/CONTRIBUTING.md#pull-request-guidelines), [how to setup development](/CONTRIBUTING.md#development-setup)) etc., there.

## 🤝 Sponsors

The development of Gunish is supported by my OSS sponsors!

<p align="center">
  <a href="https://cdn.jsdelivr.net/gh/kazupon/sponsors/sponsors.svg">
    <img alt="sponsor" src='https://cdn.jsdelivr.net/gh/kazupon/sponsors/sponsors.svg'/>
  </a>
</p>

## ©️ License

[MIT](http://opensource.org/licenses/MIT)

<!-- Badges -->

[npm-version-src]: https://img.shields.io/npm/v/pnpmc?style=flat
[npm-version-href]: https://npmjs.com/package/pnpmc
[ci-src]: https://github.com/kazupon/pnpmc/actions/workflows/ci.yml/badge.svg
[ci-href]: https://github.com/kazupon/pnpmc/actions/workflows/ci.yml
