# pnpmc

[![Version][npm-version-src]][npm-version-href]
[![CI][ci-src]][ci-href]

PNPM Catalogs Tooling

## 🌟 Features

- Detect catalogable dependencies in workspace

## 💿 Installation

```sh
pnpm add -D pnpmc
```

> [!IMPORTANT]
> Notice that this tool is for pnpm workspace feature only.

## 🚀 Usage

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

## 🙌 Contributing guidelines

If you are interested in contributing to `pnpmc`, I highly recommend checking out [the contributing guidelines](/CONTRIBUTING.md) here. You'll find all the relevant information such as [how to make a PR](/CONTRIBUTING.md#pull-request-guidelines), [how to setup development](/CONTRIBUTING.md#development-setup)) etc., there.

## ©️ License

[MIT](http://opensource.org/licenses/MIT)

<!-- Badges -->

[npm-version-src]: https://img.shields.io/npm/v/pnpmc?style=flat
[npm-version-href]: https://npmjs.com/package/pnpmc
[ci-src]: https://github.com/kazupon/pnpmc/actions/workflows/ci.yml/badge.svg
[ci-href]: https://github.com/kazupon/pnpmc/actions/workflows/ci.yml
