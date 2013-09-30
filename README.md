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

## Create content for your website 

Create a .md file and specify at least the layout in metadata. This will look for a .jade and a .styl file, and they must be present in your template (see create a template section, below)

Optional metadatas : title, customCss, ...

### Blog

To create a blog, put in a separated folder (like content/blog/) and include a file with layout "blog"

## Create template for your website

