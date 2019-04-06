const os = require('os');
const fs = require('fs');
const path = require('path');
const process = require('process');
const child_proc = require('child_process');
const utils = require('./utils');

if (process.version.match(/^v(\d+)/)[1].length < 2) {
    console.log('Too old Node.js, Node.js 10+ required');
    return 1;
}

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
            default: // Linux, MacOS
                return `ps aux | grep -ie ${name} | awk '{print $2}' | xargs kill -9`;
        }
    }

    console.log(`Killing ${getName()} process if it runs`);

    try {
        child_proc.execSync(getCmd(getName()), {stdio: 'ignore'});
    } catch (error) {
        // ignore errors
    }
}

function getSkypeAsarPaths() {
    switch (os.platform()) {
        case 'win32':
            return ['C:\\Program Files (x86)\\Microsoft\\Skype for Desktop\\resources'];
        case 'darwin': // MacOS
            return ['/Applications/Skype.app/Contents/Resources'];
        default: // Linux
             return ['/usr/share/skypeforlinux/resources'];
            // snap Skype version is installed to '/snap/skype/current/usr/share/skypeforlinux/resources'
            // but looks like it's not possible to easily modify files here
    }
}

function findSkypeAsarPath() {
    const paths = getSkypeAsarPaths();
    const result = paths.filter(path => fs.existsSync(path));
    return result.length ? result[0] : null;
}

function modifySkype(replacements) {
    killSkypeProcess();

    const resourcesPath = findSkypeAsarPath();
    if (!resourcesPath) {
        console.error(`${getSkypeAsarPaths()} not found
            maybe you are not using Skype 8 (Skype for Desktop, not Windows 10 Store app)
            or it is installed in different place`);
        process.exit(1);
    }

    const asarName = 'app.asar';
    const asarPath = path.join(resourcesPath, asarName);

    console.log(asarPath);

    const tmpDirPath = `skype8_asar/${utils.getCurrentDateTimeString()}`;
    const tmpAsarPath = path.join(tmpDirPath, asarName);

    if (!fs.existsSync(tmpDirPath)) {
        fs.mkdirSync(tmpDirPath, { recursive: true });
    }

    console.log(`Copying files to ${tmpDirPath}`);

    fs.copyFileSync(asarPath, tmpAsarPath);
    fs.chmodSync(tmpAsarPath, 0o666);
    utils.copyDirRecursiveSync(asarPath + '.unpacked', tmpDirPath);
    fs.copyFileSync(tmpAsarPath, tmpAsarPath + '.bak');

    const srcDirName = 'app';

    const runAsar = argsStr => {
        child_proc.execSync(`asar ${argsStr}`, {cwd: tmpDirPath})
    };

    console.log(`Extracting ${asarName}`);

    runAsar(`extract ${asarName} ${srcDirName}`);

    replacements.forEach(it => {
        console.log(`Replacing ${it.dest} with ${it.src}`);

        fs.copyFileSync(it.src, path.join(tmpDirPath, srcDirName, it.dest))
    });

    console.log(`Packing ${asarName}`);

    runAsar(`pack ${srcDirName} ${asarName} --unpack "{*.node,*.dll}"`);

    console.log(`Copying ${tmpAsarPath} back to ${resourcesPath}`);

    fs.chmodSync(asarPath, 0o666);
    fs.copyFileSync(tmpAsarPath, asarPath);
}

const replacements = [
    {task: 'replace', src: 'data/muted_Skype_Call_Ringing.m4a', dest: 'media/Skype_Call_Ringing.m4a'},
    {task: 'replace', src: 'data/muted_Skype_Call_Ringing_Long.m4a', dest: 'media/Skype_Call_Ringing_Long.m4a'},
];

modifySkype(replacements);
