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
translation files, namely: that weren't always sorted in the same way, sometimes I've forgotten to add new 
translation keys to all files,
my colleagues that translate to the corresponding language struggle to find relevant fields

Just like good developers do, I decided to create a script that would automate my job and 
make me ensure that I'm not going to miss any of the translations.

> It is better to spend 10 hours automating a task than to spend 10 minutes doing it manually.

## Create a script

Let's assume you have an existing project with already configured *i18n* 
tool as well with translation files. 
In this article, I will present an example with **React** and ***i18n***.
My translation files lay under `./src/translation` folder. 
