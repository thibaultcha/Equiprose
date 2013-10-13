;(function () {

console.log(process.argv[2])

marked.setOptions({
    gfm: true,
    highlight: function (code, lang, callback) {
    
    },
    tables: true,
    breaks: false,
    pedantic: false,
    sanitize: false,
    smartLists: true,
    smartypants: false,
    langPrefix: 'lang-'
})

})()