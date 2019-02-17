const fs = require('fs');
const path = require('path');

const getCurrentDateTimeString = () => {
    const date = new Date();
    return date.getFullYear() + '-' +
        (date.getMonth() + 1).toString().padStart(2, '0') + '-' +
        date.getDate().toString().padStart(2, '0') + '_' +
        date.getHours().toString().padStart(2, '0') + '-' +
        date.getMinutes().toString().padStart(2, '0') + '-' +
        date.getSeconds().toString().padStart(2, '0');
};

const copyDirRecursiveSync = (source, target) => {
    const targetDir = path.join( target, path.basename( source ) );
    if (!fs.existsSync(targetDir)) {
        fs.mkdirSync(targetDir);
    }

    const fileNames = fs.readdirSync(source);
    fileNames.forEach( fileName => {
        const curSource = path.join(source, fileName);
        if (fs.lstatSync(curSource).isDirectory()) {
            copyDirRecursiveSync(curSource, targetDir);
        } else {
            fs.copyFileSync(curSource, path.join(targetDir, fileName));
        }
    });
};

module.exports = {
    getCurrentDateTimeString,
    copyDirRecursiveSync
};