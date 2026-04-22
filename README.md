# `ts-achieve`

[![.github/workflows/ci.yml](https://github.com/ts-achieve/ts-achieve/actions/workflows/ci.yml/badge.svg)](https://github.com/ts-achieve/ts-achieve/actions/workflows/ci.yml)

`ts-achieve` is a VS Code extension by T.S. Achieve. It gamifies the TypeScript development experience by organizing diagnostic messages into unlockable achievements.

# ⭐ features

- **achievement tracker:** a list of all 1372 TypeScript diagnostics, with information about when, where, and how each achievement was unlocked
- **summary view:** an overview of your achievement progress, milestones, and other fun facts
- **speedrun mode:** unlock all achievements as fast as you can
- **liveblog mode:** defeat the achiever by triggering errors to spawn enemies

# 👬 contributing

## 📥 installing

```
cd ts-achieve
pnpm i
```

## 🧪 testing

```
cd ts-achieve
pnpm t
```

## 🏗️ building

```
cd ts-achieve
pnpm b
```

# 📜 history

- **v0.1.3** (2026 4 21) achieved [publication](https://marketplace.visualstudio.com/items?itemName=ts-achieve.ts-achieve)

- **v0.1.0** (2026 4 11) achieved `publisher: "ts-achieve"` in `package.json`

  this is a breaking change. installations of v0.0.x must go
  to `~/.vscode/extensions` (Unix) or `%USERPROFILE%\.vscode\extensions` (Windows)
  and delete all folders that begin with `undefined_publisher.ts-achieve`.

- **v0.0.1** (2026 3 20) achieved `ts-achieve`
