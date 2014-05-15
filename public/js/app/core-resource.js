/*
 * JS endpoint provider for easily creating new REST endpoints.
 */

'use strict';


/** Namespace for the application. */
var yngApp = {};

yngApp.core = angular.module('yng.core', ['ngResource']);

/******************************************************************************/

/**
 * Configuration object for an api endpoint.
 * @constructor
 */
yngApp.ApiEndpointConfig = function() {
    /**
     * Map of actions for the endpoint, keyed by action name. An action has a HTTP
     * method (GET, POST, etc.) as well as an optional set of default parameters.
     * @type {Object.<string, {method: string, params: Object}>}
     */
    this.actions = {};

    /** Map of custom headers to be added for each method, keyed on header name.*/
    this.customHeaders = {};

    /** Array of custom interceptors to be added.*/
    this.customInterceptors = {};

    /** Flag indicating if CORS should be enabled.*/
    this.corsEnabled = false;

    /** The default actions defined for every endpoint.
    {action1: {method:?, params:?, isArray:?, headers:?, ...},
        action2: {method:?, params:?, isArray:?, headers:?, ...},
    ...}    */
    this.defaultActions  =
    {
        'get': { method: 'GET' },
        'save': { method: 'POST', params:{} },
        'query': { method: 'GET', params:{}, isArray: true },
        'remove': { method: 'DELETE', params:{}},
        'delete': { method: 'DELETE', params:{}},
        'update': { method: 'PUT', params:{}}
    };

};




/**
 * Set the base URL for this endpoint, exclusive of path.
 * @param {string} url
 * @return {yngApp.ApiEndpointConfig}
 */
yngApp.ApiEndpointConfig.prototype.baseUrl = function(url) {
    this.baseUrl = url;
    return this;
};

/**
 * Set the route for this endpoint. This is relative to the server's base route.
 * @param {string} route
 * @return {yngApp.ApiEndpointConfig}
 */
yngApp.ApiEndpointConfig.prototype.route = function(route) {
    this.route = route;
    return this;
};


yngApp.ApiEndpointConfig.prototype.customHeaders = function (customHeaders) {
    this.customHeaders = customHeaders;
    return this;
};

yngApp.ApiEndpointConfig.prototype.customInterceptors = function (customInterceptors) {
    this.customInterceptors = customInterceptors;
    return this;
};

/** Enables CORS for this endpoint. */
yngApp.ApiEndpointConfig.prototype.enableCors = function () {
    this.corsEnabled = true;
    return this;
};

/******************************************************************************/

/**
 * Configuration object for a query.
 * @constructor
 */
yngApp.QueryConfig = function() {

     this.parmMap = {};
};


/**
 * An api endpoint.
 *
 * @constructor
 * @param {string} baseRoute The server api's base route.
 * @param {yngApp.ApiEndpointConfig} endpointConfig Configuration object for the
 *     endpoint.
 * @param {!Object} $injector The angular $injector service.
 * @param {!Function} $resource The angular $resource service.
 */
yngApp.ApiEndpoint = function(endpointConfig, $injector, $resource) {
    this.config = endpointConfig;
    this.$injector = $injector;

    this.API = $resource(endpointConfig.baseUrl + endpointConfig.route, {},
        endpointConfig.defaultActions);

    /*
    var self = this;
    angular.forEach(endpointConfig.actions, function(action, actionName) {
        var actionMethod = self.actionrequest;
        self[actionName] = angular.bind(self, actionMethod, actionName);
    });  */

    /*
    // Extend this endpoint objects with methods for all of the actions defined
    // in the configuration object. The action performed depends on whether or
    // not there is a model defined in the configuration; when there is a model
    // defined, certain request types must be wrapped in order to apply the
    // pre/post request transformations defined by the model.
    var self = this;
    angular.forEach(endpointConfig.actions, function(action, actionName) {
        var actionMethod = self.request;

        action.headers = angular.extend(action.headers || {}, endpointConfig.customHeaders || {});

        // Handle interceptors
        if (!action.interceptor) {
            action = angular.extend(action, { interceptor: endpointConfig.customInterceptors });
        } else {
            // Merge custom with default interceptors
            var mergedInterceptor = action.interceptor;
            angular.forEach(action.interceptor, function(interceptorFn, interceptorKey) {
                if (endpointConfig.customInterceptors[interceptorKey]) {
                    mergedInterceptor[interceptorKey] = function() {
                        endpointConfig.customInterceptors[interceptorKey].apply(this, arguments);
                        interceptorFn.apply(this, arguments);
                    };
                }
                action.interceptor = mergedInterceptor;
            });
        }

        self[actionName] = angular.bind(self, actionMethod, actionName);
    });   */

};


/******************************************************************************/

/**
 * Angular provider for configuring and instantiating as api service.
 *
 * @constructor
 */
yngApp.ApiProvider = function() {

    this.endpoints = {};
};


/**
 * Creates an api endpoint. The endpoint is returned so that configuration of
 * the endpoint can be chained.
 *
 * @param {string} name The name of the endpoint.
 * @return {yngApp.ApiEndpointConfig} The endpoint configuration object.
 */
yngApp.ApiProvider.prototype.endpoint = function(name) {
    var endpointConfig = new yngApp.ApiEndpointConfig();
    this.endpoints[name] = endpointConfig;
    return endpointConfig;
};

/**
 * Function invoked by angular to get the instance of the api service.
 * @return {Object.<string, yngApp.ApiEndpoint>} The set of all api endpoints.
 */
yngApp.ApiProvider.prototype.$get = ['$injector', function($injector) {
    var api = {};

    var self = this;
    angular.forEach(this.endpoints, function(endpointConfig, name) {
        api[name] = $injector.instantiate(yngApp.ApiEndpoint, {
            baseRoute: self.baseRoute,
            endpointConfig: endpointConfig
        });
    });

    return api;
}];

// Create CAAS API provider
yngApp.core.config(function($provide) {
    $provide.provider('caas', yngApp.ApiProvider);
});


yngApp.apis = angular.module('yng.apis',[] );

/**
 * Constants for accessing the CAAS APIs
 */
    yngApp.apis.constant('settings', {
        apis: {

            product: {
                route: '/products/:productSku',
                // query parameters
                PAGE_NUMBER: 'pageNumber',
                PAGE_SIZE: 'pageSize',
                SORT: 'sort'
            },
            headers: {
                tenant: 'X-tenantId',
                authorization: 'Authorization',
                buyer: 'X-buyerId'
            }
        }
    });






