#!/usr/bin/env bash

postcss -c postcss.json app/static/css/*.css
cat public/static/cssa/*.css > public/static/css/style.css
rm -rf public/static/cssa

find app -type f -name '*.js' -not -path 'app/static/js/*' -print0 | xargs -0 uglifyjs -c -o public/static/js/trick.js --

mv public/index.html public/index.html.old
#gsed '/<!-- DEPLOY -->/,/<!-- END DEPLOY -->/c <script src=""></script>\n    <link rel="" />' public/index.html.old
perl -0777 -pe 's/<!-- DEPLOY -->[\w\d\s\/\.<>!="-]*<!-- END DEPLOY -->/<link rel="stylesheet" href="\/static\/css\/style.css">\n    <script src="\/static\/js\/trick.js"><\/script>/g' public/index.html.old > public/index.html
rm public/index.html.old