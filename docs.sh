#!/usr/bin/env bash

if [ ! -f deploy.key ]; then exit; fi

if [ "$TRAVIS_PULL_REQUEST" != false ]; then
    if [ "$TRAVIS_BRANCH" != master ]; then exit; fi

    BRANCH_DIR="pull-$TRAVIS_PULL_REQUEST"
fi

export SSH_KEYFILE="$(readlink -f deploy.key)"
export GIT_SSH="$(readlink -f deploy/ssh.sh)"
git clone -b gh-pages git@github.com:the-tricktionary/web .deploy || exit 1
cd .deploy || exit 1
git config user.name travis
git config user.email travis@nowhere
cp -R ../docs/the-tricktionary/* .
git add -A
git commit -m "travis: $TRAVIS_COMMIT"
git push || exit 1
cd ..