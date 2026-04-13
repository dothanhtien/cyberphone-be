'use strict';

customElements.define('compodoc-menu', class extends HTMLElement {
    constructor() {
        super();
        this.isNormalMode = this.getAttribute('mode') === 'normal';
    }

    connectedCallback() {
        this.render(this.isNormalMode);
    }

    render(isNormalMode) {
        let tp = lithtml.html(`
        <nav>
            <ul class="list">
                <li class="title">
                    <a href="index.html" data-type="index-link">cyberphone-be</a>
                </li>

                <li class="divider"></li>
                ${ isNormalMode ? `<div id="book-search-input" role="search"><input type="text" placeholder="Type to search"></div>` : '' }
                <li class="chapter">
                    <a data-type="chapter-link" href="index.html"><span class="icon ion-ios-home"></span>Getting started</a>
                    <ul class="links">
                                <li class="link">
                                    <a href="overview.html" data-type="chapter-link">
                                        <span class="icon ion-ios-keypad"></span>Overview
                                    </a>
                                </li>

                            <li class="link">
                                <a href="index.html" data-type="chapter-link">
                                    <span class="icon ion-ios-paper"></span>
                                        README
                                </a>
                            </li>
                                <li class="link">
                                    <a href="dependencies.html" data-type="chapter-link">
                                        <span class="icon ion-ios-list"></span>Dependencies
                                    </a>
                                </li>
                                <li class="link">
                                    <a href="properties.html" data-type="chapter-link">
                                        <span class="icon ion-ios-apps"></span>Properties
                                    </a>
                                </li>

                    </ul>
                </li>
                    <li class="chapter modules">
                        <a data-type="chapter-link" href="modules.html">
                            <div class="menu-toggler linked" data-bs-toggle="collapse" ${ isNormalMode ?
                                'data-bs-target="#modules-links"' : 'data-bs-target="#xs-modules-links"' }>
                                <span class="icon ion-ios-archive"></span>
                                <span class="link-name">Modules</span>
                                <span class="icon ion-ios-arrow-down"></span>
                            </div>
                        </a>
                        <ul class="links collapse " ${ isNormalMode ? 'id="modules-links"' : 'id="xs-modules-links"' }>
                            <li class="link">
                                <a href="modules/AppModule.html" data-type="entity-link" >AppModule</a>
                                    <li class="chapter inner">
                                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                            'data-bs-target="#controllers-links-module-AppModule-271f6133c6c6a02e01d2c93cb007dcebce467c2e717a505fd4dacb887d15db2d21e29a1a0092a710a34cb324ee8eaeeba243a1863b0cb3619c1026e37e3150e0"' : 'data-bs-target="#xs-controllers-links-module-AppModule-271f6133c6c6a02e01d2c93cb007dcebce467c2e717a505fd4dacb887d15db2d21e29a1a0092a710a34cb324ee8eaeeba243a1863b0cb3619c1026e37e3150e0"' }>
                                            <span class="icon ion-md-swap"></span>
                                            <span>Controllers</span>
                                            <span class="icon ion-ios-arrow-down"></span>
                                        </div>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="controllers-links-module-AppModule-271f6133c6c6a02e01d2c93cb007dcebce467c2e717a505fd4dacb887d15db2d21e29a1a0092a710a34cb324ee8eaeeba243a1863b0cb3619c1026e37e3150e0"' :
                                            'id="xs-controllers-links-module-AppModule-271f6133c6c6a02e01d2c93cb007dcebce467c2e717a505fd4dacb887d15db2d21e29a1a0092a710a34cb324ee8eaeeba243a1863b0cb3619c1026e37e3150e0"' }>
                                            <li class="link">
                                                <a href="controllers/AppController.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >AppController</a>
                                            </li>
                                        </ul>
                                    </li>
                                <li class="chapter inner">
                                    <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                        'data-bs-target="#injectables-links-module-AppModule-271f6133c6c6a02e01d2c93cb007dcebce467c2e717a505fd4dacb887d15db2d21e29a1a0092a710a34cb324ee8eaeeba243a1863b0cb3619c1026e37e3150e0"' : 'data-bs-target="#xs-injectables-links-module-AppModule-271f6133c6c6a02e01d2c93cb007dcebce467c2e717a505fd4dacb887d15db2d21e29a1a0092a710a34cb324ee8eaeeba243a1863b0cb3619c1026e37e3150e0"' }>
                                        <span class="icon ion-md-arrow-round-down"></span>
                                        <span>Injectables</span>
                                        <span class="icon ion-ios-arrow-down"></span>
                                    </div>
                                    <ul class="links collapse" ${ isNormalMode ? 'id="injectables-links-module-AppModule-271f6133c6c6a02e01d2c93cb007dcebce467c2e717a505fd4dacb887d15db2d21e29a1a0092a710a34cb324ee8eaeeba243a1863b0cb3619c1026e37e3150e0"' :
                                        'id="xs-injectables-links-module-AppModule-271f6133c6c6a02e01d2c93cb007dcebce467c2e717a505fd4dacb887d15db2d21e29a1a0092a710a34cb324ee8eaeeba243a1863b0cb3619c1026e37e3150e0"' }>
                                        <li class="link">
                                            <a href="injectables/AppService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >AppService</a>
                                        </li>
                                    </ul>
                                </li>
                            </li>
                            <li class="link">
                                <a href="modules/AuthModule.html" data-type="entity-link" >AuthModule</a>
                                    <li class="chapter inner">
                                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                            'data-bs-target="#controllers-links-module-AuthModule-ee90af108b541da88e5b80e526d60245ce8d7ec8b847c2697933c3c8fcb65e971dba3c314b0ba752c3b817e9479fe4925141952032de5495c17e0d438d8c3207"' : 'data-bs-target="#xs-controllers-links-module-AuthModule-ee90af108b541da88e5b80e526d60245ce8d7ec8b847c2697933c3c8fcb65e971dba3c314b0ba752c3b817e9479fe4925141952032de5495c17e0d438d8c3207"' }>
                                            <span class="icon ion-md-swap"></span>
                                            <span>Controllers</span>
                                            <span class="icon ion-ios-arrow-down"></span>
                                        </div>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="controllers-links-module-AuthModule-ee90af108b541da88e5b80e526d60245ce8d7ec8b847c2697933c3c8fcb65e971dba3c314b0ba752c3b817e9479fe4925141952032de5495c17e0d438d8c3207"' :
                                            'id="xs-controllers-links-module-AuthModule-ee90af108b541da88e5b80e526d60245ce8d7ec8b847c2697933c3c8fcb65e971dba3c314b0ba752c3b817e9479fe4925141952032de5495c17e0d438d8c3207"' }>
                                            <li class="link">
                                                <a href="controllers/AuthController.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >AuthController</a>
                                            </li>
                                        </ul>
                                    </li>
                                <li class="chapter inner">
                                    <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                        'data-bs-target="#injectables-links-module-AuthModule-ee90af108b541da88e5b80e526d60245ce8d7ec8b847c2697933c3c8fcb65e971dba3c314b0ba752c3b817e9479fe4925141952032de5495c17e0d438d8c3207"' : 'data-bs-target="#xs-injectables-links-module-AuthModule-ee90af108b541da88e5b80e526d60245ce8d7ec8b847c2697933c3c8fcb65e971dba3c314b0ba752c3b817e9479fe4925141952032de5495c17e0d438d8c3207"' }>
                                        <span class="icon ion-md-arrow-round-down"></span>
                                        <span>Injectables</span>
                                        <span class="icon ion-ios-arrow-down"></span>
                                    </div>
                                    <ul class="links collapse" ${ isNormalMode ? 'id="injectables-links-module-AuthModule-ee90af108b541da88e5b80e526d60245ce8d7ec8b847c2697933c3c8fcb65e971dba3c314b0ba752c3b817e9479fe4925141952032de5495c17e0d438d8c3207"' :
                                        'id="xs-injectables-links-module-AuthModule-ee90af108b541da88e5b80e526d60245ce8d7ec8b847c2697933c3c8fcb65e971dba3c314b0ba752c3b817e9479fe4925141952032de5495c17e0d438d8c3207"' }>
                                        <li class="link">
                                            <a href="injectables/AuthService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >AuthService</a>
                                        </li>
                                        <li class="link">
                                            <a href="injectables/JwtAuthGuard.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >JwtAuthGuard</a>
                                        </li>
                                        <li class="link">
                                            <a href="injectables/JwtStrategy.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >JwtStrategy</a>
                                        </li>
                                        <li class="link">
                                            <a href="injectables/LocalStrategy.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >LocalStrategy</a>
                                        </li>
                                        <li class="link">
                                            <a href="injectables/RefreshTokenRepository.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >RefreshTokenRepository</a>
                                        </li>
                                        <li class="link">
                                            <a href="injectables/RefreshTokenService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >RefreshTokenService</a>
                                        </li>
                                    </ul>
                                </li>
                            </li>
                            <li class="link">
                                <a href="modules/BrandsModule.html" data-type="entity-link" >BrandsModule</a>
                                    <li class="chapter inner">
                                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                            'data-bs-target="#controllers-links-module-BrandsModule-eb93eec0a5ed94af2ab32f8f88df628ba4c30c5c789e24d00a3f746bf207b0da157232d724a4ff1eda86ae5aa2a1cae0c715cc3ec8803a80351b8a59c1c3d15f"' : 'data-bs-target="#xs-controllers-links-module-BrandsModule-eb93eec0a5ed94af2ab32f8f88df628ba4c30c5c789e24d00a3f746bf207b0da157232d724a4ff1eda86ae5aa2a1cae0c715cc3ec8803a80351b8a59c1c3d15f"' }>
                                            <span class="icon ion-md-swap"></span>
                                            <span>Controllers</span>
                                            <span class="icon ion-ios-arrow-down"></span>
                                        </div>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="controllers-links-module-BrandsModule-eb93eec0a5ed94af2ab32f8f88df628ba4c30c5c789e24d00a3f746bf207b0da157232d724a4ff1eda86ae5aa2a1cae0c715cc3ec8803a80351b8a59c1c3d15f"' :
                                            'id="xs-controllers-links-module-BrandsModule-eb93eec0a5ed94af2ab32f8f88df628ba4c30c5c789e24d00a3f746bf207b0da157232d724a4ff1eda86ae5aa2a1cae0c715cc3ec8803a80351b8a59c1c3d15f"' }>
                                            <li class="link">
                                                <a href="controllers/BrandsController.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >BrandsController</a>
                                            </li>
                                        </ul>
                                    </li>
                                <li class="chapter inner">
                                    <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                        'data-bs-target="#injectables-links-module-BrandsModule-eb93eec0a5ed94af2ab32f8f88df628ba4c30c5c789e24d00a3f746bf207b0da157232d724a4ff1eda86ae5aa2a1cae0c715cc3ec8803a80351b8a59c1c3d15f"' : 'data-bs-target="#xs-injectables-links-module-BrandsModule-eb93eec0a5ed94af2ab32f8f88df628ba4c30c5c789e24d00a3f746bf207b0da157232d724a4ff1eda86ae5aa2a1cae0c715cc3ec8803a80351b8a59c1c3d15f"' }>
                                        <span class="icon ion-md-arrow-round-down"></span>
                                        <span>Injectables</span>
                                        <span class="icon ion-ios-arrow-down"></span>
                                    </div>
                                    <ul class="links collapse" ${ isNormalMode ? 'id="injectables-links-module-BrandsModule-eb93eec0a5ed94af2ab32f8f88df628ba4c30c5c789e24d00a3f746bf207b0da157232d724a4ff1eda86ae5aa2a1cae0c715cc3ec8803a80351b8a59c1c3d15f"' :
                                        'id="xs-injectables-links-module-BrandsModule-eb93eec0a5ed94af2ab32f8f88df628ba4c30c5c789e24d00a3f746bf207b0da157232d724a4ff1eda86ae5aa2a1cae0c715cc3ec8803a80351b8a59c1c3d15f"' }>
                                        <li class="link">
                                            <a href="injectables/BrandsService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >BrandsService</a>
                                        </li>
                                    </ul>
                                </li>
                            </li>
                            <li class="link">
                                <a href="modules/CartsModule.html" data-type="entity-link" >CartsModule</a>
                                    <li class="chapter inner">
                                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                            'data-bs-target="#controllers-links-module-CartsModule-cd7608570628b3bd002b48a1cc2ea4d7882f8a59b43e88015660fe9f0acb01483ecf4d46e90e2a6f2fac202c264fce14b047f1ae262b87e10fdd848d7914dd69"' : 'data-bs-target="#xs-controllers-links-module-CartsModule-cd7608570628b3bd002b48a1cc2ea4d7882f8a59b43e88015660fe9f0acb01483ecf4d46e90e2a6f2fac202c264fce14b047f1ae262b87e10fdd848d7914dd69"' }>
                                            <span class="icon ion-md-swap"></span>
                                            <span>Controllers</span>
                                            <span class="icon ion-ios-arrow-down"></span>
                                        </div>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="controllers-links-module-CartsModule-cd7608570628b3bd002b48a1cc2ea4d7882f8a59b43e88015660fe9f0acb01483ecf4d46e90e2a6f2fac202c264fce14b047f1ae262b87e10fdd848d7914dd69"' :
                                            'id="xs-controllers-links-module-CartsModule-cd7608570628b3bd002b48a1cc2ea4d7882f8a59b43e88015660fe9f0acb01483ecf4d46e90e2a6f2fac202c264fce14b047f1ae262b87e10fdd848d7914dd69"' }>
                                            <li class="link">
                                                <a href="controllers/StorefrontCartsController.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >StorefrontCartsController</a>
                                            </li>
                                        </ul>
                                    </li>
                                <li class="chapter inner">
                                    <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                        'data-bs-target="#injectables-links-module-CartsModule-cd7608570628b3bd002b48a1cc2ea4d7882f8a59b43e88015660fe9f0acb01483ecf4d46e90e2a6f2fac202c264fce14b047f1ae262b87e10fdd848d7914dd69"' : 'data-bs-target="#xs-injectables-links-module-CartsModule-cd7608570628b3bd002b48a1cc2ea4d7882f8a59b43e88015660fe9f0acb01483ecf4d46e90e2a6f2fac202c264fce14b047f1ae262b87e10fdd848d7914dd69"' }>
                                        <span class="icon ion-md-arrow-round-down"></span>
                                        <span>Injectables</span>
                                        <span class="icon ion-ios-arrow-down"></span>
                                    </div>
                                    <ul class="links collapse" ${ isNormalMode ? 'id="injectables-links-module-CartsModule-cd7608570628b3bd002b48a1cc2ea4d7882f8a59b43e88015660fe9f0acb01483ecf4d46e90e2a6f2fac202c264fce14b047f1ae262b87e10fdd848d7914dd69"' :
                                        'id="xs-injectables-links-module-CartsModule-cd7608570628b3bd002b48a1cc2ea4d7882f8a59b43e88015660fe9f0acb01483ecf4d46e90e2a6f2fac202c264fce14b047f1ae262b87e10fdd848d7914dd69"' }>
                                        <li class="link">
                                            <a href="injectables/CartItemRepository.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >CartItemRepository</a>
                                        </li>
                                        <li class="link">
                                            <a href="injectables/CartRepository.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >CartRepository</a>
                                        </li>
                                        <li class="link">
                                            <a href="injectables/StorefrontCartsService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >StorefrontCartsService</a>
                                        </li>
                                    </ul>
                                </li>
                            </li>
                            <li class="link">
                                <a href="modules/CategoriesModule.html" data-type="entity-link" >CategoriesModule</a>
                                    <li class="chapter inner">
                                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                            'data-bs-target="#controllers-links-module-CategoriesModule-8dd551a288e3b0a6e21694ef58ee3c47e3b481bfcde7fd3578c00e6d4186a06a9a8f0e0d4f0af4ec09f9c1e64ac4076c3be23a7f97a40ec62cb21faddc9694aa"' : 'data-bs-target="#xs-controllers-links-module-CategoriesModule-8dd551a288e3b0a6e21694ef58ee3c47e3b481bfcde7fd3578c00e6d4186a06a9a8f0e0d4f0af4ec09f9c1e64ac4076c3be23a7f97a40ec62cb21faddc9694aa"' }>
                                            <span class="icon ion-md-swap"></span>
                                            <span>Controllers</span>
                                            <span class="icon ion-ios-arrow-down"></span>
                                        </div>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="controllers-links-module-CategoriesModule-8dd551a288e3b0a6e21694ef58ee3c47e3b481bfcde7fd3578c00e6d4186a06a9a8f0e0d4f0af4ec09f9c1e64ac4076c3be23a7f97a40ec62cb21faddc9694aa"' :
                                            'id="xs-controllers-links-module-CategoriesModule-8dd551a288e3b0a6e21694ef58ee3c47e3b481bfcde7fd3578c00e6d4186a06a9a8f0e0d4f0af4ec09f9c1e64ac4076c3be23a7f97a40ec62cb21faddc9694aa"' }>
                                            <li class="link">
                                                <a href="controllers/CategoriesController.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >CategoriesController</a>
                                            </li>
                                        </ul>
                                    </li>
                                <li class="chapter inner">
                                    <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                        'data-bs-target="#injectables-links-module-CategoriesModule-8dd551a288e3b0a6e21694ef58ee3c47e3b481bfcde7fd3578c00e6d4186a06a9a8f0e0d4f0af4ec09f9c1e64ac4076c3be23a7f97a40ec62cb21faddc9694aa"' : 'data-bs-target="#xs-injectables-links-module-CategoriesModule-8dd551a288e3b0a6e21694ef58ee3c47e3b481bfcde7fd3578c00e6d4186a06a9a8f0e0d4f0af4ec09f9c1e64ac4076c3be23a7f97a40ec62cb21faddc9694aa"' }>
                                        <span class="icon ion-md-arrow-round-down"></span>
                                        <span>Injectables</span>
                                        <span class="icon ion-ios-arrow-down"></span>
                                    </div>
                                    <ul class="links collapse" ${ isNormalMode ? 'id="injectables-links-module-CategoriesModule-8dd551a288e3b0a6e21694ef58ee3c47e3b481bfcde7fd3578c00e6d4186a06a9a8f0e0d4f0af4ec09f9c1e64ac4076c3be23a7f97a40ec62cb21faddc9694aa"' :
                                        'id="xs-injectables-links-module-CategoriesModule-8dd551a288e3b0a6e21694ef58ee3c47e3b481bfcde7fd3578c00e6d4186a06a9a8f0e0d4f0af4ec09f9c1e64ac4076c3be23a7f97a40ec62cb21faddc9694aa"' }>
                                        <li class="link">
                                            <a href="injectables/CategoriesService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >CategoriesService</a>
                                        </li>
                                    </ul>
                                </li>
                            </li>
                            <li class="link">
                                <a href="modules/CloudinaryModule.html" data-type="entity-link" >CloudinaryModule</a>
                                <li class="chapter inner">
                                    <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                        'data-bs-target="#injectables-links-module-CloudinaryModule-696094646b1018f746a16d2585c0a4b063cfd919c5d929e2d92ca36208ddd765738ae0d6d30d3a2a1289b2237b324bfabbb9348233bc5718e9a8e00e5d590070"' : 'data-bs-target="#xs-injectables-links-module-CloudinaryModule-696094646b1018f746a16d2585c0a4b063cfd919c5d929e2d92ca36208ddd765738ae0d6d30d3a2a1289b2237b324bfabbb9348233bc5718e9a8e00e5d590070"' }>
                                        <span class="icon ion-md-arrow-round-down"></span>
                                        <span>Injectables</span>
                                        <span class="icon ion-ios-arrow-down"></span>
                                    </div>
                                    <ul class="links collapse" ${ isNormalMode ? 'id="injectables-links-module-CloudinaryModule-696094646b1018f746a16d2585c0a4b063cfd919c5d929e2d92ca36208ddd765738ae0d6d30d3a2a1289b2237b324bfabbb9348233bc5718e9a8e00e5d590070"' :
                                        'id="xs-injectables-links-module-CloudinaryModule-696094646b1018f746a16d2585c0a4b063cfd919c5d929e2d92ca36208ddd765738ae0d6d30d3a2a1289b2237b324bfabbb9348233bc5718e9a8e00e5d590070"' }>
                                        <li class="link">
                                            <a href="injectables/CloudinaryService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >CloudinaryService</a>
                                        </li>
                                    </ul>
                                </li>
                            </li>
                            <li class="link">
                                <a href="modules/CustomersModule.html" data-type="entity-link" >CustomersModule</a>
                                <li class="chapter inner">
                                    <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                        'data-bs-target="#injectables-links-module-CustomersModule-141f3bcdded193e80dfc518e0d9d9ef6309ee2b3ac5e7283d35df810883acfe360be9c8f8e6336aef984579f5d0956cd5f04ef17088d3f98e6da7feb0377d681"' : 'data-bs-target="#xs-injectables-links-module-CustomersModule-141f3bcdded193e80dfc518e0d9d9ef6309ee2b3ac5e7283d35df810883acfe360be9c8f8e6336aef984579f5d0956cd5f04ef17088d3f98e6da7feb0377d681"' }>
                                        <span class="icon ion-md-arrow-round-down"></span>
                                        <span>Injectables</span>
                                        <span class="icon ion-ios-arrow-down"></span>
                                    </div>
                                    <ul class="links collapse" ${ isNormalMode ? 'id="injectables-links-module-CustomersModule-141f3bcdded193e80dfc518e0d9d9ef6309ee2b3ac5e7283d35df810883acfe360be9c8f8e6336aef984579f5d0956cd5f04ef17088d3f98e6da7feb0377d681"' :
                                        'id="xs-injectables-links-module-CustomersModule-141f3bcdded193e80dfc518e0d9d9ef6309ee2b3ac5e7283d35df810883acfe360be9c8f8e6336aef984579f5d0956cd5f04ef17088d3f98e6da7feb0377d681"' }>
                                        <li class="link">
                                            <a href="injectables/CustomerRepository.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >CustomerRepository</a>
                                        </li>
                                        <li class="link">
                                            <a href="injectables/CustomersService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >CustomersService</a>
                                        </li>
                                    </ul>
                                </li>
                            </li>
                            <li class="link">
                                <a href="modules/DashboardModule.html" data-type="entity-link" >DashboardModule</a>
                                    <li class="chapter inner">
                                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                            'data-bs-target="#controllers-links-module-DashboardModule-b55044a364991e12932ce2bcab956eea18ae0e43819cbe0f23a5e54682ae661392b90da89f450a939e93256ca50c9fb7729e8075264629026805cb4b14bc31b2"' : 'data-bs-target="#xs-controllers-links-module-DashboardModule-b55044a364991e12932ce2bcab956eea18ae0e43819cbe0f23a5e54682ae661392b90da89f450a939e93256ca50c9fb7729e8075264629026805cb4b14bc31b2"' }>
                                            <span class="icon ion-md-swap"></span>
                                            <span>Controllers</span>
                                            <span class="icon ion-ios-arrow-down"></span>
                                        </div>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="controllers-links-module-DashboardModule-b55044a364991e12932ce2bcab956eea18ae0e43819cbe0f23a5e54682ae661392b90da89f450a939e93256ca50c9fb7729e8075264629026805cb4b14bc31b2"' :
                                            'id="xs-controllers-links-module-DashboardModule-b55044a364991e12932ce2bcab956eea18ae0e43819cbe0f23a5e54682ae661392b90da89f450a939e93256ca50c9fb7729e8075264629026805cb4b14bc31b2"' }>
                                            <li class="link">
                                                <a href="controllers/DashboardController.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >DashboardController</a>
                                            </li>
                                        </ul>
                                    </li>
                                <li class="chapter inner">
                                    <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                        'data-bs-target="#injectables-links-module-DashboardModule-b55044a364991e12932ce2bcab956eea18ae0e43819cbe0f23a5e54682ae661392b90da89f450a939e93256ca50c9fb7729e8075264629026805cb4b14bc31b2"' : 'data-bs-target="#xs-injectables-links-module-DashboardModule-b55044a364991e12932ce2bcab956eea18ae0e43819cbe0f23a5e54682ae661392b90da89f450a939e93256ca50c9fb7729e8075264629026805cb4b14bc31b2"' }>
                                        <span class="icon ion-md-arrow-round-down"></span>
                                        <span>Injectables</span>
                                        <span class="icon ion-ios-arrow-down"></span>
                                    </div>
                                    <ul class="links collapse" ${ isNormalMode ? 'id="injectables-links-module-DashboardModule-b55044a364991e12932ce2bcab956eea18ae0e43819cbe0f23a5e54682ae661392b90da89f450a939e93256ca50c9fb7729e8075264629026805cb4b14bc31b2"' :
                                        'id="xs-injectables-links-module-DashboardModule-b55044a364991e12932ce2bcab956eea18ae0e43819cbe0f23a5e54682ae661392b90da89f450a939e93256ca50c9fb7729e8075264629026805cb4b14bc31b2"' }>
                                        <li class="link">
                                            <a href="injectables/DashboardService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >DashboardService</a>
                                        </li>
                                    </ul>
                                </li>
                            </li>
                            <li class="link">
                                <a href="modules/DatabaseModule.html" data-type="entity-link" >DatabaseModule</a>
                            </li>
                            <li class="link">
                                <a href="modules/IdentitiesModule.html" data-type="entity-link" >IdentitiesModule</a>
                                <li class="chapter inner">
                                    <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                        'data-bs-target="#injectables-links-module-IdentitiesModule-b4fd34e5ba21ff4106b50b3193e43d4980edd94422efd5c20495b4bd491592ca10afdcf7852b24be90ea89b69d20ed771082d3c601cbd413033cc7e566859bd4"' : 'data-bs-target="#xs-injectables-links-module-IdentitiesModule-b4fd34e5ba21ff4106b50b3193e43d4980edd94422efd5c20495b4bd491592ca10afdcf7852b24be90ea89b69d20ed771082d3c601cbd413033cc7e566859bd4"' }>
                                        <span class="icon ion-md-arrow-round-down"></span>
                                        <span>Injectables</span>
                                        <span class="icon ion-ios-arrow-down"></span>
                                    </div>
                                    <ul class="links collapse" ${ isNormalMode ? 'id="injectables-links-module-IdentitiesModule-b4fd34e5ba21ff4106b50b3193e43d4980edd94422efd5c20495b4bd491592ca10afdcf7852b24be90ea89b69d20ed771082d3c601cbd413033cc7e566859bd4"' :
                                        'id="xs-injectables-links-module-IdentitiesModule-b4fd34e5ba21ff4106b50b3193e43d4980edd94422efd5c20495b4bd491592ca10afdcf7852b24be90ea89b69d20ed771082d3c601cbd413033cc7e566859bd4"' }>
                                        <li class="link">
                                            <a href="injectables/IdentitiesService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >IdentitiesService</a>
                                        </li>
                                        <li class="link">
                                            <a href="injectables/IdentityRepository.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >IdentityRepository</a>
                                        </li>
                                    </ul>
                                </li>
                            </li>
                            <li class="link">
                                <a href="modules/MediaModule.html" data-type="entity-link" >MediaModule</a>
                                    <li class="chapter inner">
                                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                            'data-bs-target="#controllers-links-module-MediaModule-d59939db5d8dc24053102c3a6d9cf79f95d72bbc50faceb439371ac5a0dc2b3576c68d4f6727e8da304bfa780416bc02442c0f4826739219c06573c818014c3a"' : 'data-bs-target="#xs-controllers-links-module-MediaModule-d59939db5d8dc24053102c3a6d9cf79f95d72bbc50faceb439371ac5a0dc2b3576c68d4f6727e8da304bfa780416bc02442c0f4826739219c06573c818014c3a"' }>
                                            <span class="icon ion-md-swap"></span>
                                            <span>Controllers</span>
                                            <span class="icon ion-ios-arrow-down"></span>
                                        </div>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="controllers-links-module-MediaModule-d59939db5d8dc24053102c3a6d9cf79f95d72bbc50faceb439371ac5a0dc2b3576c68d4f6727e8da304bfa780416bc02442c0f4826739219c06573c818014c3a"' :
                                            'id="xs-controllers-links-module-MediaModule-d59939db5d8dc24053102c3a6d9cf79f95d72bbc50faceb439371ac5a0dc2b3576c68d4f6727e8da304bfa780416bc02442c0f4826739219c06573c818014c3a"' }>
                                            <li class="link">
                                                <a href="controllers/MediaController.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >MediaController</a>
                                            </li>
                                        </ul>
                                    </li>
                                <li class="chapter inner">
                                    <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                        'data-bs-target="#injectables-links-module-MediaModule-d59939db5d8dc24053102c3a6d9cf79f95d72bbc50faceb439371ac5a0dc2b3576c68d4f6727e8da304bfa780416bc02442c0f4826739219c06573c818014c3a"' : 'data-bs-target="#xs-injectables-links-module-MediaModule-d59939db5d8dc24053102c3a6d9cf79f95d72bbc50faceb439371ac5a0dc2b3576c68d4f6727e8da304bfa780416bc02442c0f4826739219c06573c818014c3a"' }>
                                        <span class="icon ion-md-arrow-round-down"></span>
                                        <span>Injectables</span>
                                        <span class="icon ion-ios-arrow-down"></span>
                                    </div>
                                    <ul class="links collapse" ${ isNormalMode ? 'id="injectables-links-module-MediaModule-d59939db5d8dc24053102c3a6d9cf79f95d72bbc50faceb439371ac5a0dc2b3576c68d4f6727e8da304bfa780416bc02442c0f4826739219c06573c818014c3a"' :
                                        'id="xs-injectables-links-module-MediaModule-d59939db5d8dc24053102c3a6d9cf79f95d72bbc50faceb439371ac5a0dc2b3576c68d4f6727e8da304bfa780416bc02442c0f4826739219c06573c818014c3a"' }>
                                        <li class="link">
                                            <a href="injectables/MediaAssetsService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >MediaAssetsService</a>
                                        </li>
                                        <li class="link">
                                            <a href="injectables/MediaService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >MediaService</a>
                                        </li>
                                    </ul>
                                </li>
                            </li>
                            <li class="link">
                                <a href="modules/OrdersModule.html" data-type="entity-link" >OrdersModule</a>
                                    <li class="chapter inner">
                                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                            'data-bs-target="#controllers-links-module-OrdersModule-d39e653031c9d9593ad3e9f20c9690af66eb77e8fa339f6efb012677c0f58dbd372a219466e743a5307850da2496bdc6724b743c2417cd490bdf1d3068e0a3f0"' : 'data-bs-target="#xs-controllers-links-module-OrdersModule-d39e653031c9d9593ad3e9f20c9690af66eb77e8fa339f6efb012677c0f58dbd372a219466e743a5307850da2496bdc6724b743c2417cd490bdf1d3068e0a3f0"' }>
                                            <span class="icon ion-md-swap"></span>
                                            <span>Controllers</span>
                                            <span class="icon ion-ios-arrow-down"></span>
                                        </div>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="controllers-links-module-OrdersModule-d39e653031c9d9593ad3e9f20c9690af66eb77e8fa339f6efb012677c0f58dbd372a219466e743a5307850da2496bdc6724b743c2417cd490bdf1d3068e0a3f0"' :
                                            'id="xs-controllers-links-module-OrdersModule-d39e653031c9d9593ad3e9f20c9690af66eb77e8fa339f6efb012677c0f58dbd372a219466e743a5307850da2496bdc6724b743c2417cd490bdf1d3068e0a3f0"' }>
                                            <li class="link">
                                                <a href="controllers/StorefrontOrdersController.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >StorefrontOrdersController</a>
                                            </li>
                                        </ul>
                                    </li>
                                <li class="chapter inner">
                                    <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                        'data-bs-target="#injectables-links-module-OrdersModule-d39e653031c9d9593ad3e9f20c9690af66eb77e8fa339f6efb012677c0f58dbd372a219466e743a5307850da2496bdc6724b743c2417cd490bdf1d3068e0a3f0"' : 'data-bs-target="#xs-injectables-links-module-OrdersModule-d39e653031c9d9593ad3e9f20c9690af66eb77e8fa339f6efb012677c0f58dbd372a219466e743a5307850da2496bdc6724b743c2417cd490bdf1d3068e0a3f0"' }>
                                        <span class="icon ion-md-arrow-round-down"></span>
                                        <span>Injectables</span>
                                        <span class="icon ion-ios-arrow-down"></span>
                                    </div>
                                    <ul class="links collapse" ${ isNormalMode ? 'id="injectables-links-module-OrdersModule-d39e653031c9d9593ad3e9f20c9690af66eb77e8fa339f6efb012677c0f58dbd372a219466e743a5307850da2496bdc6724b743c2417cd490bdf1d3068e0a3f0"' :
                                        'id="xs-injectables-links-module-OrdersModule-d39e653031c9d9593ad3e9f20c9690af66eb77e8fa339f6efb012677c0f58dbd372a219466e743a5307850da2496bdc6724b743c2417cd490bdf1d3068e0a3f0"' }>
                                        <li class="link">
                                            <a href="injectables/StorefrontOrdersService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >StorefrontOrdersService</a>
                                        </li>
                                    </ul>
                                </li>
                            </li>
                            <li class="link">
                                <a href="modules/PasswordModule.html" data-type="entity-link" >PasswordModule</a>
                                <li class="chapter inner">
                                    <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                        'data-bs-target="#injectables-links-module-PasswordModule-f53527dfa2fc41520b5ca844e6fcafedbb6a7994c0e9c9e8a25728f1819b458c45f067655f6611a77e8cef7c41819fed03458d949cef268c667073bd197653c9"' : 'data-bs-target="#xs-injectables-links-module-PasswordModule-f53527dfa2fc41520b5ca844e6fcafedbb6a7994c0e9c9e8a25728f1819b458c45f067655f6611a77e8cef7c41819fed03458d949cef268c667073bd197653c9"' }>
                                        <span class="icon ion-md-arrow-round-down"></span>
                                        <span>Injectables</span>
                                        <span class="icon ion-ios-arrow-down"></span>
                                    </div>
                                    <ul class="links collapse" ${ isNormalMode ? 'id="injectables-links-module-PasswordModule-f53527dfa2fc41520b5ca844e6fcafedbb6a7994c0e9c9e8a25728f1819b458c45f067655f6611a77e8cef7c41819fed03458d949cef268c667073bd197653c9"' :
                                        'id="xs-injectables-links-module-PasswordModule-f53527dfa2fc41520b5ca844e6fcafedbb6a7994c0e9c9e8a25728f1819b458c45f067655f6611a77e8cef7c41819fed03458d949cef268c667073bd197653c9"' }>
                                        <li class="link">
                                            <a href="injectables/PasswordService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >PasswordService</a>
                                        </li>
                                    </ul>
                                </li>
                            </li>
                            <li class="link">
                                <a href="modules/PaymentModule.html" data-type="entity-link" >PaymentModule</a>
                                    <li class="chapter inner">
                                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                            'data-bs-target="#controllers-links-module-PaymentModule-1a87cef0200a69df98262522ab9c545fa73e72bca4f04f76da565e72ec63b05457a09b2dc23907c0fd4c293e84f559989768787b11265744567ebe58b4f5d872"' : 'data-bs-target="#xs-controllers-links-module-PaymentModule-1a87cef0200a69df98262522ab9c545fa73e72bca4f04f76da565e72ec63b05457a09b2dc23907c0fd4c293e84f559989768787b11265744567ebe58b4f5d872"' }>
                                            <span class="icon ion-md-swap"></span>
                                            <span>Controllers</span>
                                            <span class="icon ion-ios-arrow-down"></span>
                                        </div>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="controllers-links-module-PaymentModule-1a87cef0200a69df98262522ab9c545fa73e72bca4f04f76da565e72ec63b05457a09b2dc23907c0fd4c293e84f559989768787b11265744567ebe58b4f5d872"' :
                                            'id="xs-controllers-links-module-PaymentModule-1a87cef0200a69df98262522ab9c545fa73e72bca4f04f76da565e72ec63b05457a09b2dc23907c0fd4c293e84f559989768787b11265744567ebe58b4f5d872"' }>
                                            <li class="link">
                                                <a href="controllers/PaymentController.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >PaymentController</a>
                                            </li>
                                        </ul>
                                    </li>
                                <li class="chapter inner">
                                    <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                        'data-bs-target="#injectables-links-module-PaymentModule-1a87cef0200a69df98262522ab9c545fa73e72bca4f04f76da565e72ec63b05457a09b2dc23907c0fd4c293e84f559989768787b11265744567ebe58b4f5d872"' : 'data-bs-target="#xs-injectables-links-module-PaymentModule-1a87cef0200a69df98262522ab9c545fa73e72bca4f04f76da565e72ec63b05457a09b2dc23907c0fd4c293e84f559989768787b11265744567ebe58b4f5d872"' }>
                                        <span class="icon ion-md-arrow-round-down"></span>
                                        <span>Injectables</span>
                                        <span class="icon ion-ios-arrow-down"></span>
                                    </div>
                                    <ul class="links collapse" ${ isNormalMode ? 'id="injectables-links-module-PaymentModule-1a87cef0200a69df98262522ab9c545fa73e72bca4f04f76da565e72ec63b05457a09b2dc23907c0fd4c293e84f559989768787b11265744567ebe58b4f5d872"' :
                                        'id="xs-injectables-links-module-PaymentModule-1a87cef0200a69df98262522ab9c545fa73e72bca4f04f76da565e72ec63b05457a09b2dc23907c0fd4c293e84f559989768787b11265744567ebe58b4f5d872"' }>
                                        <li class="link">
                                            <a href="injectables/MomoStrategy.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >MomoStrategy</a>
                                        </li>
                                        <li class="link">
                                            <a href="injectables/PaymentService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >PaymentService</a>
                                        </li>
                                    </ul>
                                </li>
                            </li>
                            <li class="link">
                                <a href="modules/ProductsModule.html" data-type="entity-link" >ProductsModule</a>
                                    <li class="chapter inner">
                                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                            'data-bs-target="#controllers-links-module-ProductsModule-ff2ae35f83a2ff481bf3dfd4dc79cddb9a0e3bd409b943c39a745de2ba36f2d4e4f89869794f5b05836cf6d092f98b281a0ccbfa92147a9ed73a813d24d61309"' : 'data-bs-target="#xs-controllers-links-module-ProductsModule-ff2ae35f83a2ff481bf3dfd4dc79cddb9a0e3bd409b943c39a745de2ba36f2d4e4f89869794f5b05836cf6d092f98b281a0ccbfa92147a9ed73a813d24d61309"' }>
                                            <span class="icon ion-md-swap"></span>
                                            <span>Controllers</span>
                                            <span class="icon ion-ios-arrow-down"></span>
                                        </div>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="controllers-links-module-ProductsModule-ff2ae35f83a2ff481bf3dfd4dc79cddb9a0e3bd409b943c39a745de2ba36f2d4e4f89869794f5b05836cf6d092f98b281a0ccbfa92147a9ed73a813d24d61309"' :
                                            'id="xs-controllers-links-module-ProductsModule-ff2ae35f83a2ff481bf3dfd4dc79cddb9a0e3bd409b943c39a745de2ba36f2d4e4f89869794f5b05836cf6d092f98b281a0ccbfa92147a9ed73a813d24d61309"' }>
                                            <li class="link">
                                                <a href="controllers/AdminProductAttributesController.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >AdminProductAttributesController</a>
                                            </li>
                                            <li class="link">
                                                <a href="controllers/AdminProductsController.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >AdminProductsController</a>
                                            </li>
                                            <li class="link">
                                                <a href="controllers/StorefrontProductsController.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >StorefrontProductsController</a>
                                            </li>
                                        </ul>
                                    </li>
                                <li class="chapter inner">
                                    <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                        'data-bs-target="#injectables-links-module-ProductsModule-ff2ae35f83a2ff481bf3dfd4dc79cddb9a0e3bd409b943c39a745de2ba36f2d4e4f89869794f5b05836cf6d092f98b281a0ccbfa92147a9ed73a813d24d61309"' : 'data-bs-target="#xs-injectables-links-module-ProductsModule-ff2ae35f83a2ff481bf3dfd4dc79cddb9a0e3bd409b943c39a745de2ba36f2d4e4f89869794f5b05836cf6d092f98b281a0ccbfa92147a9ed73a813d24d61309"' }>
                                        <span class="icon ion-md-arrow-round-down"></span>
                                        <span>Injectables</span>
                                        <span class="icon ion-ios-arrow-down"></span>
                                    </div>
                                    <ul class="links collapse" ${ isNormalMode ? 'id="injectables-links-module-ProductsModule-ff2ae35f83a2ff481bf3dfd4dc79cddb9a0e3bd409b943c39a745de2ba36f2d4e4f89869794f5b05836cf6d092f98b281a0ccbfa92147a9ed73a813d24d61309"' :
                                        'id="xs-injectables-links-module-ProductsModule-ff2ae35f83a2ff481bf3dfd4dc79cddb9a0e3bd409b943c39a745de2ba36f2d4e4f89869794f5b05836cf6d092f98b281a0ccbfa92147a9ed73a813d24d61309"' }>
                                        <li class="link">
                                            <a href="injectables/AdminProductAttributesService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >AdminProductAttributesService</a>
                                        </li>
                                        <li class="link">
                                            <a href="injectables/AdminProductCategoriesService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >AdminProductCategoriesService</a>
                                        </li>
                                        <li class="link">
                                            <a href="injectables/AdminProductImageUploadService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >AdminProductImageUploadService</a>
                                        </li>
                                        <li class="link">
                                            <a href="injectables/AdminProductImagesService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >AdminProductImagesService</a>
                                        </li>
                                        <li class="link">
                                            <a href="injectables/AdminProductValidatorsService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >AdminProductValidatorsService</a>
                                        </li>
                                        <li class="link">
                                            <a href="injectables/AdminProductsService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >AdminProductsService</a>
                                        </li>
                                        <li class="link">
                                            <a href="injectables/ProductAttributeRepository.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >ProductAttributeRepository</a>
                                        </li>
                                        <li class="link">
                                            <a href="injectables/ProductImageRepository.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >ProductImageRepository</a>
                                        </li>
                                        <li class="link">
                                            <a href="injectables/ProductRepository.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >ProductRepository</a>
                                        </li>
                                        <li class="link">
                                            <a href="injectables/StorefrontProductRepository.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >StorefrontProductRepository</a>
                                        </li>
                                        <li class="link">
                                            <a href="injectables/StorefrontProductsService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >StorefrontProductsService</a>
                                        </li>
                                    </ul>
                                </li>
                            </li>
                            <li class="link">
                                <a href="modules/ProductVariantsModule.html" data-type="entity-link" >ProductVariantsModule</a>
                                    <li class="chapter inner">
                                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                            'data-bs-target="#controllers-links-module-ProductVariantsModule-7fc399f8cc83e504728997a81e94d7ce7a5ea4ef29c87e0336db39c782765fc56aa731d27e42ad7fb6a4ac62e649592735c6d491c75231063d698d3afb3074ad"' : 'data-bs-target="#xs-controllers-links-module-ProductVariantsModule-7fc399f8cc83e504728997a81e94d7ce7a5ea4ef29c87e0336db39c782765fc56aa731d27e42ad7fb6a4ac62e649592735c6d491c75231063d698d3afb3074ad"' }>
                                            <span class="icon ion-md-swap"></span>
                                            <span>Controllers</span>
                                            <span class="icon ion-ios-arrow-down"></span>
                                        </div>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="controllers-links-module-ProductVariantsModule-7fc399f8cc83e504728997a81e94d7ce7a5ea4ef29c87e0336db39c782765fc56aa731d27e42ad7fb6a4ac62e649592735c6d491c75231063d698d3afb3074ad"' :
                                            'id="xs-controllers-links-module-ProductVariantsModule-7fc399f8cc83e504728997a81e94d7ce7a5ea4ef29c87e0336db39c782765fc56aa731d27e42ad7fb6a4ac62e649592735c6d491c75231063d698d3afb3074ad"' }>
                                            <li class="link">
                                                <a href="controllers/ProductVariantsController.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >ProductVariantsController</a>
                                            </li>
                                        </ul>
                                    </li>
                                <li class="chapter inner">
                                    <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                        'data-bs-target="#injectables-links-module-ProductVariantsModule-7fc399f8cc83e504728997a81e94d7ce7a5ea4ef29c87e0336db39c782765fc56aa731d27e42ad7fb6a4ac62e649592735c6d491c75231063d698d3afb3074ad"' : 'data-bs-target="#xs-injectables-links-module-ProductVariantsModule-7fc399f8cc83e504728997a81e94d7ce7a5ea4ef29c87e0336db39c782765fc56aa731d27e42ad7fb6a4ac62e649592735c6d491c75231063d698d3afb3074ad"' }>
                                        <span class="icon ion-md-arrow-round-down"></span>
                                        <span>Injectables</span>
                                        <span class="icon ion-ios-arrow-down"></span>
                                    </div>
                                    <ul class="links collapse" ${ isNormalMode ? 'id="injectables-links-module-ProductVariantsModule-7fc399f8cc83e504728997a81e94d7ce7a5ea4ef29c87e0336db39c782765fc56aa731d27e42ad7fb6a4ac62e649592735c6d491c75231063d698d3afb3074ad"' :
                                        'id="xs-injectables-links-module-ProductVariantsModule-7fc399f8cc83e504728997a81e94d7ce7a5ea4ef29c87e0336db39c782765fc56aa731d27e42ad7fb6a4ac62e649592735c6d491c75231063d698d3afb3074ad"' }>
                                        <li class="link">
                                            <a href="injectables/ProductVariantsService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >ProductVariantsService</a>
                                        </li>
                                        <li class="link">
                                            <a href="injectables/VariantAttributesService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >VariantAttributesService</a>
                                        </li>
                                    </ul>
                                </li>
                            </li>
                            <li class="link">
                                <a href="modules/SeedsModule.html" data-type="entity-link" >SeedsModule</a>
                                <li class="chapter inner">
                                    <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                        'data-bs-target="#injectables-links-module-SeedsModule-fc44d3955e43a7f698432eb96fd5f3456b3d6b541b999953e7776f14be51429587d8edaaf75e7481abc9a726a516fa36ff6c40b880d0df807635ab77a456fca0"' : 'data-bs-target="#xs-injectables-links-module-SeedsModule-fc44d3955e43a7f698432eb96fd5f3456b3d6b541b999953e7776f14be51429587d8edaaf75e7481abc9a726a516fa36ff6c40b880d0df807635ab77a456fca0"' }>
                                        <span class="icon ion-md-arrow-round-down"></span>
                                        <span>Injectables</span>
                                        <span class="icon ion-ios-arrow-down"></span>
                                    </div>
                                    <ul class="links collapse" ${ isNormalMode ? 'id="injectables-links-module-SeedsModule-fc44d3955e43a7f698432eb96fd5f3456b3d6b541b999953e7776f14be51429587d8edaaf75e7481abc9a726a516fa36ff6c40b880d0df807635ab77a456fca0"' :
                                        'id="xs-injectables-links-module-SeedsModule-fc44d3955e43a7f698432eb96fd5f3456b3d6b541b999953e7776f14be51429587d8edaaf75e7481abc9a726a516fa36ff6c40b880d0df807635ab77a456fca0"' }>
                                        <li class="link">
                                            <a href="injectables/SeedRolesRunner.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >SeedRolesRunner</a>
                                        </li>
                                        <li class="link">
                                            <a href="injectables/SeedSuperAdminRunner.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >SeedSuperAdminRunner</a>
                                        </li>
                                        <li class="link">
                                            <a href="injectables/SeedsService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >SeedsService</a>
                                        </li>
                                    </ul>
                                </li>
                            </li>
                            <li class="link">
                                <a href="modules/StorageModule.html" data-type="entity-link" >StorageModule</a>
                                <li class="chapter inner">
                                    <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                        'data-bs-target="#injectables-links-module-StorageModule-0131123a4e85dcc6d7779ec302c79699453ceebb7a53f0422e8e78a227c524cadf7358a4f00eae5d79aefc3faf1c5226d0abdb518415d014ba54aa65b954ae63"' : 'data-bs-target="#xs-injectables-links-module-StorageModule-0131123a4e85dcc6d7779ec302c79699453ceebb7a53f0422e8e78a227c524cadf7358a4f00eae5d79aefc3faf1c5226d0abdb518415d014ba54aa65b954ae63"' }>
                                        <span class="icon ion-md-arrow-round-down"></span>
                                        <span>Injectables</span>
                                        <span class="icon ion-ios-arrow-down"></span>
                                    </div>
                                    <ul class="links collapse" ${ isNormalMode ? 'id="injectables-links-module-StorageModule-0131123a4e85dcc6d7779ec302c79699453ceebb7a53f0422e8e78a227c524cadf7358a4f00eae5d79aefc3faf1c5226d0abdb518415d014ba54aa65b954ae63"' :
                                        'id="xs-injectables-links-module-StorageModule-0131123a4e85dcc6d7779ec302c79699453ceebb7a53f0422e8e78a227c524cadf7358a4f00eae5d79aefc3faf1c5226d0abdb518415d014ba54aa65b954ae63"' }>
                                        <li class="link">
                                            <a href="injectables/CloudinaryStorageProvider.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >CloudinaryStorageProvider</a>
                                        </li>
                                    </ul>
                                </li>
                            </li>
                            <li class="link">
                                <a href="modules/TemplatePlaygroundModule.html" data-type="entity-link" >TemplatePlaygroundModule</a>
                                    <li class="chapter inner">
                                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                            'data-bs-target="#components-links-module-TemplatePlaygroundModule-a48e698b66bad8be9ff3b78b5db8e15ee6bb54bd2575fdb1bb61a34e76437cc54b2e161854c3d6c97b4c751d05ff3a43b70b87ceffd46d3c5bf53f6f161e3044"' : 'data-bs-target="#xs-components-links-module-TemplatePlaygroundModule-a48e698b66bad8be9ff3b78b5db8e15ee6bb54bd2575fdb1bb61a34e76437cc54b2e161854c3d6c97b4c751d05ff3a43b70b87ceffd46d3c5bf53f6f161e3044"' }>
                                            <span class="icon ion-md-cog"></span>
                                            <span>Components</span>
                                            <span class="icon ion-ios-arrow-down"></span>
                                        </div>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="components-links-module-TemplatePlaygroundModule-a48e698b66bad8be9ff3b78b5db8e15ee6bb54bd2575fdb1bb61a34e76437cc54b2e161854c3d6c97b4c751d05ff3a43b70b87ceffd46d3c5bf53f6f161e3044"' :
                                            'id="xs-components-links-module-TemplatePlaygroundModule-a48e698b66bad8be9ff3b78b5db8e15ee6bb54bd2575fdb1bb61a34e76437cc54b2e161854c3d6c97b4c751d05ff3a43b70b87ceffd46d3c5bf53f6f161e3044"' }>
                                            <li class="link">
                                                <a href="components/TemplatePlaygroundComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >TemplatePlaygroundComponent</a>
                                            </li>
                                        </ul>
                                    </li>
                                <li class="chapter inner">
                                    <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                        'data-bs-target="#injectables-links-module-TemplatePlaygroundModule-a48e698b66bad8be9ff3b78b5db8e15ee6bb54bd2575fdb1bb61a34e76437cc54b2e161854c3d6c97b4c751d05ff3a43b70b87ceffd46d3c5bf53f6f161e3044"' : 'data-bs-target="#xs-injectables-links-module-TemplatePlaygroundModule-a48e698b66bad8be9ff3b78b5db8e15ee6bb54bd2575fdb1bb61a34e76437cc54b2e161854c3d6c97b4c751d05ff3a43b70b87ceffd46d3c5bf53f6f161e3044"' }>
                                        <span class="icon ion-md-arrow-round-down"></span>
                                        <span>Injectables</span>
                                        <span class="icon ion-ios-arrow-down"></span>
                                    </div>
                                    <ul class="links collapse" ${ isNormalMode ? 'id="injectables-links-module-TemplatePlaygroundModule-a48e698b66bad8be9ff3b78b5db8e15ee6bb54bd2575fdb1bb61a34e76437cc54b2e161854c3d6c97b4c751d05ff3a43b70b87ceffd46d3c5bf53f6f161e3044"' :
                                        'id="xs-injectables-links-module-TemplatePlaygroundModule-a48e698b66bad8be9ff3b78b5db8e15ee6bb54bd2575fdb1bb61a34e76437cc54b2e161854c3d6c97b4c751d05ff3a43b70b87ceffd46d3c5bf53f6f161e3044"' }>
                                        <li class="link">
                                            <a href="injectables/HbsRenderService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >HbsRenderService</a>
                                        </li>
                                        <li class="link">
                                            <a href="injectables/TemplateEditorService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >TemplateEditorService</a>
                                        </li>
                                        <li class="link">
                                            <a href="injectables/ZipExportService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >ZipExportService</a>
                                        </li>
                                    </ul>
                                </li>
                            </li>
                            <li class="link">
                                <a href="modules/UsersModule.html" data-type="entity-link" >UsersModule</a>
                                    <li class="chapter inner">
                                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                            'data-bs-target="#controllers-links-module-UsersModule-3fcb21f6f16b895e3a5c971c2dc7ebf7a22908012339039472379f01f876f27cb19069ed431a4bd53eea171d3329823dc5e0d71a226512b967cce6bf962da636"' : 'data-bs-target="#xs-controllers-links-module-UsersModule-3fcb21f6f16b895e3a5c971c2dc7ebf7a22908012339039472379f01f876f27cb19069ed431a4bd53eea171d3329823dc5e0d71a226512b967cce6bf962da636"' }>
                                            <span class="icon ion-md-swap"></span>
                                            <span>Controllers</span>
                                            <span class="icon ion-ios-arrow-down"></span>
                                        </div>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="controllers-links-module-UsersModule-3fcb21f6f16b895e3a5c971c2dc7ebf7a22908012339039472379f01f876f27cb19069ed431a4bd53eea171d3329823dc5e0d71a226512b967cce6bf962da636"' :
                                            'id="xs-controllers-links-module-UsersModule-3fcb21f6f16b895e3a5c971c2dc7ebf7a22908012339039472379f01f876f27cb19069ed431a4bd53eea171d3329823dc5e0d71a226512b967cce6bf962da636"' }>
                                            <li class="link">
                                                <a href="controllers/UsersController.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >UsersController</a>
                                            </li>
                                        </ul>
                                    </li>
                                <li class="chapter inner">
                                    <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                        'data-bs-target="#injectables-links-module-UsersModule-3fcb21f6f16b895e3a5c971c2dc7ebf7a22908012339039472379f01f876f27cb19069ed431a4bd53eea171d3329823dc5e0d71a226512b967cce6bf962da636"' : 'data-bs-target="#xs-injectables-links-module-UsersModule-3fcb21f6f16b895e3a5c971c2dc7ebf7a22908012339039472379f01f876f27cb19069ed431a4bd53eea171d3329823dc5e0d71a226512b967cce6bf962da636"' }>
                                        <span class="icon ion-md-arrow-round-down"></span>
                                        <span>Injectables</span>
                                        <span class="icon ion-ios-arrow-down"></span>
                                    </div>
                                    <ul class="links collapse" ${ isNormalMode ? 'id="injectables-links-module-UsersModule-3fcb21f6f16b895e3a5c971c2dc7ebf7a22908012339039472379f01f876f27cb19069ed431a4bd53eea171d3329823dc5e0d71a226512b967cce6bf962da636"' :
                                        'id="xs-injectables-links-module-UsersModule-3fcb21f6f16b895e3a5c971c2dc7ebf7a22908012339039472379f01f876f27cb19069ed431a4bd53eea171d3329823dc5e0d71a226512b967cce6bf962da636"' }>
                                        <li class="link">
                                            <a href="injectables/RoleRepository.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >RoleRepository</a>
                                        </li>
                                        <li class="link">
                                            <a href="injectables/UserRepository.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >UserRepository</a>
                                        </li>
                                        <li class="link">
                                            <a href="injectables/UsersService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >UsersService</a>
                                        </li>
                                    </ul>
                                </li>
                            </li>
                </ul>
                </li>
                        <li class="chapter">
                            <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ? 'data-bs-target="#entities-links"' :
                                'data-bs-target="#xs-entities-links"' }>
                                <span class="icon ion-ios-apps"></span>
                                <span>Entities</span>
                                <span class="icon ion-ios-arrow-down"></span>
                            </div>
                            <ul class="links collapse " ${ isNormalMode ? 'id="entities-links"' : 'id="xs-entities-links"' }>
                                <li class="link">
                                    <a href="entities/Brand.html" data-type="entity-link" >Brand</a>
                                </li>
                                <li class="link">
                                    <a href="entities/Cart.html" data-type="entity-link" >Cart</a>
                                </li>
                                <li class="link">
                                    <a href="entities/CartItem.html" data-type="entity-link" >CartItem</a>
                                </li>
                                <li class="link">
                                    <a href="entities/Category.html" data-type="entity-link" >Category</a>
                                </li>
                                <li class="link">
                                    <a href="entities/Customer.html" data-type="entity-link" >Customer</a>
                                </li>
                                <li class="link">
                                    <a href="entities/Identity.html" data-type="entity-link" >Identity</a>
                                </li>
                                <li class="link">
                                    <a href="entities/MediaAsset.html" data-type="entity-link" >MediaAsset</a>
                                </li>
                                <li class="link">
                                    <a href="entities/Order.html" data-type="entity-link" >Order</a>
                                </li>
                                <li class="link">
                                    <a href="entities/OrderItem.html" data-type="entity-link" >OrderItem</a>
                                </li>
                                <li class="link">
                                    <a href="entities/Payment.html" data-type="entity-link" >Payment</a>
                                </li>
                                <li class="link">
                                    <a href="entities/Product.html" data-type="entity-link" >Product</a>
                                </li>
                                <li class="link">
                                    <a href="entities/ProductAttribute.html" data-type="entity-link" >ProductAttribute</a>
                                </li>
                                <li class="link">
                                    <a href="entities/ProductCategory.html" data-type="entity-link" >ProductCategory</a>
                                </li>
                                <li class="link">
                                    <a href="entities/ProductImage.html" data-type="entity-link" >ProductImage</a>
                                </li>
                                <li class="link">
                                    <a href="entities/ProductVariant.html" data-type="entity-link" >ProductVariant</a>
                                </li>
                                <li class="link">
                                    <a href="entities/RefreshToken.html" data-type="entity-link" >RefreshToken</a>
                                </li>
                                <li class="link">
                                    <a href="entities/Role.html" data-type="entity-link" >Role</a>
                                </li>
                                <li class="link">
                                    <a href="entities/User.html" data-type="entity-link" >User</a>
                                </li>
                                <li class="link">
                                    <a href="entities/VariantAttribute.html" data-type="entity-link" >VariantAttribute</a>
                                </li>
                            </ul>
                        </li>
                    <li class="chapter">
                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ? 'data-bs-target="#classes-links"' :
                            'data-bs-target="#xs-classes-links"' }>
                            <span class="icon ion-ios-paper"></span>
                            <span>Classes</span>
                            <span class="icon ion-ios-arrow-down"></span>
                        </div>
                        <ul class="links collapse " ${ isNormalMode ? 'id="classes-links"' : 'id="xs-classes-links"' }>
                            <li class="link">
                                <a href="classes/AddToCartDto.html" data-type="entity-link" >AddToCartDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/AuthMapper.html" data-type="entity-link" >AuthMapper</a>
                            </li>
                            <li class="link">
                                <a href="classes/AuthResponseDto.html" data-type="entity-link" >AuthResponseDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/Brand.html" data-type="entity-link" >Brand</a>
                            </li>
                            <li class="link">
                                <a href="classes/BrandCreateEntityInput.html" data-type="entity-link" >BrandCreateEntityInput</a>
                            </li>
                            <li class="link">
                                <a href="classes/BrandResponseDto.html" data-type="entity-link" >BrandResponseDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/BrandUpdateEntityInput.html" data-type="entity-link" >BrandUpdateEntityInput</a>
                            </li>
                            <li class="link">
                                <a href="classes/Cart.html" data-type="entity-link" >Cart</a>
                            </li>
                            <li class="link">
                                <a href="classes/CartCreateEntityInput.html" data-type="entity-link" >CartCreateEntityInput</a>
                            </li>
                            <li class="link">
                                <a href="classes/CartItem.html" data-type="entity-link" >CartItem</a>
                            </li>
                            <li class="link">
                                <a href="classes/CartItemCreateEntityInput.html" data-type="entity-link" >CartItemCreateEntityInput</a>
                            </li>
                            <li class="link">
                                <a href="classes/CartItemMapper.html" data-type="entity-link" >CartItemMapper</a>
                            </li>
                            <li class="link">
                                <a href="classes/CartItemResponseDto.html" data-type="entity-link" >CartItemResponseDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/CartItemUpdateEntityInput.html" data-type="entity-link" >CartItemUpdateEntityInput</a>
                            </li>
                            <li class="link">
                                <a href="classes/CartMapper.html" data-type="entity-link" >CartMapper</a>
                            </li>
                            <li class="link">
                                <a href="classes/CartResponseDto.html" data-type="entity-link" >CartResponseDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/CartUpdateEntityDto.html" data-type="entity-link" >CartUpdateEntityDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/Category.html" data-type="entity-link" >Category</a>
                            </li>
                            <li class="link">
                                <a href="classes/CategoryResponseDto.html" data-type="entity-link" >CategoryResponseDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/CreateBrandDto.html" data-type="entity-link" >CreateBrandDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/CreateBrandsTable1769846726911.html" data-type="entity-link" >CreateBrandsTable1769846726911</a>
                            </li>
                            <li class="link">
                                <a href="classes/CreateCartItemDto.html" data-type="entity-link" >CreateCartItemDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/CreateCartItemsTable1772387171432.html" data-type="entity-link" >CreateCartItemsTable1772387171432</a>
                            </li>
                            <li class="link">
                                <a href="classes/CreateCartsTable1772245023149.html" data-type="entity-link" >CreateCartsTable1772245023149</a>
                            </li>
                            <li class="link">
                                <a href="classes/CreateCategoriesTable1769691889014.html" data-type="entity-link" >CreateCategoriesTable1769691889014</a>
                            </li>
                            <li class="link">
                                <a href="classes/CreateCategoryDto.html" data-type="entity-link" >CreateCategoryDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/CreateCustomerDto.html" data-type="entity-link" >CreateCustomerDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/CreateCustomersTable1769922336526.html" data-type="entity-link" >CreateCustomersTable1769922336526</a>
                            </li>
                            <li class="link">
                                <a href="classes/CreateIdentitiesTable1775168788830.html" data-type="entity-link" >CreateIdentitiesTable1775168788830</a>
                            </li>
                            <li class="link">
                                <a href="classes/CreateMediaAssetDto.html" data-type="entity-link" >CreateMediaAssetDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/CreateMediaAssetsTable1769819737337.html" data-type="entity-link" >CreateMediaAssetsTable1769819737337</a>
                            </li>
                            <li class="link">
                                <a href="classes/CreateOrderDto.html" data-type="entity-link" >CreateOrderDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/CreateOrderItemsTable1772554471656.html" data-type="entity-link" >CreateOrderItemsTable1772554471656</a>
                            </li>
                            <li class="link">
                                <a href="classes/CreateOrderSequence1772542822305.html" data-type="entity-link" >CreateOrderSequence1772542822305</a>
                            </li>
                            <li class="link">
                                <a href="classes/CreateOrdersTable1772541379498.html" data-type="entity-link" >CreateOrdersTable1772541379498</a>
                            </li>
                            <li class="link">
                                <a href="classes/CreatePaymentDto.html" data-type="entity-link" >CreatePaymentDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/CreatePaymentsTable1772722663123.html" data-type="entity-link" >CreatePaymentsTable1772722663123</a>
                            </li>
                            <li class="link">
                                <a href="classes/CreateProductAttributeDto.html" data-type="entity-link" >CreateProductAttributeDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/CreateProductAttributesTable1772117079538.html" data-type="entity-link" >CreateProductAttributesTable1772117079538</a>
                            </li>
                            <li class="link">
                                <a href="classes/CreateProductCategoriesTable1770221347679.html" data-type="entity-link" >CreateProductCategoriesTable1770221347679</a>
                            </li>
                            <li class="link">
                                <a href="classes/CreateProductDto.html" data-type="entity-link" >CreateProductDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/CreateProductImageDto.html" data-type="entity-link" >CreateProductImageDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/CreateProductImagesTable1770769025308.html" data-type="entity-link" >CreateProductImagesTable1770769025308</a>
                            </li>
                            <li class="link">
                                <a href="classes/CreateProductsTable1770129475009.html" data-type="entity-link" >CreateProductsTable1770129475009</a>
                            </li>
                            <li class="link">
                                <a href="classes/CreateProductVariantDto.html" data-type="entity-link" >CreateProductVariantDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/CreateProductVariantsTable1770337425769.html" data-type="entity-link" >CreateProductVariantsTable1770337425769</a>
                            </li>
                            <li class="link">
                                <a href="classes/CreateRefreshTokensTable1775650699683.html" data-type="entity-link" >CreateRefreshTokensTable1775650699683</a>
                            </li>
                            <li class="link">
                                <a href="classes/CreateRolesTable1769921614252.html" data-type="entity-link" >CreateRolesTable1769921614252</a>
                            </li>
                            <li class="link">
                                <a href="classes/CreateUserDto.html" data-type="entity-link" >CreateUserDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/CreateUsersTable1769922336525.html" data-type="entity-link" >CreateUsersTable1769922336525</a>
                            </li>
                            <li class="link">
                                <a href="classes/CreateVariantAttributesTable1772147838817.html" data-type="entity-link" >CreateVariantAttributesTable1772147838817</a>
                            </li>
                            <li class="link">
                                <a href="classes/Customer.html" data-type="entity-link" >Customer</a>
                            </li>
                            <li class="link">
                                <a href="classes/CustomerCreateEntityInput.html" data-type="entity-link" >CustomerCreateEntityInput</a>
                            </li>
                            <li class="link">
                                <a href="classes/DateRangeFilterDto.html" data-type="entity-link" >DateRangeFilterDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/FilterProductsDto.html" data-type="entity-link" >FilterProductsDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/GetMediasDto.html" data-type="entity-link" >GetMediasDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/Identity.html" data-type="entity-link" >Identity</a>
                            </li>
                            <li class="link">
                                <a href="classes/IdentityCreateEntity.html" data-type="entity-link" >IdentityCreateEntity</a>
                            </li>
                            <li class="link">
                                <a href="classes/LimitFilterDto.html" data-type="entity-link" >LimitFilterDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/MediaAsset.html" data-type="entity-link" >MediaAsset</a>
                            </li>
                            <li class="link">
                                <a href="classes/MediaAssetCreateEntityDto.html" data-type="entity-link" >MediaAssetCreateEntityDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/MediaAssetResponse.html" data-type="entity-link" >MediaAssetResponse</a>
                            </li>
                            <li class="link">
                                <a href="classes/Order.html" data-type="entity-link" >Order</a>
                            </li>
                            <li class="link">
                                <a href="classes/OrderCreateEntityInput.html" data-type="entity-link" >OrderCreateEntityInput</a>
                            </li>
                            <li class="link">
                                <a href="classes/OrderItem.html" data-type="entity-link" >OrderItem</a>
                            </li>
                            <li class="link">
                                <a href="classes/PaginationQueryDto.html" data-type="entity-link" >PaginationQueryDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/Payment.html" data-type="entity-link" >Payment</a>
                            </li>
                            <li class="link">
                                <a href="classes/Product.html" data-type="entity-link" >Product</a>
                            </li>
                            <li class="link">
                                <a href="classes/ProductAttribute.html" data-type="entity-link" >ProductAttribute</a>
                            </li>
                            <li class="link">
                                <a href="classes/ProductAttributeCreateEntityDto.html" data-type="entity-link" >ProductAttributeCreateEntityDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/ProductAttributeResponseDto.html" data-type="entity-link" >ProductAttributeResponseDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/ProductAttributeUpdateEntityDto.html" data-type="entity-link" >ProductAttributeUpdateEntityDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/ProductCategory.html" data-type="entity-link" >ProductCategory</a>
                            </li>
                            <li class="link">
                                <a href="classes/ProductCreateEntityDto.html" data-type="entity-link" >ProductCreateEntityDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/ProductImage.html" data-type="entity-link" >ProductImage</a>
                            </li>
                            <li class="link">
                                <a href="classes/ProductImageCreateEntityDto.html" data-type="entity-link" >ProductImageCreateEntityDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/ProductImageResponseDto.html" data-type="entity-link" >ProductImageResponseDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/ProductImageUpdateEntityDto.html" data-type="entity-link" >ProductImageUpdateEntityDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/ProductResponseDto.html" data-type="entity-link" >ProductResponseDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/ProductUpdateEntityDto.html" data-type="entity-link" >ProductUpdateEntityDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/ProductVariant.html" data-type="entity-link" >ProductVariant</a>
                            </li>
                            <li class="link">
                                <a href="classes/ProductVariantCreateEntityDto.html" data-type="entity-link" >ProductVariantCreateEntityDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/ProductVariantUpdateEntityDto.html" data-type="entity-link" >ProductVariantUpdateEntityDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/RefreshToken.html" data-type="entity-link" >RefreshToken</a>
                            </li>
                            <li class="link">
                                <a href="classes/RegisterDto.html" data-type="entity-link" >RegisterDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/ResolveCartDto.html" data-type="entity-link" >ResolveCartDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/Role.html" data-type="entity-link" >Role</a>
                            </li>
                            <li class="link">
                                <a href="classes/StorefrontProductResponseDto.html" data-type="entity-link" >StorefrontProductResponseDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/SyncVariantAttributeDto.html" data-type="entity-link" >SyncVariantAttributeDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/TopProductsFilterDto.html" data-type="entity-link" >TopProductsFilterDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/UpdateBrandDto.html" data-type="entity-link" >UpdateBrandDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/UpdateCategoryDto.html" data-type="entity-link" >UpdateCategoryDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/UpdateProductDto.html" data-type="entity-link" >UpdateProductDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/UpdateProductVariantDto.html" data-type="entity-link" >UpdateProductVariantDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/UpdateUserDto.html" data-type="entity-link" >UpdateUserDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/UploadMediasDto.html" data-type="entity-link" >UploadMediasDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/User.html" data-type="entity-link" >User</a>
                            </li>
                            <li class="link">
                                <a href="classes/UserCreateEntityDto.html" data-type="entity-link" >UserCreateEntityDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/UserMapper.html" data-type="entity-link" >UserMapper</a>
                            </li>
                            <li class="link">
                                <a href="classes/UserResponseDto.html" data-type="entity-link" >UserResponseDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/VariantAttribute.html" data-type="entity-link" >VariantAttribute</a>
                            </li>
                            <li class="link">
                                <a href="classes/VariantAttributeCreateEntityDto.html" data-type="entity-link" >VariantAttributeCreateEntityDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/VariantAttributeUpdateEntityDto.html" data-type="entity-link" >VariantAttributeUpdateEntityDto</a>
                            </li>
                        </ul>
                    </li>
                        <li class="chapter">
                            <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ? 'data-bs-target="#injectables-links"' :
                                'data-bs-target="#xs-injectables-links"' }>
                                <span class="icon ion-md-arrow-round-down"></span>
                                <span>Injectables</span>
                                <span class="icon ion-ios-arrow-down"></span>
                            </div>
                            <ul class="links collapse " ${ isNormalMode ? 'id="injectables-links"' : 'id="xs-injectables-links"' }>
                                <li class="link">
                                    <a href="injectables/CartItemRepository.html" data-type="entity-link" >CartItemRepository</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/CartRepository.html" data-type="entity-link" >CartRepository</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/ClassValidatorPipe.html" data-type="entity-link" >ClassValidatorPipe</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/CustomerRepository.html" data-type="entity-link" >CustomerRepository</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/IdentityRepository.html" data-type="entity-link" >IdentityRepository</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/JwtAuthGuard.html" data-type="entity-link" >JwtAuthGuard</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/JwtStrategy.html" data-type="entity-link" >JwtStrategy</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/LocalAuthGuard.html" data-type="entity-link" >LocalAuthGuard</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/LocalStrategy.html" data-type="entity-link" >LocalStrategy</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/NonEmptyBodyPipe.html" data-type="entity-link" >NonEmptyBodyPipe</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/ProductAttributeRepository.html" data-type="entity-link" >ProductAttributeRepository</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/ProductImageRepository.html" data-type="entity-link" >ProductImageRepository</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/ProductRepository.html" data-type="entity-link" >ProductRepository</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/RefreshTokenRepository.html" data-type="entity-link" >RefreshTokenRepository</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/RoleRepository.html" data-type="entity-link" >RoleRepository</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/StorefrontProductRepository.html" data-type="entity-link" >StorefrontProductRepository</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/UserRepository.html" data-type="entity-link" >UserRepository</a>
                                </li>
                            </ul>
                        </li>
                    <li class="chapter">
                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ? 'data-bs-target="#interfaces-links"' :
                            'data-bs-target="#xs-interfaces-links"' }>
                            <span class="icon ion-md-information-circle-outline"></span>
                            <span>Interfaces</span>
                            <span class="icon ion-ios-arrow-down"></span>
                        </div>
                        <ul class="links collapse " ${ isNormalMode ? ' id="interfaces-links"' : 'id="xs-interfaces-links"' }>
                            <li class="link">
                                <a href="interfaces/AuthenticatedRequest.html" data-type="entity-link" >AuthenticatedRequest</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/AuthUser.html" data-type="entity-link" >AuthUser</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/BrandQueryRaw.html" data-type="entity-link" >BrandQueryRaw</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/CartItemRaw.html" data-type="entity-link" >CartItemRaw</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/CategorySalesRaw.html" data-type="entity-link" >CategorySalesRaw</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/CompoDocConfig.html" data-type="entity-link" >CompoDocConfig</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/CreateIdentityParams.html" data-type="entity-link" >CreateIdentityParams</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/CreatePaymentUrlParams.html" data-type="entity-link" >CreatePaymentUrlParams</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/CreateRefreshTokenParams.html" data-type="entity-link" >CreateRefreshTokenParams</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/FindOneActiveByCartIdAndVariantIdParams.html" data-type="entity-link" >FindOneActiveByCartIdAndVariantIdParams</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/FindOneActiveByCustomerIdOrSessionIdParams.html" data-type="entity-link" >FindOneActiveByCustomerIdOrSessionIdParams</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/FindOneCartRaw.html" data-type="entity-link" >FindOneCartRaw</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ICartItemRepository.html" data-type="entity-link" >ICartItemRepository</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ICartRepository.html" data-type="entity-link" >ICartRepository</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ICustomerRepository.html" data-type="entity-link" >ICustomerRepository</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/IIdentityRepository.html" data-type="entity-link" >IIdentityRepository</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/IProductAttributeRepository.html" data-type="entity-link" >IProductAttributeRepository</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/IProductImageRepository.html" data-type="entity-link" >IProductImageRepository</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/IProductRepository.html" data-type="entity-link" >IProductRepository</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/IRefreshTokenRepository.html" data-type="entity-link" >IRefreshTokenRepository</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/IRoleRepository.html" data-type="entity-link" >IRoleRepository</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/IStorefrontProductRepository.html" data-type="entity-link" >IStorefrontProductRepository</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/Item.html" data-type="entity-link" >Item</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/IUserRepository.html" data-type="entity-link" >IUserRepository</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/MomoConfig.html" data-type="entity-link" >MomoConfig</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/MomoCreatePaymentUrlRequest.html" data-type="entity-link" >MomoCreatePaymentUrlRequest</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/MomoCreatePaymentUrlResponse.html" data-type="entity-link" >MomoCreatePaymentUrlResponse</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/MomoReturnQuery.html" data-type="entity-link" >MomoReturnQuery</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/OrderCalculationInput.html" data-type="entity-link" >OrderCalculationInput</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/OrderCalculationResult.html" data-type="entity-link" >OrderCalculationResult</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/PaginatedEntity.html" data-type="entity-link" >PaginatedEntity</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/PaymentResult.html" data-type="entity-link" >PaymentResult</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/PaymentStrategy.html" data-type="entity-link" >PaymentStrategy</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/PostgresError.html" data-type="entity-link" >PostgresError</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ProductDetailsRaw.html" data-type="entity-link" >ProductDetailsRaw</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ProductRaw.html" data-type="entity-link" >ProductRaw</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/RawProductRow.html" data-type="entity-link" >RawProductRow</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/RecentOrderRaw.html" data-type="entity-link" >RecentOrderRaw</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/RevenueRaw.html" data-type="entity-link" >RevenueRaw</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/Session.html" data-type="entity-link" >Session</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/StorageProvider.html" data-type="entity-link" >StorageProvider</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/StorageUploadResult.html" data-type="entity-link" >StorageUploadResult</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/SummaryRaw.html" data-type="entity-link" >SummaryRaw</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/Template.html" data-type="entity-link" >Template</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/TopProductRaw.html" data-type="entity-link" >TopProductRaw</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/UserInfo.html" data-type="entity-link" >UserInfo</a>
                            </li>
                        </ul>
                    </li>
                    <li class="chapter">
                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ? 'data-bs-target="#miscellaneous-links"'
                            : 'data-bs-target="#xs-miscellaneous-links"' }>
                            <span class="icon ion-ios-cube"></span>
                            <span>Miscellaneous</span>
                            <span class="icon ion-ios-arrow-down"></span>
                        </div>
                        <ul class="links collapse " ${ isNormalMode ? 'id="miscellaneous-links"' : 'id="xs-miscellaneous-links"' }>
                            <li class="link">
                                <a href="miscellaneous/enumerations.html" data-type="entity-link">Enums</a>
                            </li>
                            <li class="link">
                                <a href="miscellaneous/functions.html" data-type="entity-link">Functions</a>
                            </li>
                            <li class="link">
                                <a href="miscellaneous/typealiases.html" data-type="entity-link">Type aliases</a>
                            </li>
                            <li class="link">
                                <a href="miscellaneous/variables.html" data-type="entity-link">Variables</a>
                            </li>
                        </ul>
                    </li>
                        <li class="chapter">
                            <a data-type="chapter-link" href="routes.html"><span class="icon ion-ios-git-branch"></span>Routes</a>
                        </li>
                    <li class="chapter">
                        <a data-type="chapter-link" href="coverage.html"><span class="icon ion-ios-stats"></span>Documentation coverage</a>
                    </li>
                    <li class="divider"></li>
                    <li class="copyright">
                        Documentation generated using <a href="https://compodoc.app/" target="_blank" rel="noopener noreferrer">
                            <img data-src="images/compodoc-vectorise.png" class="img-responsive" data-type="compodoc-logo">
                        </a>
                    </li>
            </ul>
        </nav>
        `);
        this.innerHTML = tp.strings;
    }
});