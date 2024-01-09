import fs from 'fs'
import path from 'path'
import chalk from 'chalk'
import inquirer from 'inquirer'
import jimp from 'jimp'

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
    message: "Write the title of the content",
    waitUserInput: true
  },
  {
    name: "type",
    message: "Type of the content",
    type: "list",
    choices: ['article', 'project', 'page'],
    waitUserInput: true
  },
  {
    name: "slug",
    message: "Write the slug of the content",
    waitUserInput: true
  },
  {
    name: "description",
    message: "Write the description of the content",
    waitUserInput: true
  },
]

function createFrontmatterTemplates(answers) {
  const title = answers.title;
  const slug = answers.slug;
  const description = answers.description;
  const todaysDateRaw = new Date()
  const todaysDate = todaysDateRaw.toISOString()

  const frontmatters = {};

  languages.forEach((language) => {
    frontmatters[language] = `---
title: ${title}
image: 
id: 0
description: ${description}
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

function createPageMetadataImage(fileName, title) {
  jimp.read(fileName, (err, baseImage) => {
    if (err) throw err;

    let textImage = new jimp(1200, 630, 0x0, (err, textImage) => {  
        if (err) throw err;
    })
    jimp.loadFont('./fonts/ibm-plex-sans-pagina.fnt').then(font => {
        textImage.print(font, 62, 433, title)
        baseImage.blit(textImage, 0, 0)
        baseImage.write('page-metadata-image.jpg');
    });
  });
}

function createPostMetadataImage(fileName, title, description) {
  jimp.read(fileName, (err, baseImage) => {
    if (err) throw err;

    let textImage = new jimp(1200, 630, 0x0, (err, textImage) => {  
        if (err) throw err;
    })
    jimp.loadFont('./fonts/ibm-plex-sans-medium.fnt').then(font => {
      textImage.print(font, 62, 430, description)
      baseImage.blit(textImage, 0, 0)
  });
  jimp.loadFont('./fonts/ibm-plex-sans-titulo.fnt').then(font => {
      textImage.print(font, 62, 350, title)
      baseImage.blit(textImage, 0, 0)
      baseImage.write('post-metadata-image.jpg');
  });
  });
}

function createMetadataImage(answers) {
  const fileName = 'metadata-image-template.jpg';

  const contentType = answers.type;
  const title = answers.title;
  const description = answers.description;

  if(contentType === 'page') {
    createPageMetadataImage(fileName, title)
  } else {
    createPostMetadataImage(fileName, title, description)
  }
}

inquirer
  .prompt(questions)
  .then((answers) => {
    console.log(answers)
    const frontmatterTemplates = createFrontmatterTemplates(answers);
    createContentFolders(answers, frontmatterTemplates)
    createMetadataImage(answers)
  })
  .catch((error) => {
    if (error.isTtyError) {
      log.warn(error)
    } else {
      log.warn(error)
    }
  });