const fs = require('fs');
const path = require('path');

function copyFolderSync(from, to) {
    // Create the destination folder if it doesn't exist
    if (!fs.existsSync(to)) {
        fs.mkdirSync(to, { recursive: true });
    }

    // Read all files in the source directory
    const files = fs.readdirSync(from);

    files.forEach(element => {
        const sourcePath = path.join(from, element);
        const destPath = path.join(to, element);
        
        if (fs.lstatSync(sourcePath).isFile()) {
            fs.copyFileSync(sourcePath, destPath);
        } else {
            copyFolderSync(sourcePath, destPath);
        }
    });
}

try {
    const publicDir = path.join(process.cwd(), 'public');
    const staticDir = path.join(process.cwd(), '.next', 'static');
    
    console.log('Copying public files to .next/static directory...');
    copyFolderSync(publicDir, staticDir);
    console.log('Successfully copied public files to .next/static directory');
} catch (error) {
    console.error('Error copying files:', error);
    process.exit(1);
} 