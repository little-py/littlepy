# LittlePy: Online Python Compiler and Execution Environment

[![pipeline status](https://gitlab.com/littlepy/littlepy/badges/master/pipeline.svg)](https://gitlab.com/littlepy/littlepy/commits/master)
[![coverage report](https://gitlab.com/littlepy/littlepy/badges/master/coverage.svg)](https://gitlab.com/littlepy/littlepy/commits/master)
[![npm](https://img.shields.io/npm/v/littlepy)](https://www.npmjs.com/package/littlepy)

* Python 3 Language Compiler and Execution Environment written in TypeScript (JavaScript)
* Zero external dependencies
* High code quality: more than 90% of the code is covered by tests
* Written from scratch, it is not a port of existing implementation
* LittlePy main purpose is for learning Python, but it can also be used as a safe scripting engine or whatever you need
* Of course it is free of charge
* Every error message points you to unique place in source code which means there are no generic errors
* Locale-independent: all error messages are just identifiers, each message can be translated to any language 
* It is core Python implementation without Python libraries
* Playground: https://littlepy.gitlab.io/littlepy-example (source code: https://gitlab.com/littlepy/littlepy-example)
* Supports external JavaScript code integration
* It is easy to build debug environment based on it (see the example above)

> You can view tests to see which features are covered. It is mostly all Python 3 features except async and complex types.
