---
title: How to handle i18n missing translation
date: '2022-09-14'
tags: ['i18n', 'node', 'script', 'git', 'react', 'automation']
draft: false
summary: 'This post describes one of many methods to handle and maintain missing translations in i18n and React example.'
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

Of course, to start we have to create script file first. So let's create it in folder with 
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