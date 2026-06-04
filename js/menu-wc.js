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
                                            'data-bs-target="#controllers-links-module-AppModule-2681e7a432fd678ff31133633a5ac905c5a12944ee824d2d1c9dfa5533aeba670a714055c10cdb8ec1d7a3f159666e0e5bff95b65f21476e1909826c0a10c2c2"' : 'data-bs-target="#xs-controllers-links-module-AppModule-2681e7a432fd678ff31133633a5ac905c5a12944ee824d2d1c9dfa5533aeba670a714055c10cdb8ec1d7a3f159666e0e5bff95b65f21476e1909826c0a10c2c2"' }>
                                            <span class="icon ion-md-swap"></span>
                                            <span>Controllers</span>
                                            <span class="icon ion-ios-arrow-down"></span>
                                        </div>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="controllers-links-module-AppModule-2681e7a432fd678ff31133633a5ac905c5a12944ee824d2d1c9dfa5533aeba670a714055c10cdb8ec1d7a3f159666e0e5bff95b65f21476e1909826c0a10c2c2"' :
                                            'id="xs-controllers-links-module-AppModule-2681e7a432fd678ff31133633a5ac905c5a12944ee824d2d1c9dfa5533aeba670a714055c10cdb8ec1d7a3f159666e0e5bff95b65f21476e1909826c0a10c2c2"' }>
                                            <li class="link">
                                                <a href="controllers/AppController.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >AppController</a>
                                            </li>
                                        </ul>
                                    </li>
                                <li class="chapter inner">
                                    <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                        'data-bs-target="#injectables-links-module-AppModule-2681e7a432fd678ff31133633a5ac905c5a12944ee824d2d1c9dfa5533aeba670a714055c10cdb8ec1d7a3f159666e0e5bff95b65f21476e1909826c0a10c2c2"' : 'data-bs-target="#xs-injectables-links-module-AppModule-2681e7a432fd678ff31133633a5ac905c5a12944ee824d2d1c9dfa5533aeba670a714055c10cdb8ec1d7a3f159666e0e5bff95b65f21476e1909826c0a10c2c2"' }>
                                        <span class="icon ion-md-arrow-round-down"></span>
                                        <span>Injectables</span>
                                        <span class="icon ion-ios-arrow-down"></span>
                                    </div>
                                    <ul class="links collapse" ${ isNormalMode ? 'id="injectables-links-module-AppModule-2681e7a432fd678ff31133633a5ac905c5a12944ee824d2d1c9dfa5533aeba670a714055c10cdb8ec1d7a3f159666e0e5bff95b65f21476e1909826c0a10c2c2"' :
                                        'id="xs-injectables-links-module-AppModule-2681e7a432fd678ff31133633a5ac905c5a12944ee824d2d1c9dfa5533aeba670a714055c10cdb8ec1d7a3f159666e0e5bff95b65f21476e1909826c0a10c2c2"' }>
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
                                            'data-bs-target="#controllers-links-module-AuthModule-1839f2e77ffda9d6fee8f418915dfbd55d2409d6fad22ab2b786336c1929854021430679da98bd16fffbb8f52d6e9b24e12b0244b1f70d1545aba841391659e8"' : 'data-bs-target="#xs-controllers-links-module-AuthModule-1839f2e77ffda9d6fee8f418915dfbd55d2409d6fad22ab2b786336c1929854021430679da98bd16fffbb8f52d6e9b24e12b0244b1f70d1545aba841391659e8"' }>
                                            <span class="icon ion-md-swap"></span>
                                            <span>Controllers</span>
                                            <span class="icon ion-ios-arrow-down"></span>
                                        </div>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="controllers-links-module-AuthModule-1839f2e77ffda9d6fee8f418915dfbd55d2409d6fad22ab2b786336c1929854021430679da98bd16fffbb8f52d6e9b24e12b0244b1f70d1545aba841391659e8"' :
                                            'id="xs-controllers-links-module-AuthModule-1839f2e77ffda9d6fee8f418915dfbd55d2409d6fad22ab2b786336c1929854021430679da98bd16fffbb8f52d6e9b24e12b0244b1f70d1545aba841391659e8"' }>
                                            <li class="link">
                                                <a href="controllers/AuthController.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >AuthController</a>
                                            </li>
                                        </ul>
                                    </li>
                                <li class="chapter inner">
                                    <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                        'data-bs-target="#injectables-links-module-AuthModule-1839f2e77ffda9d6fee8f418915dfbd55d2409d6fad22ab2b786336c1929854021430679da98bd16fffbb8f52d6e9b24e12b0244b1f70d1545aba841391659e8"' : 'data-bs-target="#xs-injectables-links-module-AuthModule-1839f2e77ffda9d6fee8f418915dfbd55d2409d6fad22ab2b786336c1929854021430679da98bd16fffbb8f52d6e9b24e12b0244b1f70d1545aba841391659e8"' }>
                                        <span class="icon ion-md-arrow-round-down"></span>
                                        <span>Injectables</span>
                                        <span class="icon ion-ios-arrow-down"></span>
                                    </div>
                                    <ul class="links collapse" ${ isNormalMode ? 'id="injectables-links-module-AuthModule-1839f2e77ffda9d6fee8f418915dfbd55d2409d6fad22ab2b786336c1929854021430679da98bd16fffbb8f52d6e9b24e12b0244b1f70d1545aba841391659e8"' :
                                        'id="xs-injectables-links-module-AuthModule-1839f2e77ffda9d6fee8f418915dfbd55d2409d6fad22ab2b786336c1929854021430679da98bd16fffbb8f52d6e9b24e12b0244b1f70d1545aba841391659e8"' }>
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
                                            'data-bs-target="#controllers-links-module-BrandsModule-0f029cd5647a7edda3b4239bf1b2a41eade00ec8e0a27ff7a1a2296b24ae2633a372a5b7ba5a716ad5a3c7470901c9d439345315060f0d8f92e4f1758072250b"' : 'data-bs-target="#xs-controllers-links-module-BrandsModule-0f029cd5647a7edda3b4239bf1b2a41eade00ec8e0a27ff7a1a2296b24ae2633a372a5b7ba5a716ad5a3c7470901c9d439345315060f0d8f92e4f1758072250b"' }>
                                            <span class="icon ion-md-swap"></span>
                                            <span>Controllers</span>
                                            <span class="icon ion-ios-arrow-down"></span>
                                        </div>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="controllers-links-module-BrandsModule-0f029cd5647a7edda3b4239bf1b2a41eade00ec8e0a27ff7a1a2296b24ae2633a372a5b7ba5a716ad5a3c7470901c9d439345315060f0d8f92e4f1758072250b"' :
                                            'id="xs-controllers-links-module-BrandsModule-0f029cd5647a7edda3b4239bf1b2a41eade00ec8e0a27ff7a1a2296b24ae2633a372a5b7ba5a716ad5a3c7470901c9d439345315060f0d8f92e4f1758072250b"' }>
                                            <li class="link">
                                                <a href="controllers/BrandsController.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >BrandsController</a>
                                            </li>
                                        </ul>
                                    </li>
                                <li class="chapter inner">
                                    <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                        'data-bs-target="#injectables-links-module-BrandsModule-0f029cd5647a7edda3b4239bf1b2a41eade00ec8e0a27ff7a1a2296b24ae2633a372a5b7ba5a716ad5a3c7470901c9d439345315060f0d8f92e4f1758072250b"' : 'data-bs-target="#xs-injectables-links-module-BrandsModule-0f029cd5647a7edda3b4239bf1b2a41eade00ec8e0a27ff7a1a2296b24ae2633a372a5b7ba5a716ad5a3c7470901c9d439345315060f0d8f92e4f1758072250b"' }>
                                        <span class="icon ion-md-arrow-round-down"></span>
                                        <span>Injectables</span>
                                        <span class="icon ion-ios-arrow-down"></span>
                                    </div>
                                    <ul class="links collapse" ${ isNormalMode ? 'id="injectables-links-module-BrandsModule-0f029cd5647a7edda3b4239bf1b2a41eade00ec8e0a27ff7a1a2296b24ae2633a372a5b7ba5a716ad5a3c7470901c9d439345315060f0d8f92e4f1758072250b"' :
                                        'id="xs-injectables-links-module-BrandsModule-0f029cd5647a7edda3b4239bf1b2a41eade00ec8e0a27ff7a1a2296b24ae2633a372a5b7ba5a716ad5a3c7470901c9d439345315060f0d8f92e4f1758072250b"' }>
                                        <li class="link">
                                            <a href="injectables/BrandRepository.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >BrandRepository</a>
                                        </li>
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
                                            'data-bs-target="#controllers-links-module-CartsModule-f37ed60fa11901a90571511bfb208b16cab0b0f6f0876f15c21cf043730a674c114fe8534983e3fc742611b9cac6a7ab664866dafd0d656ea223fb939e87430a"' : 'data-bs-target="#xs-controllers-links-module-CartsModule-f37ed60fa11901a90571511bfb208b16cab0b0f6f0876f15c21cf043730a674c114fe8534983e3fc742611b9cac6a7ab664866dafd0d656ea223fb939e87430a"' }>
                                            <span class="icon ion-md-swap"></span>
                                            <span>Controllers</span>
                                            <span class="icon ion-ios-arrow-down"></span>
                                        </div>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="controllers-links-module-CartsModule-f37ed60fa11901a90571511bfb208b16cab0b0f6f0876f15c21cf043730a674c114fe8534983e3fc742611b9cac6a7ab664866dafd0d656ea223fb939e87430a"' :
                                            'id="xs-controllers-links-module-CartsModule-f37ed60fa11901a90571511bfb208b16cab0b0f6f0876f15c21cf043730a674c114fe8534983e3fc742611b9cac6a7ab664866dafd0d656ea223fb939e87430a"' }>
                                            <li class="link">
                                                <a href="controllers/StorefrontCartsController.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >StorefrontCartsController</a>
                                            </li>
                                        </ul>
                                    </li>
                                <li class="chapter inner">
                                    <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                        'data-bs-target="#injectables-links-module-CartsModule-f37ed60fa11901a90571511bfb208b16cab0b0f6f0876f15c21cf043730a674c114fe8534983e3fc742611b9cac6a7ab664866dafd0d656ea223fb939e87430a"' : 'data-bs-target="#xs-injectables-links-module-CartsModule-f37ed60fa11901a90571511bfb208b16cab0b0f6f0876f15c21cf043730a674c114fe8534983e3fc742611b9cac6a7ab664866dafd0d656ea223fb939e87430a"' }>
                                        <span class="icon ion-md-arrow-round-down"></span>
                                        <span>Injectables</span>
                                        <span class="icon ion-ios-arrow-down"></span>
                                    </div>
                                    <ul class="links collapse" ${ isNormalMode ? 'id="injectables-links-module-CartsModule-f37ed60fa11901a90571511bfb208b16cab0b0f6f0876f15c21cf043730a674c114fe8534983e3fc742611b9cac6a7ab664866dafd0d656ea223fb939e87430a"' :
                                        'id="xs-injectables-links-module-CartsModule-f37ed60fa11901a90571511bfb208b16cab0b0f6f0876f15c21cf043730a674c114fe8534983e3fc742611b9cac6a7ab664866dafd0d656ea223fb939e87430a"' }>
                                        <li class="link">
                                            <a href="injectables/AdminCartsService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >AdminCartsService</a>
                                        </li>
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
                                            'data-bs-target="#controllers-links-module-CategoriesModule-2f4c7cff2bb7f8155bd6fe8cd6b82afb3fe530615e07e0039c3fcc30207e1f558d5297ebcf3e7df864408123d0607032d4921e990ff01d5c0dca57318a4cf851"' : 'data-bs-target="#xs-controllers-links-module-CategoriesModule-2f4c7cff2bb7f8155bd6fe8cd6b82afb3fe530615e07e0039c3fcc30207e1f558d5297ebcf3e7df864408123d0607032d4921e990ff01d5c0dca57318a4cf851"' }>
                                            <span class="icon ion-md-swap"></span>
                                            <span>Controllers</span>
                                            <span class="icon ion-ios-arrow-down"></span>
                                        </div>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="controllers-links-module-CategoriesModule-2f4c7cff2bb7f8155bd6fe8cd6b82afb3fe530615e07e0039c3fcc30207e1f558d5297ebcf3e7df864408123d0607032d4921e990ff01d5c0dca57318a4cf851"' :
                                            'id="xs-controllers-links-module-CategoriesModule-2f4c7cff2bb7f8155bd6fe8cd6b82afb3fe530615e07e0039c3fcc30207e1f558d5297ebcf3e7df864408123d0607032d4921e990ff01d5c0dca57318a4cf851"' }>
                                            <li class="link">
                                                <a href="controllers/CategoriesController.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >CategoriesController</a>
                                            </li>
                                        </ul>
                                    </li>
                                <li class="chapter inner">
                                    <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                        'data-bs-target="#injectables-links-module-CategoriesModule-2f4c7cff2bb7f8155bd6fe8cd6b82afb3fe530615e07e0039c3fcc30207e1f558d5297ebcf3e7df864408123d0607032d4921e990ff01d5c0dca57318a4cf851"' : 'data-bs-target="#xs-injectables-links-module-CategoriesModule-2f4c7cff2bb7f8155bd6fe8cd6b82afb3fe530615e07e0039c3fcc30207e1f558d5297ebcf3e7df864408123d0607032d4921e990ff01d5c0dca57318a4cf851"' }>
                                        <span class="icon ion-md-arrow-round-down"></span>
                                        <span>Injectables</span>
                                        <span class="icon ion-ios-arrow-down"></span>
                                    </div>
                                    <ul class="links collapse" ${ isNormalMode ? 'id="injectables-links-module-CategoriesModule-2f4c7cff2bb7f8155bd6fe8cd6b82afb3fe530615e07e0039c3fcc30207e1f558d5297ebcf3e7df864408123d0607032d4921e990ff01d5c0dca57318a4cf851"' :
                                        'id="xs-injectables-links-module-CategoriesModule-2f4c7cff2bb7f8155bd6fe8cd6b82afb3fe530615e07e0039c3fcc30207e1f558d5297ebcf3e7df864408123d0607032d4921e990ff01d5c0dca57318a4cf851"' }>
                                        <li class="link">
                                            <a href="injectables/CategoriesService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >CategoriesService</a>
                                        </li>
                                        <li class="link">
                                            <a href="injectables/CategoryRepository.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >CategoryRepository</a>
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
                                        'data-bs-target="#injectables-links-module-CustomersModule-96e5370e793a28cbf2ba81ba46ed028ba4b8ffe001edca820ea1ec13f70e774e2c4214969f41074033b1281afd80dbbb63deca527ac54bc1ab0c7748340a4629"' : 'data-bs-target="#xs-injectables-links-module-CustomersModule-96e5370e793a28cbf2ba81ba46ed028ba4b8ffe001edca820ea1ec13f70e774e2c4214969f41074033b1281afd80dbbb63deca527ac54bc1ab0c7748340a4629"' }>
                                        <span class="icon ion-md-arrow-round-down"></span>
                                        <span>Injectables</span>
                                        <span class="icon ion-ios-arrow-down"></span>
                                    </div>
                                    <ul class="links collapse" ${ isNormalMode ? 'id="injectables-links-module-CustomersModule-96e5370e793a28cbf2ba81ba46ed028ba4b8ffe001edca820ea1ec13f70e774e2c4214969f41074033b1281afd80dbbb63deca527ac54bc1ab0c7748340a4629"' :
                                        'id="xs-injectables-links-module-CustomersModule-96e5370e793a28cbf2ba81ba46ed028ba4b8ffe001edca820ea1ec13f70e774e2c4214969f41074033b1281afd80dbbb63deca527ac54bc1ab0c7748340a4629"' }>
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
                                            'data-bs-target="#controllers-links-module-DashboardModule-c8a86abde72a5311ca20032b572842b62fe56f8757f7b11b751b9b65b7537b31b71e7d7736ab4b4ecb5b39695c77937c7f10f83d18b4e28fdeeb53b4538fb9ac"' : 'data-bs-target="#xs-controllers-links-module-DashboardModule-c8a86abde72a5311ca20032b572842b62fe56f8757f7b11b751b9b65b7537b31b71e7d7736ab4b4ecb5b39695c77937c7f10f83d18b4e28fdeeb53b4538fb9ac"' }>
                                            <span class="icon ion-md-swap"></span>
                                            <span>Controllers</span>
                                            <span class="icon ion-ios-arrow-down"></span>
                                        </div>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="controllers-links-module-DashboardModule-c8a86abde72a5311ca20032b572842b62fe56f8757f7b11b751b9b65b7537b31b71e7d7736ab4b4ecb5b39695c77937c7f10f83d18b4e28fdeeb53b4538fb9ac"' :
                                            'id="xs-controllers-links-module-DashboardModule-c8a86abde72a5311ca20032b572842b62fe56f8757f7b11b751b9b65b7537b31b71e7d7736ab4b4ecb5b39695c77937c7f10f83d18b4e28fdeeb53b4538fb9ac"' }>
                                            <li class="link">
                                                <a href="controllers/DashboardController.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >DashboardController</a>
                                            </li>
                                        </ul>
                                    </li>
                                <li class="chapter inner">
                                    <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                        'data-bs-target="#injectables-links-module-DashboardModule-c8a86abde72a5311ca20032b572842b62fe56f8757f7b11b751b9b65b7537b31b71e7d7736ab4b4ecb5b39695c77937c7f10f83d18b4e28fdeeb53b4538fb9ac"' : 'data-bs-target="#xs-injectables-links-module-DashboardModule-c8a86abde72a5311ca20032b572842b62fe56f8757f7b11b751b9b65b7537b31b71e7d7736ab4b4ecb5b39695c77937c7f10f83d18b4e28fdeeb53b4538fb9ac"' }>
                                        <span class="icon ion-md-arrow-round-down"></span>
                                        <span>Injectables</span>
                                        <span class="icon ion-ios-arrow-down"></span>
                                    </div>
                                    <ul class="links collapse" ${ isNormalMode ? 'id="injectables-links-module-DashboardModule-c8a86abde72a5311ca20032b572842b62fe56f8757f7b11b751b9b65b7537b31b71e7d7736ab4b4ecb5b39695c77937c7f10f83d18b4e28fdeeb53b4538fb9ac"' :
                                        'id="xs-injectables-links-module-DashboardModule-c8a86abde72a5311ca20032b572842b62fe56f8757f7b11b751b9b65b7537b31b71e7d7736ab4b4ecb5b39695c77937c7f10f83d18b4e28fdeeb53b4538fb9ac"' }>
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
                                            'data-bs-target="#controllers-links-module-MediaModule-b88e9f90965901c4299708e5235063a44f6de74ea3e768df07ff1fb1e566a6ffda245fa52dfffc98bc711ec4ee85b8b0b813f0edac84bc0939ae12c822adaaff"' : 'data-bs-target="#xs-controllers-links-module-MediaModule-b88e9f90965901c4299708e5235063a44f6de74ea3e768df07ff1fb1e566a6ffda245fa52dfffc98bc711ec4ee85b8b0b813f0edac84bc0939ae12c822adaaff"' }>
                                            <span class="icon ion-md-swap"></span>
                                            <span>Controllers</span>
                                            <span class="icon ion-ios-arrow-down"></span>
                                        </div>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="controllers-links-module-MediaModule-b88e9f90965901c4299708e5235063a44f6de74ea3e768df07ff1fb1e566a6ffda245fa52dfffc98bc711ec4ee85b8b0b813f0edac84bc0939ae12c822adaaff"' :
                                            'id="xs-controllers-links-module-MediaModule-b88e9f90965901c4299708e5235063a44f6de74ea3e768df07ff1fb1e566a6ffda245fa52dfffc98bc711ec4ee85b8b0b813f0edac84bc0939ae12c822adaaff"' }>
                                            <li class="link">
                                                <a href="controllers/MediaController.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >MediaController</a>
                                            </li>
                                        </ul>
                                    </li>
                                <li class="chapter inner">
                                    <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                        'data-bs-target="#injectables-links-module-MediaModule-b88e9f90965901c4299708e5235063a44f6de74ea3e768df07ff1fb1e566a6ffda245fa52dfffc98bc711ec4ee85b8b0b813f0edac84bc0939ae12c822adaaff"' : 'data-bs-target="#xs-injectables-links-module-MediaModule-b88e9f90965901c4299708e5235063a44f6de74ea3e768df07ff1fb1e566a6ffda245fa52dfffc98bc711ec4ee85b8b0b813f0edac84bc0939ae12c822adaaff"' }>
                                        <span class="icon ion-md-arrow-round-down"></span>
                                        <span>Injectables</span>
                                        <span class="icon ion-ios-arrow-down"></span>
                                    </div>
                                    <ul class="links collapse" ${ isNormalMode ? 'id="injectables-links-module-MediaModule-b88e9f90965901c4299708e5235063a44f6de74ea3e768df07ff1fb1e566a6ffda245fa52dfffc98bc711ec4ee85b8b0b813f0edac84bc0939ae12c822adaaff"' :
                                        'id="xs-injectables-links-module-MediaModule-b88e9f90965901c4299708e5235063a44f6de74ea3e768df07ff1fb1e566a6ffda245fa52dfffc98bc711ec4ee85b8b0b813f0edac84bc0939ae12c822adaaff"' }>
                                        <li class="link">
                                            <a href="injectables/MediaAssetRepository.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >MediaAssetRepository</a>
                                        </li>
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
                                            'data-bs-target="#controllers-links-module-OrdersModule-afa5d0581d6aeb3509fcdf752b01d06457784f260411732d78586a767900387c390bd739fa120fffaa47a6b5b4f85c0619757bc7ce36422af20e38c30e430bff"' : 'data-bs-target="#xs-controllers-links-module-OrdersModule-afa5d0581d6aeb3509fcdf752b01d06457784f260411732d78586a767900387c390bd739fa120fffaa47a6b5b4f85c0619757bc7ce36422af20e38c30e430bff"' }>
                                            <span class="icon ion-md-swap"></span>
                                            <span>Controllers</span>
                                            <span class="icon ion-ios-arrow-down"></span>
                                        </div>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="controllers-links-module-OrdersModule-afa5d0581d6aeb3509fcdf752b01d06457784f260411732d78586a767900387c390bd739fa120fffaa47a6b5b4f85c0619757bc7ce36422af20e38c30e430bff"' :
                                            'id="xs-controllers-links-module-OrdersModule-afa5d0581d6aeb3509fcdf752b01d06457784f260411732d78586a767900387c390bd739fa120fffaa47a6b5b4f85c0619757bc7ce36422af20e38c30e430bff"' }>
                                            <li class="link">
                                                <a href="controllers/AdminOrdersController.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >AdminOrdersController</a>
                                            </li>
                                            <li class="link">
                                                <a href="controllers/StorefrontOrdersController.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >StorefrontOrdersController</a>
                                            </li>
                                        </ul>
                                    </li>
                                <li class="chapter inner">
                                    <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                        'data-bs-target="#injectables-links-module-OrdersModule-afa5d0581d6aeb3509fcdf752b01d06457784f260411732d78586a767900387c390bd739fa120fffaa47a6b5b4f85c0619757bc7ce36422af20e38c30e430bff"' : 'data-bs-target="#xs-injectables-links-module-OrdersModule-afa5d0581d6aeb3509fcdf752b01d06457784f260411732d78586a767900387c390bd739fa120fffaa47a6b5b4f85c0619757bc7ce36422af20e38c30e430bff"' }>
                                        <span class="icon ion-md-arrow-round-down"></span>
                                        <span>Injectables</span>
                                        <span class="icon ion-ios-arrow-down"></span>
                                    </div>
                                    <ul class="links collapse" ${ isNormalMode ? 'id="injectables-links-module-OrdersModule-afa5d0581d6aeb3509fcdf752b01d06457784f260411732d78586a767900387c390bd739fa120fffaa47a6b5b4f85c0619757bc7ce36422af20e38c30e430bff"' :
                                        'id="xs-injectables-links-module-OrdersModule-afa5d0581d6aeb3509fcdf752b01d06457784f260411732d78586a767900387c390bd739fa120fffaa47a6b5b4f85c0619757bc7ce36422af20e38c30e430bff"' }>
                                        <li class="link">
                                            <a href="injectables/AdminOrdersService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >AdminOrdersService</a>
                                        </li>
                                        <li class="link">
                                            <a href="injectables/OrderItemRepository.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >OrderItemRepository</a>
                                        </li>
                                        <li class="link">
                                            <a href="injectables/OrderRepository.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >OrderRepository</a>
                                        </li>
                                        <li class="link">
                                            <a href="injectables/StorefrontOrdersService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >StorefrontOrdersService</a>
                                        </li>
                                    </ul>
                                </li>
                            </li>
                            <li class="link">
                                <a href="modules/PaymentModule.html" data-type="entity-link" >PaymentModule</a>
                                    <li class="chapter inner">
                                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                            'data-bs-target="#controllers-links-module-PaymentModule-95b103c842615cf5205e0ed7eeca8f4b1bf4835a88109e6f2e0ca17772b6b7b1f4c1a891c4b9a7e1b1343ce6c8e36c68234855b479b363fb0036a6f545e0a5a6"' : 'data-bs-target="#xs-controllers-links-module-PaymentModule-95b103c842615cf5205e0ed7eeca8f4b1bf4835a88109e6f2e0ca17772b6b7b1f4c1a891c4b9a7e1b1343ce6c8e36c68234855b479b363fb0036a6f545e0a5a6"' }>
                                            <span class="icon ion-md-swap"></span>
                                            <span>Controllers</span>
                                            <span class="icon ion-ios-arrow-down"></span>
                                        </div>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="controllers-links-module-PaymentModule-95b103c842615cf5205e0ed7eeca8f4b1bf4835a88109e6f2e0ca17772b6b7b1f4c1a891c4b9a7e1b1343ce6c8e36c68234855b479b363fb0036a6f545e0a5a6"' :
                                            'id="xs-controllers-links-module-PaymentModule-95b103c842615cf5205e0ed7eeca8f4b1bf4835a88109e6f2e0ca17772b6b7b1f4c1a891c4b9a7e1b1343ce6c8e36c68234855b479b363fb0036a6f545e0a5a6"' }>
                                            <li class="link">
                                                <a href="controllers/PaymentController.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >PaymentController</a>
                                            </li>
                                        </ul>
                                    </li>
                                <li class="chapter inner">
                                    <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                        'data-bs-target="#injectables-links-module-PaymentModule-95b103c842615cf5205e0ed7eeca8f4b1bf4835a88109e6f2e0ca17772b6b7b1f4c1a891c4b9a7e1b1343ce6c8e36c68234855b479b363fb0036a6f545e0a5a6"' : 'data-bs-target="#xs-injectables-links-module-PaymentModule-95b103c842615cf5205e0ed7eeca8f4b1bf4835a88109e6f2e0ca17772b6b7b1f4c1a891c4b9a7e1b1343ce6c8e36c68234855b479b363fb0036a6f545e0a5a6"' }>
                                        <span class="icon ion-md-arrow-round-down"></span>
                                        <span>Injectables</span>
                                        <span class="icon ion-ios-arrow-down"></span>
                                    </div>
                                    <ul class="links collapse" ${ isNormalMode ? 'id="injectables-links-module-PaymentModule-95b103c842615cf5205e0ed7eeca8f4b1bf4835a88109e6f2e0ca17772b6b7b1f4c1a891c4b9a7e1b1343ce6c8e36c68234855b479b363fb0036a6f545e0a5a6"' :
                                        'id="xs-injectables-links-module-PaymentModule-95b103c842615cf5205e0ed7eeca8f4b1bf4835a88109e6f2e0ca17772b6b7b1f4c1a891c4b9a7e1b1343ce6c8e36c68234855b479b363fb0036a6f545e0a5a6"' }>
                                        <li class="link">
                                            <a href="injectables/MomoStrategy.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >MomoStrategy</a>
                                        </li>
                                        <li class="link">
                                            <a href="injectables/PaymentRepository.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >PaymentRepository</a>
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
                                            'data-bs-target="#controllers-links-module-ProductsModule-b7ff9b26b1c11de149f8273e7f356eed7570bb56d459c40163c4f838035b53ed422316d8c9767031d509744ffd9d0cda558bf328b236cd77d9f8bd3f1b1becf4"' : 'data-bs-target="#xs-controllers-links-module-ProductsModule-b7ff9b26b1c11de149f8273e7f356eed7570bb56d459c40163c4f838035b53ed422316d8c9767031d509744ffd9d0cda558bf328b236cd77d9f8bd3f1b1becf4"' }>
                                            <span class="icon ion-md-swap"></span>
                                            <span>Controllers</span>
                                            <span class="icon ion-ios-arrow-down"></span>
                                        </div>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="controllers-links-module-ProductsModule-b7ff9b26b1c11de149f8273e7f356eed7570bb56d459c40163c4f838035b53ed422316d8c9767031d509744ffd9d0cda558bf328b236cd77d9f8bd3f1b1becf4"' :
                                            'id="xs-controllers-links-module-ProductsModule-b7ff9b26b1c11de149f8273e7f356eed7570bb56d459c40163c4f838035b53ed422316d8c9767031d509744ffd9d0cda558bf328b236cd77d9f8bd3f1b1becf4"' }>
                                            <li class="link">
                                                <a href="controllers/AdminProductAttributesController.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >AdminProductAttributesController</a>
                                            </li>
                                            <li class="link">
                                                <a href="controllers/AdminProductVariantsController.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >AdminProductVariantsController</a>
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
                                        'data-bs-target="#injectables-links-module-ProductsModule-b7ff9b26b1c11de149f8273e7f356eed7570bb56d459c40163c4f838035b53ed422316d8c9767031d509744ffd9d0cda558bf328b236cd77d9f8bd3f1b1becf4"' : 'data-bs-target="#xs-injectables-links-module-ProductsModule-b7ff9b26b1c11de149f8273e7f356eed7570bb56d459c40163c4f838035b53ed422316d8c9767031d509744ffd9d0cda558bf328b236cd77d9f8bd3f1b1becf4"' }>
                                        <span class="icon ion-md-arrow-round-down"></span>
                                        <span>Injectables</span>
                                        <span class="icon ion-ios-arrow-down"></span>
                                    </div>
                                    <ul class="links collapse" ${ isNormalMode ? 'id="injectables-links-module-ProductsModule-b7ff9b26b1c11de149f8273e7f356eed7570bb56d459c40163c4f838035b53ed422316d8c9767031d509744ffd9d0cda558bf328b236cd77d9f8bd3f1b1becf4"' :
                                        'id="xs-injectables-links-module-ProductsModule-b7ff9b26b1c11de149f8273e7f356eed7570bb56d459c40163c4f838035b53ed422316d8c9767031d509744ffd9d0cda558bf328b236cd77d9f8bd3f1b1becf4"' }>
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
                                            <a href="injectables/AdminProductVariantsService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >AdminProductVariantsService</a>
                                        </li>
                                        <li class="link">
                                            <a href="injectables/AdminProductsService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >AdminProductsService</a>
                                        </li>
                                        <li class="link">
                                            <a href="injectables/AdminVariantAttributesService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >AdminVariantAttributesService</a>
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
                                            <a href="injectables/ProductVariantRepository.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >ProductVariantRepository</a>
                                        </li>
                                        <li class="link">
                                            <a href="injectables/StorefrontProductsService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >StorefrontProductsService</a>
                                        </li>
                                        <li class="link">
                                            <a href="injectables/VariantAttributeRepository.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >VariantAttributeRepository</a>
                                        </li>
                                    </ul>
                                </li>
                            </li>
                            <li class="link">
                                <a href="modules/SeedsModule.html" data-type="entity-link" >SeedsModule</a>
                                <li class="chapter inner">
                                    <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                        'data-bs-target="#injectables-links-module-SeedsModule-962760c614a8bf241e564f9af5c9f44c0bd6c423a1a5be7182875a17df88ea0e800dcbe9dcba65c7b25e74b405abb1de992dc2f781ab710e1f6d154891a7b3e9"' : 'data-bs-target="#xs-injectables-links-module-SeedsModule-962760c614a8bf241e564f9af5c9f44c0bd6c423a1a5be7182875a17df88ea0e800dcbe9dcba65c7b25e74b405abb1de992dc2f781ab710e1f6d154891a7b3e9"' }>
                                        <span class="icon ion-md-arrow-round-down"></span>
                                        <span>Injectables</span>
                                        <span class="icon ion-ios-arrow-down"></span>
                                    </div>
                                    <ul class="links collapse" ${ isNormalMode ? 'id="injectables-links-module-SeedsModule-962760c614a8bf241e564f9af5c9f44c0bd6c423a1a5be7182875a17df88ea0e800dcbe9dcba65c7b25e74b405abb1de992dc2f781ab710e1f6d154891a7b3e9"' :
                                        'id="xs-injectables-links-module-SeedsModule-962760c614a8bf241e564f9af5c9f44c0bd6c423a1a5be7182875a17df88ea0e800dcbe9dcba65c7b25e74b405abb1de992dc2f781ab710e1f6d154891a7b3e9"' }>
                                        <li class="link">
                                            <a href="injectables/SeedBrandsRunner.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >SeedBrandsRunner</a>
                                        </li>
                                        <li class="link">
                                            <a href="injectables/SeedCategoriesRunner.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >SeedCategoriesRunner</a>
                                        </li>
                                        <li class="link">
                                            <a href="injectables/SeedProductsRunner.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >SeedProductsRunner</a>
                                        </li>
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
                                <a href="modules/StorefrontConfigurationsModule.html" data-type="entity-link" >StorefrontConfigurationsModule</a>
                                    <li class="chapter inner">
                                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                            'data-bs-target="#controllers-links-module-StorefrontConfigurationsModule-ecb9d1a8e0fec13eda499c5d4774e08597dca93b72b1d26ee5cb8378cc18448e95896806e246744ba2283c7640abb0bfd0b4ee2124c5ba807b671b70980b8859"' : 'data-bs-target="#xs-controllers-links-module-StorefrontConfigurationsModule-ecb9d1a8e0fec13eda499c5d4774e08597dca93b72b1d26ee5cb8378cc18448e95896806e246744ba2283c7640abb0bfd0b4ee2124c5ba807b671b70980b8859"' }>
                                            <span class="icon ion-md-swap"></span>
                                            <span>Controllers</span>
                                            <span class="icon ion-ios-arrow-down"></span>
                                        </div>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="controllers-links-module-StorefrontConfigurationsModule-ecb9d1a8e0fec13eda499c5d4774e08597dca93b72b1d26ee5cb8378cc18448e95896806e246744ba2283c7640abb0bfd0b4ee2124c5ba807b671b70980b8859"' :
                                            'id="xs-controllers-links-module-StorefrontConfigurationsModule-ecb9d1a8e0fec13eda499c5d4774e08597dca93b72b1d26ee5cb8378cc18448e95896806e246744ba2283c7640abb0bfd0b4ee2124c5ba807b671b70980b8859"' }>
                                            <li class="link">
                                                <a href="controllers/StorefrontConfigurationsController.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >StorefrontConfigurationsController</a>
                                            </li>
                                            <li class="link">
                                                <a href="controllers/StorefrontSlidersController.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >StorefrontSlidersController</a>
                                            </li>
                                        </ul>
                                    </li>
                                <li class="chapter inner">
                                    <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                        'data-bs-target="#injectables-links-module-StorefrontConfigurationsModule-ecb9d1a8e0fec13eda499c5d4774e08597dca93b72b1d26ee5cb8378cc18448e95896806e246744ba2283c7640abb0bfd0b4ee2124c5ba807b671b70980b8859"' : 'data-bs-target="#xs-injectables-links-module-StorefrontConfigurationsModule-ecb9d1a8e0fec13eda499c5d4774e08597dca93b72b1d26ee5cb8378cc18448e95896806e246744ba2283c7640abb0bfd0b4ee2124c5ba807b671b70980b8859"' }>
                                        <span class="icon ion-md-arrow-round-down"></span>
                                        <span>Injectables</span>
                                        <span class="icon ion-ios-arrow-down"></span>
                                    </div>
                                    <ul class="links collapse" ${ isNormalMode ? 'id="injectables-links-module-StorefrontConfigurationsModule-ecb9d1a8e0fec13eda499c5d4774e08597dca93b72b1d26ee5cb8378cc18448e95896806e246744ba2283c7640abb0bfd0b4ee2124c5ba807b671b70980b8859"' :
                                        'id="xs-injectables-links-module-StorefrontConfigurationsModule-ecb9d1a8e0fec13eda499c5d4774e08597dca93b72b1d26ee5cb8378cc18448e95896806e246744ba2283c7640abb0bfd0b4ee2124c5ba807b671b70980b8859"' }>
                                        <li class="link">
                                            <a href="injectables/StorefrontConfigurationRepository.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >StorefrontConfigurationRepository</a>
                                        </li>
                                        <li class="link">
                                            <a href="injectables/StorefrontConfigurationsService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >StorefrontConfigurationsService</a>
                                        </li>
                                        <li class="link">
                                            <a href="injectables/StorefrontSliderRepository.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >StorefrontSliderRepository</a>
                                        </li>
                                        <li class="link">
                                            <a href="injectables/StorefrontSlidersService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >StorefrontSlidersService</a>
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
                                            'data-bs-target="#controllers-links-module-UsersModule-233387f42a11c62ab81b40c01d61cff6ca2399841f56746811d5be92d0c3ad1593b0c5660c77e22c1acba166fa9a831344eeb5a7a964af39a9a3237251a80011"' : 'data-bs-target="#xs-controllers-links-module-UsersModule-233387f42a11c62ab81b40c01d61cff6ca2399841f56746811d5be92d0c3ad1593b0c5660c77e22c1acba166fa9a831344eeb5a7a964af39a9a3237251a80011"' }>
                                            <span class="icon ion-md-swap"></span>
                                            <span>Controllers</span>
                                            <span class="icon ion-ios-arrow-down"></span>
                                        </div>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="controllers-links-module-UsersModule-233387f42a11c62ab81b40c01d61cff6ca2399841f56746811d5be92d0c3ad1593b0c5660c77e22c1acba166fa9a831344eeb5a7a964af39a9a3237251a80011"' :
                                            'id="xs-controllers-links-module-UsersModule-233387f42a11c62ab81b40c01d61cff6ca2399841f56746811d5be92d0c3ad1593b0c5660c77e22c1acba166fa9a831344eeb5a7a964af39a9a3237251a80011"' }>
                                            <li class="link">
                                                <a href="controllers/UsersController.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >UsersController</a>
                                            </li>
                                        </ul>
                                    </li>
                                <li class="chapter inner">
                                    <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                        'data-bs-target="#injectables-links-module-UsersModule-233387f42a11c62ab81b40c01d61cff6ca2399841f56746811d5be92d0c3ad1593b0c5660c77e22c1acba166fa9a831344eeb5a7a964af39a9a3237251a80011"' : 'data-bs-target="#xs-injectables-links-module-UsersModule-233387f42a11c62ab81b40c01d61cff6ca2399841f56746811d5be92d0c3ad1593b0c5660c77e22c1acba166fa9a831344eeb5a7a964af39a9a3237251a80011"' }>
                                        <span class="icon ion-md-arrow-round-down"></span>
                                        <span>Injectables</span>
                                        <span class="icon ion-ios-arrow-down"></span>
                                    </div>
                                    <ul class="links collapse" ${ isNormalMode ? 'id="injectables-links-module-UsersModule-233387f42a11c62ab81b40c01d61cff6ca2399841f56746811d5be92d0c3ad1593b0c5660c77e22c1acba166fa9a831344eeb5a7a964af39a9a3237251a80011"' :
                                        'id="xs-injectables-links-module-UsersModule-233387f42a11c62ab81b40c01d61cff6ca2399841f56746811d5be92d0c3ad1593b0c5660c77e22c1acba166fa9a831344eeb5a7a964af39a9a3237251a80011"' }>
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
                                    <a href="entities/StorefrontConfiguration.html" data-type="entity-link" >StorefrontConfiguration</a>
                                </li>
                                <li class="link">
                                    <a href="entities/StorefrontSlider.html" data-type="entity-link" >StorefrontSlider</a>
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
                                <a href="classes/BrandMapper.html" data-type="entity-link" >BrandMapper</a>
                            </li>
                            <li class="link">
                                <a href="classes/BrandResponseDto.html" data-type="entity-link" >BrandResponseDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/BrandUpdateEntityInput.html" data-type="entity-link" >BrandUpdateEntityInput</a>
                            </li>
                            <li class="link">
                                <a href="classes/BuyNowDto.html" data-type="entity-link" >BuyNowDto</a>
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
                                <a href="classes/CartUpdateEntityDto-1.html" data-type="entity-link" >CartUpdateEntityDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/Category.html" data-type="entity-link" >Category</a>
                            </li>
                            <li class="link">
                                <a href="classes/CategoryChildResponseDto.html" data-type="entity-link" >CategoryChildResponseDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/CategoryCreateEntityDto.html" data-type="entity-link" >CategoryCreateEntityDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/CategoryMapper.html" data-type="entity-link" >CategoryMapper</a>
                            </li>
                            <li class="link">
                                <a href="classes/CategoryResponseDto.html" data-type="entity-link" >CategoryResponseDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/CategoryUpdateEntityDto.html" data-type="entity-link" >CategoryUpdateEntityDto</a>
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
                                <a href="classes/CreateStorefrontConfigTables1777595779348.html" data-type="entity-link" >CreateStorefrontConfigTables1777595779348</a>
                            </li>
                            <li class="link">
                                <a href="classes/CreateStorefrontConfigurationsTable1778195710003.html" data-type="entity-link" >CreateStorefrontConfigurationsTable1778195710003</a>
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
                                <a href="classes/GetStorefrontConfigurationsDto.html" data-type="entity-link" >GetStorefrontConfigurationsDto</a>
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
                                <a href="classes/OrderDetailsResponseDto.html" data-type="entity-link" >OrderDetailsResponseDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/OrderItem.html" data-type="entity-link" >OrderItem</a>
                            </li>
                            <li class="link">
                                <a href="classes/OrderItemCreateEntityDto.html" data-type="entity-link" >OrderItemCreateEntityDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/OrderMapper.html" data-type="entity-link" >OrderMapper</a>
                            </li>
                            <li class="link">
                                <a href="classes/OrderResponseDto.html" data-type="entity-link" >OrderResponseDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/OrderUpdateEntityInput.html" data-type="entity-link" >OrderUpdateEntityInput</a>
                            </li>
                            <li class="link">
                                <a href="classes/PaginationQueryDto.html" data-type="entity-link" >PaginationQueryDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/Payment.html" data-type="entity-link" >Payment</a>
                            </li>
                            <li class="link">
                                <a href="classes/PaymentCreateEntityInput.html" data-type="entity-link" >PaymentCreateEntityInput</a>
                            </li>
                            <li class="link">
                                <a href="classes/PaymentUpdateEntityInput.html" data-type="entity-link" >PaymentUpdateEntityInput</a>
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
                                <a href="classes/StorefrontConfiguration.html" data-type="entity-link" >StorefrontConfiguration</a>
                            </li>
                            <li class="link">
                                <a href="classes/StorefrontConfigurationCreateEntityInput.html" data-type="entity-link" >StorefrontConfigurationCreateEntityInput</a>
                            </li>
                            <li class="link">
                                <a href="classes/StorefrontConfigurationMapper.html" data-type="entity-link" >StorefrontConfigurationMapper</a>
                            </li>
                            <li class="link">
                                <a href="classes/StorefrontConfigurationResponseDto.html" data-type="entity-link" >StorefrontConfigurationResponseDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/StorefrontConfigurationUpdateEntityInput.html" data-type="entity-link" >StorefrontConfigurationUpdateEntityInput</a>
                            </li>
                            <li class="link">
                                <a href="classes/StorefrontProductMapper.html" data-type="entity-link" >StorefrontProductMapper</a>
                            </li>
                            <li class="link">
                                <a href="classes/StorefrontProductResponseDto.html" data-type="entity-link" >StorefrontProductResponseDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/StorefrontProductsResolver.html" data-type="entity-link" >StorefrontProductsResolver</a>
                            </li>
                            <li class="link">
                                <a href="classes/StorefrontProductType.html" data-type="entity-link" >StorefrontProductType</a>
                            </li>
                            <li class="link">
                                <a href="classes/StorefrontSliderCreateEntityInput.html" data-type="entity-link" >StorefrontSliderCreateEntityInput</a>
                            </li>
                            <li class="link">
                                <a href="classes/StorefrontSliderMapper.html" data-type="entity-link" >StorefrontSliderMapper</a>
                            </li>
                            <li class="link">
                                <a href="classes/StorefrontSliderResponseDto.html" data-type="entity-link" >StorefrontSliderResponseDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/StorefrontSliderUpdateEntityInput.html" data-type="entity-link" >StorefrontSliderUpdateEntityInput</a>
                            </li>
                            <li class="link">
                                <a href="classes/SyncStorefrontConfigurationItemDto.html" data-type="entity-link" >SyncStorefrontConfigurationItemDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/SyncStorefrontConfigurationsDto.html" data-type="entity-link" >SyncStorefrontConfigurationsDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/SyncStorefrontSliderItemDto.html" data-type="entity-link" >SyncStorefrontSliderItemDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/SyncStorefrontSlidersDto.html" data-type="entity-link" >SyncStorefrontSlidersDto</a>
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
                                <a href="classes/UserUpdateEntityDto.html" data-type="entity-link" >UserUpdateEntityDto</a>
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
                                    <a href="injectables/BrandRepository.html" data-type="entity-link" >BrandRepository</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/CartItemRepository.html" data-type="entity-link" >CartItemRepository</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/CartRepository.html" data-type="entity-link" >CartRepository</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/CategoryRepository.html" data-type="entity-link" >CategoryRepository</a>
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
                                    <a href="injectables/MediaAssetRepository.html" data-type="entity-link" >MediaAssetRepository</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/MomoStrategy.html" data-type="entity-link" >MomoStrategy</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/NonEmptyBodyPipe.html" data-type="entity-link" >NonEmptyBodyPipe</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/OrderItemRepository.html" data-type="entity-link" >OrderItemRepository</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/OrderRepository.html" data-type="entity-link" >OrderRepository</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/PaymentRepository.html" data-type="entity-link" >PaymentRepository</a>
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
                                    <a href="injectables/ProductVariantRepository.html" data-type="entity-link" >ProductVariantRepository</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/RefreshTokenRepository.html" data-type="entity-link" >RefreshTokenRepository</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/RoleRepository.html" data-type="entity-link" >RoleRepository</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/StorefrontConfigurationRepository.html" data-type="entity-link" >StorefrontConfigurationRepository</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/StorefrontSliderRepository.html" data-type="entity-link" >StorefrontSliderRepository</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/UserRepository.html" data-type="entity-link" >UserRepository</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/VariantAttributeRepository.html" data-type="entity-link" >VariantAttributeRepository</a>
                                </li>
                            </ul>
                        </li>
                    <li class="chapter">
                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ? 'data-bs-target="#guards-links"' :
                            'data-bs-target="#xs-guards-links"' }>
                            <span class="icon ion-ios-lock"></span>
                            <span>Guards</span>
                            <span class="icon ion-ios-arrow-down"></span>
                        </div>
                        <ul class="links collapse " ${ isNormalMode ? 'id="guards-links"' : 'id="xs-guards-links"' }>
                            <li class="link">
                                <a href="guards/RolesGuard.html" data-type="entity-link" >RolesGuard</a>
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
                                <a href="interfaces/CategoryRaw.html" data-type="entity-link" >CategoryRaw</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/CategorySalesRaw.html" data-type="entity-link" >CategorySalesRaw</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/CategorySeed.html" data-type="entity-link" >CategorySeed</a>
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
                                <a href="interfaces/IBrandRepository.html" data-type="entity-link" >IBrandRepository</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ICartItemRepository.html" data-type="entity-link" >ICartItemRepository</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ICartRepository.html" data-type="entity-link" >ICartRepository</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ICategoryRepository.html" data-type="entity-link" >ICategoryRepository</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ICustomerRepository.html" data-type="entity-link" >ICustomerRepository</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/IIdentityRepository.html" data-type="entity-link" >IIdentityRepository</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/IMediaAssetRepository.html" data-type="entity-link" >IMediaAssetRepository</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/IOrderItemRepository.html" data-type="entity-link" >IOrderItemRepository</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/IOrderRepository.html" data-type="entity-link" >IOrderRepository</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/IPaymentRepository.html" data-type="entity-link" >IPaymentRepository</a>
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
                                <a href="interfaces/IProductVariantRepository.html" data-type="entity-link" >IProductVariantRepository</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/IRefreshTokenRepository.html" data-type="entity-link" >IRefreshTokenRepository</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/IRoleRepository.html" data-type="entity-link" >IRoleRepository</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/IStorefrontConfigurationRepository.html" data-type="entity-link" >IStorefrontConfigurationRepository</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/IStorefrontSliderRepository.html" data-type="entity-link" >IStorefrontSliderRepository</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/Item.html" data-type="entity-link" >Item</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/IUserRepository.html" data-type="entity-link" >IUserRepository</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/IVariantAttributeRepository.html" data-type="entity-link" >IVariantAttributeRepository</a>
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
                                <a href="interfaces/OrderRaw.html" data-type="entity-link" >OrderRaw</a>
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
                                <a href="interfaces/ProductSeed.html" data-type="entity-link" >ProductSeed</a>
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
                            <li class="link">
                                <a href="interfaces/VariantSeed.html" data-type="entity-link" >VariantSeed</a>
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