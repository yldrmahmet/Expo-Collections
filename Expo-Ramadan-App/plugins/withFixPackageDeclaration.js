const { withDangerousMod } = require('expo/config-plugins');
const fs = require('fs');
const path = require('path');

/**
 * Config plugin to fix package declarations in MainActivity.kt and MainApplication.kt
 *
 * This fixes a bug where expo prebuild generates package declarations from the app name
 * instead of using the configured android.package value.
 */
function withFixPackageDeclaration(config) {
  return withDangerousMod(config, [
    'android',
    async (config) => {
      const androidPackage = config.android?.package;

      if (!androidPackage) {
        console.warn('No android.package found in config, skipping package fix');
        return config;
      }

      const packagePath = androidPackage.replace(/\./g, '/');
      const javaDir = path.join(
        config.modRequest.platformProjectRoot,
        'app/src/main/java',
        packagePath
      );

      const filesToFix = ['MainActivity.kt', 'MainApplication.kt'];

      for (const fileName of filesToFix) {
        const filePath = path.join(javaDir, fileName);

        try {
          if (fs.existsSync(filePath)) {
            let contents = fs.readFileSync(filePath, 'utf8');

            // Replace any package declaration with the correct one
            const packageRegex = /^package\s+[\w.]+/m;
            const correctPackage = `package ${androidPackage}`;

            if (contents.match(packageRegex)) {
              const oldPackage = contents.match(packageRegex)[0];
              if (oldPackage !== correctPackage) {
                contents = contents.replace(packageRegex, correctPackage);
                fs.writeFileSync(filePath, contents, 'utf8');
                console.log(`Fixed package declaration in ${fileName}: ${oldPackage} -> ${correctPackage}`);
              }
            }
          }
        } catch (error) {
          console.warn(`Failed to fix package in ${fileName}:`, error.message);
        }
      }

      return config;
    },
  ]);
}

module.exports = withFixPackageDeclaration;
