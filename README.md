# Business Services Printing WordPress theme

WordPress theme for UCFCard.ucf.edu, created by Mike Setzer, maintained by Business Services.
This theme is built around Advanced Custom Fields.

## Deployment

- The Dev branch is automatically deployed to the UCFCard Dev environment
- The Master branch is automatically deployed to the UCFCard QA environment
- Deployment to production is done manually via Jenkins using release versions

=========

Repository for UCFCard.ucf.edu WordPress theme build, created by Mike Setzer, maintained by Business Services.
This project includes a full setup of GulpJS and SASS for automation, and Jenkins for deployment.

## System Preparation

1. [NodeJS](http://nodejs.org) - Use the installer.
2. [GulpJS](https://github.com/gulpjs/gulp) - `$ npm install -g gulp` (mac users may need sudo)
3. [LibSass](http://sass-lang.com/libsass)

## Local Installation

1. Clone this repo or download it into a directory of your choice.
2. `$ cd` into the directory and run `$ npm install`.

## Usage

**Development Mode**

This will give you file watching, auto-rebuild, and CSS injection.

```shell
$ gulp
```

## WordPress modularization

**WordPress theme files**

- Reusable template parts, such as menus go to `/template-parts`
- Individual parts go to `/templates`

**WordPress styletheme modifications are added to the partials folders**

If you are modifying a plugin's CSS, eg. GravityForms, simply:
- Add a _gforms.scss file to partials
- Add the import to partials/_index.scss
- And head the _gforms.scss file with the appropriate selector

## Deployment
- The Dev branch is automatically deployed to the UCFCard Dev environment
- The Master branch is automatically deployed to the UCFCard QA environment
- *Deployment to production is done manually via Jenkins using release versions*
- **Be sure to update the style.css with the version on new releases.**

## Features
- Sass linting (based on [default](https://github.com/sasstools/sass-lint/blob/master/lib/config/sass-lint.yml) config)
- Autoprefixer configuration
- SMACSS and Atomic Design-based folder structure
- `px` to `em`, `px` to `rem` and other useful functions.
- Mixins for inlining media queries.
* Useful CSS helper classes.
* Default print styles, performance optimized.
* "Delete-key friendly." Easy to strip out parts you don't need.

## Dependencies
```
  "colors": "^1.1.2",
  "del": "^2.0.2",
  "gulp-autoprefixer": "^2.1.0",
  "gulp-rename": "^1.2.0",
  "gulp-sass": "^1.3.2",
  "gulp-sass-lint": "1.0.1",
  "gulp-sourcemaps": "^1.5.2",
  "sassdoc": "^2.1.15",
  "vinyl-paths": "^2.0.0"
```

## Tasks
- styles
- sass-lint
- watch
- default
  - styles
  - watch
- build
  - styles