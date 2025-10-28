#!/usr/bin/env bash

(
  cd dist/seating/browser
  git init
  git checkout -b gh-pages
  git add .
  git commit -m "publish"
  git remote add origin git@github.com:better-bus/better-bus.github.io.git
  git push origin gh-pages --force
)
