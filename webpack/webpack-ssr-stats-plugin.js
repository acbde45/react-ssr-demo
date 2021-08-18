const path = require('path');
const fs = require('fs');

const PLUGIN_NAME = 'WebpackSSRStatsPlugin';

class WebpackSSRStatsPlugin {
  constructor(options) {
    this.options = options;
  }

  apply(compiler) {
    const { name } = this.options;

    compiler.hooks.done.tap(PLUGIN_NAME, (stats) => {
      const statsJson = stats.toJson();
      const outputDir = statsJson.outputPath;

      let result = {
        [`${name}Stats`]: statsJson,
      };
      const outputPath = path.join(outputDir, './stats.json');
      const exists = fs.existsSync(outputPath);

      if (exists) {
        const oldStatsStr = fs.readFileSync(outputPath, { encoding: 'utf8' });
        const oldStats = JSON.parse(oldStatsStr);

        Object.assign(oldStats, result);
        result = oldStats;
      }
  
      fs.writeFileSync(outputPath, JSON.stringify(result));
    });
  }
}

module.exports = WebpackSSRStatsPlugin;
