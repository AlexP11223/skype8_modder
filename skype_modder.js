const os = require('os');
const fs = require('fs');
const path = require('path');
const process = require('process');
const child_proc = require('child_process');

function killSkypeProcess() {
    function getName() {
        switch (os.platform()) {
            case 'win32':
                return `Skype.exe`;
            case 'darwin': // MacOS
                return 'Skype';
            default: // Linux
                return `skypeforlinux`;
        }
    }

    function getCmd(name) {
        switch (os.platform()) {
            case 'win32':
                return `taskkill /f /im ${name}`;
            default:
                return ``;
        }
    }

    console.log(`Killing ${getName()} process if it runs`);

    try {
        child_proc.execSync(getCmd(getName()), {stdio: 'ignore'});
    } catch (error) {
        // ignore errors
    }
}

function getSkypeAsarPath() {
    switch (os.platform()) {
        case 'win32':
            return 'C:\\Program Files (x86)\\Microsoft\\Skype for Desktop\\resources';
        case 'darwin': // MacOS
            return '/Applications/Skype.app/Contents/Resources';
        default: // Linux
            return '/usr/share/skypeforlinux/resources';
    }
}

function getCurrentDateTimeString() {
    const date = new Date();
    return date.getFullYear() + '-' +
        (date.getMonth() + 1).toString().padStart(2, '0') + '-' +
        date.getDate().toString().padStart(2, '0') + '_' +
        date.getHours().toString().padStart(2, '0') + '-' +
        date.getMinutes().toString().padStart(2, '0') + '-' +
        date.getSeconds().toString().padStart(2, '0');
}

function copyDirRecursiveSync(source, target) {
    const targetDir = path.join( target, path.basename( source ) );
    if (!fs.existsSync(targetDir)) {
        fs.mkdirSync(targetDir);
    }

    const files = fs.readdirSync(source);
    files.forEach( file => {
        const curSource = path.join(source, file);
        if (fs.lstatSync(curSource).isDirectory()) {
            copyDirRecursiveSync(curSource, targetDir);
        } else {
            fs.copyFileSync(curSource, path.join(targetDir, file));
        }
    });
}

function modifySkype() {
    killSkypeProcess();

    const resourcesPath = getSkypeAsarPath();
    const asarName = 'app.asar';
    const asarPath = path.join(resourcesPath, asarName);

    console.log(asarPath);

    if (!fs.existsSync(asarPath)) {
        console.error(`${asarPath} not found
            maybe you are not using Skype 8 (Skype for Desktop, not Windows 10 Store app)
            or it is installed in different place`);
        process.exit(1);
    }

    const tmpDirPath = `skype8_asar/${getCurrentDateTimeString()}`;
    const tmpAsarPath = path.join(tmpDirPath, asarName);

    if (!fs.existsSync(tmpDirPath)) {
        fs.mkdirSync(tmpDirPath, { recursive: true });
    }

    console.log(`Copying files to ${tmpDirPath}`);

    fs.copyFileSync(asarPath, tmpAsarPath);
    copyDirRecursiveSync(asarPath + '.unpacked', tmpDirPath);
    fs.copyFileSync(tmpAsarPath, tmpAsarPath + '.bak');

    const srcDirName = 'app';

    const runAsar = argsStr => {
        child_proc.execSync(`asar ${argsStr}`, {cwd: tmpDirPath})
    };

    console.log(`Extracting ${asarName}`);

    runAsar(`extract ${asarName} ${srcDirName}`);

    console.log(`Packing ${asarName}`);

    runAsar(`pack ${srcDirName} ${asarName} --unpack "{*.node,*.dll}"`);
}

modifySkype();
