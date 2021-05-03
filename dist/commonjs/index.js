'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _utils = require('./utils');

var utils = _interopRequireWildcard(_utils);

var _asyncStorage = require('@react-native-community/async-storage');

var _asyncStorage2 = _interopRequireDefault(_asyncStorage);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var storage = {
  setItem: function setItem(key, value) {
    if (_asyncStorage2.default) {
      return _asyncStorage2.default.setItem(key, value);
    }
  },
  getItem: function getItem(key, value) {
    if (_asyncStorage2.default) {
      return _asyncStorage2.default.getItem(key, value);
    }
    return undefined;
  }
};

function getDefaults() {
  return {
    prefix: 'i18next_res_',
    expirationTime: 7 * 24 * 60 * 60 * 1000,
    versions: {}
  };
}

var Cache = function () {
  function Cache(services) {
    var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

    _classCallCheck(this, Cache);

    this.init(services, options);

    this.type = 'backend';
  }

  _createClass(Cache, [{
    key: 'init',
    value: function init(services) {
      var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

      this.services = services;
      this.options = defaults(options, this.options || {}, getDefaults());
    }
  }, {
    key: 'read',
    value: function read(language, namespace, callback) {
      var _this = this;

      var nowMS = new Date().getTime();

      if (!_asyncStorage2.default) {
        return callback(null, null);
      }

      storage.getItem('' + this.options.prefix + language + '-' + namespace).then(function (local) {
        if (local) {
          local = JSON.parse(local);
          if (
          // expiration field is mandatory, and should not be expired
          local.i18nStamp && local.i18nStamp + _this.options.expirationTime > nowMS &&
          // there should be no language version set, or if it is, it should match the one in translation
          _this.options.versions[language] === local.i18nVersion) {
            delete local.i18nVersion;
            delete local.i18nStamp;
            return callback(null, local);
          }
        }

        callback(null, null);
      }).catch(function (err) {
        console.warn(err);
        callback(null, null);
      });
    }
  }, {
    key: 'save',
    value: function save(language, namespace, data) {
      if (_asyncStorage2.default) {
        data.i18nStamp = new Date().getTime();

        // language version (if set)
        if (this.options.versions[language]) {
          data.i18nVersion = this.options.versions[language];
        }

        // save
        storage.setItem('' + this.options.prefix + language + '-' + namespace, JSON.stringify(data));
      }
    }
  }]);

  return Cache;
}();

Cache.type = 'backend';

exports.default = Cache;