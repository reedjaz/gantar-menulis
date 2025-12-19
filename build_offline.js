const fs = require('fs');
const path = require('path');

const bundle = {};

function scanDir(dir) {
    const files = fs.readdirSync(dir);

    files.forEach(file => {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);

        if (stat.isDirectory()) {
            scanDir(fullPath);
        } else if (file.endsWith('.html') || file.endsWith('.json')) {
            // Convert backslashes to forward slashes for the key (URL style)
            const key = fullPath.replace(/\\/g, '/');
            const content = fs.readFileSync(fullPath, 'utf8');
            bundle[key] = content;
            console.log(`Bundled: ${key}`);
        } else if (file.endsWith('.mp3')) {
            const key = fullPath.replace(/\\/g, '/');
            const fileData = fs.readFileSync(fullPath);
            const base64Content = fileData.toString('base64');
            const dataUri = `data:audio/mpeg;base64,${base64Content}`;
            bundle[key] = dataUri;
            console.log(`Bundled Audio: ${key}`);
        }
    });

}

// Scan relevant directories
if (fs.existsSync('scene')) scanDir('scene');
if (fs.existsSync('components')) scanDir('components');
if (fs.existsSync('assets')) scanDir('assets');

// Create the JS file content
const jsContent = `window.OFFLINE_CONTENT = ${JSON.stringify(bundle, null, 2)};`;

// Write to js/offline_bundle.js
if (!fs.existsSync('js')) {
    fs.mkdirSync('js');
}

fs.writeFileSync('js/offline_bundle.js', jsContent);
console.log('Build complete: js/offline_bundle.js created.');
