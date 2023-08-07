# Changelog

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
