# P-Safe
![Node.js CI](https://github.com/jz-software/p-safe/workflows/Node.js%20CI/badge.svg?branch=master)

Store your passwords securely.
![](https://i.imgur.com/LccgsXR.png)

## Installation

Use **git** to clone the repository:

```bash
git clone https://github.com/jz-software/p-safe
```
Go to the folder:
```bash
cd p-safe
```
Install dependencies using [npm](https://www.npmjs.com/):
```bash
npm install
```
Run the program:
```bash
npm start
```

## How the passwords are stored?
The program uses an [aes-256-gcm](https://en.wikipedia.org/wiki/Advanced_Encryption_Standard) module.

Passwords are stored locally, so internet connection is not required to use the program.

## Profiles
The program can have multiple profiles each having their own passwords and settings.

## License
[MIT](https://choosealicense.com/licenses/mit/)
