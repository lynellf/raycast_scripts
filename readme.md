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
