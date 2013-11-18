# Miranda

[![Build Status](https://api.travis-ci.org/thibaultCha/Miranda.png)](https://travis-ci.org/thibaultCha/Miranda) [![Coverage Status](https://coveralls.io/repos/thibaultCha/Miranda/badge.png?branch=master)](https://coveralls.io/r/thibaultCha/Miranda?branch=master)

Miranda is a static website and blog generator built with [Node.js](http://nodejs.org).

## Usage

Miranda will be available on [npm](https://npmjs.org) very soon. For now, docs are included in the Miranda 101 blog post when creating a new website.

### Install

In order to use it, you can already download (or clone) the master branch, and add the `bin/` folder to your `$PATH`.

And run `make install` in the project root directory to install npm's dependencies.

### Commands

`miranda new [path]`

`miranda build [path]`

`miranda serve [path] -p [port]`

`path` refers to a directory containing a `config.yml` file. If no `path` is provided, the command targets the current directory.

## Roadmap

- npm publication
- Create pages from command line
- Create blog posts from command line
- Syntax highlighting for code snippets
- Compress option for Jade and Stylus output

## Licence

Copyright (C) 2013 by Thibault Charbonnier.

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.