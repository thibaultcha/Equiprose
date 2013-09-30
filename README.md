# Miranda

Miranda is a static website and/or blog generator.
I built it because I love Markdown and wanted [my website](http://thibaultcha.me) to support it. Miranda is inspired from [snap](https://github.com/mlbli/snap), but I was not satisfied with it because I wanted more than a blog. 
Miranda was first built as a Node.js app ([CrydeeEngine](https://github.com/thibaultCha/CrydeeEngine), until I realized static content was much more appropriated to my needs and.. maybe yours?

#### TL:DR 
Write your content in Markdown, create your Jade+Stylus template, build: you're done!

#### Features

- Generates static webpages (cool for GitHub hosting)
- Write your content in Markdown
- Emojis support :+1:
- Custom templates

![Miranda](http://f.cl.ly/items/263R13320x1j3u2S301I/Miranda.png)

#### Summary

- **[How it works](#how-it-works)**
- **[Use it](#use-it)**
- **[Create your content](#create-content-for-your-website)**
- **[Create your template](#create-a-template)**
- **[How to blog with it](#the-blog-part)**
- **[Roadmap](#roadmap)**
- **[Licence](#licence)**

======

## How it works

Miranda takes an arborescence of Markdown files and render them as HTML files:

```
content/
├── index.md
├── 404.md
├── blog
│   ├── 2013-09-26_hello-world.md
│   ├── 2013-09-27_article-2.md
│   ├── 2013-10-01_article-3.md
│   └── index.md
└── project
    └── about.md
```

Becomes:
```
dist/
├── index.html
├── 404.html
├── blog
│   ├── hello-world.html
│   ├── article-2.html
│   ├── article-3.html
│   └── index.html
└── project
    └── about.html
```

## Use it

### Install

Miranda requires [Node.js](http://nodejs.org) and [npm](https://npmjs.org) to be installed.

1. Download or clone, run `npm install` for dependencies.
2. Configure it `config.js`
3. Create content for your website
4. Create a template or use an existing one

### Commands

For now, you'll need to run `node build` to build your website. There is currently no logs but you will be notified if an error occurs. I plan to add a Makefile.

## Create your content

Miranda takes your content arborescence, and creates the exact same one with `.html` files. So create your content as if it was your real webpages. Each content file **must** contain some metadatas in a ```json``` tag. Example:
```
```json
{
	"layout": "page"
}
\```

Content goes here...
```

The backslash is only for GitHub to escape the json tag, **do not** include it in your content's files.

### Metadatas

The only required Metadata is the layout (we'll see why), but you can specify some more:

```
```json
{
	"layout"    : "page",
	"customCss" : "home",
	"title"     : "Home",
	"author"    : "Dustin"
}
\```
```

* __Layout__: required because Miranda will look for a `.jade` and a `.styl` files with the same name in your `config.template` directory.
* __customCss__: optional, if you want a custom css file for, let's say, this page of type "page".
* __title__: optional, the page title.
* __author__: optional, the author of a blog post, if different from `config.author.name`.

### Emojis

To write an emoji, simply use the GitHub way, put its name between two ":". Use [this cheatsheet](http://www.emoji-cheat-sheet.com) :)

## Create your template

### Jade and Stylus

Use [Jade](http://jade-lang.com) and [Stylus](http://learnboost.github.io/stylus) to build your template. Each content file you write must have a `layout` value, and Miranda will search the corresponding `.jade` and `.styl` files. You'll get an error if one is missing.

This is the arborescence you need to use:

```
templates/my-template/
├── layouts
│   ├── blog.jade
│   ├── layout.jade
│   ├── page.jade
│   └── post.jade
└── styl
    ├── blog.styl
    ├── custom
    │   └── home.styl
    ├── page.styl
    ├── post.styl
    └── styles.styl
```

I think this representation speaks for itself, but two things worth to mention here:

* I recommend you (yeah, I know...) to have a generic `.jade` and `.styl` file, like `layout.jade` and `styles.styl` below. This way, you can include them in your other files, since both Jade and Stylus support includes :tada:
* The `custom/` folder is for custom css styles you want to include in a unique page among others using a specific layout.

### Inject content in your generated HTML

When you create a template, use Jade's variables to inject the content in HTML files:

```jade
title #{owner.name} - #{title}
div.content
	#{content}
```

The available variables are :

```jade
// assets stuff
#{layoutCss}
#{customCss}
#{assetsPath}
// page stuff
#{title}
#{owner.name}
#{owner.description}
// blog index stuff
#{blog.posts[n].link}
#{blog.posts[n].title}
#{blog.posts[n].author}
#{blog.posts[n].date}
// blog psot stuff
#{post.title}
#{post.author}
#{post.date}
// any page or blog post stuff
#{content}
```

To see a template example, see the one I created for my website: `tempaltes/thibaultcha`.

## The Blog part

To create a blog in your website, you just need the right arborescence:

```
├── blog
│   ├── 2013-09-26_hello-world.md
│   ├── 2013-09-27_article-2.md
│   ├── 2013-10-01_article-3.md
│   └── index.md
```

- Your blog directory should contain an index or a landing page, containing a Jade loop (see Jade [docs](http://jade-lang.com/reference)) looping over the `{blog.posts}` array.

- Each blog post **must** be named as `YYYY-MM-DD`_`article-slug.md` and have the `blog` layout. You can then specify an author or a title in the metadatas.

## Roadmap

First, I wanted this project to be very easy to use. If you have any suggestions regarding the usability of this project, please don't hesitate to tell me.

Other features shoud come:
- A Makefile
- Logs
- Create pages from console
- Create blog posts from console

## Licence

Copyright (C) 2013 by Thibault Charbonnier.

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
