# lua-luachecker

A simple luacheck extension for [VS Code](https://code.visualstudio.com/).

A mixture of [linter-luacheck](https://github.com/AtomLinter/linter-luacheck) and [vscode-lualinter](https://github.com/dcr30/vscode-lualinter).

![Example animation](https://github.com/ghtalpo/lua-luachecker/blob/master/out.gif)

## Requirements

Install [luacheck](https://github.com/mpeterv/luacheck) first.

## Extension Settings

This extension contributes the following settings:

* `luachecker.luacheck`: point to luacheck if this extension does not work
* `luachecker.enable`: enable/disable this extension
* `luachecker.warnOnSave`: set to `true` to show warning message if there is an error when saving a file
* `luachecker.globals`: add more globals names to standard ones, separated by comma, eg jit, bit
* `luachecker.ignore`: ignore warnings related to these variables names, separated by comma, eg self, myvar

## Known Issues

Does not work flawlessly on GIT tab

## Release Notes

### 0.0.1

Initial release 

### 0.0.2

Add --globals and --ignore options for luacheck

### 0.1.2

Nothing but a version number.

### For more information

* [luacheck](https://github.com/mpeterv/luacheck)
* [linter-luacheck](https://github.com/AtomLinter/linter-luacheck)
* [vscode-lualinter](https://github.com/dcr30/vscode-lualinter)

## Contribute

Bugs, ideas and pull requests please go to [ghtalpo/lua-luachecker
](https://github.com/ghtalpo/lua-luachecker).

**Enjoy!**
