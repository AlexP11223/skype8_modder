Script for Skype 8 files modification.

Skype 8 is written using Electron, so it is possible to extract most of its source files from **asar.pak** (**C:\Program Files (x86)\Microsoft\Skype for Desktop\resources\asar.pak** on Windows) [using `asar` Node.js tool](https://medium.com/how-to-electron/how-to-get-source-code-of-any-electron-application-cbb5c7726c37). 

This script kills all running Skype 8 processes, copies **asar.pak** from the Skype 8 dir to **skype8_asar/<date_time>/asar.pak.bak** (can rename and replace back if something went wrong) in the current dir, extract files using `asar` tool (also it needs to copy **.unpacked** dir from the Skype 8 dir before that), replaces the specified files (at the bottom of [skype8_modder.js](https://github.com/AlexP11223/skype8_modder/blob/master/skype_modder.js)), packs it back and replaces the original **asar.pak** in the Skype 8 dir.

This can be useful for example to replace or disable the ringtone sound since there is still no way to do this in Skype 8 settings, and this is all this script currently does by default - mutes Skype 8 ringtone sound, because I was very annoyed by it playing loudly every time I call someone and I don't see any reason to have it. Sadly it also uses the same sound for the incoming calls, so they get muted too (probably possible to fix by modifying some .js code in the extracted source files, but it's not a problem for me because on desktop I use only headphones anyway).

It should work on

- Windows
- Linux (not snap)
- MacOS (not tested, possibly wrong path).

You need to repeat it after any Skype 8 update. 

# Usage

0. Download the files (use the Download button in the top right corner on GitHub, or `git clone`).
1. Install [Node.js **10+**](https://nodejs.org/en/download/). 

   On Windows you may need to restart your PC so the PATH variable gets reloaded (or just launch cmd or PowerShell from the Start menu and run everything from there).
   
   On Ubuntu 18.04 LTS you need to [find out how to install Node.js 10+](https://www.google.com/search?q=ubuntu+nodejs+10), by default it installs 8.x.
2. Install `asar` by running `npm install -g asar` in cmd/terminal. You can skip this step if running via the .bat or .sh script.
3. Run `node skype_modder.js` in cmd/terminal OR run **skype_modder.bat** (for Windows) OR run **skype_modder.sh** (for Linux/MacOS).

   You may need to run it as admin/root (via the right click menu on Windows or `sudo` on Linux/MacOS), otherwise it may fail to replace the original `asar.pak` (you can do it manually if you want). 

   .bat/.sh scripts don't do anything special, just may be a bit more convenient (e.g. to run from a file manager) and they also check whether `Node.js` and `asar` are installed and attempt to install `asar` if it's not installed.
   
