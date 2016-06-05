#!/bin/sh

if [ ! -f deploy/key1 ]; then exit; fi
if [ -z "$TRAVIS_BRANCH" ]; then exit; fi

BRANCH_DIR="$TRAVIS_BRANCH"

if [ "$TRAVIS_PULL_REQUEST" != false ]; then
    if [ "$TRAVIS_BRANCH" != master ]; then exit; fi

    BRANCH_DIR="pull-$TRAVIS_PULL_REQUEST"
fi

export SSH_KEYFILE="$(readlink -f deploy/key1)"
export GIT_SSH="$(readlink -f deploy/ssh.sh)"
git clone -b gh-pages git@github.com:svbeon/tricktionary.git .deploy || exit 1
cd .deploy || exit 1
git config user.name travis
git config user.email travis@nowhere
git rm -rf ./*
cp -r ../ .
echo "trick.svbeon.tk" > CNAME
git add -A
git commit -m "travis: $TRAVIS_COMMIT"
git push || exit 1
cd ../
