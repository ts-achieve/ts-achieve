# `ts-achieve`

[![.github/workflows/ci.yml](https://github.com/ts-achieve/ts-achieve/actions/workflows/ci.yml/badge.svg)](https://github.com/ts-achieve/ts-achieve/actions/workflows/ci.yml)

`ts-achieve` is a VS Code extension by T.S. Achieve. It gamifies the TypeScript development experience by organizing diagnostic messages into unlockable achievements.

# features

- **achievement tracker:** a list of all 1372 warnings, suggestions, and errors in TypeScript, including information about where and how each achievement was unlocked
- **summary view:** an overview of your achievement progress, milestones, and other fun facts
- **speedrun mode:** unlock all achievements as fast as you can!

# contributing

## installing

```
cd ts-achieve
pnpm i
```

## testing

```
cd ts-achieve
pnpm t
```

## building

```
cd ts-achieve
pnpm b
```

# history

- **v0.1.0** (2026 4 11) achieved `publisher` field in `package.json`

  this is a breaking change. installations of v0.0.x must go
  to `~/.vscode/extensions` (Unix) or `%USERPROFILE%\.vscode\extensions` (Windows)
  and delete all folders that begin with `undefined_publisher.ts-achieve`.
