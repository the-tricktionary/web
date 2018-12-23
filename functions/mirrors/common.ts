exports.typeRenewer = function (str) {
  return str.toString().toLocaleLowerCase().trim()
    .replace(/s$/g, '')
}

// from https://gist.github.com/mathewbyrne/1280286
exports.slugify = function (text) {
  return text.toString().toLocaleLowerCase().trim()
    .replace(/&/g, '-and-') // Replace & with 'and'
    .replace(/[\s\W-]+/g, '-') // Replace spaces, non-word characters and dashes with a single dash (-)
    .replace(/^-+|-+$/g, '') // remove leading, trailing -
}
