import fs from 'fs'
import path from 'path'
import chalk from 'chalk'
import inquirer from 'inquirer'

const languages = ['es', 'en'];

const log = {
  success: (message) => console.log(chalk.green(message)),
  info: (message) => console.log(chalk.yellow(message)),
  warn: (message) => console.log(chalk.red(message)),
  help: (message) => console.log(chalk.violet(message)),
};

const questions = [
  {
    name: "title",
    message: "Write the title of the post",
    waitUserInput: true
  },
  {
    name: "type",
    message: "Type of the post",
    type: "list",
    choices: ['article', 'project', 'page'],
    waitUserInput: true
  },
  {
    name: "slug",
    message: "Write the slug of the post",
    waitUserInput: true
  },
]

function createFrontmatterTemplates(answers) {
  const title = answers.title;
  const slug = answers.slug;
  const todaysDateRaw = new Date()
  const todaysDate = todaysDateRaw.toISOString()

  const frontmatters = {};

  languages.forEach((language) => {
    frontmatters[language] = `---
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
locale: ${language}
date: ${todaysDate}
category: Frontmatter
---

# ${title}
Este es un archivo MDX de ejemplo en el idioma ${language}.
    `;
  })

  return frontmatters;
}

function createContentFolders(answers, frontmatterObject) {
  const type = answers.type;
  const slug = answers.slug;
  const folderName = `${type}s/${slug}`;
  
  if (!fs.existsSync(folderName)) {
    fs.mkdirSync(folderName, { recursive: true });
  }
    
  languages.forEach((language) => {
    const languageFolder = path.join(folderName, language);
    if (!fs.existsSync(languageFolder)) {
      fs.mkdirSync(languageFolder, { recursive: true });
    }
  
    const contentFilePath = path.join(languageFolder, 'content.mdx');
    if (fs.existsSync(contentFilePath)) {
      log.warn(`El archivo ${contentFilePath} ya existe.`);
    } else {
      const content = frontmatterObject[language];
      fs.writeFileSync(contentFilePath, content);
      log.success(`Archivo ${contentFilePath} creado correctamente.`);
    }
  });
}

inquirer
  .prompt(questions)
  .then((answers) => {
    console.log(answers)
    const frontmatterTemplates = createFrontmatterTemplates(answers);
    createContentFolders(answers, frontmatterTemplates)
  })
  .catch((error) => {
    if (error.isTtyError) {
      log.warn(error)
    } else {
      log.warn(error)
    }
  });