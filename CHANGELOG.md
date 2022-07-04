# Change Log

### 2.0.0 - 2022/7/4
- Improved the speed at which the extension can load a font
- The `Glyph`, `Features`, and `License` tabs now work for WOFF2 fonts
- Fonts can now be copied as an SVG
- Added support for displaying all glyphs in a font
- Glyphs are now paginated (goodbye editor freeze!)
- Other various minor bug fixes that I can't be bothered to list here
- Fonts as large as 25MB can now be loaded ([#3](https://github.com/ctcuff/vscode-font-preview/issues/3)) (*__NOTE__: Web fonts larger than 30MB can be parsed but cannot be rendered as a displayable font face* [Chromium source here](https://chromium.googlesource.com/chromium/blink/+/refs/heads/main/Source/platform/fonts/opentype/OpenTypeSanitizer.cpp#70))
- Added a modal that displays ascender, descender, baseline, and other information about a glyph from the `hhea` and `head` tables ([#4](https://github.com/ctcuff/vscode-font-preview/issues/4))

### 1.3.2 - 2022/1/12
- Added a new "Type Yourself" tab. Now you can type an extended block of text
- Fixed a bug that caused some fonts to crash as soon as it was opened

### 1.2.2 - 2021/8/2

- Added a setting to allow the preview to always open in your preferred tab. ([#2](https://github.com/ctcuff/vscode-font-preview/issues/2))

### 1.1.2 - 2021/7/29

- Added Arabic, Chinese, and Japanese translations for preview text. ([#1](https://github.com/ctcuff/vscode-font-preview/issues/1))

### 1.0.2 - 2021/6/27

- Decreased extension size by removing unnecessary files from build

### 1.0.1 - 2021/6/27

- Fixed a bug that caused some glyphs not to display a title on hover

### 1.0.0 - 2021/6/25

- Initial release 🎉
