## Raycast Scripts

- Custom Scripts for [Raycast](https://www.raycast.com/), an Alfred / Spotlight alternative

Requirements:

- Include a `config.json` file within our custom scripts directory.
- Each key represents the filename of the custom script

### Open Repo With Code

Allows us to open any local repo directory with VSCode

#### Config

```
basePath: string // repo directory or parent directory of the desired targets
codeCommand: string // the terminal command to open vscode within the directory
```

### Reddit2Obsidian

Move saved posts and or comments to obsidian vault

#### Config

[App Config Details Can Be Found Here](https://www.reddit.com/prefs/apps)

```
username: string
password: string
appId: string
appSecret: string
userAgent: string
vaultPath: string
```
