# Miranda

[![Build Status](https://api.travis-ci.org/thibaultCha/Miranda.png)](https://travis-ci.org/thibaultCha/Miranda) [![Coverage Status](https://coveralls.io/repos/thibaultCha/Miranda/badge.png?branch=master)](https://coveralls.io/r/thibaultCha/Miranda?branch=master)

[Miranda](http://thibaultcha.github.io/Miranda/) is a static website and blog generator built with [Node.js](http://nodejs.org).

- **[Features](#features)**
- **[Install](#install)**
- **[Usage](#usage)**
- **[Roadmap](#roadmap)**
- **[Licence](#licence)**

## Features

- Static website + blog generator
- Shipped to you as a simple binary script
- Website preview
- Markdown support
- Native emojis support :+1:
- Write your template using [Jade](http://jade-lang.com) and [Stylus](http://learnboost.github.io/stylus/)
- Multiple and widely configurable websites

## Install

Node `0.10` or greater:

```
$ [sudo] npm install -g miranda
```
é
Or:

Clone the master branch, add the `bin/` folder to your `$PATH`, run `make install` in the project root directory to install dependencies.

## Usage

Docs are hosted on the [wiki](https://github.com/thibaultCha/Miranda/wiki), but below is a sample so you can see how simple it is to use.

### Commands

`miranda -h`: prints help.

`miranda create [path]`

`miranda build [path]`

`miranda serve [path] -p [port]`

`miranda new <page|post> [path]`

`path` always refers to a directory containing a `config.yml` file. If no `path` is provided, the command targets the current directory.

`miranda about`

### Build your first website

`miranda create ~/Desktop/test`

`miranda serve ~/Desktop/test`

Browse to `http://localhost:8888`. That's it. (By the way, pull request about the base template are welcomed too).

## Roadmap

- npm publication
- help on invalid command
- live update on directory changes

## Development

Clone the sources, and run `make install`, `make dev` to install all dependencies.

`make test`: runs the tests.

`make test-cov`: runs the coverage.

## Licence

Copyright (C) 2013 by Thibault Charbonnier.

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.