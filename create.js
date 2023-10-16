const fs = require('fs');
const path = require('path');

if (process.argv.length !== 4) {
  console.error('Uso: node crear_mdx.js <folder_base> <new_foldername>');
  process.exit(1);
}

const folderBase = process.argv[2];
const newFolderName = process.argv[3];
const folderName = `${folderBase}/${newFolderName}`;
const frontmatter = `---
title: -
image: 
id: 0
description: -
imageAlt: Texto alternativo de la imagen
slug: ${newFolderName}
path: ${newFolderName}
openGraphType: website
url: https://marianoguillaume.com
schemaType: website
locale: es
date: 06/09/2023
category: Frontmatter
---

# Título
Este es un archivo MDX de ejemplo en el idioma "es".
`;

if (!fs.existsSync(folderName)) {
  fs.mkdirSync(folderName, { recursive: true });
}

const languages = ['es', 'en'];
languages.forEach((language) => {
  const languageFolder = path.join(folderName, language);
  if (!fs.existsSync(languageFolder)) {
    fs.mkdirSync(languageFolder, { recursive: true });
  }

  const contentFilePath = path.join(languageFolder, 'content.mdx');
  if (fs.existsSync(contentFilePath)) {
    console.error(`El archivo ${contentFilePath} ya existe.`);
  } else {
    const content = frontmatter;
    fs.writeFileSync(contentFilePath, content);
    console.log(`Archivo ${contentFilePath} creado correctamente.`);
  }
});
