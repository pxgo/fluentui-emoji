const path = require('path');
const fs = require('fs').promises;
const assetsDir = path.join(__dirname, '../assets');
const distDir = path.join(__dirname, '../dist');
async function main() {
  const stickersDir = await fs.readdir(assetsDir);
  console.log(`共找到 ${stickersDir.length} 个表情`);
  const groups = {};
  for(let i = 0; i < stickersDir.length; i++) {
    const cl = (text) => {
      console.log(`[${(i + 1).toString().padStart(stickersDir.length.toString().length, '0')}/${stickersDir.length}] ${text}`);
    }
    const stickerDirName = stickersDir[i];
    const stickerDirPath = path.join(assetsDir, stickerDirName);
    cl(`正在处理 ${stickerDirPath}...`);
    const metaDataFilePath = path.resolve(stickerDirPath, 'metadata.json');
    const metaDataString = await fs.readFile(metaDataFilePath, 'utf8');
    const {
      group,
      unicode,
    } = JSON.parse(metaDataString);
    const stickerDirChildren = await fs.readdir(stickerDirPath);
    let fileDir = path.resolve(stickerDirPath, '3D');
    if(stickerDirChildren.includes('Default')) {
      fileDir = path.resolve(stickerDirPath, 'Default/3D');
    }
    const files = await fs.readdir(fileDir);
    const filePath = path.resolve(fileDir, files[0])
    if(!groups[group]) {
      groups[group] = [];
    }
    groups[group].push({
      group,
      unicode: unicode.split(' ').join('_'),
      filePath,
    });
  }

  const outputStickerDir = path.resolve(distDir, 'stickers');
  await fs.mkdir(outputStickerDir, {
    recursive: true,
  });
  const oldFiles = await fs.readdir(outputStickerDir);
  for(const oldFileName of oldFiles) {
    await fs.unlink(path.resolve(outputStickerDir, oldFileName));
  }
  const outputDataPath = path.resolve(distDir, 'out.json');
  const outputData = [];
  for(const group in groups) {
    const stickersUnicode = [];
    for(const res of groups[group]){
      const {unicode, filePath} = res;
      stickersUnicode.push(unicode);
      await fs.copyFile(filePath, path.resolve(outputStickerDir, `${unicode}.png`));
    }
    outputData.push({
      name: group,
      stickers: stickersUnicode,
    })
  }
  await fs.writeFile(outputDataPath, JSON.stringify(outputData, null, 2));

  console.log('done.');
}


main().catch(console.error);
