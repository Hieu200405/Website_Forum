const fs = require('fs');
const path = require('path');

function buildLocMap(relativePaths) {
  const serverRoot = path.resolve(__dirname, '../../../Server');

  return relativePaths.reduce((acc, relPath) => {
    const abs = path.join(serverRoot, relPath);
    const text = fs.readFileSync(abs, 'utf8');
    const loc = text
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line.length > 0).length;

    acc[relPath] = loc;
    return acc;
  }, {});
}

module.exports = { buildLocMap };
