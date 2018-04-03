# Business Services Printing WordPress theme

<<<<<<< HEAD
BUILD
WordPress theme for UCFCard.ucf.edu, created by Mike Setzer, maintained by Business Services.
This theme is built around Advanced Custom Fields.

## Deployment

- The Dev branch is automatically deployed to the UCFCard Dev environment
- The Master branch is automatically deployed to the UCFCard QA environment
- Deployment to production is done manually via Jenkins using release versions
=======
Repository for UCFCard.ucf.edu WordPress theme build, created by Mike Setzer, maintained by Business Services.
This project includes a full setup of GulpJS and SASS for automation, and Jenkins for deployment.

## System Preparation

1. [NodeJS](http://nodejs.org) - Use the installer.
2. [GulpJS](https://github.com/gulpjs/gulp) - `$ npm install -g gulp` (mac users may need sudo)

## Local Installation

1. Clone this repo or download it into a directory of your choice.
2. `$ cd` into the directory and run `$ npm install`.

## Usage

**Development Mode**

This will give you file watching, auto-rebuild, and CSS injection.

```shell
$ gulp
```

## Deployment

- The Dev branch is automatically deployed to the UCFCard.ucf.edu Dev environment
- The Master branch is automatically deployed to the UCFCard.ucf.edu QA environment
- *Deployment to production is done manually via Jenkins using release versions*
>>>>>>> master
- **Be sure to update the style.css with the version on new releases.**
