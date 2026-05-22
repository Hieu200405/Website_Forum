const fs = require('fs');
const path = require('path');

const files = fs.readdirSync(__dirname).filter(f => f.startsWith('verify_') && f.endsWith('.js'));

files.forEach(file => {
    const filePath = path.join(__dirname, file);
    let content = fs.readFileSync(filePath, 'utf8');

    // Remove existing runTests(); calls at the bottom of the file
    content = content.replace(/^runTests\(\);\s*$/gm, '');
    
    // Inject process.exitCode = 1 inside the catch blocks where "TEST FAILED" is logged
    content = content.replace(/console\.error\([^)]+TEST\s+FAILED[^)]+\);/g, `$&
        process.exitCode = 1;`);

    // Add robust execution wrapper at the end
    content += `\n// Robust execution wrapper added to avoid hanging CI and report correct exit code
runTests().then(() => {
    // Give a short delay to allow logs to flush
    setTimeout(() => {
        console.log('Exiting process with code:', process.exitCode || 0);
        process.exit(process.exitCode || 0);
    }, 500);
}).catch((err) => {
    console.error('Unhandled Rejection in runTests:', err);
    process.exit(1);
});
`;

    fs.writeFileSync(filePath, content);
    console.log(`Patched ${file} with exit handler.`);
});
