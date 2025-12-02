# Changelog

## [0.10.4](https://github.com/ehmpathy/simple-lambda-handlers/compare/v0.10.3...v0.10.4) (2025-12-02)


### Bug Fixes

* **4xx:** identify bad requests that extend bad request error cross package ([#44](https://github.com/ehmpathy/simple-lambda-handlers/issues/44)) ([43c5a86](https://github.com/ehmpathy/simple-lambda-handlers/commit/43c5a8686afbab5f69e2a8b19376b1bc7f65368f))

## [0.10.3](https://github.com/ehmpathy/simple-lambda-handlers/compare/v0.10.2...v0.10.3) (2025-11-28)


### Bug Fixes

* **practs:** bump to latest best ([18a24a1](https://github.com/ehmpathy/simple-lambda-handlers/commit/18a24a1e6bcc113bda7e5a2ebf0d2ba323baf910))

## [0.10.2](https://github.com/ehmpathy/simple-lambda-handlers/compare/v0.10.1...v0.10.2) (2025-11-28)


### Bug Fixes

* **pkg:** forward middy export to eliminate not-portable tsc errors ([1c62936](https://github.com/ehmpathy/simple-lambda-handlers/commit/1c62936d95f3fe1be48f8cb818e8e2239b59dfd5))

## [0.10.1](https://github.com/ehmpathy/simple-lambda-handlers/compare/v0.10.0...v0.10.1) (2025-11-13)


### Bug Fixes

* **logs:** ensure partial log transformer choices are respected ([9586fbe](https://github.com/ehmpathy/simple-lambda-handlers/commit/9586fbeb7f909ccf6f3e227e1b573344aa9098f3))

## [0.10.0](https://github.com/ehmpathy/simple-lambda-handlers/compare/v0.9.2...v0.10.0) (2025-11-12)


### Features

* **logs:** enable translation of input and output debug logs before emission ([831d935](https://github.com/ehmpathy/simple-lambda-handlers/commit/831d93552a3d997e53ba5481addda7bbc8ddf226))


### Bug Fixes

* **cicd:** bump ghactions runners ([728ae17](https://github.com/ehmpathy/simple-lambda-handlers/commit/728ae17c0af51a529a375002663f9c3dbe5f22f2))
* **deps:** npm audit fix ([a45464e](https://github.com/ehmpathy/simple-lambda-handlers/commit/a45464e39df7269278984c3e13d5f4e078416a0f))
* **practs:** bump to latest best ([1bc7b50](https://github.com/ehmpathy/simple-lambda-handlers/commit/1bc7b5007c6d3bcabc2a0e3a07fe98b016435d23))

## [0.9.2](https://github.com/ehmpathy/simple-lambda-handlers/compare/v0.9.1...v0.9.2) (2024-08-18)


### Bug Fixes

* **logs:** expose error.cause message and trace if available ([de0f3f5](https://github.com/ehmpathy/simple-lambda-handlers/commit/de0f3f52a8e6ab269e218d388184b9a1ce4425f1))

## [0.9.1](https://github.com/ehmpathy/simple-lambda-handlers/compare/v0.9.0...v0.9.1) (2024-07-06)


### Bug Fixes

* **errors:** support bad request errors from any package ([dca5539](https://github.com/ehmpathy/simple-lambda-handlers/commit/dca55390505f76f804c7625ce364392ae7c9943d))

## [0.9.0](https://github.com/ehmpathy/simple-lambda-handlers/compare/v0.8.5...v0.9.0) (2023-09-16)


### Features

* **errors:** use standard ehmpathy error-fns library for bad-request-error ([44cc2cb](https://github.com/ehmpathy/simple-lambda-handlers/commit/44cc2cb8d3d511bacf08856310b39337db265f14))


### Bug Fixes

* **types:** add type safety to multiValueHeaders output ([4063d98](https://github.com/ehmpathy/simple-lambda-handlers/commit/4063d9838c300a459bf9db1f3fbc354bf7a106b5))

## [0.8.5](https://github.com/ehmpathy/simple-lambda-handlers/compare/v0.8.4...v0.8.5) (2023-08-07)


### Bug Fixes

* **practs:** use latest best practices and resolve audit ([5d345c5](https://github.com/ehmpathy/simple-lambda-handlers/commit/5d345c53792da2e4dfe1a864dfc4afc5f4d10316))
* **types:** ensure input and output types are generic to passthrough ([4de8521](https://github.com/ehmpathy/simple-lambda-handlers/commit/4de8521189fe249cc8d7b1e6cf1c6ada00b8c82a))

### [0.8.4](https://www.github.com/uladkasach/simple-lambda-handlers/compare/v0.8.3...v0.8.4) (2022-02-21)


### Bug Fixes

* **api-gateway:** normalize httpMethod arg onto event shape between v1 and v2 api gateway ([172b0eb](https://www.github.com/uladkasach/simple-lambda-handlers/commit/172b0eb8a934aa3b941c6c9d9ecc597b0d24563d))

### [0.8.3](https://www.github.com/uladkasach/simple-lambda-handlers/compare/v0.8.2...v0.8.3) (2022-02-18)


### Bug Fixes

* **api-gateway:** ensure that lambda event validation error does not leak sensitive metadata ([#22](https://www.github.com/uladkasach/simple-lambda-handlers/issues/22)) ([95fa89a](https://www.github.com/uladkasach/simple-lambda-handlers/commit/95fa89aaf1c9ac2f7c564286728fea4399075ae5))

### [0.8.2](https://www.github.com/uladkasach/simple-lambda-handlers/compare/v0.8.1...v0.8.2) (2022-02-18)


### Bug Fixes

* **size:** remove aws-lambda and aws-sdk from dependencies ([fc27f10](https://www.github.com/uladkasach/simple-lambda-handlers/commit/fc27f10909984593c7abba49ce87f20c118d17ff))

### [0.8.1](https://www.github.com/uladkasach/simple-lambda-handlers/compare/v0.8.0...v0.8.1) (2022-02-18)


### Bug Fixes

* **types:** ensure that v17+ joi event schema types supported ([#19](https://www.github.com/uladkasach/simple-lambda-handlers/issues/19)) ([0033a91](https://www.github.com/uladkasach/simple-lambda-handlers/commit/0033a91caf0cf679db954e726cda70155d11fe4b))

## [0.8.0](https://www.github.com/uladkasach/simple-lambda-handlers/compare/v0.7.0...v0.8.0) (2022-02-16)


### Features

* **normalization:** normalize path arg onto event shape between v1 and v2 api gateway ([#17](https://www.github.com/uladkasach/simple-lambda-handlers/issues/17)) ([33adfb1](https://www.github.com/uladkasach/simple-lambda-handlers/commit/33adfb1ce23b9b86d1314e89b8ca4ea5d960f57e))

## [0.7.0](https://www.github.com/uladkasach/simple-lambda-handlers/compare/v0.6.0...v0.7.0) (2022-02-11)


### Features

* **api-gateway:** expose well doc'd enumeration of http status codes ([f4b4a4a](https://www.github.com/uladkasach/simple-lambda-handlers/commit/f4b4a4a04855dfd4ca173b1ca154f5af4b600c3c))


### Bug Fixes

* **doc:** update jsdoc comment of BadRequestError for clarity ([42df968](https://www.github.com/uladkasach/simple-lambda-handlers/commit/42df96813c1e53f6e6f45cf6575c3a6a83a21acb))

## [0.6.0](https://www.github.com/uladkasach/simple-lambda-handlers/compare/v0.5.0...v0.6.0) (2021-12-16)


### Features

* **contract:** add optional metadata param to BadRequestError ([fa4a328](https://www.github.com/uladkasach/simple-lambda-handlers/commit/fa4a328ddfd5b70371d070cb1185b9b411339a89))


### Bug Fixes

* **contract:** ensure that bad-request-error message does not change w/ old usage ([8533455](https://www.github.com/uladkasach/simple-lambda-handlers/commit/85334559244b7c5db1420bfd599dc48e9e841765))
* **deps:** remove unnessesary dev dep causing ci build errors ([f8117f9](https://www.github.com/uladkasach/simple-lambda-handlers/commit/f8117f9cfcdd4c1a96d53fc5723a30a20c38b7f0))
