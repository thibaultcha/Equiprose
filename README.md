# Miranda

Miranda is a static website `||` blog generator.


:warning: This is a draft README


## Features

- static (cool for hosting on GitHub)
- content writen in markdown
- emoji support
- custom templates

## How it works

Take an arborescence of Markdown files and render them as html files.

```
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

```
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

## Create content for your website 

Create a .md file and specify at least the layout in metadata. This will look for a .jade and a .styl file, and they must be present in your template (see create a template section, below)

Optional metadatas : title, customCss, ...

### Blog

To create a blog, put in a separated folder (like content/blog/) and include a file with layout "blog"

## Create template for your website

