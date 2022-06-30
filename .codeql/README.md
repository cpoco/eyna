```sh
cd $(git rev-parse --show-toplevel)
npm ci
npm run codeql -w pkg/native
mkdir -p .codeql/db .codeql/out .codeql/pack
codeql pack download --dir=.codeql/pack codeql/javascript-queries
codeql pack download --dir=.codeql/pack codeql/cpp-queries
codeql database create  --threads=0 --language=javascript --source-root=.                -- .codeql/db/javascript
codeql database create  --threads=0 --language=cpp        --source-root=pkg/native/build -- .codeql/db/cpp
codeql database analyze --threads=0 --format=csv --output=.codeql/out/javascript.csv     -- .codeql/db/javascript .codeql/pack/codeql/javascript-queries/**/*.qls
codeql database analyze --threads=0 --format=csv --output=.codeql/out/cpp.csv            -- .codeql/db/cpp        .codeql/pack/codeql/cpp-queries/**/*.qls
```
