const fs = require('fs');
const path = require('path');

const rootDir = __dirname; // Assuming script is in root or we adjust paths
const outputFile = path.join(rootDir, 'js', 'offline_bundle.js');

const directoriesToScan = [
    { path: 'scene', extensions: ['.html'] },
    { path: 'assets', extensions: ['.json'] },

];

let bundleData = {};

function scanDirectory(dirPath, extensions) {
    if (!fs.existsSync(dirPath)) return;

    const items = fs.readdirSync(dirPath);

    items.forEach(item => {
        const fullPath = path.join(dirPath, item);
        const stat = fs.statSync(fullPath);

        if (stat.isDirectory()) {
            scanDirectory(fullPath, extensions);
        } else {
            const ext = path.extname(item).toLowerCase();
            if (extensions.includes(ext)) {
                // Normalize path to forward slashes for the key
                const relativePath = path.relative(rootDir, fullPath).replace(/\\/g, '/');
                const content = fs.readFileSync(fullPath, 'utf8');

                // For JSON files, we might want to minify or just keep as string
                // But offline_bundle expects a map of "path": "content string"
                // So we just store the raw string content.
                // However, the fetch.js logic for JSON expects to parse it.
                // fetch.js: rule is window.OFFLINE_CONTENT[url]
                // If it's a JSON file, fetch usually returns text which we parse.
                // If we store it as a string here, it works fine.

                bundleData[relativePath] = content;
                console.log(`Bundled: ${relativePath}`);
            }
        }
    });
}

console.log('Starting asset bundling...');

directoriesToScan.forEach(config => {
    const fullDirPath = path.join(rootDir, config.path);
    scanDirectory(fullDirPath, config.extensions);
});

const outputContent = `window.OFFLINE_CONTENT = ${JSON.stringify(bundleData, null, 2)};`;

fs.writeFileSync(outputFile, outputContent);

console.log(`\nSuccess! Bundle written to: ${outputFile}`);
console.log(`Total files bundled: ${Object.keys(bundleData).length}`);
