---
title: gRPC multi-language packaging
date: '2022-07-21'
tags: ['grpc', 'protobuf', 'bash', 'ci/cd', 'java', 'kotlin', 'gradle', 'jdk', 'javascript', 'typescript']
draft: false
summary: 'This article describes how to create script that publishes gRPC generated code that targets multiple languages from one place and, for example, could be used by CI/CD pipeline.'
images: []
---

## Introduction

The gRPC is great in various fields, but from developer experience, my favorite one is that we can have one `.proto`
file that defines shape and data model of each microservice. When we generate gRPC service code, we got two things:
server part (how service would work) and the client part (how service would be consumed). Mainly we would use same
`.proto` file in two repositories: in microservice that would implement gRPC service methods and in microservice that
would consume those methods. To avoid duplicating and synchronizing `.proto` files in each repository we can package
generated code with Maven/Gradle, NPM, GoLang modules, Conan and so on.
In this article, I describe my own approach to resolve this issue.

## Project setup

We'll create a project consisting of three components:

1. folder with all `.proto` files
1. folder containing subprojects for each target *language*/*package manager*
1. script part, which would generate, package and publish code for every subproject mentioned in previous point

In our example, we will work on **Kotlin** and **Web** *(JavaScript with TypeScript declaration)*.
Script that we are going to create would use: [Protobuf Compiler](https://github.com/protocolbuffers/protobuf)
(with plugins: [gRPC Kotlin](https://github.com/grpc/grpc-kotlingrad), [gRPC Java](https://github.com/grpc/grpc-java),
[gRPC Web](https://github.com/grpc/grpc-web)), [Gradle](https://gradle.org/np) and [Npm](https://www.npmjs.com/).
Before we'd run that script, we need to install those.
Gradle and Npm should be easy to install.
How to install the Protobuf Compiler with plugins, I'll describe later.

## Folder structure

First things first, we have to prepare proper project structure and create folders mentioned above.

```text
./
├──📂 generated
│   ├──📁 jvm
│   └──📁 web
├──📁 proto
└──📁 script
```

### Kotlin

Then in `./genereted/jvm` we'll create necessary files and folders for a minimal Kotlin/Gradle project.
Because Kotlin files created by the Protobuf Compiler require Java classes to work, we will create target folders for
both Java and Kotlin in `./generated/jvm/src/main` folder.
And in those folders we would generate code.

```text {4-9}
./
├──📂 generated
│   ├──📂 jvm
│   │   ├──📂 src
│   │   │   └──📂 main
│   │   │       ├──📁 java
│   │   │       └──📁 kotlin
│   │   ├── build.gradle.kts
│   │   └── settings.gradle
│   └──📁 web
├──📁 proto
└──📁 script
```

After creation of the files in JVM part we need to add few dependencies in `./gradle/jvm/build.gradle.kts` build file.

```kotlin:build.gradle.kts {6-16}
// rest of build file...
dependencies {
    implementation(kotlin("stdlib"))
    implementation(platform("org.jetbrains.kotlin:kotlin-bom"))

    // protobuf
    api("com.google.protobuf:protobuf-java:3.21.1")
    api("com.google.protobuf:protobuf-kotlin:3.21.1")

    // grpc
    api("io.grpc:grpc-protobuf:1.47.0")
    api("io.grpc:grpc-stub:1.47.0")
    api("io.grpc:grpc-kotlin-stub:1.3.1")

    // kotlin
    api("org.jetbrains.kotlinx:kotlinx-coroutines-core:1.6.2")
}
```

### Web

Simply we want to do the same thing as in Kotlin for the Web and for other package managers if we want to.
So next we'll create required folders and files for the Web:

```text {5-9}
./
├──📂 generated
│   ├──📁 jvm
│   └──📂 web
│       ├──📂 src
│       │   ├──📁 generated
│       │   ├── index.d.ts
│       │   └── index.js
│       └── package.json
├──📁 proto
└──📁 script
```

We would generate code for Web into `./generated/web/src/generated` folder.
The `index.js` and `index.d.ts` files would export generated JavaScript files and TypeScript types declarations.
Of course, we need to point out those files in `package.json` file.
Same as in the Kotlin, we have to add a few dependencies.

```json:package.json {4-5, 7-10}
{
  "name": "example-grpc-lib",
  "version": "0.0.1-SNAPSHOOT",
  "main": "src/index.js",
  "types": "src/index.d.ts",
  "dependencies": {
    "@types/google-closure-compiler": "^0.0.19",
    "@types/google-protobuf": "^3.15.6",
    "google-protobuf": "^3.20.0",
    "grpc-web": "^1.3.1"
  }
}
```

## Script

Finally, we can create our script that would make all our jobs for us.
Firstly, we'll create script file, lets name it `run.sh` and place it under `./script` folder.

```treeview {5}
./
├──📁 generated
├──📁 proto
└──📂 script
    └── run.sh
```

### Constants

At the beginning of script, we will define some helpful constants.
Those constants represent paths to our previous created directories and files.

```shell:run.sh
#!/usr/bin/env bash
SCRIPTS_DIR_PATH=$(dirname "$(realpath -s "$0")")
PROJECT_ROOT_PATH=$(realpath -s "$SCRIPTS_DIR_PATH/..")

PROTO_FILES_PATH="$PROJECT_ROOT_PATH/proto"
GENERATED_PATH="$PROJECT_ROOT_PATH/generated"

JVM_TARGET_ROOT_PATH="$GENERATED_PATH/jvm"
WEB_TARGET_ROOT_PATH="$GENERATED_PATH/web"
WEB_TARGET_SRC_PATH="$WEB_TARGET_ROOT_PATH/src"

JAVA_TARGET_PATH="$JVM_TARGET_ROOT_PATH/src/main/java"
KOTLIN_TARGET_PATH="$JVM_TARGET_ROOT_PATH/src/main/kotlin"
WEB_TARGET_PATH="$WEB_TARGET_SRC_PATH/generated"

WEB_TARGET_ENTRY_FILE_PATH="$WEB_TARGET_SRC_PATH/index.js"
WEB_TARGET_DECLARATION_TYPES_FILE_PATH="$WEB_TARGET_SRC_PATH/index.d.js"
```

### Clean

So, the first thing that should happen when we run our script has to be deleting previous generated code.
To do that, we will create two util functions to delete the content of a folder or file.
Then we will create a function that would use those util functions to erase all previous generated files.

```shell:run.sh
function clear_dir() {
  rm -rf "$1" &> /dev/null
  mkdir "$1"
}

function clear_file() {
  rm "$1" &> /dev/null
  touch "$1"
}

function clean() {
 clear_dir "$JAVA_TARGET_PATH"
 clear_dir "$KOTLIN_TARGET_PATH"
 clear_dir "$WEB_TARGET_PATH"
 clear_file "$WEB_TARGET_ENTRY_FILE_PATH"
 clear_file "$WEB_TARGET_DECLARATION_TYPES_FILE_PATH"
}
```

### Generate

After that, with a clean project, we can make a function that actually creates some code.

```shell:run.sh
function generate_grpc() {
  proto_file=$1
  protoc -I="$PROTO_FILES_PATH" \
    \
    --js_out=import_style=commonjs,binary:"$WEB_TARGET_PATH" \
    --grpc-web_out=import_style=commonjs+dts,mode=grpcweb:"$WEB_TARGET_PATH" \
    \
    --grpc-java_out="$JAVA_TARGET_PATH" \
    --java_out="$JAVA_TARGET_PATH" \
    \
    --grpckt_out="$KOTLIN_TARGET_PATH" \
    --kotlin_out="$KOTLIN_TARGET_PATH" \
    \
    "$proto_file"
}
```

What this function does is only run Protobuf Compiler to generate code based on a given `.proto` file path.
The compiled Kotlin code requires Java code to operate, so to make it work we have to generate them both.
To compile Kotlin messages into desired location we use `--kotlin_out` parameter and to generate gRPC services we
use `--grpckt_out`.
For Java, it is pretty straight forward: `--java_out` and `--grpc-java_out`.
Of course,
we would generate Kotlin code to `./generated/jvm/src/main/kotlin` and Java to `./generated/jvm/src/main/java`
directory.
For Web, we have more options to choose from, than just indicate where code would be compiled.
The `--js_out` corresponds to generation of a message, and the `--grpc-web_out` for gRPC services clients.
What can be different in Web than in JVM is that we have something called `import_style`.
It tells compiler how JavaScript/TypeScript is generated and how generated files would import request/responses files.

After that we simply go through every file that have `.proto` extension in `./proto` folder using `find` bash util, and
run `generate_grpc` function for each found file.

```shell:run.sh
function generate() {
  find "$PROTO_FILES_PATH" -type f -name "*.proto" | while read -r proto_file; do generate_grpc "$proto_file"; done
}
```

When we'll run `generate` function, all target folders should contain new generated files that reflect
structure of `./proto` directory.

#### NPM package entry files

In Gradle for a Java/Kotlin case, that's all.
We have all files in proper places, and `build.gradle.kts` build file contains all information required to create
Gradle package.

But for the NPM package actually one step left.
We have to export all generated files in single entry file which is pointed in `package.json` file.
So we'll create function that would append `index.js` entry file and `index.d.ts` type declaration file with a statement
that export given file.
Later we'd use that function on every generated `.js` file.
In that way, we export all gRPC generated files and related to them type declarations.

```shell:run.sh
function append_web_entry_file() {
  relative_file_path=${1#"$WEB_TARGET_SRC_PATH"}
  file_name=${relative_file_path%.js}
  echo "export * from \".$file_name\";" >>"$WEB_TARGET_ENTRY_FILE_PATH"
  echo "export * from \".$file_name\";" >>"$WEB_TARGET_DECLARATION_TYPES_FILE_PATH"
}

function generate_web_entry_files() {
  find "$WEB_TARGET_PATH" -type f -name "*.js" ! -name "*.d.ts" | while read -r js_file; do append_web_entry_file "$js_file"; done
}
```

### Publish

When we have all generated and required files, we can publish our code.
To do that, we need to use proper commands for each package manager.
In our example, we're using Gradle and NPM, so we'd create functions that invoke those package managers commands to
package and publish code.
Before that, we have to somehow update versions of our code.
We can do that in various ways.
We could just pass a version to the main script as an argument.
But I chose to version our packages by using `git tags` along with `git describe --tags` to get a version from it.
Then we can create functions responsible for publishing.

```shell:run.sh
function publish_gradle() {
  version=$1
  gradle -p="$JVM_TARGET_ROOT_PATH" publish -Pversion="$version"
}

function publish_npm() {
  version=$1
  npm --prefix "$WEB_TARGET_ROOT_PATH" version "$version"
  npm publish "$WEB_TARGET_ROOT_PATH"
}

function publish() {
  git fetch --all --tags
  version=$(git describe --tags)
  publish_gradle "$version"
  publish_npm "$version"
}
```

### Finishing the script

At the end of the script we have to just invoke `clean`, `generate` and the `publish` functions.

```shell:run.sh
echo "Removing all previous generated files..."
clean

echo "Generating gRPC code from:"
generate

echo "Publishing..."
publish

exit 0
```

#### The `.gitignore` and `echo`'s

To be more professional, we should log what's happening while a script is running.
Since we use **bash**, to output each step of script, we are going to use `echo` utility before each of them.

To `.gitignore` file in addition to folders/files like `node_modules`,
`build` and so on we will add all places where the code is generated, like so:

```gitignore:.gitignore
generated/jvm/src/main/java/*
generated/jvm/src/main/kotlin/*
generated/web/src/generated/*

*.lock
*.log
node_mudles
build
```

## CI/CD

The great thing in this script is that we can use it on CI/CD.
When we change something in a data model like: add or remove field to a message, add or remove the gRPC method and stuff
like that and push it to remote, then we have automatically packaged and published code ready to use.

### GitHub Actions example

```yaml:workflows/publish.yaml
name: Publish gRPC generated code
on:
  push:
    branches:
      - '*'
    tags:
      - '*'
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
        with:
          fetch-depth: 0
      - uses: actions/setup-node@v3
        with:
          node-version: '16.x'
          registry-url: 'https://npm.pkg.github.com'
      - uses: actions/setup-java@v3
        with:
          distribution: 'liberica'
          java-version: '17'
      - run: ./scripts/install_protoc_if_not_exists.sh
      - run: ./scripts/install_protoc_plugins_if_not_exists.sh
      - run: ./scripts/run.sh
        env:
          USERNAME: jakub-spiewak
          TOKEN: ${{ secrets.TOKEN }}
          NODE_AUTH_TOKEN: ${{ secrets.TOKEN }}
```

Since Protobuf Compiler requires relevant plugins to generate gRPC services methods,
we have to install them on a machine that runs CI/CD job.
To make it happen, we can create two small scripts which install the required plugin.

So we add them to a project:

```text {5-6}
.
├──📁 generated
├──📁 proto
└──📂 script
    ├── install_protoc_if_not_exists.sh
    ├── install_protoc_plugins_if_not_exists.sh
    └── run.sh
```

The script to install Protobuf Compiler `./script/install_protoc_if_not_exists.sh`:

```shell:install_protoc_if_not_exists.sh
#!/usr/bin/env bash

PROTOC_TARGET_PATH="/usr/local"
if [ -f "$PROTOC_TARGET_PATH/bin/protoc" ]; then exit 0; fi
echo "Installing protoc..."

mkdir "$PROTOC_TARGET_PATH"
PROTOC_TEMP_DIR=".temp"
mkdir "$PROTOC_TEMP_DIR"

PROTOC_LINK="https://github.com/protocolbuffers/protobuf/releases/download/v3.20.1/protoc-3.20.1-linux-x86_64.zip"
PROTOC_TEMP_FILE_PATH="$PROTOC_TEMP_DIR/protoc.zip"
sudo curl -L "$PROTOC_LINK" -o "$PROTOC_TEMP_FILE_PATH"

sudo unzip -o "$PROTOC_TEMP_FILE_PATH" -d "$PROTOC_TARGET_PATH"

rm -rf "$PROTOC_TEMP_DIR"
```

The script to install plugins `./script/install_protoc_plugins_if_not_exists.sh`:

```shell:install_protoc_plugins_if_not_exists.sh
#!/usr/bin/env bash

KOTLIN_PLUGIN_LINK=https://repo1.maven.org/maven2/io/grpc/protoc-gen-grpc-kotlin/1.3.0/protoc-gen-grpc-kotlin-1.3.0-jdk8.jar
JAVA_PLUGIN_LINK=https://repo1.maven.org/maven2/io/grpc/protoc-gen-grpc-java/1.47.0/protoc-gen-grpc-java-1.47.0-linux-x86_64.exe
JS_PLUGIN_LINK=https://github.com/grpc/grpc-web/releases/download/1.3.1/protoc-gen-grpc-web-1.3.1-linux-x86_64

TARGET_PLUGINS_DIR="/usr/local/bin"

TARGET_KOTLIN_PLUGIN_JAR_PATH="$TARGET_PLUGINS_DIR/protoc-gen-grpc-kotlin.jar"
TARGET_KOTLIN_PLUGIN_PATH="$TARGET_PLUGINS_DIR/protoc-gen-grpckt"
TARGET_JAVA_PLUGIN_PATH="$TARGET_PLUGINS_DIR/protoc-gen-grpc-java"
TARGET_JS_PLUGIN_PATH="$TARGET_PLUGINS_DIR/protoc-gen-grpc-web"

if [ ! -f "$TARGET_KOTLIN_PLUGIN_PATH" ]; then
  echo "Installing protoc Kotlin plugin..."
  echo "java -jar $TARGET_KOTLIN_PLUGIN_JAR_PATH" >"$TARGET_KOTLIN_PLUGIN_PATH"
  curl -L "$KOTLIN_PLUGIN_LINK" -o "$TARGET_KOTLIN_PLUGIN_JAR_PATH"
  chmod +x "$TARGET_KOTLIN_PLUGIN_PATH"
fi

if [ ! -f "$TARGET_JAVA_PLUGIN_PATH" ]; then
  echo "Installing protoc Java plugin..."
  curl -L "$JAVA_PLUGIN_LINK" -o "$TARGET_JAVA_PLUGIN_PATH"
  chmod +x "$TARGET_JAVA_PLUGIN_PATH"
fi

if [ ! -f "$TARGET_JS_PLUGIN_PATH" ]; then
  echo "Installing protoc JS plugin..."
  curl -L "$JS_PLUGIN_LINK" -o "$TARGET_JS_PLUGIN_PATH"
  chmod +x "$TARGET_JS_PLUGIN_PATH"
fi
```

Those two scripts just do the same thing as it is described in their repositories—how to install them.
Namely, for each program, we check if it is in a path already.
If it is not, then we download that program and place it in a `/usr/local/` to make it executable.

## The end

Thank you for reading my first article in this blog; I hope you like it.
You can find whole example in [this GitHub repo](https://github.com/jakub-spiewak/grpc-multilanguage-package-blog-example)

### References

- [Protobuf docs](https://developers.google.com/protocol-buffers)
- [Protobuf repo](https://github.com/protocolbuffers/protobuf)
- [gRPC docs](https://grpc.io)
- [gRPC Web](https://github.com/grpc/grpc-web)
- [gRPC Java](https://github.com/grpc/grpc-java)
- [gRPC Kotlin](https://github.com/grpc/grpc-kotlin)
