# Change Log

# 2.1.0 - 2022/7/9

This version requires VS Code 1.56.0+

## Features

- There's now an option to use a worker when lading a font. If enabled, VS Code will use a worker to create a base64 version of the font that can be rendered using `@font-face`. This setting can be enabled in the settings UI or in JSON with:
  ```json
  {
    "font-preview.useWorker": <boolean> // false by default
  }
  ```
- The glyph inspector now has toggles that can enable/disable certain rendering options

    <div align="center">
        <img width="800" alt="Screen Shot 2022-07-09 at 4 33 47 PM" src="https://user-images.githubusercontent.com/7400747/178122503-eb35290f-bec8-494b-8583-67f9ecc5b632.png">
    </div>

## Enhancements

- A `@font-face` style will no longer be created for fonts greater than 30 MB since they can't be rendered by Chromium in the first place (this speeds up font loading times as well)
- A loading indicator now displays in the status bar when a font is loading
- VS Code will show an error message in the editor area when a font fails to load
- The glyph inspector modal is a little bit more responsive when resizing the viewport
- Upgraded a few dependencies to path security issues

## Bug Fixes

- Fixed a bug causing the baseline to display on top of the glyph
- Fixed a bug causing glyphs to be rendered twice

# 2.0.0 - 2022/7/4

This version requires VS Code 1.56.0+

## Features

- Fonts can now be copied as an SVG
- Fonts as large as 25MB can now be loaded ([#3](https://github.com/ctcuff/vscode-font-preview/issues/3)) (_**NOTE**: Web fonts larger than 30MB can be parsed but cannot be rendered as a displayable font face_ [Chromium source here](https://chromium.googlesource.com/chromium/blink/+/refs/heads/main/Source/platform/fonts/opentype/OpenTypeSanitizer.cpp#70))
- Added a modal that displays ascender, descender, baseline, and other information about a glyph from the `hhea` and `head` tables ([#4](https://github.com/ctcuff/vscode-font-preview/issues/4))
- The `Glyph`, `Features`, and `License` tabs now work for WOFF2 fonts

## Enhancements

- Improved the speed at which the extension can load a font
- Added support for displaying all glyphs in a font
- Glyphs are now paginated (goodbye editor freeze!)
- Other various minor bug fixes that I can't be bothered to list here

# 1.3.2 - 2022/1/12

## Features

- Added a new "Type Yourself" tab. Now you can type an extended block of text

## Bug Fixes

- Fixed a bug that caused some fonts to crash as soon as it was opened

# 1.2.2 - 2021/8/2

## Features

- Added a setting to allow the preview to always open in your preferred tab. ([#2](https://github.com/ctcuff/vscode-font-preview/issues/2))

# 1.1.2 - 2021/7/29

## Features

- Added Arabic, Chinese, and Japanese translations for preview text. ([#1](https://github.com/ctcuff/vscode-font-preview/issues/1))

# 1.0.2 - 2021/6/27

## Enhancements

- Decreased extension size by removing unnecessary files from build

# 1.0.1 - 2021/6/27

## Bug Fixes

- Fixed a bug that caused some glyphs not to display a title on hover

# 1.0.0 - 2021/6/25

- Initial release 🎉
