```sh
cd $(git rev-parse --show-toplevel)
npm ci

mkdir -p .codeql/db .codeql/out .codeql/pack

codeql pack download --dir=.codeql/pack codeql/javascript-queries
codeql pack download --dir=.codeql/pack codeql/cpp-queries

codeql database create  --threads=0 --language=javascript --source-root=.                                            -- .codeql/db/javascript
codeql database create  --threads=0 --language=cpp        --source-root=. --command="node scripts/trace-command.mjs" -- .codeql/db/cpp

codeql database analyze --threads=0 --format=csv          --output=.codeql/out/javascript.csv   -- .codeql/db/javascript .codeql/pack/codeql/javascript-queries/**/*.qls
codeql database analyze --threads=0 --format=csv          --output=.codeql/out/cpp.csv          -- .codeql/db/cpp        .codeql/pack/codeql/cpp-queries/**/*.qls

codeql database analyze --threads=0 --format=sarif-latest --output=.codeql/out/javascript.sarif -- .codeql/db/javascript .codeql/pack/codeql/javascript-queries/**/*.qls
codeql database analyze --threads=0 --format=sarif-latest --output=.codeql/out/cpp.sarif        -- .codeql/db/cpp        .codeql/pack/codeql/cpp-queries/**/*.qls
```
