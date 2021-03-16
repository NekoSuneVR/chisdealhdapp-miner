## Development

Install the node dependencies with `yarn install`. Use `npm start` to start the miner for development.

## Releases

New releases should have a new `version` in the `package.json` file.

You will need to install `electron-packager` as a global npm package to compile the miner.

Use the following command for compiling:

```
electron-packager . idle-empire-miner --platform=win32 --arch=x64 --icon=icon.ico --out=./dist --overwrite
```

Then zip the folder and draft a new release on the `idle-empire-miner-releases` repository, the tag version should match the version in the `package.json`.

Finally, update the `client.version` and `client.compatibility` settings in the Laravel config of `idle-empire`.
