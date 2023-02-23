require('dotenv').config()

var saveFile = require('fs').writeFileSync;

var pkgJsonPath = require.main.paths[0].split('node_modules')[0] + 'package.json';

var json = require(pkgJsonPath);

if(json.build.publish['token'] === "") {
    json.build.publish['token'] = process.env.GH_TOKEN;
}
else json.build.publish['token'] = "";

saveFile(pkgJsonPath, JSON.stringify(json, null, 2));