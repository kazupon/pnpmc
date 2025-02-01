# pnpmc

[![Version][npm-version-src]][npm-version-href]
[![CI][ci-src]][ci-href]

<p align="center">
  <img src="./assets/pnpmc.gif" alt="PNPMC Demo">
</p>

PNPM Catalogs Tooling

## 🌟 Features

- Show cataglos
- Detect catalogable dependencies in workspace
- Register the dependency to the catalog

## 💿 Installation

```sh
pnpm add -D pnpmc
```

> [!IMPORTANT]
> Notice that this tool is for pnpm workspace feature only.

## 🚀 Usage

### Display of defined catalogs

You can show the defined catalogs on your pnpm workspace projects (`pnpm-workspace.yaml`):

```sh
pnpx pnpmc

# PNPM Catalogs Tooling (pnpmc v0.1.0)
#
# 📙 Defined catalogs in pnpm-workspace.yaml:
#   default:
#     typescript: ^5.7.3
#
```

### Detect catalogable dependencies

You can detect catalogable dependencies on your pnpm workspace projects (`pnpm-workspace.yaml`):

```sh
pnpx pnpmc

# PNPM Catalogs Tooling (pnpmc v0.1.0)
#
# 📙 Defined catalogs in pnpm-workspace.yaml:
#   (none)
#
# 📦 Catalogable Dependencies (1):
#   typescript:
#     /packages/package1 (package1): ^5.7.3
#     /packages/package2 (package2): ^5.6.0
#
```

### Register the dependency to the catalog

You can register the dependency to the catalog on your pnpm workspace projects (`pnpm-workspace.yaml`):

```sh
pnpx pnpmc --dependency typescript --alias ^5.7.0 --catalog tools

# PNPM Catalogs Tooling (pnpmc v0.1.2)
#
# 📙 Registered 'typescript' as '5.7.0' in Catalog 'tools'
#
# 📦 Overridden 'typescript' alias on /packages/package1 (package1) : ^5.7.3 -> catalog:tools
# 📦 Overridden 'typescript' alias on /packages/package2 (package2) : ^5.6.0 -> catalog:tools
```

## 🙌 Contributing guidelines

If you are interested in contributing to `pnpmc`, I highly recommend checking out [the contributing guidelines](/CONTRIBUTING.md) here. You'll find all the relevant information such as [how to make a PR](/CONTRIBUTING.md#pull-request-guidelines), [how to setup development](/CONTRIBUTING.md#development-setup)) etc., there.

## ©️ License

[MIT](http://opensource.org/licenses/MIT)

<!-- Badges -->

[npm-version-src]: https://img.shields.io/npm/v/pnpmc?style=flat
[npm-version-href]: https://npmjs.com/package/pnpmc
[ci-src]: https://github.com/kazupon/pnpmc/actions/workflows/ci.yml/badge.svg
[ci-href]: https://github.com/kazupon/pnpmc/actions/workflows/ci.yml
