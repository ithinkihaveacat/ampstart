## How to build and deploy an "amptimized" version of ampstart

Build `amphtml` and `ampstart` (run commands from the `amptimize` directory):

```sh
# Create dist
mkdir dist

# Build amphtml (assumes amphtml cloned into ../../amphtml)
cd ../../amphtml
gulp dist
cd -
# ... and copy into dist/js
cp -a ../../amphtml/dist dist/js

# Build ampstart
cd ..
gulp build
cd -
# ... and copy into ./dist
cp -a ../dist .
```

View locally:

```sh
# Optimize ampstart's AMPs
ls ../dist/*.html ../dist/{render,templates}/*.html | cut -b 8- | xargs node index.js

# View on localhost
firebase serve # may need to `firebase login` and `firebase use $project` first
```

Deploy to a server:

```sh
# Set CANONICAL_ROOT environment variable
set -x CANONICAL_ROOT https://amptimize-ae28d.firebaseapp.com # fish
export CANONICAL_ROOT=https://amptimize-ae28d.firebaseapp.com # bash

# Optimize ampstart's AMPs
ls ../dist/*.html ../dist/{render,templates}/*.html | cut -b 8- | xargs node index.js

# Deploy (host must match CANONICAL_ROOT!)
firebase deploy # may need to `firebase login` and `firebase use $project` first
```
