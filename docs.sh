#!/usr/bin/env bash

if [ "$TRAVIS_BRANCH" != "master" ]; then exit; fi
if [ ! -f deploy.key ]; then exit; fi

eval `ssh-agent -s`
ssh-add deploy.key
git clone -b master git@github.com:the-tricktionary/the-tricktionary.github.io.git .deploy || exit 1
cd .deploy || exit 1
git config user.name travis
git config user.email travis@nowhere
cp -R ../docs/the-tricktionary/* .
git add -A
git commit -m "travis: $TRAVIS_COMMIT"
git push || exit 1
cd ..