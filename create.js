const fs = require('fs');
const path = require('path');
const chalk = require('chalk');  
const inquirer = require('inquirer');

const log = {
  success: (message) => console.log(chalk.green(message)),
  info: (message) => console.log(chalk.yellow(message)),
  warn: (message) => console.log(chalk.red(message)),
  help: (message) => console.log(chalk.violet(message)),
};

inquirer
  .prompt([
    /* Pass your questions in here */
    {name: "title", message:"Write the title of the post", waitUserInput: false},
    {name: "test", message:"Type of the post", type:"list", choices: ['article', 'project', 'page'], waitUserInput: false}
  ])
  .then((answers) => {
    // Use user feedback for... whatever!!
    console.log(answers)
  })
  .catch((error) => {
    if (error.isTtyError) {
      // Prompt couldn't be rendered in the current environment
    } else {
      // Something else went wrong
    }
  });
const argv = require('yargs/yargs')(process.argv.slice(2)).argv;

const title = "a";
const type = "y";
const slug = "l";
// const title = argv.t || argv.title;
// const type = argv.T || argv.type;
// const slug = argv.s || argv.slug;

// const folderBase = process.argv[2];
// const newFolderName = process.argv[3];
const folderName = `${type}s/${slug}`;
const todaysDateRaw = new Date()
const todaysDate = todaysDateRaw.toISOString()
const frontmatter = `---
title: ${title}
image: 
id: 0
description: -
imageAlt: Texto alternativo de la imagen
slug: ${slug}
path: ${slug}
openGraphType: website
url: https://marianoguillaume.com
schemaType: website
locale: es
date: ${todaysDate}
category: Frontmatter
---

# ${title}
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
