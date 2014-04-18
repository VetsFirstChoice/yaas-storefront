/**
 * [y] hybris Platform
 *
 * Copyright (c) 2000-2014 hybris AG
 * All rights reserved.
 *
 * This software is the confidential and proprietary information of hybris
 * ("Confidential Information"). You shall not disclose such Confidential
 * Information and shall use it only in accordance with the terms of the
 * license agreement you entered into with hybris.
 */
describe('ProductSvc Test', function () {

    var productUrl = 'http://product-service-dprod.deis-dev-01.ytech.fra.hybris.com';
    var productRoute = '/products';
    var $scope, $rootScope, $httpBackend, productSvc;

    var prodList = [
        {name: 'Shirt'},
        {name: 'Hat'}
    ];

    beforeEach(angular.mock.module('ds.products', function (caasProvider) {

        caasProvider.setBaseRoute(productUrl);
        caasProvider.endpoint('products', { productSku: '@productSku' }).route(productRoute);
    }));


    beforeEach(function () {
        this.addMatchers({
            toEqualData: function (expected) {
                return angular.equals(this.actual, expected);
            }
        });

        inject(function (_$httpBackend_, _$rootScope_, _ProductSvc_) {
            $rootScope = _$rootScope_;
            $scope = _$rootScope_.$new();

            $httpBackend = _$httpBackend_;
            productSvc = _ProductSvc_;
        });
    });


    it('query returns product array', function () {
        $httpBackend.expectGET('http://product-service-dprod.deis-dev-01.ytech.fra.hybris.com/products').respond(prodList);

        var products = productSvc.query();

        $httpBackend.flush();
        expect(products).toEqualData(prodList);
    });

     it('query with success handler invokes callback on resolved promise', function () {
         var products;
         $httpBackend.expectGET('http://product-service-dprod.deis-dev-01.ytech.fra.hybris.com/products').respond(prodList);

         var myCallback = function(result) {
             products = result;
         }

         productSvc.queryWithResultHandler({}, myCallback);
         $httpBackend.flush();
         expect(products).toEqualData(prodList);
     });
});