import { z } from 'zod';

/**
 * File types supported by Slack
 * See: https://api.slack.com/types/file#file_types
 */
export const FileTypeEnum = z.enum([
    'auto', // Let us detect the file type
    'text', // Plain text
    'ai', // Adobe Illustrator
    'apk', // Android App
    'applescript', // AppleScript
    'binary', // Binary file
    'bmp', // Bitmap
    'boxnote', // BoxNote
    'c', // C
    'csharp', // C#
    'cpp', // C++
    'css', // CSS
    'csv', // CSV
    'clojure', // Clojure
    'coffeescript', // CoffeeScript
    'cfm', // ColdFusion
    'dart', // Dart
    'diff', // Diff
    'doc', // Word Document
    'docx', // Word Document
    'dockerfile', // Dockerfile
    'dotx', // Word Template
    'email', // Email
    'eps', // EPS
    'epub', // EPUB
    'erlang', // Erlang
    'fla', // Flash FLA
    'flv', // Flash video
    'fsharp', // F#
    'fortran', // Fortran
    'gdoc', // GDocs Document
    'gdraw', // GDocs Drawing
    'gif', // GIF
    'go', // Go
    'gpres', // GDocs Presentation
    'groovy', // Groovy
    'gsheet', // GDocs Spreadsheet
    'gzip', // GZip
    'html', // HTML
    'handlebars', // Handlebars
    'haskell', // Haskell
    'haxe', // Haxe
    'indd', // InDesign Document
    'java', // Java
    'javascript', // JavaScript/JSON
    'jpg', // JPEG
    'keynote', // Keynote Document
    'kotlin', // Kotlin
    'latex', // LaTeX/sTeX
    'lisp', // Lisp
    'lua', // Lua
    'm4a', // MPEG 4 audio
    'markdown', // Markdown (raw)
    'matlab', // MATLAB
    'mhtml', // MHTML
    'mkv', // Matroska video
    'mov', // QuickTime video
    'mp3', // Mp3
    'mp4', // MPEG 4 video
    'mpg', // MPEG video
    'mumps', // MUMPS
    'numbers', // Numbers Document
    'nzb', // NZB
    'objc', // Objective-C
    'ocaml', // OCaml
    'odg', // OpenDocument Drawing
    'odi', // OpenDocument Image
    'odp', // OpenDocument Presentation
    'ods', // OpenDocument Spreadsheet
    'odt', // OpenDocument Text
    'ogg', // Ogg Vorbis
    'ogv', // Ogg video
    'pages', // Pages Document
    'pascal', // Pascal
    'pdf', // PDF
    'perl', // Perl
    'php', // PHP
    'pig', // Pig
    'png', // PNG
    'post', // Slack Post
    'powershell', // PowerShell
    'ppt', // PowerPoint presentation
    'pptx', // PowerPoint presentation
    'psd', // Photoshop Document
    'puppet', // Puppet
    'python', // Python
    'r', // R
    'ruby', // Ruby
    'rust', // Rust
    'sql', // SQL
    'sass', // Sass
    'scala', // Scala
    'scheme', // Scheme
    'sketch', // Sketch File
    'shell', // Shell
    'smalltalk', // Smalltalk
    'svg', // SVG
    'swf', // Flash SWF
    'swift', // Swift
    'tar', // Tarball
    'tiff', // TIFF
    'tsv', // TSV
    'tsx', // TSX
    'typescript', // TypeScript
    'vb', // VB.NET
    'vbscript', // VBScript
    'vcard', // vCard
    'velocity', // Velocity
    'verilog', // Verilog
    'wav', // WAV
    'webm', // WebM
    'wmv', // Windows Media Video
    'xls', // Excel spreadsheet
    'xlsx', // Excel spreadsheet
    'xlsb', // Excel Spreadsheet (Binary, Macro Enabled)
    'xlsm', // Excel Spreadsheet (Macro Enabled)
    'xltx', // Excel Template
    'xml', // XML
    'yaml', // YAML
    'zip', // Zip
]);

/**
 * Type for file types supported by Slack
 */
export type FileType = z.infer<typeof FileTypeEnum>;
