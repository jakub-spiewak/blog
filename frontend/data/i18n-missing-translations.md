---
title: How to handle i18n missing translation
date: '2022-09-14'
tags: ['i18n', 'node', 'script', 'git', 'react', 'automation']
draft: false
summary: 'This post describes one of many methods to handle and maintain missing translations in i18n and React
example.'
images: []
---

## Introduction

I was in many projects that we had to develop applications that support internalization.
*i18next* is a great tool that helps us to achieve this.
But when it comes to development itself, I always encountered the same tiny problems with
translation files, namely: that weren't always sorted in the same way, sometimes I've
forgotten to add new translation keys to all files,
my colleagues that translate to the corresponding language struggle to find relevant fields

Just like good developers do, I decided to create a script that would automate my job and
make me ensure that I'm not going to miss any of the translations.

> It is better to spend 10 hours automating a task than to spend 10 minutes doing it manually.

## Create a script

Let's assume you have an existing project with already configured *i18n*
tool as well with existing translation files.

Of course, to start, we have to create a script file first. So let's create it in folder with
other scrips: `./scripts/add-missing-translations.js` and add it to `./package.json`.

```json:package.json {10}
{
  "name": "i18n-script-blog-example",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "translations": "node ./scripts/add-missing-translations.js"
  },
  "dependencies": {
    "i18next": "^21.9.1",
    "import": "^0.0.6",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-i18next": "^11.18.6"
  },
  "devDependencies": {
    "@types/react": "^18.0.17",
    "@types/react-dom": "^18.0.6",
    "@vitejs/plugin-react": "^2.1.0",
    "typescript": "^4.6.4",
    "vite": "^3.1.0"
  }
}
```

### Helper functions

If you have `loadash` in your dependencies you can skip this part.
Assuming that we have translations in nested `.json` files/objects we will need some helpful
utilities to easily extract and write some values in those nested objects.

First, we are going to create a function that returns a one dimensional array containing all keys
of a given object.
In case when we would have a nested values, then we would get keys separated with dot `.` character.

```javascript:./scripts/add-missing-translations.js
const keys = (obj) => {
    const getObjectKeys = (obj, prefix = null) => {
        const result = []
        Object.keys(obj).forEach(key => {
            const value = obj[key]
            const prefixedKey = prefix !== null ? `${prefix}.${key}` : key
            if (typeof value === "string") result.push(prefixedKey)
            else result.push(...getObjectKeys(value, prefixedKey))
        })
        return result.sort()
    }
    return getObjectKeys(obj)
}
```

Next utilities that we are going to use will be `set()` and `get()` functions.
`get()` would take an object and key (or **keys** separated by dot character) of value that we want
to extract and return that value.
`set()` would simply take as an arguments object that we want to modify,
key (or **keys** separated by dot character) of value that we want to set and of course value itself.

```javascript:./scripts/add-missing-translations.js
const get = (obj, path) => {
    const properties = path.split('.')
    return properties.reduce((prev, curr) => prev && prev[curr], obj)
}

const set = (obj, path, value) => {
    const [first, ...rest] = path.split('.')
    if (!rest.length) {
        obj[first] = value
        return
    }

    if (!obj[first] || ['string', 'number'].includes(typeof obj[first])) obj[first] = {}
    set(obj[first], rest.join('.'), value)
}
```

## Variables

To start process files, we have to know where files are placed.
In this example, we chose the english language as our ***source of true***.
So we will get the content of the english translation file, and with the help of our
utility function, we will extract all translation files.

```javascript:./scripts/add-missing-translations.js
const scriptName = fileURLToPath(import.meta.url)
const scriptDirectory = dirname(scriptName)
const translationsDirectory = `${dirname(scriptDirectory)}/src/translation`

const patternFileName = "en.json"
const patternFilePath = `${translationsDirectory}/${patternFileName}`
const patternFileContent = JSON.parse(fs.readFileSync(patternFilePath).toString())
const patternFileKeys = keys(patternFileContent)
```

## Reading file

When we have all needed variables that contain all required files/ directories,
we can read all-translations files with `fs` from node and process them ignoring our
"source of true".

```javascript:./scripts/add-missing-translations.js
fs.readdirSync(translationsDirectory).forEach(file => {
    if (file === patternFileName) return;

})
```

## Process files

So, for each file, we would read the content of them and place it in variable.
If file is empty, then we just put into a variable empty object.
In each iteration we get current language based on the filename.

```javascript:./scripts/add-missing-translations.js {4, 6-8}
fs.readdirSync(translationsDirectory).forEach(file => {
    if (file === patternFileName) return;

    const language = file.split('.')[0].toUpperCase()

    const filePath = `${translationsDirectory}/${file}`
    let fileContent = JSON.parse(fs.readFileSync(filePath).toString())
    if (fileContent === undefined) fileContent = {}
})
```

### Write file

Later, for each key of our "source of true" file (which is english), we get the
corresponding translation in current file.
Then we set the same value in a *result* variable.
If value doesn't exist, then we set the corresponding english value prefixed with current
language.
Lastly, we'd override file with *result* variable.

```javascript:./scripts/add-missing-translations.js {3,11-20}
fs.readdirSync(translationsDirectory).forEach(file => {
    if (file === patternFileName) return;
    const result = {}

    const language = file.split('.')[0].toUpperCase()

    const filePath = `${translationsDirectory}/${file}`
    let fileContent = JSON.parse(fs.readFileSync(filePath).toString())
    if (fileContent === undefined) fileContent = {}

    patternFileKeys.forEach(key => {
        const value = get(fileContent, key)
        if (!value) {
            set(result, key, `${language}_${get(patternFileContent, key)}`)
        } else {
            set(result, key, value)
        }
    })
    
    fs.writeFileSync(filePath, JSON.stringify(result, sortReplacer, 2))
})
```

#### Sorting values

You could notice that in the last listing in line with writing file, we have
`JSON.stringify(result, sortReplacer, 2)`. 
That `sortReplacer` simply does alphabetically sort when we stringify 
**result** variable, and looks like this:

```javascript:./scripts/add-missing-translations.js
const sortReplacer = (key, value) => {
    return value instanceof Object && !(value instanceof Array) ?
        Object.keys(value)
            .sort()
            .reduce((sorted, key) => {
                sorted[key] = value[key];
                return sorted
            }, {}) :
        value;
}
```
