import fs from 'fs'
import path from 'path'
import chalk from 'chalk'
import inquirer from 'inquirer'
import jimp from 'jimp'
import cloudinary from 'cloudinary'
import { v4 as uuidv4 } from 'uuid';
import 'dotenv/config'

const cloud_name = process.env.CLOUD_NAME;
const api_key = process.env.API_KEY;
const api_secret = process.env.API_SECRET;
const upload_preset = process.env.UPLOAD_PRESET;

cloudinary.config({ 
  cloud_name, 
  api_key,
  api_secret
});

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
  const imageUrl = answers.imageData.secure_url;
  const todaysDateRaw = new Date()
  const todaysDate = todaysDateRaw.toISOString()
  const id = uuidv4();

  const frontmatters = {};

  languages.forEach((language) => {
    frontmatters[language] = `---
title: ${title}
image: ${imageUrl}
id: ${id}
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

async function deleteFile(filePath) {
  await new Promise(resolve => setTimeout(resolve, 2000));

  try {
    fs.unlinkSync(filePath);
    log.success(`File ${filePath} has been deleted.`);
  } catch (err) {
    log.warn(err);
  }
}

async function uploadImage(file) {
  await new Promise(resolve => setTimeout(resolve, 2000));
  const imageData = cloudinary.v2.uploader.unsigned_upload(file, upload_preset, {folder: 'marianoGuillaume-blog-images'}).then((result, error)=>{
    console.log(result, error);
    return result
  });
  deleteFile(file)
  return imageData
}

async function createPageMetadataImage(fileName, title) {
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
  })
}

async function createPostMetadataImage(fileName, title, description) {
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
  })
}

async function createMetadataImage(answers) {
  const fileName = 'metadata-image-template.jpg';

  const contentType = answers.type;
  const title = answers.title;
  const description = answers.description;

  if(contentType === 'page') {
    await createPageMetadataImage(fileName, title)
    const imageData = await uploadImage('page-metadata-image.jpg')
    await deleteFile('page-metadata-image.jpg')

    return imageData
  } else {
    await createPostMetadataImage(fileName, title, description)
    const imageData = await uploadImage('post-metadata-image.jpg')
    await deleteFile('post-metadata-image.jpg')

    return imageData
  }
}

inquirer
  .prompt(questions)
  .then(async (answers) => {
    console.log(answers)
    const imageData = await createMetadataImage(answers)
    const frontmatterTemplates = createFrontmatterTemplates({imageData ,...answers});
    createContentFolders(answers, frontmatterTemplates)
  })
  .catch((error) => {
    if (error.isTtyError) {
      log.warn(error)
    } else {
      log.warn(error)
    }
  });