angular.module('wwwsplit-timer.templates', ['timer.tmpl']);
angular.module('timer.tmpl', []).run([
  '$templateCache',
  function ($templateCache) {
    $templateCache.put('timer.tmpl', '<div class="ng-scope" id="control_nav">\n' + '  <button class="control" id="start" ng-click="start_timer()" ng-disabled="running || is_editing">\n' + '    <i class="icon-play icon-2x icon-white"></i>\n' + '  </button>\n' + '  <button disabled="disabled" class="control" id="reset" ng-click="reset_timer()" ng-disabled="!(running || is_finished)">\n' + '    <i class="icon-refresh icon-2x icon-white"></i>\n' + '  </button>\n' + '  <button disabled="disabled" class="control" id="split" ng-click="split()" ng-disabled="!running">\n' + '    <i class="icon-forward icon-2x icon-white"></i>\n' + '  </button>\n' + '  <button disabled="disabled" class="control" id="unsplit" ng-click="unsplit()" ng-disabled="!running || current_split == current_run.splits[0]">\n' + '    <i class="icon-backward icon-2x icon-white"></i>\n' + '  </button>\n' + '  <button style="display: none;" class="control" id="cancel_edit" ng-click="cancel_edit()" ng-disabled="running || run_editor_form.$invalid" ng-show="is_editing">\n' + '    <i class="icon-ban-circle icon-2x icon-white"></i>\n' + '  </button>\n' + '</div>\n' + '\n' + '<div id=\'current_run\'>\n' + '  <table class=\'table\' id=\'current_run_splits\' ng-class=\'{"table-hover": !running}\'>\n' + '    <tr id=\'current_run_title\'>\n' + '      <th colspan=\'2\'>\n' + '        <h1>\n' + '          {{current_run.title}} #{{current_run.attempts}}\n' + '        </h1>\n' + '        <h4 id=\'current_run_game_title\'>\n' + '          <a ng-href=\'#/games/{{current_run.game.id}}\'>\n' + '            {{current_run.game.title}}\n' + '          </a>\n' + '        </h4>\n' + '      </th>\n' + '    </tr>\n' + '    <tr class=\'current_run_split\' ng-class=\'{active_split: split == current_split}\' ng-repeat=\'split in current_run.splits\'>\n' + '      <td class=\'split_title\'>\n' + '      {{split.title}}\n' + '      </td>\n' + '      <td class=\'split_time\' ng-class=\'{ahead: split.live_data.live_time < split.split_time, behind: split.live_data.live_time > split.split_time,\n' + '      gained_time: split.live_data.segment_diff < 0, lost_time: split.live_data.segment_diff > 0 ,\n' + '      unknown: split.live_data.live_time && !split.live_data.relative_time,\n' + '      best: split.live_data.best_segment}\'>\n' + '        <span>{{split.live_data.relative_time || split.live_data.live_time || split.split_time | milliseconds_to_HMS}}</span>\n' + '      </td>\n' + '    </tr>\n' + '  </table>\n' + '</div>\n' + '\n' + '<div class=\'text-right\' id=\'clock\'>\n' + '  <h1 class=\'clock\'>\n' + '    {{(elapsed_time | milliseconds_to_HMS) || \'\'}}\n' + '  </h1>\n' + '</div>\n' + '\n' + '<div class="lineChart" data="chart_data"></div>');
  }
]);
(function () {
  angular.module('d3', []).factory('d3Service', [
    '$document',
    '$q',
    '$rootScope',
    function ($document, $q, $rootScope) {
      var d3;
      d3 = void 0;
      d3 = function () {
        var d3 = { version: '3.3.8' };
        if (!Date.now)
          Date.now = function () {
            return +new Date();
          };
        var d3_arraySlice = [].slice, d3_array = function (list) {
            return d3_arraySlice.call(list);
          };
        var d3_document = document, d3_documentElement = d3_document.documentElement, d3_window = window;
        try {
          d3_array(d3_documentElement.childNodes)[0].nodeType;
        } catch (e) {
          d3_array = function (list) {
            var i = list.length, array = new Array(i);
            while (i--)
              array[i] = list[i];
            return array;
          };
        }
        try {
          d3_document.createElement('div').style.setProperty('opacity', 0, '');
        } catch (error) {
          var d3_element_prototype = d3_window.Element.prototype, d3_element_setAttribute = d3_element_prototype.setAttribute, d3_element_setAttributeNS = d3_element_prototype.setAttributeNS, d3_style_prototype = d3_window.CSSStyleDeclaration.prototype, d3_style_setProperty = d3_style_prototype.setProperty;
          d3_element_prototype.setAttribute = function (name, value) {
            d3_element_setAttribute.call(this, name, value + '');
          };
          d3_element_prototype.setAttributeNS = function (space, local, value) {
            d3_element_setAttributeNS.call(this, space, local, value + '');
          };
          d3_style_prototype.setProperty = function (name, value, priority) {
            d3_style_setProperty.call(this, name, value + '', priority);
          };
        }
        d3.ascending = function (a, b) {
          return a < b ? -1 : a > b ? 1 : a >= b ? 0 : NaN;
        };
        d3.descending = function (a, b) {
          return b < a ? -1 : b > a ? 1 : b >= a ? 0 : NaN;
        };
        d3.min = function (array, f) {
          var i = -1, n = array.length, a, b;
          if (arguments.length === 1) {
            while (++i < n && !((a = array[i]) != null && a <= a))
              a = undefined;
            while (++i < n)
              if ((b = array[i]) != null && a > b)
                a = b;
          } else {
            while (++i < n && !((a = f.call(array, array[i], i)) != null && a <= a))
              a = undefined;
            while (++i < n)
              if ((b = f.call(array, array[i], i)) != null && a > b)
                a = b;
          }
          return a;
        };
        d3.max = function (array, f) {
          var i = -1, n = array.length, a, b;
          if (arguments.length === 1) {
            while (++i < n && !((a = array[i]) != null && a <= a))
              a = undefined;
            while (++i < n)
              if ((b = array[i]) != null && b > a)
                a = b;
          } else {
            while (++i < n && !((a = f.call(array, array[i], i)) != null && a <= a))
              a = undefined;
            while (++i < n)
              if ((b = f.call(array, array[i], i)) != null && b > a)
                a = b;
          }
          return a;
        };
        d3.extent = function (array, f) {
          var i = -1, n = array.length, a, b, c;
          if (arguments.length === 1) {
            while (++i < n && !((a = c = array[i]) != null && a <= a))
              a = c = undefined;
            while (++i < n)
              if ((b = array[i]) != null) {
                if (a > b)
                  a = b;
                if (c < b)
                  c = b;
              }
          } else {
            while (++i < n && !((a = c = f.call(array, array[i], i)) != null && a <= a))
              a = undefined;
            while (++i < n)
              if ((b = f.call(array, array[i], i)) != null) {
                if (a > b)
                  a = b;
                if (c < b)
                  c = b;
              }
          }
          return [
            a,
            c
          ];
        };
        d3.sum = function (array, f) {
          var s = 0, n = array.length, a, i = -1;
          if (arguments.length === 1) {
            while (++i < n)
              if (!isNaN(a = +array[i]))
                s += a;
          } else {
            while (++i < n)
              if (!isNaN(a = +f.call(array, array[i], i)))
                s += a;
          }
          return s;
        };
        function d3_number(x) {
          return x != null && !isNaN(x);
        }
        d3.mean = function (array, f) {
          var n = array.length, a, m = 0, i = -1, j = 0;
          if (arguments.length === 1) {
            while (++i < n)
              if (d3_number(a = array[i]))
                m += (a - m) / ++j;
          } else {
            while (++i < n)
              if (d3_number(a = f.call(array, array[i], i)))
                m += (a - m) / ++j;
          }
          return j ? m : undefined;
        };
        d3.quantile = function (values, p) {
          var H = (values.length - 1) * p + 1, h = Math.floor(H), v = +values[h - 1], e = H - h;
          return e ? v + e * (values[h] - v) : v;
        };
        d3.median = function (array, f) {
          if (arguments.length > 1)
            array = array.map(f);
          array = array.filter(d3_number);
          return array.length ? d3.quantile(array.sort(d3.ascending), 0.5) : undefined;
        };
        d3.bisector = function (f) {
          return {
            left: function (a, x, lo, hi) {
              if (arguments.length < 3)
                lo = 0;
              if (arguments.length < 4)
                hi = a.length;
              while (lo < hi) {
                var mid = lo + hi >>> 1;
                if (f.call(a, a[mid], mid) < x)
                  lo = mid + 1;
                else
                  hi = mid;
              }
              return lo;
            },
            right: function (a, x, lo, hi) {
              if (arguments.length < 3)
                lo = 0;
              if (arguments.length < 4)
                hi = a.length;
              while (lo < hi) {
                var mid = lo + hi >>> 1;
                if (x < f.call(a, a[mid], mid))
                  hi = mid;
                else
                  lo = mid + 1;
              }
              return lo;
            }
          };
        };
        var d3_bisector = d3.bisector(function (d) {
            return d;
          });
        d3.bisectLeft = d3_bisector.left;
        d3.bisect = d3.bisectRight = d3_bisector.right;
        d3.shuffle = function (array) {
          var m = array.length, t, i;
          while (m) {
            i = Math.random() * m-- | 0;
            t = array[m], array[m] = array[i], array[i] = t;
          }
          return array;
        };
        d3.permute = function (array, indexes) {
          var i = indexes.length, permutes = new Array(i);
          while (i--)
            permutes[i] = array[indexes[i]];
          return permutes;
        };
        d3.pairs = function (array) {
          var i = 0, n = array.length - 1, p0, p1 = array[0], pairs = new Array(n < 0 ? 0 : n);
          while (i < n)
            pairs[i] = [
              p0 = p1,
              p1 = array[++i]
            ];
          return pairs;
        };
        d3.zip = function () {
          if (!(n = arguments.length))
            return [];
          for (var i = -1, m = d3.min(arguments, d3_zipLength), zips = new Array(m); ++i < m;) {
            for (var j = -1, n, zip = zips[i] = new Array(n); ++j < n;) {
              zip[j] = arguments[j][i];
            }
          }
          return zips;
        };
        function d3_zipLength(d) {
          return d.length;
        }
        d3.transpose = function (matrix) {
          return d3.zip.apply(d3, matrix);
        };
        d3.keys = function (map) {
          var keys = [];
          for (var key in map)
            keys.push(key);
          return keys;
        };
        d3.values = function (map) {
          var values = [];
          for (var key in map)
            values.push(map[key]);
          return values;
        };
        d3.entries = function (map) {
          var entries = [];
          for (var key in map)
            entries.push({
              key: key,
              value: map[key]
            });
          return entries;
        };
        d3.merge = function (arrays) {
          var n = arrays.length, m, i = -1, j = 0, merged, array;
          while (++i < n)
            j += arrays[i].length;
          merged = new Array(j);
          while (--n >= 0) {
            array = arrays[n];
            m = array.length;
            while (--m >= 0) {
              merged[--j] = array[m];
            }
          }
          return merged;
        };
        var abs = Math.abs;
        d3.range = function (start, stop, step) {
          if (arguments.length < 3) {
            step = 1;
            if (arguments.length < 2) {
              stop = start;
              start = 0;
            }
          }
          if ((stop - start) / step === Infinity)
            throw new Error('infinite range');
          var range = [], k = d3_range_integerScale(abs(step)), i = -1, j;
          start *= k, stop *= k, step *= k;
          if (step < 0)
            while ((j = start + step * ++i) > stop)
              range.push(j / k);
          else
            while ((j = start + step * ++i) < stop)
              range.push(j / k);
          return range;
        };
        function d3_range_integerScale(x) {
          var k = 1;
          while (x * k % 1)
            k *= 10;
          return k;
        }
        function d3_class(ctor, properties) {
          try {
            for (var key in properties) {
              Object.defineProperty(ctor.prototype, key, {
                value: properties[key],
                enumerable: false
              });
            }
          } catch (e) {
            ctor.prototype = properties;
          }
        }
        d3.map = function (object) {
          var map = new d3_Map();
          if (object instanceof d3_Map)
            object.forEach(function (key, value) {
              map.set(key, value);
            });
          else
            for (var key in object)
              map.set(key, object[key]);
          return map;
        };
        function d3_Map() {
        }
        d3_class(d3_Map, {
          has: function (key) {
            return d3_map_prefix + key in this;
          },
          get: function (key) {
            return this[d3_map_prefix + key];
          },
          set: function (key, value) {
            return this[d3_map_prefix + key] = value;
          },
          remove: function (key) {
            key = d3_map_prefix + key;
            return key in this && delete this[key];
          },
          keys: function () {
            var keys = [];
            this.forEach(function (key) {
              keys.push(key);
            });
            return keys;
          },
          values: function () {
            var values = [];
            this.forEach(function (key, value) {
              values.push(value);
            });
            return values;
          },
          entries: function () {
            var entries = [];
            this.forEach(function (key, value) {
              entries.push({
                key: key,
                value: value
              });
            });
            return entries;
          },
          forEach: function (f) {
            for (var key in this) {
              if (key.charCodeAt(0) === d3_map_prefixCode) {
                f.call(this, key.substring(1), this[key]);
              }
            }
          }
        });
        var d3_map_prefix = '\0', d3_map_prefixCode = d3_map_prefix.charCodeAt(0);
        d3.nest = function () {
          var nest = {}, keys = [], sortKeys = [], sortValues, rollup;
          function map(mapType, array, depth) {
            if (depth >= keys.length)
              return rollup ? rollup.call(nest, array) : sortValues ? array.sort(sortValues) : array;
            var i = -1, n = array.length, key = keys[depth++], keyValue, object, setter, valuesByKey = new d3_Map(), values;
            while (++i < n) {
              if (values = valuesByKey.get(keyValue = key(object = array[i]))) {
                values.push(object);
              } else {
                valuesByKey.set(keyValue, [object]);
              }
            }
            if (mapType) {
              object = mapType();
              setter = function (keyValue, values) {
                object.set(keyValue, map(mapType, values, depth));
              };
            } else {
              object = {};
              setter = function (keyValue, values) {
                object[keyValue] = map(mapType, values, depth);
              };
            }
            valuesByKey.forEach(setter);
            return object;
          }
          function entries(map, depth) {
            if (depth >= keys.length)
              return map;
            var array = [], sortKey = sortKeys[depth++];
            map.forEach(function (key, keyMap) {
              array.push({
                key: key,
                values: entries(keyMap, depth)
              });
            });
            return sortKey ? array.sort(function (a, b) {
              return sortKey(a.key, b.key);
            }) : array;
          }
          nest.map = function (array, mapType) {
            return map(mapType, array, 0);
          };
          nest.entries = function (array) {
            return entries(map(d3.map, array, 0), 0);
          };
          nest.key = function (d) {
            keys.push(d);
            return nest;
          };
          nest.sortKeys = function (order) {
            sortKeys[keys.length - 1] = order;
            return nest;
          };
          nest.sortValues = function (order) {
            sortValues = order;
            return nest;
          };
          nest.rollup = function (f) {
            rollup = f;
            return nest;
          };
          return nest;
        };
        d3.set = function (array) {
          var set = new d3_Set();
          if (array)
            for (var i = 0, n = array.length; i < n; ++i)
              set.add(array[i]);
          return set;
        };
        function d3_Set() {
        }
        d3_class(d3_Set, {
          has: function (value) {
            return d3_map_prefix + value in this;
          },
          add: function (value) {
            this[d3_map_prefix + value] = true;
            return value;
          },
          remove: function (value) {
            value = d3_map_prefix + value;
            return value in this && delete this[value];
          },
          values: function () {
            var values = [];
            this.forEach(function (value) {
              values.push(value);
            });
            return values;
          },
          forEach: function (f) {
            for (var value in this) {
              if (value.charCodeAt(0) === d3_map_prefixCode) {
                f.call(this, value.substring(1));
              }
            }
          }
        });
        d3.behavior = {};
        d3.rebind = function (target, source) {
          var i = 1, n = arguments.length, method;
          while (++i < n)
            target[method = arguments[i]] = d3_rebind(target, source, source[method]);
          return target;
        };
        function d3_rebind(target, source, method) {
          return function () {
            var value = method.apply(source, arguments);
            return value === source ? target : value;
          };
        }
        function d3_vendorSymbol(object, name) {
          if (name in object)
            return name;
          name = name.charAt(0).toUpperCase() + name.substring(1);
          for (var i = 0, n = d3_vendorPrefixes.length; i < n; ++i) {
            var prefixName = d3_vendorPrefixes[i] + name;
            if (prefixName in object)
              return prefixName;
          }
        }
        var d3_vendorPrefixes = [
            'webkit',
            'ms',
            'moz',
            'Moz',
            'o',
            'O'
          ];
        function d3_noop() {
        }
        d3.dispatch = function () {
          var dispatch = new d3_dispatch(), i = -1, n = arguments.length;
          while (++i < n)
            dispatch[arguments[i]] = d3_dispatch_event(dispatch);
          return dispatch;
        };
        function d3_dispatch() {
        }
        d3_dispatch.prototype.on = function (type, listener) {
          var i = type.indexOf('.'), name = '';
          if (i >= 0) {
            name = type.substring(i + 1);
            type = type.substring(0, i);
          }
          if (type)
            return arguments.length < 2 ? this[type].on(name) : this[type].on(name, listener);
          if (arguments.length === 2) {
            if (listener == null)
              for (type in this) {
                if (this.hasOwnProperty(type))
                  this[type].on(name, null);
              }
            return this;
          }
        };
        function d3_dispatch_event(dispatch) {
          var listeners = [], listenerByName = new d3_Map();
          function event() {
            var z = listeners, i = -1, n = z.length, l;
            while (++i < n)
              if (l = z[i].on)
                l.apply(this, arguments);
            return dispatch;
          }
          event.on = function (name, listener) {
            var l = listenerByName.get(name), i;
            if (arguments.length < 2)
              return l && l.on;
            if (l) {
              l.on = null;
              listeners = listeners.slice(0, i = listeners.indexOf(l)).concat(listeners.slice(i + 1));
              listenerByName.remove(name);
            }
            if (listener)
              listeners.push(listenerByName.set(name, { on: listener }));
            return dispatch;
          };
          return event;
        }
        d3.event = null;
        function d3_eventPreventDefault() {
          d3.event.preventDefault();
        }
        function d3_eventSource() {
          var e = d3.event, s;
          while (s = e.sourceEvent)
            e = s;
          return e;
        }
        function d3_eventDispatch(target) {
          var dispatch = new d3_dispatch(), i = 0, n = arguments.length;
          while (++i < n)
            dispatch[arguments[i]] = d3_dispatch_event(dispatch);
          dispatch.of = function (thiz, argumentz) {
            return function (e1) {
              try {
                var e0 = e1.sourceEvent = d3.event;
                e1.target = target;
                d3.event = e1;
                dispatch[e1.type].apply(thiz, argumentz);
              } finally {
                d3.event = e0;
              }
            };
          };
          return dispatch;
        }
        d3.requote = function (s) {
          return s.replace(d3_requote_re, '\\$&');
        };
        var d3_requote_re = /[\\\^\$\*\+\?\|\[\]\(\)\.\{\}]/g;
        var d3_subclass = {}.__proto__ ? function (object, prototype) {
            object.__proto__ = prototype;
          } : function (object, prototype) {
            for (var property in prototype)
              object[property] = prototype[property];
          };
        function d3_selection(groups) {
          d3_subclass(groups, d3_selectionPrototype);
          return groups;
        }
        var d3_select = function (s, n) {
            return n.querySelector(s);
          }, d3_selectAll = function (s, n) {
            return n.querySelectorAll(s);
          }, d3_selectMatcher = d3_documentElement[d3_vendorSymbol(d3_documentElement, 'matchesSelector')], d3_selectMatches = function (n, s) {
            return d3_selectMatcher.call(n, s);
          };
        if (typeof Sizzle === 'function') {
          d3_select = function (s, n) {
            return Sizzle(s, n)[0] || null;
          };
          d3_selectAll = function (s, n) {
            return Sizzle.uniqueSort(Sizzle(s, n));
          };
          d3_selectMatches = Sizzle.matchesSelector;
        }
        d3.selection = function () {
          return d3_selectionRoot;
        };
        var d3_selectionPrototype = d3.selection.prototype = [];
        d3_selectionPrototype.select = function (selector) {
          var subgroups = [], subgroup, subnode, group, node;
          selector = d3_selection_selector(selector);
          for (var j = -1, m = this.length; ++j < m;) {
            subgroups.push(subgroup = []);
            subgroup.parentNode = (group = this[j]).parentNode;
            for (var i = -1, n = group.length; ++i < n;) {
              if (node = group[i]) {
                subgroup.push(subnode = selector.call(node, node.__data__, i, j));
                if (subnode && '__data__' in node)
                  subnode.__data__ = node.__data__;
              } else {
                subgroup.push(null);
              }
            }
          }
          return d3_selection(subgroups);
        };
        function d3_selection_selector(selector) {
          return typeof selector === 'function' ? selector : function () {
            return d3_select(selector, this);
          };
        }
        d3_selectionPrototype.selectAll = function (selector) {
          var subgroups = [], subgroup, node;
          selector = d3_selection_selectorAll(selector);
          for (var j = -1, m = this.length; ++j < m;) {
            for (var group = this[j], i = -1, n = group.length; ++i < n;) {
              if (node = group[i]) {
                subgroups.push(subgroup = d3_array(selector.call(node, node.__data__, i, j)));
                subgroup.parentNode = node;
              }
            }
          }
          return d3_selection(subgroups);
        };
        function d3_selection_selectorAll(selector) {
          return typeof selector === 'function' ? selector : function () {
            return d3_selectAll(selector, this);
          };
        }
        var d3_nsPrefix = {
            svg: 'http://www.w3.org/2000/svg',
            xhtml: 'http://www.w3.org/1999/xhtml',
            xlink: 'http://www.w3.org/1999/xlink',
            xml: 'http://www.w3.org/XML/1998/namespace',
            xmlns: 'http://www.w3.org/2000/xmlns/'
          };
        d3.ns = {
          prefix: d3_nsPrefix,
          qualify: function (name) {
            var i = name.indexOf(':'), prefix = name;
            if (i >= 0) {
              prefix = name.substring(0, i);
              name = name.substring(i + 1);
            }
            return d3_nsPrefix.hasOwnProperty(prefix) ? {
              space: d3_nsPrefix[prefix],
              local: name
            } : name;
          }
        };
        d3_selectionPrototype.attr = function (name, value) {
          if (arguments.length < 2) {
            if (typeof name === 'string') {
              var node = this.node();
              name = d3.ns.qualify(name);
              return name.local ? node.getAttributeNS(name.space, name.local) : node.getAttribute(name);
            }
            for (value in name)
              this.each(d3_selection_attr(value, name[value]));
            return this;
          }
          return this.each(d3_selection_attr(name, value));
        };
        function d3_selection_attr(name, value) {
          name = d3.ns.qualify(name);
          function attrNull() {
            this.removeAttribute(name);
          }
          function attrNullNS() {
            this.removeAttributeNS(name.space, name.local);
          }
          function attrConstant() {
            this.setAttribute(name, value);
          }
          function attrConstantNS() {
            this.setAttributeNS(name.space, name.local, value);
          }
          function attrFunction() {
            var x = value.apply(this, arguments);
            if (x == null)
              this.removeAttribute(name);
            else
              this.setAttribute(name, x);
          }
          function attrFunctionNS() {
            var x = value.apply(this, arguments);
            if (x == null)
              this.removeAttributeNS(name.space, name.local);
            else
              this.setAttributeNS(name.space, name.local, x);
          }
          return value == null ? name.local ? attrNullNS : attrNull : typeof value === 'function' ? name.local ? attrFunctionNS : attrFunction : name.local ? attrConstantNS : attrConstant;
        }
        function d3_collapse(s) {
          return s.trim().replace(/\s+/g, ' ');
        }
        d3_selectionPrototype.classed = function (name, value) {
          if (arguments.length < 2) {
            if (typeof name === 'string') {
              var node = this.node(), n = (name = name.trim().split(/^|\s+/g)).length, i = -1;
              if (value = node.classList) {
                while (++i < n)
                  if (!value.contains(name[i]))
                    return false;
              } else {
                value = node.getAttribute('class');
                while (++i < n)
                  if (!d3_selection_classedRe(name[i]).test(value))
                    return false;
              }
              return true;
            }
            for (value in name)
              this.each(d3_selection_classed(value, name[value]));
            return this;
          }
          return this.each(d3_selection_classed(name, value));
        };
        function d3_selection_classedRe(name) {
          return new RegExp('(?:^|\\s+)' + d3.requote(name) + '(?:\\s+|$)', 'g');
        }
        function d3_selection_classed(name, value) {
          name = name.trim().split(/\s+/).map(d3_selection_classedName);
          var n = name.length;
          function classedConstant() {
            var i = -1;
            while (++i < n)
              name[i](this, value);
          }
          function classedFunction() {
            var i = -1, x = value.apply(this, arguments);
            while (++i < n)
              name[i](this, x);
          }
          return typeof value === 'function' ? classedFunction : classedConstant;
        }
        function d3_selection_classedName(name) {
          var re = d3_selection_classedRe(name);
          return function (node, value) {
            if (c = node.classList)
              return value ? c.add(name) : c.remove(name);
            var c = node.getAttribute('class') || '';
            if (value) {
              re.lastIndex = 0;
              if (!re.test(c))
                node.setAttribute('class', d3_collapse(c + ' ' + name));
            } else {
              node.setAttribute('class', d3_collapse(c.replace(re, ' ')));
            }
          };
        }
        d3_selectionPrototype.style = function (name, value, priority) {
          var n = arguments.length;
          if (n < 3) {
            if (typeof name !== 'string') {
              if (n < 2)
                value = '';
              for (priority in name)
                this.each(d3_selection_style(priority, name[priority], value));
              return this;
            }
            if (n < 2)
              return d3_window.getComputedStyle(this.node(), null).getPropertyValue(name);
            priority = '';
          }
          return this.each(d3_selection_style(name, value, priority));
        };
        function d3_selection_style(name, value, priority) {
          function styleNull() {
            this.style.removeProperty(name);
          }
          function styleConstant() {
            this.style.setProperty(name, value, priority);
          }
          function styleFunction() {
            var x = value.apply(this, arguments);
            if (x == null)
              this.style.removeProperty(name);
            else
              this.style.setProperty(name, x, priority);
          }
          return value == null ? styleNull : typeof value === 'function' ? styleFunction : styleConstant;
        }
        d3_selectionPrototype.property = function (name, value) {
          if (arguments.length < 2) {
            if (typeof name === 'string')
              return this.node()[name];
            for (value in name)
              this.each(d3_selection_property(value, name[value]));
            return this;
          }
          return this.each(d3_selection_property(name, value));
        };
        function d3_selection_property(name, value) {
          function propertyNull() {
            delete this[name];
          }
          function propertyConstant() {
            this[name] = value;
          }
          function propertyFunction() {
            var x = value.apply(this, arguments);
            if (x == null)
              delete this[name];
            else
              this[name] = x;
          }
          return value == null ? propertyNull : typeof value === 'function' ? propertyFunction : propertyConstant;
        }
        d3_selectionPrototype.text = function (value) {
          return arguments.length ? this.each(typeof value === 'function' ? function () {
            var v = value.apply(this, arguments);
            this.textContent = v == null ? '' : v;
          } : value == null ? function () {
            this.textContent = '';
          } : function () {
            this.textContent = value;
          }) : this.node().textContent;
        };
        d3_selectionPrototype.html = function (value) {
          return arguments.length ? this.each(typeof value === 'function' ? function () {
            var v = value.apply(this, arguments);
            this.innerHTML = v == null ? '' : v;
          } : value == null ? function () {
            this.innerHTML = '';
          } : function () {
            this.innerHTML = value;
          }) : this.node().innerHTML;
        };
        d3_selectionPrototype.append = function (name) {
          name = d3_selection_creator(name);
          return this.select(function () {
            return this.appendChild(name.apply(this, arguments));
          });
        };
        function d3_selection_creator(name) {
          return typeof name === 'function' ? name : (name = d3.ns.qualify(name)).local ? function () {
            return this.ownerDocument.createElementNS(name.space, name.local);
          } : function () {
            return this.ownerDocument.createElementNS(this.namespaceURI, name);
          };
        }
        d3_selectionPrototype.insert = function (name, before) {
          name = d3_selection_creator(name);
          before = d3_selection_selector(before);
          return this.select(function () {
            return this.insertBefore(name.apply(this, arguments), before.apply(this, arguments) || null);
          });
        };
        d3_selectionPrototype.remove = function () {
          return this.each(function () {
            var parent = this.parentNode;
            if (parent)
              parent.removeChild(this);
          });
        };
        d3_selectionPrototype.data = function (value, key) {
          var i = -1, n = this.length, group, node;
          if (!arguments.length) {
            value = new Array(n = (group = this[0]).length);
            while (++i < n) {
              if (node = group[i]) {
                value[i] = node.__data__;
              }
            }
            return value;
          }
          function bind(group, groupData) {
            var i, n = group.length, m = groupData.length, n0 = Math.min(n, m), updateNodes = new Array(m), enterNodes = new Array(m), exitNodes = new Array(n), node, nodeData;
            if (key) {
              var nodeByKeyValue = new d3_Map(), dataByKeyValue = new d3_Map(), keyValues = [], keyValue;
              for (i = -1; ++i < n;) {
                keyValue = key.call(node = group[i], node.__data__, i);
                if (nodeByKeyValue.has(keyValue)) {
                  exitNodes[i] = node;
                } else {
                  nodeByKeyValue.set(keyValue, node);
                }
                keyValues.push(keyValue);
              }
              for (i = -1; ++i < m;) {
                keyValue = key.call(groupData, nodeData = groupData[i], i);
                if (node = nodeByKeyValue.get(keyValue)) {
                  updateNodes[i] = node;
                  node.__data__ = nodeData;
                } else if (!dataByKeyValue.has(keyValue)) {
                  enterNodes[i] = d3_selection_dataNode(nodeData);
                }
                dataByKeyValue.set(keyValue, nodeData);
                nodeByKeyValue.remove(keyValue);
              }
              for (i = -1; ++i < n;) {
                if (nodeByKeyValue.has(keyValues[i])) {
                  exitNodes[i] = group[i];
                }
              }
            } else {
              for (i = -1; ++i < n0;) {
                node = group[i];
                nodeData = groupData[i];
                if (node) {
                  node.__data__ = nodeData;
                  updateNodes[i] = node;
                } else {
                  enterNodes[i] = d3_selection_dataNode(nodeData);
                }
              }
              for (; i < m; ++i) {
                enterNodes[i] = d3_selection_dataNode(groupData[i]);
              }
              for (; i < n; ++i) {
                exitNodes[i] = group[i];
              }
            }
            enterNodes.update = updateNodes;
            enterNodes.parentNode = updateNodes.parentNode = exitNodes.parentNode = group.parentNode;
            enter.push(enterNodes);
            update.push(updateNodes);
            exit.push(exitNodes);
          }
          var enter = d3_selection_enter([]), update = d3_selection([]), exit = d3_selection([]);
          if (typeof value === 'function') {
            while (++i < n) {
              bind(group = this[i], value.call(group, group.parentNode.__data__, i));
            }
          } else {
            while (++i < n) {
              bind(group = this[i], value);
            }
          }
          update.enter = function () {
            return enter;
          };
          update.exit = function () {
            return exit;
          };
          return update;
        };
        function d3_selection_dataNode(data) {
          return { __data__: data };
        }
        d3_selectionPrototype.datum = function (value) {
          return arguments.length ? this.property('__data__', value) : this.property('__data__');
        };
        d3_selectionPrototype.filter = function (filter) {
          var subgroups = [], subgroup, group, node;
          if (typeof filter !== 'function')
            filter = d3_selection_filter(filter);
          for (var j = 0, m = this.length; j < m; j++) {
            subgroups.push(subgroup = []);
            subgroup.parentNode = (group = this[j]).parentNode;
            for (var i = 0, n = group.length; i < n; i++) {
              if ((node = group[i]) && filter.call(node, node.__data__, i)) {
                subgroup.push(node);
              }
            }
          }
          return d3_selection(subgroups);
        };
        function d3_selection_filter(selector) {
          return function () {
            return d3_selectMatches(this, selector);
          };
        }
        d3_selectionPrototype.order = function () {
          for (var j = -1, m = this.length; ++j < m;) {
            for (var group = this[j], i = group.length - 1, next = group[i], node; --i >= 0;) {
              if (node = group[i]) {
                if (next && next !== node.nextSibling)
                  next.parentNode.insertBefore(node, next);
                next = node;
              }
            }
          }
          return this;
        };
        d3_selectionPrototype.sort = function (comparator) {
          comparator = d3_selection_sortComparator.apply(this, arguments);
          for (var j = -1, m = this.length; ++j < m;)
            this[j].sort(comparator);
          return this.order();
        };
        function d3_selection_sortComparator(comparator) {
          if (!arguments.length)
            comparator = d3.ascending;
          return function (a, b) {
            return a && b ? comparator(a.__data__, b.__data__) : !a - !b;
          };
        }
        d3_selectionPrototype.each = function (callback) {
          return d3_selection_each(this, function (node, i, j) {
            callback.call(node, node.__data__, i, j);
          });
        };
        function d3_selection_each(groups, callback) {
          for (var j = 0, m = groups.length; j < m; j++) {
            for (var group = groups[j], i = 0, n = group.length, node; i < n; i++) {
              if (node = group[i])
                callback(node, i, j);
            }
          }
          return groups;
        }
        d3_selectionPrototype.call = function (callback) {
          var args = d3_array(arguments);
          callback.apply(args[0] = this, args);
          return this;
        };
        d3_selectionPrototype.empty = function () {
          return !this.node();
        };
        d3_selectionPrototype.node = function () {
          for (var j = 0, m = this.length; j < m; j++) {
            for (var group = this[j], i = 0, n = group.length; i < n; i++) {
              var node = group[i];
              if (node)
                return node;
            }
          }
          return null;
        };
        d3_selectionPrototype.size = function () {
          var n = 0;
          this.each(function () {
            ++n;
          });
          return n;
        };
        function d3_selection_enter(selection) {
          d3_subclass(selection, d3_selection_enterPrototype);
          return selection;
        }
        var d3_selection_enterPrototype = [];
        d3.selection.enter = d3_selection_enter;
        d3.selection.enter.prototype = d3_selection_enterPrototype;
        d3_selection_enterPrototype.append = d3_selectionPrototype.append;
        d3_selection_enterPrototype.empty = d3_selectionPrototype.empty;
        d3_selection_enterPrototype.node = d3_selectionPrototype.node;
        d3_selection_enterPrototype.call = d3_selectionPrototype.call;
        d3_selection_enterPrototype.size = d3_selectionPrototype.size;
        d3_selection_enterPrototype.select = function (selector) {
          var subgroups = [], subgroup, subnode, upgroup, group, node;
          for (var j = -1, m = this.length; ++j < m;) {
            upgroup = (group = this[j]).update;
            subgroups.push(subgroup = []);
            subgroup.parentNode = group.parentNode;
            for (var i = -1, n = group.length; ++i < n;) {
              if (node = group[i]) {
                subgroup.push(upgroup[i] = subnode = selector.call(group.parentNode, node.__data__, i, j));
                subnode.__data__ = node.__data__;
              } else {
                subgroup.push(null);
              }
            }
          }
          return d3_selection(subgroups);
        };
        d3_selection_enterPrototype.insert = function (name, before) {
          if (arguments.length < 2)
            before = d3_selection_enterInsertBefore(this);
          return d3_selectionPrototype.insert.call(this, name, before);
        };
        function d3_selection_enterInsertBefore(enter) {
          var i0, j0;
          return function (d, i, j) {
            var group = enter[j].update, n = group.length, node;
            if (j != j0)
              j0 = j, i0 = 0;
            if (i >= i0)
              i0 = i + 1;
            while (!(node = group[i0]) && ++i0 < n);
            return node;
          };
        }
        d3_selectionPrototype.transition = function () {
          var id = d3_transitionInheritId || ++d3_transitionId, subgroups = [], subgroup, node, transition = d3_transitionInherit || {
              time: Date.now(),
              ease: d3_ease_cubicInOut,
              delay: 0,
              duration: 250
            };
          for (var j = -1, m = this.length; ++j < m;) {
            subgroups.push(subgroup = []);
            for (var group = this[j], i = -1, n = group.length; ++i < n;) {
              if (node = group[i])
                d3_transitionNode(node, i, id, transition);
              subgroup.push(node);
            }
          }
          return d3_transition(subgroups, id);
        };
        d3_selectionPrototype.interrupt = function () {
          return this.each(d3_selection_interrupt);
        };
        function d3_selection_interrupt() {
          var lock = this.__transition__;
          if (lock)
            ++lock.active;
        }
        d3.select = function (node) {
          var group = [typeof node === 'string' ? d3_select(node, d3_document) : node];
          group.parentNode = d3_documentElement;
          return d3_selection([group]);
        };
        d3.selectAll = function (nodes) {
          var group = d3_array(typeof nodes === 'string' ? d3_selectAll(nodes, d3_document) : nodes);
          group.parentNode = d3_documentElement;
          return d3_selection([group]);
        };
        var d3_selectionRoot = d3.select(d3_documentElement);
        d3_selectionPrototype.on = function (type, listener, capture) {
          var n = arguments.length;
          if (n < 3) {
            if (typeof type !== 'string') {
              if (n < 2)
                listener = false;
              for (capture in type)
                this.each(d3_selection_on(capture, type[capture], listener));
              return this;
            }
            if (n < 2)
              return (n = this.node()['__on' + type]) && n._;
            capture = false;
          }
          return this.each(d3_selection_on(type, listener, capture));
        };
        function d3_selection_on(type, listener, capture) {
          var name = '__on' + type, i = type.indexOf('.'), wrap = d3_selection_onListener;
          if (i > 0)
            type = type.substring(0, i);
          var filter = d3_selection_onFilters.get(type);
          if (filter)
            type = filter, wrap = d3_selection_onFilter;
          function onRemove() {
            var l = this[name];
            if (l) {
              this.removeEventListener(type, l, l.$);
              delete this[name];
            }
          }
          function onAdd() {
            var l = wrap(listener, d3_array(arguments));
            onRemove.call(this);
            this.addEventListener(type, this[name] = l, l.$ = capture);
            l._ = listener;
          }
          function removeAll() {
            var re = new RegExp('^__on([^.]+)' + d3.requote(type) + '$'), match;
            for (var name in this) {
              if (match = name.match(re)) {
                var l = this[name];
                this.removeEventListener(match[1], l, l.$);
                delete this[name];
              }
            }
          }
          return i ? listener ? onAdd : onRemove : listener ? d3_noop : removeAll;
        }
        var d3_selection_onFilters = d3.map({
            mouseenter: 'mouseover',
            mouseleave: 'mouseout'
          });
        d3_selection_onFilters.forEach(function (k) {
          if ('on' + k in d3_document)
            d3_selection_onFilters.remove(k);
        });
        function d3_selection_onListener(listener, argumentz) {
          return function (e) {
            var o = d3.event;
            d3.event = e;
            argumentz[0] = this.__data__;
            try {
              listener.apply(this, argumentz);
            } finally {
              d3.event = o;
            }
          };
        }
        function d3_selection_onFilter(listener, argumentz) {
          var l = d3_selection_onListener(listener, argumentz);
          return function (e) {
            var target = this, related = e.relatedTarget;
            if (!related || related !== target && !(related.compareDocumentPosition(target) & 8)) {
              l.call(target, e);
            }
          };
        }
        var d3_event_dragSelect = d3_vendorSymbol(d3_documentElement.style, 'userSelect'), d3_event_dragId = 0;
        function d3_event_dragSuppress() {
          var name = '.dragsuppress-' + ++d3_event_dragId, touchmove = 'touchmove' + name, selectstart = 'selectstart' + name, dragstart = 'dragstart' + name, click = 'click' + name, w = d3.select(d3_window).on(touchmove, d3_eventPreventDefault).on(selectstart, d3_eventPreventDefault).on(dragstart, d3_eventPreventDefault), style = d3_documentElement.style, select = style[d3_event_dragSelect];
          style[d3_event_dragSelect] = 'none';
          return function (suppressClick) {
            w.on(name, null);
            style[d3_event_dragSelect] = select;
            if (suppressClick) {
              function off() {
                w.on(click, null);
              }
              w.on(click, function () {
                d3_eventPreventDefault();
                off();
              }, true);
              setTimeout(off, 0);
            }
          };
        }
        d3.mouse = function (container) {
          return d3_mousePoint(container, d3_eventSource());
        };
        var d3_mouse_bug44083 = /WebKit/.test(d3_window.navigator.userAgent) ? -1 : 0;
        function d3_mousePoint(container, e) {
          if (e.changedTouches)
            e = e.changedTouches[0];
          var svg = container.ownerSVGElement || container;
          if (svg.createSVGPoint) {
            var point = svg.createSVGPoint();
            if (d3_mouse_bug44083 < 0 && (d3_window.scrollX || d3_window.scrollY)) {
              svg = d3.select('body').append('svg').style({
                position: 'absolute',
                top: 0,
                left: 0,
                margin: 0,
                padding: 0,
                border: 'none'
              }, 'important');
              var ctm = svg[0][0].getScreenCTM();
              d3_mouse_bug44083 = !(ctm.f || ctm.e);
              svg.remove();
            }
            if (d3_mouse_bug44083)
              point.x = e.pageX, point.y = e.pageY;
            else
              point.x = e.clientX, point.y = e.clientY;
            point = point.matrixTransform(container.getScreenCTM().inverse());
            return [
              point.x,
              point.y
            ];
          }
          var rect = container.getBoundingClientRect();
          return [
            e.clientX - rect.left - container.clientLeft,
            e.clientY - rect.top - container.clientTop
          ];
        }
        d3.touches = function (container, touches) {
          if (arguments.length < 2)
            touches = d3_eventSource().touches;
          return touches ? d3_array(touches).map(function (touch) {
            var point = d3_mousePoint(container, touch);
            point.identifier = touch.identifier;
            return point;
          }) : [];
        };
        d3.behavior.drag = function () {
          var event = d3_eventDispatch(drag, 'drag', 'dragstart', 'dragend'), origin = null, mousedown = dragstart(d3_noop, d3.mouse, 'mousemove', 'mouseup'), touchstart = dragstart(touchid, touchposition, 'touchmove', 'touchend');
          function drag() {
            this.on('mousedown.drag', mousedown).on('touchstart.drag', touchstart);
          }
          function touchid() {
            return d3.event.changedTouches[0].identifier;
          }
          function touchposition(parent, id) {
            return d3.touches(parent).filter(function (p) {
              return p.identifier === id;
            })[0];
          }
          function dragstart(id, position, move, end) {
            return function () {
              var target = this, parent = target.parentNode, event_ = event.of(target, arguments), eventTarget = d3.event.target, eventId = id(), drag = eventId == null ? 'drag' : 'drag-' + eventId, origin_ = position(parent, eventId), dragged = 0, offset, w = d3.select(d3_window).on(move + '.' + drag, moved).on(end + '.' + drag, ended), dragRestore = d3_event_dragSuppress();
              if (origin) {
                offset = origin.apply(target, arguments);
                offset = [
                  offset.x - origin_[0],
                  offset.y - origin_[1]
                ];
              } else {
                offset = [
                  0,
                  0
                ];
              }
              event_({ type: 'dragstart' });
              function moved() {
                var p = position(parent, eventId), dx = p[0] - origin_[0], dy = p[1] - origin_[1];
                dragged |= dx | dy;
                origin_ = p;
                event_({
                  type: 'drag',
                  x: p[0] + offset[0],
                  y: p[1] + offset[1],
                  dx: dx,
                  dy: dy
                });
              }
              function ended() {
                w.on(move + '.' + drag, null).on(end + '.' + drag, null);
                dragRestore(dragged && d3.event.target === eventTarget);
                event_({ type: 'dragend' });
              }
            };
          }
          drag.origin = function (x) {
            if (!arguments.length)
              return origin;
            origin = x;
            return drag;
          };
          return d3.rebind(drag, event, 'on');
        };
        var π = Math.PI, τ = 2 * π, halfπ = π / 2, ε = 0.000001, ε2 = ε * ε, d3_radians = π / 180, d3_degrees = 180 / π;
        function d3_sgn(x) {
          return x > 0 ? 1 : x < 0 ? -1 : 0;
        }
        function d3_acos(x) {
          return x > 1 ? 0 : x < -1 ? π : Math.acos(x);
        }
        function d3_asin(x) {
          return x > 1 ? halfπ : x < -1 ? -halfπ : Math.asin(x);
        }
        function d3_sinh(x) {
          return ((x = Math.exp(x)) - 1 / x) / 2;
        }
        function d3_cosh(x) {
          return ((x = Math.exp(x)) + 1 / x) / 2;
        }
        function d3_tanh(x) {
          return ((x = Math.exp(2 * x)) - 1) / (x + 1);
        }
        function d3_haversin(x) {
          return (x = Math.sin(x / 2)) * x;
        }
        var ρ = Math.SQRT2, ρ2 = 2, ρ4 = 4;
        d3.interpolateZoom = function (p0, p1) {
          var ux0 = p0[0], uy0 = p0[1], w0 = p0[2], ux1 = p1[0], uy1 = p1[1], w1 = p1[2];
          var dx = ux1 - ux0, dy = uy1 - uy0, d2 = dx * dx + dy * dy, d1 = Math.sqrt(d2), b0 = (w1 * w1 - w0 * w0 + ρ4 * d2) / (2 * w0 * ρ2 * d1), b1 = (w1 * w1 - w0 * w0 - ρ4 * d2) / (2 * w1 * ρ2 * d1), r0 = Math.log(Math.sqrt(b0 * b0 + 1) - b0), r1 = Math.log(Math.sqrt(b1 * b1 + 1) - b1), dr = r1 - r0, S = (dr || Math.log(w1 / w0)) / ρ;
          function interpolate(t) {
            var s = t * S;
            if (dr) {
              var coshr0 = d3_cosh(r0), u = w0 / (ρ2 * d1) * (coshr0 * d3_tanh(ρ * s + r0) - d3_sinh(r0));
              return [
                ux0 + u * dx,
                uy0 + u * dy,
                w0 * coshr0 / d3_cosh(ρ * s + r0)
              ];
            }
            return [
              ux0 + t * dx,
              uy0 + t * dy,
              w0 * Math.exp(ρ * s)
            ];
          }
          interpolate.duration = S * 1000;
          return interpolate;
        };
        d3.behavior.zoom = function () {
          var view = {
              x: 0,
              y: 0,
              k: 1
            }, translate0, center, size = [
              960,
              500
            ], scaleExtent = d3_behavior_zoomInfinity, mousedown = 'mousedown.zoom', mousemove = 'mousemove.zoom', mouseup = 'mouseup.zoom', mousewheelTimer, touchstart = 'touchstart.zoom', touchtime, event = d3_eventDispatch(zoom, 'zoomstart', 'zoom', 'zoomend'), x0, x1, y0, y1;
          function zoom(g) {
            g.on(mousedown, mousedowned).on(d3_behavior_zoomWheel + '.zoom', mousewheeled).on(mousemove, mousewheelreset).on('dblclick.zoom', dblclicked).on(touchstart, touchstarted);
          }
          zoom.event = function (g) {
            g.each(function () {
              var event_ = event.of(this, arguments), view1 = view;
              if (d3_transitionInheritId) {
                d3.select(this).transition().each('start.zoom', function () {
                  view = this.__chart__ || {
                    x: 0,
                    y: 0,
                    k: 1
                  };
                  zoomstarted(event_);
                }).tween('zoom:zoom', function () {
                  var dx = size[0], dy = size[1], cx = dx / 2, cy = dy / 2, i = d3.interpolateZoom([
                      (cx - view.x) / view.k,
                      (cy - view.y) / view.k,
                      dx / view.k
                    ], [
                      (cx - view1.x) / view1.k,
                      (cy - view1.y) / view1.k,
                      dx / view1.k
                    ]);
                  return function (t) {
                    var l = i(t), k = dx / l[2];
                    this.__chart__ = view = {
                      x: cx - l[0] * k,
                      y: cy - l[1] * k,
                      k: k
                    };
                    zoomed(event_);
                  };
                }).each('end.zoom', function () {
                  zoomended(event_);
                });
              } else {
                this.__chart__ = view;
                zoomstarted(event_);
                zoomed(event_);
                zoomended(event_);
              }
            });
          };
          zoom.translate = function (_) {
            if (!arguments.length)
              return [
                view.x,
                view.y
              ];
            view = {
              x: +_[0],
              y: +_[1],
              k: view.k
            };
            rescale();
            return zoom;
          };
          zoom.scale = function (_) {
            if (!arguments.length)
              return view.k;
            view = {
              x: view.x,
              y: view.y,
              k: +_
            };
            rescale();
            return zoom;
          };
          zoom.scaleExtent = function (_) {
            if (!arguments.length)
              return scaleExtent;
            scaleExtent = _ == null ? d3_behavior_zoomInfinity : [
              +_[0],
              +_[1]
            ];
            return zoom;
          };
          zoom.center = function (_) {
            if (!arguments.length)
              return center;
            center = _ && [
              +_[0],
              +_[1]
            ];
            return zoom;
          };
          zoom.size = function (_) {
            if (!arguments.length)
              return size;
            size = _ && [
              +_[0],
              +_[1]
            ];
            return zoom;
          };
          zoom.x = function (z) {
            if (!arguments.length)
              return x1;
            x1 = z;
            x0 = z.copy();
            view = {
              x: 0,
              y: 0,
              k: 1
            };
            return zoom;
          };
          zoom.y = function (z) {
            if (!arguments.length)
              return y1;
            y1 = z;
            y0 = z.copy();
            view = {
              x: 0,
              y: 0,
              k: 1
            };
            return zoom;
          };
          function location(p) {
            return [
              (p[0] - view.x) / view.k,
              (p[1] - view.y) / view.k
            ];
          }
          function point(l) {
            return [
              l[0] * view.k + view.x,
              l[1] * view.k + view.y
            ];
          }
          function scaleTo(s) {
            view.k = Math.max(scaleExtent[0], Math.min(scaleExtent[1], s));
          }
          function translateTo(p, l) {
            l = point(l);
            view.x += p[0] - l[0];
            view.y += p[1] - l[1];
          }
          function rescale() {
            if (x1)
              x1.domain(x0.range().map(function (x) {
                return (x - view.x) / view.k;
              }).map(x0.invert));
            if (y1)
              y1.domain(y0.range().map(function (y) {
                return (y - view.y) / view.k;
              }).map(y0.invert));
          }
          function zoomstarted(event) {
            event({ type: 'zoomstart' });
          }
          function zoomed(event) {
            rescale();
            event({
              type: 'zoom',
              scale: view.k,
              translate: [
                view.x,
                view.y
              ]
            });
          }
          function zoomended(event) {
            event({ type: 'zoomend' });
          }
          function mousedowned() {
            var target = this, event_ = event.of(target, arguments), eventTarget = d3.event.target, dragged = 0, w = d3.select(d3_window).on(mousemove, moved).on(mouseup, ended), l = location(d3.mouse(target)), dragRestore = d3_event_dragSuppress();
            d3_selection_interrupt.call(target);
            zoomstarted(event_);
            function moved() {
              dragged = 1;
              translateTo(d3.mouse(target), l);
              zoomed(event_);
            }
            function ended() {
              w.on(mousemove, d3_window === target ? mousewheelreset : null).on(mouseup, null);
              dragRestore(dragged && d3.event.target === eventTarget);
              zoomended(event_);
            }
          }
          function touchstarted() {
            var target = this, event_ = event.of(target, arguments), locations0 = {}, distance0 = 0, scale0, eventId = d3.event.changedTouches[0].identifier, touchmove = 'touchmove.zoom-' + eventId, touchend = 'touchend.zoom-' + eventId, w = d3.select(d3_window).on(touchmove, moved).on(touchend, ended), t = d3.select(target).on(mousedown, null).on(touchstart, started), dragRestore = d3_event_dragSuppress();
            d3_selection_interrupt.call(target);
            started();
            zoomstarted(event_);
            function relocate() {
              var touches = d3.touches(target);
              scale0 = view.k;
              touches.forEach(function (t) {
                if (t.identifier in locations0)
                  locations0[t.identifier] = location(t);
              });
              return touches;
            }
            function started() {
              var changed = d3.event.changedTouches;
              for (var i = 0, n = changed.length; i < n; ++i) {
                locations0[changed[i].identifier] = null;
              }
              var touches = relocate(), now = Date.now();
              if (touches.length === 1) {
                if (now - touchtime < 500) {
                  var p = touches[0], l = locations0[p.identifier];
                  scaleTo(view.k * 2);
                  translateTo(p, l);
                  d3_eventPreventDefault();
                  zoomed(event_);
                }
                touchtime = now;
              } else if (touches.length > 1) {
                var p = touches[0], q = touches[1], dx = p[0] - q[0], dy = p[1] - q[1];
                distance0 = dx * dx + dy * dy;
              }
            }
            function moved() {
              var touches = d3.touches(target), p0, l0, p1, l1;
              for (var i = 0, n = touches.length; i < n; ++i, l1 = null) {
                p1 = touches[i];
                if (l1 = locations0[p1.identifier]) {
                  if (l0)
                    break;
                  p0 = p1, l0 = l1;
                }
              }
              if (l1) {
                var distance1 = (distance1 = p1[0] - p0[0]) * distance1 + (distance1 = p1[1] - p0[1]) * distance1, scale1 = distance0 && Math.sqrt(distance1 / distance0);
                p0 = [
                  (p0[0] + p1[0]) / 2,
                  (p0[1] + p1[1]) / 2
                ];
                l0 = [
                  (l0[0] + l1[0]) / 2,
                  (l0[1] + l1[1]) / 2
                ];
                scaleTo(scale1 * scale0);
              }
              touchtime = null;
              translateTo(p0, l0);
              zoomed(event_);
            }
            function ended() {
              if (d3.event.touches.length) {
                var changed = d3.event.changedTouches;
                for (var i = 0, n = changed.length; i < n; ++i) {
                  delete locations0[changed[i].identifier];
                }
                for (var identifier in locations0) {
                  return void relocate();
                }
              }
              w.on(touchmove, null).on(touchend, null);
              t.on(mousedown, mousedowned).on(touchstart, touchstarted);
              dragRestore();
              zoomended(event_);
            }
          }
          function mousewheeled() {
            var event_ = event.of(this, arguments);
            if (mousewheelTimer)
              clearTimeout(mousewheelTimer);
            else
              d3_selection_interrupt.call(this), zoomstarted(event_);
            mousewheelTimer = setTimeout(function () {
              mousewheelTimer = null;
              zoomended(event_);
            }, 50);
            d3_eventPreventDefault();
            var point = center || d3.mouse(this);
            if (!translate0)
              translate0 = location(point);
            scaleTo(Math.pow(2, d3_behavior_zoomDelta() * 0.002) * view.k);
            translateTo(point, translate0);
            zoomed(event_);
          }
          function mousewheelreset() {
            translate0 = null;
          }
          function dblclicked() {
            var event_ = event.of(this, arguments), p = d3.mouse(this), l = location(p), k = Math.log(view.k) / Math.LN2;
            zoomstarted(event_);
            scaleTo(Math.pow(2, d3.event.shiftKey ? Math.ceil(k) - 1 : Math.floor(k) + 1));
            translateTo(p, l);
            zoomed(event_);
            zoomended(event_);
          }
          return d3.rebind(zoom, event, 'on');
        };
        var d3_behavior_zoomInfinity = [
            0,
            Infinity
          ];
        var d3_behavior_zoomDelta, d3_behavior_zoomWheel = 'onwheel' in d3_document ? (d3_behavior_zoomDelta = function () {
            return -d3.event.deltaY * (d3.event.deltaMode ? 120 : 1);
          }, 'wheel') : 'onmousewheel' in d3_document ? (d3_behavior_zoomDelta = function () {
            return d3.event.wheelDelta;
          }, 'mousewheel') : (d3_behavior_zoomDelta = function () {
            return -d3.event.detail;
          }, 'MozMousePixelScroll');
        function d3_Color() {
        }
        d3_Color.prototype.toString = function () {
          return this.rgb() + '';
        };
        d3.hsl = function (h, s, l) {
          return arguments.length === 1 ? h instanceof d3_Hsl ? d3_hsl(h.h, h.s, h.l) : d3_rgb_parse('' + h, d3_rgb_hsl, d3_hsl) : d3_hsl(+h, +s, +l);
        };
        function d3_hsl(h, s, l) {
          return new d3_Hsl(h, s, l);
        }
        function d3_Hsl(h, s, l) {
          this.h = h;
          this.s = s;
          this.l = l;
        }
        var d3_hslPrototype = d3_Hsl.prototype = new d3_Color();
        d3_hslPrototype.brighter = function (k) {
          k = Math.pow(0.7, arguments.length ? k : 1);
          return d3_hsl(this.h, this.s, this.l / k);
        };
        d3_hslPrototype.darker = function (k) {
          k = Math.pow(0.7, arguments.length ? k : 1);
          return d3_hsl(this.h, this.s, k * this.l);
        };
        d3_hslPrototype.rgb = function () {
          return d3_hsl_rgb(this.h, this.s, this.l);
        };
        function d3_hsl_rgb(h, s, l) {
          var m1, m2;
          h = isNaN(h) ? 0 : (h %= 360) < 0 ? h + 360 : h;
          s = isNaN(s) ? 0 : s < 0 ? 0 : s > 1 ? 1 : s;
          l = l < 0 ? 0 : l > 1 ? 1 : l;
          m2 = l <= 0.5 ? l * (1 + s) : l + s - l * s;
          m1 = 2 * l - m2;
          function v(h) {
            if (h > 360)
              h -= 360;
            else if (h < 0)
              h += 360;
            if (h < 60)
              return m1 + (m2 - m1) * h / 60;
            if (h < 180)
              return m2;
            if (h < 240)
              return m1 + (m2 - m1) * (240 - h) / 60;
            return m1;
          }
          function vv(h) {
            return Math.round(v(h) * 255);
          }
          return d3_rgb(vv(h + 120), vv(h), vv(h - 120));
        }
        d3.hcl = function (h, c, l) {
          return arguments.length === 1 ? h instanceof d3_Hcl ? d3_hcl(h.h, h.c, h.l) : h instanceof d3_Lab ? d3_lab_hcl(h.l, h.a, h.b) : d3_lab_hcl((h = d3_rgb_lab((h = d3.rgb(h)).r, h.g, h.b)).l, h.a, h.b) : d3_hcl(+h, +c, +l);
        };
        function d3_hcl(h, c, l) {
          return new d3_Hcl(h, c, l);
        }
        function d3_Hcl(h, c, l) {
          this.h = h;
          this.c = c;
          this.l = l;
        }
        var d3_hclPrototype = d3_Hcl.prototype = new d3_Color();
        d3_hclPrototype.brighter = function (k) {
          return d3_hcl(this.h, this.c, Math.min(100, this.l + d3_lab_K * (arguments.length ? k : 1)));
        };
        d3_hclPrototype.darker = function (k) {
          return d3_hcl(this.h, this.c, Math.max(0, this.l - d3_lab_K * (arguments.length ? k : 1)));
        };
        d3_hclPrototype.rgb = function () {
          return d3_hcl_lab(this.h, this.c, this.l).rgb();
        };
        function d3_hcl_lab(h, c, l) {
          if (isNaN(h))
            h = 0;
          if (isNaN(c))
            c = 0;
          return d3_lab(l, Math.cos(h *= d3_radians) * c, Math.sin(h) * c);
        }
        d3.lab = function (l, a, b) {
          return arguments.length === 1 ? l instanceof d3_Lab ? d3_lab(l.l, l.a, l.b) : l instanceof d3_Hcl ? d3_hcl_lab(l.l, l.c, l.h) : d3_rgb_lab((l = d3.rgb(l)).r, l.g, l.b) : d3_lab(+l, +a, +b);
        };
        function d3_lab(l, a, b) {
          return new d3_Lab(l, a, b);
        }
        function d3_Lab(l, a, b) {
          this.l = l;
          this.a = a;
          this.b = b;
        }
        var d3_lab_K = 18;
        var d3_lab_X = 0.95047, d3_lab_Y = 1, d3_lab_Z = 1.08883;
        var d3_labPrototype = d3_Lab.prototype = new d3_Color();
        d3_labPrototype.brighter = function (k) {
          return d3_lab(Math.min(100, this.l + d3_lab_K * (arguments.length ? k : 1)), this.a, this.b);
        };
        d3_labPrototype.darker = function (k) {
          return d3_lab(Math.max(0, this.l - d3_lab_K * (arguments.length ? k : 1)), this.a, this.b);
        };
        d3_labPrototype.rgb = function () {
          return d3_lab_rgb(this.l, this.a, this.b);
        };
        function d3_lab_rgb(l, a, b) {
          var y = (l + 16) / 116, x = y + a / 500, z = y - b / 200;
          x = d3_lab_xyz(x) * d3_lab_X;
          y = d3_lab_xyz(y) * d3_lab_Y;
          z = d3_lab_xyz(z) * d3_lab_Z;
          return d3_rgb(d3_xyz_rgb(3.2404542 * x - 1.5371385 * y - 0.4985314 * z), d3_xyz_rgb(-0.969266 * x + 1.8760108 * y + 0.041556 * z), d3_xyz_rgb(0.0556434 * x - 0.2040259 * y + 1.0572252 * z));
        }
        function d3_lab_hcl(l, a, b) {
          return l > 0 ? d3_hcl(Math.atan2(b, a) * d3_degrees, Math.sqrt(a * a + b * b), l) : d3_hcl(NaN, NaN, l);
        }
        function d3_lab_xyz(x) {
          return x > 0.206893034 ? x * x * x : (x - 4 / 29) / 7.787037;
        }
        function d3_xyz_lab(x) {
          return x > 0.008856 ? Math.pow(x, 1 / 3) : 7.787037 * x + 4 / 29;
        }
        function d3_xyz_rgb(r) {
          return Math.round(255 * (r <= 0.00304 ? 12.92 * r : 1.055 * Math.pow(r, 1 / 2.4) - 0.055));
        }
        d3.rgb = function (r, g, b) {
          return arguments.length === 1 ? r instanceof d3_Rgb ? d3_rgb(r.r, r.g, r.b) : d3_rgb_parse('' + r, d3_rgb, d3_hsl_rgb) : d3_rgb(~~r, ~~g, ~~b);
        };
        function d3_rgbNumber(value) {
          return d3_rgb(value >> 16, value >> 8 & 255, value & 255);
        }
        function d3_rgbString(value) {
          return d3_rgbNumber(value) + '';
        }
        function d3_rgb(r, g, b) {
          return new d3_Rgb(r, g, b);
        }
        function d3_Rgb(r, g, b) {
          this.r = r;
          this.g = g;
          this.b = b;
        }
        var d3_rgbPrototype = d3_Rgb.prototype = new d3_Color();
        d3_rgbPrototype.brighter = function (k) {
          k = Math.pow(0.7, arguments.length ? k : 1);
          var r = this.r, g = this.g, b = this.b, i = 30;
          if (!r && !g && !b)
            return d3_rgb(i, i, i);
          if (r && r < i)
            r = i;
          if (g && g < i)
            g = i;
          if (b && b < i)
            b = i;
          return d3_rgb(Math.min(255, ~~(r / k)), Math.min(255, ~~(g / k)), Math.min(255, ~~(b / k)));
        };
        d3_rgbPrototype.darker = function (k) {
          k = Math.pow(0.7, arguments.length ? k : 1);
          return d3_rgb(~~(k * this.r), ~~(k * this.g), ~~(k * this.b));
        };
        d3_rgbPrototype.hsl = function () {
          return d3_rgb_hsl(this.r, this.g, this.b);
        };
        d3_rgbPrototype.toString = function () {
          return '#' + d3_rgb_hex(this.r) + d3_rgb_hex(this.g) + d3_rgb_hex(this.b);
        };
        function d3_rgb_hex(v) {
          return v < 16 ? '0' + Math.max(0, v).toString(16) : Math.min(255, v).toString(16);
        }
        function d3_rgb_parse(format, rgb, hsl) {
          var r = 0, g = 0, b = 0, m1, m2, name;
          m1 = /([a-z]+)\((.*)\)/i.exec(format);
          if (m1) {
            m2 = m1[2].split(',');
            switch (m1[1]) {
            case 'hsl': {
                return hsl(parseFloat(m2[0]), parseFloat(m2[1]) / 100, parseFloat(m2[2]) / 100);
              }
            case 'rgb': {
                return rgb(d3_rgb_parseNumber(m2[0]), d3_rgb_parseNumber(m2[1]), d3_rgb_parseNumber(m2[2]));
              }
            }
          }
          if (name = d3_rgb_names.get(format))
            return rgb(name.r, name.g, name.b);
          if (format != null && format.charAt(0) === '#') {
            if (format.length === 4) {
              r = format.charAt(1);
              r += r;
              g = format.charAt(2);
              g += g;
              b = format.charAt(3);
              b += b;
            } else if (format.length === 7) {
              r = format.substring(1, 3);
              g = format.substring(3, 5);
              b = format.substring(5, 7);
            }
            r = parseInt(r, 16);
            g = parseInt(g, 16);
            b = parseInt(b, 16);
          }
          return rgb(r, g, b);
        }
        function d3_rgb_hsl(r, g, b) {
          var min = Math.min(r /= 255, g /= 255, b /= 255), max = Math.max(r, g, b), d = max - min, h, s, l = (max + min) / 2;
          if (d) {
            s = l < 0.5 ? d / (max + min) : d / (2 - max - min);
            if (r == max)
              h = (g - b) / d + (g < b ? 6 : 0);
            else if (g == max)
              h = (b - r) / d + 2;
            else
              h = (r - g) / d + 4;
            h *= 60;
          } else {
            h = NaN;
            s = l > 0 && l < 1 ? 0 : h;
          }
          return d3_hsl(h, s, l);
        }
        function d3_rgb_lab(r, g, b) {
          r = d3_rgb_xyz(r);
          g = d3_rgb_xyz(g);
          b = d3_rgb_xyz(b);
          var x = d3_xyz_lab((0.4124564 * r + 0.3575761 * g + 0.1804375 * b) / d3_lab_X), y = d3_xyz_lab((0.2126729 * r + 0.7151522 * g + 0.072175 * b) / d3_lab_Y), z = d3_xyz_lab((0.0193339 * r + 0.119192 * g + 0.9503041 * b) / d3_lab_Z);
          return d3_lab(116 * y - 16, 500 * (x - y), 200 * (y - z));
        }
        function d3_rgb_xyz(r) {
          return (r /= 255) <= 0.04045 ? r / 12.92 : Math.pow((r + 0.055) / 1.055, 2.4);
        }
        function d3_rgb_parseNumber(c) {
          var f = parseFloat(c);
          return c.charAt(c.length - 1) === '%' ? Math.round(f * 2.55) : f;
        }
        var d3_rgb_names = d3.map({
            aliceblue: 15792383,
            antiquewhite: 16444375,
            aqua: 65535,
            aquamarine: 8388564,
            azure: 15794175,
            beige: 16119260,
            bisque: 16770244,
            black: 0,
            blanchedalmond: 16772045,
            blue: 255,
            blueviolet: 9055202,
            brown: 10824234,
            burlywood: 14596231,
            cadetblue: 6266528,
            chartreuse: 8388352,
            chocolate: 13789470,
            coral: 16744272,
            cornflowerblue: 6591981,
            cornsilk: 16775388,
            crimson: 14423100,
            cyan: 65535,
            darkblue: 139,
            darkcyan: 35723,
            darkgoldenrod: 12092939,
            darkgray: 11119017,
            darkgreen: 25600,
            darkgrey: 11119017,
            darkkhaki: 12433259,
            darkmagenta: 9109643,
            darkolivegreen: 5597999,
            darkorange: 16747520,
            darkorchid: 10040012,
            darkred: 9109504,
            darksalmon: 15308410,
            darkseagreen: 9419919,
            darkslateblue: 4734347,
            darkslategray: 3100495,
            darkslategrey: 3100495,
            darkturquoise: 52945,
            darkviolet: 9699539,
            deeppink: 16716947,
            deepskyblue: 49151,
            dimgray: 6908265,
            dimgrey: 6908265,
            dodgerblue: 2003199,
            firebrick: 11674146,
            floralwhite: 16775920,
            forestgreen: 2263842,
            fuchsia: 16711935,
            gainsboro: 14474460,
            ghostwhite: 16316671,
            gold: 16766720,
            goldenrod: 14329120,
            gray: 8421504,
            green: 32768,
            greenyellow: 11403055,
            grey: 8421504,
            honeydew: 15794160,
            hotpink: 16738740,
            indianred: 13458524,
            indigo: 4915330,
            ivory: 16777200,
            khaki: 15787660,
            lavender: 15132410,
            lavenderblush: 16773365,
            lawngreen: 8190976,
            lemonchiffon: 16775885,
            lightblue: 11393254,
            lightcoral: 15761536,
            lightcyan: 14745599,
            lightgoldenrodyellow: 16448210,
            lightgray: 13882323,
            lightgreen: 9498256,
            lightgrey: 13882323,
            lightpink: 16758465,
            lightsalmon: 16752762,
            lightseagreen: 2142890,
            lightskyblue: 8900346,
            lightslategray: 7833753,
            lightslategrey: 7833753,
            lightsteelblue: 11584734,
            lightyellow: 16777184,
            lime: 65280,
            limegreen: 3329330,
            linen: 16445670,
            magenta: 16711935,
            maroon: 8388608,
            mediumaquamarine: 6737322,
            mediumblue: 205,
            mediumorchid: 12211667,
            mediumpurple: 9662683,
            mediumseagreen: 3978097,
            mediumslateblue: 8087790,
            mediumspringgreen: 64154,
            mediumturquoise: 4772300,
            mediumvioletred: 13047173,
            midnightblue: 1644912,
            mintcream: 16121850,
            mistyrose: 16770273,
            moccasin: 16770229,
            navajowhite: 16768685,
            navy: 128,
            oldlace: 16643558,
            olive: 8421376,
            olivedrab: 7048739,
            orange: 16753920,
            orangered: 16729344,
            orchid: 14315734,
            palegoldenrod: 15657130,
            palegreen: 10025880,
            paleturquoise: 11529966,
            palevioletred: 14381203,
            papayawhip: 16773077,
            peachpuff: 16767673,
            peru: 13468991,
            pink: 16761035,
            plum: 14524637,
            powderblue: 11591910,
            purple: 8388736,
            red: 16711680,
            rosybrown: 12357519,
            royalblue: 4286945,
            saddlebrown: 9127187,
            salmon: 16416882,
            sandybrown: 16032864,
            seagreen: 3050327,
            seashell: 16774638,
            sienna: 10506797,
            silver: 12632256,
            skyblue: 8900331,
            slateblue: 6970061,
            slategray: 7372944,
            slategrey: 7372944,
            snow: 16775930,
            springgreen: 65407,
            steelblue: 4620980,
            tan: 13808780,
            teal: 32896,
            thistle: 14204888,
            tomato: 16737095,
            turquoise: 4251856,
            violet: 15631086,
            wheat: 16113331,
            white: 16777215,
            whitesmoke: 16119285,
            yellow: 16776960,
            yellowgreen: 10145074
          });
        d3_rgb_names.forEach(function (key, value) {
          d3_rgb_names.set(key, d3_rgbNumber(value));
        });
        function d3_functor(v) {
          return typeof v === 'function' ? v : function () {
            return v;
          };
        }
        d3.functor = d3_functor;
        function d3_identity(d) {
          return d;
        }
        d3.xhr = d3_xhrType(d3_identity);
        function d3_xhrType(response) {
          return function (url, mimeType, callback) {
            if (arguments.length === 2 && typeof mimeType === 'function')
              callback = mimeType, mimeType = null;
            return d3_xhr(url, mimeType, response, callback);
          };
        }
        function d3_xhr(url, mimeType, response, callback) {
          var xhr = {}, dispatch = d3.dispatch('beforesend', 'progress', 'load', 'error'), headers = {}, request = new XMLHttpRequest(), responseType = null;
          if (d3_window.XDomainRequest && !('withCredentials' in request) && /^(http(s)?:)?\/\//.test(url))
            request = new XDomainRequest();
          'onload' in request ? request.onload = request.onerror = respond : request.onreadystatechange = function () {
            request.readyState > 3 && respond();
          };
          function respond() {
            var status = request.status, result;
            if (!status && request.responseText || status >= 200 && status < 300 || status === 304) {
              try {
                result = response.call(xhr, request);
              } catch (e) {
                dispatch.error.call(xhr, e);
                return;
              }
              dispatch.load.call(xhr, result);
            } else {
              dispatch.error.call(xhr, request);
            }
          }
          request.onprogress = function (event) {
            var o = d3.event;
            d3.event = event;
            try {
              dispatch.progress.call(xhr, request);
            } finally {
              d3.event = o;
            }
          };
          xhr.header = function (name, value) {
            name = (name + '').toLowerCase();
            if (arguments.length < 2)
              return headers[name];
            if (value == null)
              delete headers[name];
            else
              headers[name] = value + '';
            return xhr;
          };
          xhr.mimeType = function (value) {
            if (!arguments.length)
              return mimeType;
            mimeType = value == null ? null : value + '';
            return xhr;
          };
          xhr.responseType = function (value) {
            if (!arguments.length)
              return responseType;
            responseType = value;
            return xhr;
          };
          xhr.response = function (value) {
            response = value;
            return xhr;
          };
          [
            'get',
            'post'
          ].forEach(function (method) {
            xhr[method] = function () {
              return xhr.send.apply(xhr, [method].concat(d3_array(arguments)));
            };
          });
          xhr.send = function (method, data, callback) {
            if (arguments.length === 2 && typeof data === 'function')
              callback = data, data = null;
            request.open(method, url, true);
            if (mimeType != null && !('accept' in headers))
              headers['accept'] = mimeType + ',*/*';
            if (request.setRequestHeader)
              for (var name in headers)
                request.setRequestHeader(name, headers[name]);
            if (mimeType != null && request.overrideMimeType)
              request.overrideMimeType(mimeType);
            if (responseType != null)
              request.responseType = responseType;
            if (callback != null)
              xhr.on('error', callback).on('load', function (request) {
                callback(null, request);
              });
            dispatch.beforesend.call(xhr, request);
            request.send(data == null ? null : data);
            return xhr;
          };
          xhr.abort = function () {
            request.abort();
            return xhr;
          };
          d3.rebind(xhr, dispatch, 'on');
          return callback == null ? xhr : xhr.get(d3_xhr_fixCallback(callback));
        }
        function d3_xhr_fixCallback(callback) {
          return callback.length === 1 ? function (error, request) {
            callback(error == null ? request : null);
          } : callback;
        }
        d3.dsv = function (delimiter, mimeType) {
          var reFormat = new RegExp('["' + delimiter + '\n]'), delimiterCode = delimiter.charCodeAt(0);
          function dsv(url, row, callback) {
            if (arguments.length < 3)
              callback = row, row = null;
            var xhr = d3.xhr(url, mimeType, callback);
            xhr.row = function (_) {
              return arguments.length ? xhr.response((row = _) == null ? response : typedResponse(_)) : row;
            };
            return xhr.row(row);
          }
          function response(request) {
            return dsv.parse(request.responseText);
          }
          function typedResponse(f) {
            return function (request) {
              return dsv.parse(request.responseText, f);
            };
          }
          dsv.parse = function (text, f) {
            var o;
            return dsv.parseRows(text, function (row, i) {
              if (o)
                return o(row, i - 1);
              var a = new Function('d', 'return {' + row.map(function (name, i) {
                  return JSON.stringify(name) + ': d[' + i + ']';
                }).join(',') + '}');
              o = f ? function (row, i) {
                return f(a(row), i);
              } : a;
            });
          };
          dsv.parseRows = function (text, f) {
            var EOL = {}, EOF = {}, rows = [], N = text.length, I = 0, n = 0, t, eol;
            function token() {
              if (I >= N)
                return EOF;
              if (eol)
                return eol = false, EOL;
              var j = I;
              if (text.charCodeAt(j) === 34) {
                var i = j;
                while (i++ < N) {
                  if (text.charCodeAt(i) === 34) {
                    if (text.charCodeAt(i + 1) !== 34)
                      break;
                    ++i;
                  }
                }
                I = i + 2;
                var c = text.charCodeAt(i + 1);
                if (c === 13) {
                  eol = true;
                  if (text.charCodeAt(i + 2) === 10)
                    ++I;
                } else if (c === 10) {
                  eol = true;
                }
                return text.substring(j + 1, i).replace(/""/g, '"');
              }
              while (I < N) {
                var c = text.charCodeAt(I++), k = 1;
                if (c === 10)
                  eol = true;
                else if (c === 13) {
                  eol = true;
                  if (text.charCodeAt(I) === 10)
                    ++I, ++k;
                } else if (c !== delimiterCode)
                  continue;
                return text.substring(j, I - k);
              }
              return text.substring(j);
            }
            while ((t = token()) !== EOF) {
              var a = [];
              while (t !== EOL && t !== EOF) {
                a.push(t);
                t = token();
              }
              if (f && !(a = f(a, n++)))
                continue;
              rows.push(a);
            }
            return rows;
          };
          dsv.format = function (rows) {
            if (Array.isArray(rows[0]))
              return dsv.formatRows(rows);
            var fieldSet = new d3_Set(), fields = [];
            rows.forEach(function (row) {
              for (var field in row) {
                if (!fieldSet.has(field)) {
                  fields.push(fieldSet.add(field));
                }
              }
            });
            return [fields.map(formatValue).join(delimiter)].concat(rows.map(function (row) {
              return fields.map(function (field) {
                return formatValue(row[field]);
              }).join(delimiter);
            })).join('\n');
          };
          dsv.formatRows = function (rows) {
            return rows.map(formatRow).join('\n');
          };
          function formatRow(row) {
            return row.map(formatValue).join(delimiter);
          }
          function formatValue(text) {
            return reFormat.test(text) ? '"' + text.replace(/\"/g, '""') + '"' : text;
          }
          return dsv;
        };
        d3.csv = d3.dsv(',', 'text/csv');
        d3.tsv = d3.dsv(' ', 'text/tab-separated-values');
        var d3_timer_queueHead, d3_timer_queueTail, d3_timer_interval, d3_timer_timeout, d3_timer_active, d3_timer_frame = d3_window[d3_vendorSymbol(d3_window, 'requestAnimationFrame')] || function (callback) {
            setTimeout(callback, 17);
          };
        d3.timer = function (callback, delay, then) {
          var n = arguments.length;
          if (n < 2)
            delay = 0;
          if (n < 3)
            then = Date.now();
          var time = then + delay, timer = {
              c: callback,
              t: time,
              f: false,
              n: null
            };
          if (d3_timer_queueTail)
            d3_timer_queueTail.n = timer;
          else
            d3_timer_queueHead = timer;
          d3_timer_queueTail = timer;
          if (!d3_timer_interval) {
            d3_timer_timeout = clearTimeout(d3_timer_timeout);
            d3_timer_interval = 1;
            d3_timer_frame(d3_timer_step);
          }
        };
        function d3_timer_step() {
          var now = d3_timer_mark(), delay = d3_timer_sweep() - now;
          if (delay > 24) {
            if (isFinite(delay)) {
              clearTimeout(d3_timer_timeout);
              d3_timer_timeout = setTimeout(d3_timer_step, delay);
            }
            d3_timer_interval = 0;
          } else {
            d3_timer_interval = 1;
            d3_timer_frame(d3_timer_step);
          }
        }
        d3.timer.flush = function () {
          d3_timer_mark();
          d3_timer_sweep();
        };
        function d3_timer_mark() {
          var now = Date.now();
          d3_timer_active = d3_timer_queueHead;
          while (d3_timer_active) {
            if (now >= d3_timer_active.t)
              d3_timer_active.f = d3_timer_active.c(now - d3_timer_active.t);
            d3_timer_active = d3_timer_active.n;
          }
          return now;
        }
        function d3_timer_sweep() {
          var t0, t1 = d3_timer_queueHead, time = Infinity;
          while (t1) {
            if (t1.f) {
              t1 = t0 ? t0.n = t1.n : d3_timer_queueHead = t1.n;
            } else {
              if (t1.t < time)
                time = t1.t;
              t1 = (t0 = t1).n;
            }
          }
          d3_timer_queueTail = t0;
          return time;
        }
        var d3_format_decimalPoint = '.', d3_format_thousandsSeparator = ',', d3_format_grouping = [
            3,
            3
          ], d3_format_currencySymbol = '$';
        var d3_formatPrefixes = [
            'y',
            'z',
            'a',
            'f',
            'p',
            'n',
            '\xb5',
            'm',
            '',
            'k',
            'M',
            'G',
            'T',
            'P',
            'E',
            'Z',
            'Y'
          ].map(d3_formatPrefix);
        d3.formatPrefix = function (value, precision) {
          var i = 0;
          if (value) {
            if (value < 0)
              value *= -1;
            if (precision)
              value = d3.round(value, d3_format_precision(value, precision));
            i = 1 + Math.floor(1e-12 + Math.log(value) / Math.LN10);
            i = Math.max(-24, Math.min(24, Math.floor((i <= 0 ? i + 1 : i - 1) / 3) * 3));
          }
          return d3_formatPrefixes[8 + i / 3];
        };
        function d3_formatPrefix(d, i) {
          var k = Math.pow(10, abs(8 - i) * 3);
          return {
            scale: i > 8 ? function (d) {
              return d / k;
            } : function (d) {
              return d * k;
            },
            symbol: d
          };
        }
        d3.round = function (x, n) {
          return n ? Math.round(x * (n = Math.pow(10, n))) / n : Math.round(x);
        };
        d3.format = function (specifier) {
          var match = d3_format_re.exec(specifier), fill = match[1] || ' ', align = match[2] || '>', sign = match[3] || '', symbol = match[4] || '', zfill = match[5], width = +match[6], comma = match[7], precision = match[8], type = match[9], scale = 1, suffix = '', integer = false;
          if (precision)
            precision = +precision.substring(1);
          if (zfill || fill === '0' && align === '=') {
            zfill = fill = '0';
            align = '=';
            if (comma)
              width -= Math.floor((width - 1) / 4);
          }
          switch (type) {
          case 'n':
            comma = true;
            type = 'g';
            break;
          case '%':
            scale = 100;
            suffix = '%';
            type = 'f';
            break;
          case 'p':
            scale = 100;
            suffix = '%';
            type = 'r';
            break;
          case 'b':
          case 'o':
          case 'x':
          case 'X':
            if (symbol === '#')
              symbol = '0' + type.toLowerCase();
          case 'c':
          case 'd':
            integer = true;
            precision = 0;
            break;
          case 's':
            scale = -1;
            type = 'r';
            break;
          }
          if (symbol === '#')
            symbol = '';
          else if (symbol === '$')
            symbol = d3_format_currencySymbol;
          if (type == 'r' && !precision)
            type = 'g';
          if (precision != null) {
            if (type == 'g')
              precision = Math.max(1, Math.min(21, precision));
            else if (type == 'e' || type == 'f')
              precision = Math.max(0, Math.min(20, precision));
          }
          type = d3_format_types.get(type) || d3_format_typeDefault;
          var zcomma = zfill && comma;
          return function (value) {
            if (integer && value % 1)
              return '';
            var negative = value < 0 || value === 0 && 1 / value < 0 ? (value = -value, '-') : sign;
            if (scale < 0) {
              var prefix = d3.formatPrefix(value, precision);
              value = prefix.scale(value);
              suffix = prefix.symbol;
            } else {
              value *= scale;
            }
            value = type(value, precision);
            var i = value.lastIndexOf('.'), before = i < 0 ? value : value.substring(0, i), after = i < 0 ? '' : d3_format_decimalPoint + value.substring(i + 1);
            if (!zfill && comma)
              before = d3_format_group(before);
            var length = symbol.length + before.length + after.length + (zcomma ? 0 : negative.length), padding = length < width ? new Array(length = width - length + 1).join(fill) : '';
            if (zcomma)
              before = d3_format_group(padding + before);
            negative += symbol;
            value = before + after;
            return (align === '<' ? negative + value + padding : align === '>' ? padding + negative + value : align === '^' ? padding.substring(0, length >>= 1) + negative + value + padding.substring(length) : negative + (zcomma ? value : padding + value)) + suffix;
          };
        };
        var d3_format_re = /(?:([^{])?([<>=^]))?([+\- ])?([$#])?(0)?(\d+)?(,)?(\.-?\d+)?([a-z%])?/i;
        var d3_format_types = d3.map({
            b: function (x) {
              return x.toString(2);
            },
            c: function (x) {
              return String.fromCharCode(x);
            },
            o: function (x) {
              return x.toString(8);
            },
            x: function (x) {
              return x.toString(16);
            },
            X: function (x) {
              return x.toString(16).toUpperCase();
            },
            g: function (x, p) {
              return x.toPrecision(p);
            },
            e: function (x, p) {
              return x.toExponential(p);
            },
            f: function (x, p) {
              return x.toFixed(p);
            },
            r: function (x, p) {
              return (x = d3.round(x, d3_format_precision(x, p))).toFixed(Math.max(0, Math.min(20, d3_format_precision(x * (1 + 1e-15), p))));
            }
          });
        function d3_format_precision(x, p) {
          return p - (x ? Math.ceil(Math.log(x) / Math.LN10) : 1);
        }
        function d3_format_typeDefault(x) {
          return x + '';
        }
        var d3_format_group = d3_identity;
        if (d3_format_grouping) {
          var d3_format_groupingLength = d3_format_grouping.length;
          d3_format_group = function (value) {
            var i = value.length, t = [], j = 0, g = d3_format_grouping[0];
            while (i > 0 && g > 0) {
              t.push(value.substring(i -= g, i + g));
              g = d3_format_grouping[j = (j + 1) % d3_format_groupingLength];
            }
            return t.reverse().join(d3_format_thousandsSeparator);
          };
        }
        d3.geo = {};
        function d3_adder() {
        }
        d3_adder.prototype = {
          s: 0,
          t: 0,
          add: function (y) {
            d3_adderSum(y, this.t, d3_adderTemp);
            d3_adderSum(d3_adderTemp.s, this.s, this);
            if (this.s)
              this.t += d3_adderTemp.t;
            else
              this.s = d3_adderTemp.t;
          },
          reset: function () {
            this.s = this.t = 0;
          },
          valueOf: function () {
            return this.s;
          }
        };
        var d3_adderTemp = new d3_adder();
        function d3_adderSum(a, b, o) {
          var x = o.s = a + b, bv = x - a, av = x - bv;
          o.t = a - av + (b - bv);
        }
        d3.geo.stream = function (object, listener) {
          if (object && d3_geo_streamObjectType.hasOwnProperty(object.type)) {
            d3_geo_streamObjectType[object.type](object, listener);
          } else {
            d3_geo_streamGeometry(object, listener);
          }
        };
        function d3_geo_streamGeometry(geometry, listener) {
          if (geometry && d3_geo_streamGeometryType.hasOwnProperty(geometry.type)) {
            d3_geo_streamGeometryType[geometry.type](geometry, listener);
          }
        }
        var d3_geo_streamObjectType = {
            Feature: function (feature, listener) {
              d3_geo_streamGeometry(feature.geometry, listener);
            },
            FeatureCollection: function (object, listener) {
              var features = object.features, i = -1, n = features.length;
              while (++i < n)
                d3_geo_streamGeometry(features[i].geometry, listener);
            }
          };
        var d3_geo_streamGeometryType = {
            Sphere: function (object, listener) {
              listener.sphere();
            },
            Point: function (object, listener) {
              object = object.coordinates;
              listener.point(object[0], object[1], object[2]);
            },
            MultiPoint: function (object, listener) {
              var coordinates = object.coordinates, i = -1, n = coordinates.length;
              while (++i < n)
                object = coordinates[i], listener.point(object[0], object[1], object[2]);
            },
            LineString: function (object, listener) {
              d3_geo_streamLine(object.coordinates, listener, 0);
            },
            MultiLineString: function (object, listener) {
              var coordinates = object.coordinates, i = -1, n = coordinates.length;
              while (++i < n)
                d3_geo_streamLine(coordinates[i], listener, 0);
            },
            Polygon: function (object, listener) {
              d3_geo_streamPolygon(object.coordinates, listener);
            },
            MultiPolygon: function (object, listener) {
              var coordinates = object.coordinates, i = -1, n = coordinates.length;
              while (++i < n)
                d3_geo_streamPolygon(coordinates[i], listener);
            },
            GeometryCollection: function (object, listener) {
              var geometries = object.geometries, i = -1, n = geometries.length;
              while (++i < n)
                d3_geo_streamGeometry(geometries[i], listener);
            }
          };
        function d3_geo_streamLine(coordinates, listener, closed) {
          var i = -1, n = coordinates.length - closed, coordinate;
          listener.lineStart();
          while (++i < n)
            coordinate = coordinates[i], listener.point(coordinate[0], coordinate[1], coordinate[2]);
          listener.lineEnd();
        }
        function d3_geo_streamPolygon(coordinates, listener) {
          var i = -1, n = coordinates.length;
          listener.polygonStart();
          while (++i < n)
            d3_geo_streamLine(coordinates[i], listener, 1);
          listener.polygonEnd();
        }
        d3.geo.area = function (object) {
          d3_geo_areaSum = 0;
          d3.geo.stream(object, d3_geo_area);
          return d3_geo_areaSum;
        };
        var d3_geo_areaSum, d3_geo_areaRingSum = new d3_adder();
        var d3_geo_area = {
            sphere: function () {
              d3_geo_areaSum += 4 * π;
            },
            point: d3_noop,
            lineStart: d3_noop,
            lineEnd: d3_noop,
            polygonStart: function () {
              d3_geo_areaRingSum.reset();
              d3_geo_area.lineStart = d3_geo_areaRingStart;
            },
            polygonEnd: function () {
              var area = 2 * d3_geo_areaRingSum;
              d3_geo_areaSum += area < 0 ? 4 * π + area : area;
              d3_geo_area.lineStart = d3_geo_area.lineEnd = d3_geo_area.point = d3_noop;
            }
          };
        function d3_geo_areaRingStart() {
          var λ00, φ00, λ0, cosφ0, sinφ0;
          d3_geo_area.point = function (λ, φ) {
            d3_geo_area.point = nextPoint;
            λ0 = (λ00 = λ) * d3_radians, cosφ0 = Math.cos(φ = (φ00 = φ) * d3_radians / 2 + π / 4), sinφ0 = Math.sin(φ);
          };
          function nextPoint(λ, φ) {
            λ *= d3_radians;
            φ = φ * d3_radians / 2 + π / 4;
            var dλ = λ - λ0, cosφ = Math.cos(φ), sinφ = Math.sin(φ), k = sinφ0 * sinφ, u = cosφ0 * cosφ + k * Math.cos(dλ), v = k * Math.sin(dλ);
            d3_geo_areaRingSum.add(Math.atan2(v, u));
            λ0 = λ, cosφ0 = cosφ, sinφ0 = sinφ;
          }
          d3_geo_area.lineEnd = function () {
            nextPoint(λ00, φ00);
          };
        }
        function d3_geo_cartesian(spherical) {
          var λ = spherical[0], φ = spherical[1], cosφ = Math.cos(φ);
          return [
            cosφ * Math.cos(λ),
            cosφ * Math.sin(λ),
            Math.sin(φ)
          ];
        }
        function d3_geo_cartesianDot(a, b) {
          return a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
        }
        function d3_geo_cartesianCross(a, b) {
          return [
            a[1] * b[2] - a[2] * b[1],
            a[2] * b[0] - a[0] * b[2],
            a[0] * b[1] - a[1] * b[0]
          ];
        }
        function d3_geo_cartesianAdd(a, b) {
          a[0] += b[0];
          a[1] += b[1];
          a[2] += b[2];
        }
        function d3_geo_cartesianScale(vector, k) {
          return [
            vector[0] * k,
            vector[1] * k,
            vector[2] * k
          ];
        }
        function d3_geo_cartesianNormalize(d) {
          var l = Math.sqrt(d[0] * d[0] + d[1] * d[1] + d[2] * d[2]);
          d[0] /= l;
          d[1] /= l;
          d[2] /= l;
        }
        function d3_geo_spherical(cartesian) {
          return [
            Math.atan2(cartesian[1], cartesian[0]),
            d3_asin(cartesian[2])
          ];
        }
        function d3_geo_sphericalEqual(a, b) {
          return abs(a[0] - b[0]) < ε && abs(a[1] - b[1]) < ε;
        }
        d3.geo.bounds = function () {
          var λ0, φ0, λ1, φ1, λ_, λ__, φ__, p0, dλSum, ranges, range;
          var bound = {
              point: point,
              lineStart: lineStart,
              lineEnd: lineEnd,
              polygonStart: function () {
                bound.point = ringPoint;
                bound.lineStart = ringStart;
                bound.lineEnd = ringEnd;
                dλSum = 0;
                d3_geo_area.polygonStart();
              },
              polygonEnd: function () {
                d3_geo_area.polygonEnd();
                bound.point = point;
                bound.lineStart = lineStart;
                bound.lineEnd = lineEnd;
                if (d3_geo_areaRingSum < 0)
                  λ0 = -(λ1 = 180), φ0 = -(φ1 = 90);
                else if (dλSum > ε)
                  φ1 = 90;
                else if (dλSum < -ε)
                  φ0 = -90;
                range[0] = λ0, range[1] = λ1;
              }
            };
          function point(λ, φ) {
            ranges.push(range = [
              λ0 = λ,
              λ1 = λ
            ]);
            if (φ < φ0)
              φ0 = φ;
            if (φ > φ1)
              φ1 = φ;
          }
          function linePoint(λ, φ) {
            var p = d3_geo_cartesian([
                λ * d3_radians,
                φ * d3_radians
              ]);
            if (p0) {
              var normal = d3_geo_cartesianCross(p0, p), equatorial = [
                  normal[1],
                  -normal[0],
                  0
                ], inflection = d3_geo_cartesianCross(equatorial, normal);
              d3_geo_cartesianNormalize(inflection);
              inflection = d3_geo_spherical(inflection);
              var dλ = λ - λ_, s = dλ > 0 ? 1 : -1, λi = inflection[0] * d3_degrees * s, antimeridian = abs(dλ) > 180;
              if (antimeridian ^ (s * λ_ < λi && λi < s * λ)) {
                var φi = inflection[1] * d3_degrees;
                if (φi > φ1)
                  φ1 = φi;
              } else if (λi = (λi + 360) % 360 - 180, antimeridian ^ (s * λ_ < λi && λi < s * λ)) {
                var φi = -inflection[1] * d3_degrees;
                if (φi < φ0)
                  φ0 = φi;
              } else {
                if (φ < φ0)
                  φ0 = φ;
                if (φ > φ1)
                  φ1 = φ;
              }
              if (antimeridian) {
                if (λ < λ_) {
                  if (angle(λ0, λ) > angle(λ0, λ1))
                    λ1 = λ;
                } else {
                  if (angle(λ, λ1) > angle(λ0, λ1))
                    λ0 = λ;
                }
              } else {
                if (λ1 >= λ0) {
                  if (λ < λ0)
                    λ0 = λ;
                  if (λ > λ1)
                    λ1 = λ;
                } else {
                  if (λ > λ_) {
                    if (angle(λ0, λ) > angle(λ0, λ1))
                      λ1 = λ;
                  } else {
                    if (angle(λ, λ1) > angle(λ0, λ1))
                      λ0 = λ;
                  }
                }
              }
            } else {
              point(λ, φ);
            }
            p0 = p, λ_ = λ;
          }
          function lineStart() {
            bound.point = linePoint;
          }
          function lineEnd() {
            range[0] = λ0, range[1] = λ1;
            bound.point = point;
            p0 = null;
          }
          function ringPoint(λ, φ) {
            if (p0) {
              var dλ = λ - λ_;
              dλSum += abs(dλ) > 180 ? dλ + (dλ > 0 ? 360 : -360) : dλ;
            } else
              λ__ = λ, φ__ = φ;
            d3_geo_area.point(λ, φ);
            linePoint(λ, φ);
          }
          function ringStart() {
            d3_geo_area.lineStart();
          }
          function ringEnd() {
            ringPoint(λ__, φ__);
            d3_geo_area.lineEnd();
            if (abs(dλSum) > ε)
              λ0 = -(λ1 = 180);
            range[0] = λ0, range[1] = λ1;
            p0 = null;
          }
          function angle(λ0, λ1) {
            return (λ1 -= λ0) < 0 ? λ1 + 360 : λ1;
          }
          function compareRanges(a, b) {
            return a[0] - b[0];
          }
          function withinRange(x, range) {
            return range[0] <= range[1] ? range[0] <= x && x <= range[1] : x < range[0] || range[1] < x;
          }
          return function (feature) {
            φ1 = λ1 = -(λ0 = φ0 = Infinity);
            ranges = [];
            d3.geo.stream(feature, bound);
            var n = ranges.length;
            if (n) {
              ranges.sort(compareRanges);
              for (var i = 1, a = ranges[0], b, merged = [a]; i < n; ++i) {
                b = ranges[i];
                if (withinRange(b[0], a) || withinRange(b[1], a)) {
                  if (angle(a[0], b[1]) > angle(a[0], a[1]))
                    a[1] = b[1];
                  if (angle(b[0], a[1]) > angle(a[0], a[1]))
                    a[0] = b[0];
                } else {
                  merged.push(a = b);
                }
              }
              var best = -Infinity, dλ;
              for (var n = merged.length - 1, i = 0, a = merged[n], b; i <= n; a = b, ++i) {
                b = merged[i];
                if ((dλ = angle(a[1], b[0])) > best)
                  best = dλ, λ0 = b[0], λ1 = a[1];
              }
            }
            ranges = range = null;
            return λ0 === Infinity || φ0 === Infinity ? [
              [
                NaN,
                NaN
              ],
              [
                NaN,
                NaN
              ]
            ] : [
              [
                λ0,
                φ0
              ],
              [
                λ1,
                φ1
              ]
            ];
          };
        }();
        d3.geo.centroid = function (object) {
          d3_geo_centroidW0 = d3_geo_centroidW1 = d3_geo_centroidX0 = d3_geo_centroidY0 = d3_geo_centroidZ0 = d3_geo_centroidX1 = d3_geo_centroidY1 = d3_geo_centroidZ1 = d3_geo_centroidX2 = d3_geo_centroidY2 = d3_geo_centroidZ2 = 0;
          d3.geo.stream(object, d3_geo_centroid);
          var x = d3_geo_centroidX2, y = d3_geo_centroidY2, z = d3_geo_centroidZ2, m = x * x + y * y + z * z;
          if (m < ε2) {
            x = d3_geo_centroidX1, y = d3_geo_centroidY1, z = d3_geo_centroidZ1;
            if (d3_geo_centroidW1 < ε)
              x = d3_geo_centroidX0, y = d3_geo_centroidY0, z = d3_geo_centroidZ0;
            m = x * x + y * y + z * z;
            if (m < ε2)
              return [
                NaN,
                NaN
              ];
          }
          return [
            Math.atan2(y, x) * d3_degrees,
            d3_asin(z / Math.sqrt(m)) * d3_degrees
          ];
        };
        var d3_geo_centroidW0, d3_geo_centroidW1, d3_geo_centroidX0, d3_geo_centroidY0, d3_geo_centroidZ0, d3_geo_centroidX1, d3_geo_centroidY1, d3_geo_centroidZ1, d3_geo_centroidX2, d3_geo_centroidY2, d3_geo_centroidZ2;
        var d3_geo_centroid = {
            sphere: d3_noop,
            point: d3_geo_centroidPoint,
            lineStart: d3_geo_centroidLineStart,
            lineEnd: d3_geo_centroidLineEnd,
            polygonStart: function () {
              d3_geo_centroid.lineStart = d3_geo_centroidRingStart;
            },
            polygonEnd: function () {
              d3_geo_centroid.lineStart = d3_geo_centroidLineStart;
            }
          };
        function d3_geo_centroidPoint(λ, φ) {
          λ *= d3_radians;
          var cosφ = Math.cos(φ *= d3_radians);
          d3_geo_centroidPointXYZ(cosφ * Math.cos(λ), cosφ * Math.sin(λ), Math.sin(φ));
        }
        function d3_geo_centroidPointXYZ(x, y, z) {
          ++d3_geo_centroidW0;
          d3_geo_centroidX0 += (x - d3_geo_centroidX0) / d3_geo_centroidW0;
          d3_geo_centroidY0 += (y - d3_geo_centroidY0) / d3_geo_centroidW0;
          d3_geo_centroidZ0 += (z - d3_geo_centroidZ0) / d3_geo_centroidW0;
        }
        function d3_geo_centroidLineStart() {
          var x0, y0, z0;
          d3_geo_centroid.point = function (λ, φ) {
            λ *= d3_radians;
            var cosφ = Math.cos(φ *= d3_radians);
            x0 = cosφ * Math.cos(λ);
            y0 = cosφ * Math.sin(λ);
            z0 = Math.sin(φ);
            d3_geo_centroid.point = nextPoint;
            d3_geo_centroidPointXYZ(x0, y0, z0);
          };
          function nextPoint(λ, φ) {
            λ *= d3_radians;
            var cosφ = Math.cos(φ *= d3_radians), x = cosφ * Math.cos(λ), y = cosφ * Math.sin(λ), z = Math.sin(φ), w = Math.atan2(Math.sqrt((w = y0 * z - z0 * y) * w + (w = z0 * x - x0 * z) * w + (w = x0 * y - y0 * x) * w), x0 * x + y0 * y + z0 * z);
            d3_geo_centroidW1 += w;
            d3_geo_centroidX1 += w * (x0 + (x0 = x));
            d3_geo_centroidY1 += w * (y0 + (y0 = y));
            d3_geo_centroidZ1 += w * (z0 + (z0 = z));
            d3_geo_centroidPointXYZ(x0, y0, z0);
          }
        }
        function d3_geo_centroidLineEnd() {
          d3_geo_centroid.point = d3_geo_centroidPoint;
        }
        function d3_geo_centroidRingStart() {
          var λ00, φ00, x0, y0, z0;
          d3_geo_centroid.point = function (λ, φ) {
            λ00 = λ, φ00 = φ;
            d3_geo_centroid.point = nextPoint;
            λ *= d3_radians;
            var cosφ = Math.cos(φ *= d3_radians);
            x0 = cosφ * Math.cos(λ);
            y0 = cosφ * Math.sin(λ);
            z0 = Math.sin(φ);
            d3_geo_centroidPointXYZ(x0, y0, z0);
          };
          d3_geo_centroid.lineEnd = function () {
            nextPoint(λ00, φ00);
            d3_geo_centroid.lineEnd = d3_geo_centroidLineEnd;
            d3_geo_centroid.point = d3_geo_centroidPoint;
          };
          function nextPoint(λ, φ) {
            λ *= d3_radians;
            var cosφ = Math.cos(φ *= d3_radians), x = cosφ * Math.cos(λ), y = cosφ * Math.sin(λ), z = Math.sin(φ), cx = y0 * z - z0 * y, cy = z0 * x - x0 * z, cz = x0 * y - y0 * x, m = Math.sqrt(cx * cx + cy * cy + cz * cz), u = x0 * x + y0 * y + z0 * z, v = m && -d3_acos(u) / m, w = Math.atan2(m, u);
            d3_geo_centroidX2 += v * cx;
            d3_geo_centroidY2 += v * cy;
            d3_geo_centroidZ2 += v * cz;
            d3_geo_centroidW1 += w;
            d3_geo_centroidX1 += w * (x0 + (x0 = x));
            d3_geo_centroidY1 += w * (y0 + (y0 = y));
            d3_geo_centroidZ1 += w * (z0 + (z0 = z));
            d3_geo_centroidPointXYZ(x0, y0, z0);
          }
        }
        function d3_true() {
          return true;
        }
        function d3_geo_clipPolygon(segments, compare, clipStartInside, interpolate, listener) {
          var subject = [], clip = [];
          segments.forEach(function (segment) {
            if ((n = segment.length - 1) <= 0)
              return;
            var n, p0 = segment[0], p1 = segment[n];
            if (d3_geo_sphericalEqual(p0, p1)) {
              listener.lineStart();
              for (var i = 0; i < n; ++i)
                listener.point((p0 = segment[i])[0], p0[1]);
              listener.lineEnd();
              return;
            }
            var a = new d3_geo_clipPolygonIntersection(p0, segment, null, true), b = new d3_geo_clipPolygonIntersection(p0, null, a, false);
            a.o = b;
            subject.push(a);
            clip.push(b);
            a = new d3_geo_clipPolygonIntersection(p1, segment, null, false);
            b = new d3_geo_clipPolygonIntersection(p1, null, a, true);
            a.o = b;
            subject.push(a);
            clip.push(b);
          });
          clip.sort(compare);
          d3_geo_clipPolygonLinkCircular(subject);
          d3_geo_clipPolygonLinkCircular(clip);
          if (!subject.length)
            return;
          for (var i = 0, entry = clipStartInside, n = clip.length; i < n; ++i) {
            clip[i].e = entry = !entry;
          }
          var start = subject[0], points, point;
          while (1) {
            var current = start, isSubject = true;
            while (current.v)
              if ((current = current.n) === start)
                return;
            points = current.z;
            listener.lineStart();
            do {
              current.v = current.o.v = true;
              if (current.e) {
                if (isSubject) {
                  for (var i = 0, n = points.length; i < n; ++i)
                    listener.point((point = points[i])[0], point[1]);
                } else {
                  interpolate(current.x, current.n.x, 1, listener);
                }
                current = current.n;
              } else {
                if (isSubject) {
                  points = current.p.z;
                  for (var i = points.length - 1; i >= 0; --i)
                    listener.point((point = points[i])[0], point[1]);
                } else {
                  interpolate(current.x, current.p.x, -1, listener);
                }
                current = current.p;
              }
              current = current.o;
              points = current.z;
              isSubject = !isSubject;
            } while (!current.v);
            listener.lineEnd();
          }
        }
        function d3_geo_clipPolygonLinkCircular(array) {
          if (!(n = array.length))
            return;
          var n, i = 0, a = array[0], b;
          while (++i < n) {
            a.n = b = array[i];
            b.p = a;
            a = b;
          }
          a.n = b = array[0];
          b.p = a;
        }
        function d3_geo_clipPolygonIntersection(point, points, other, entry) {
          this.x = point;
          this.z = points;
          this.o = other;
          this.e = entry;
          this.v = false;
          this.n = this.p = null;
        }
        function d3_geo_clip(pointVisible, clipLine, interpolate, clipStart) {
          return function (rotate, listener) {
            var line = clipLine(listener), rotatedClipStart = rotate.invert(clipStart[0], clipStart[1]);
            var clip = {
                point: point,
                lineStart: lineStart,
                lineEnd: lineEnd,
                polygonStart: function () {
                  clip.point = pointRing;
                  clip.lineStart = ringStart;
                  clip.lineEnd = ringEnd;
                  segments = [];
                  polygon = [];
                  listener.polygonStart();
                },
                polygonEnd: function () {
                  clip.point = point;
                  clip.lineStart = lineStart;
                  clip.lineEnd = lineEnd;
                  segments = d3.merge(segments);
                  var clipStartInside = d3_geo_pointInPolygon(rotatedClipStart, polygon);
                  if (segments.length) {
                    d3_geo_clipPolygon(segments, d3_geo_clipSort, clipStartInside, interpolate, listener);
                  } else if (clipStartInside) {
                    listener.lineStart();
                    interpolate(null, null, 1, listener);
                    listener.lineEnd();
                  }
                  listener.polygonEnd();
                  segments = polygon = null;
                },
                sphere: function () {
                  listener.polygonStart();
                  listener.lineStart();
                  interpolate(null, null, 1, listener);
                  listener.lineEnd();
                  listener.polygonEnd();
                }
              };
            function point(λ, φ) {
              var point = rotate(λ, φ);
              if (pointVisible(λ = point[0], φ = point[1]))
                listener.point(λ, φ);
            }
            function pointLine(λ, φ) {
              var point = rotate(λ, φ);
              line.point(point[0], point[1]);
            }
            function lineStart() {
              clip.point = pointLine;
              line.lineStart();
            }
            function lineEnd() {
              clip.point = point;
              line.lineEnd();
            }
            var segments;
            var buffer = d3_geo_clipBufferListener(), ringListener = clipLine(buffer), polygon, ring;
            function pointRing(λ, φ) {
              ring.push([
                λ,
                φ
              ]);
              var point = rotate(λ, φ);
              ringListener.point(point[0], point[1]);
            }
            function ringStart() {
              ringListener.lineStart();
              ring = [];
            }
            function ringEnd() {
              pointRing(ring[0][0], ring[0][1]);
              ringListener.lineEnd();
              var clean = ringListener.clean(), ringSegments = buffer.buffer(), segment, n = ringSegments.length;
              ring.pop();
              polygon.push(ring);
              ring = null;
              if (!n)
                return;
              if (clean & 1) {
                segment = ringSegments[0];
                var n = segment.length - 1, i = -1, point;
                listener.lineStart();
                while (++i < n)
                  listener.point((point = segment[i])[0], point[1]);
                listener.lineEnd();
                return;
              }
              if (n > 1 && clean & 2)
                ringSegments.push(ringSegments.pop().concat(ringSegments.shift()));
              segments.push(ringSegments.filter(d3_geo_clipSegmentLength1));
            }
            return clip;
          };
        }
        function d3_geo_clipSegmentLength1(segment) {
          return segment.length > 1;
        }
        function d3_geo_clipBufferListener() {
          var lines = [], line;
          return {
            lineStart: function () {
              lines.push(line = []);
            },
            point: function (λ, φ) {
              line.push([
                λ,
                φ
              ]);
            },
            lineEnd: d3_noop,
            buffer: function () {
              var buffer = lines;
              lines = [];
              line = null;
              return buffer;
            },
            rejoin: function () {
              if (lines.length > 1)
                lines.push(lines.pop().concat(lines.shift()));
            }
          };
        }
        function d3_geo_clipSort(a, b) {
          return ((a = a.x)[0] < 0 ? a[1] - halfπ - ε : halfπ - a[1]) - ((b = b.x)[0] < 0 ? b[1] - halfπ - ε : halfπ - b[1]);
        }
        function d3_geo_pointInPolygon(point, polygon) {
          var meridian = point[0], parallel = point[1], meridianNormal = [
              Math.sin(meridian),
              -Math.cos(meridian),
              0
            ], polarAngle = 0, winding = 0;
          d3_geo_areaRingSum.reset();
          for (var i = 0, n = polygon.length; i < n; ++i) {
            var ring = polygon[i], m = ring.length;
            if (!m)
              continue;
            var point0 = ring[0], λ0 = point0[0], φ0 = point0[1] / 2 + π / 4, sinφ0 = Math.sin(φ0), cosφ0 = Math.cos(φ0), j = 1;
            while (true) {
              if (j === m)
                j = 0;
              point = ring[j];
              var λ = point[0], φ = point[1] / 2 + π / 4, sinφ = Math.sin(φ), cosφ = Math.cos(φ), dλ = λ - λ0, antimeridian = abs(dλ) > π, k = sinφ0 * sinφ;
              d3_geo_areaRingSum.add(Math.atan2(k * Math.sin(dλ), cosφ0 * cosφ + k * Math.cos(dλ)));
              polarAngle += antimeridian ? dλ + (dλ >= 0 ? τ : -τ) : dλ;
              if (antimeridian ^ λ0 >= meridian ^ λ >= meridian) {
                var arc = d3_geo_cartesianCross(d3_geo_cartesian(point0), d3_geo_cartesian(point));
                d3_geo_cartesianNormalize(arc);
                var intersection = d3_geo_cartesianCross(meridianNormal, arc);
                d3_geo_cartesianNormalize(intersection);
                var φarc = (antimeridian ^ dλ >= 0 ? -1 : 1) * d3_asin(intersection[2]);
                if (parallel > φarc || parallel === φarc && (arc[0] || arc[1])) {
                  winding += antimeridian ^ dλ >= 0 ? 1 : -1;
                }
              }
              if (!j++)
                break;
              λ0 = λ, sinφ0 = sinφ, cosφ0 = cosφ, point0 = point;
            }
          }
          return (polarAngle < -ε || polarAngle < ε && d3_geo_areaRingSum < 0) ^ winding & 1;
        }
        var d3_geo_clipAntimeridian = d3_geo_clip(d3_true, d3_geo_clipAntimeridianLine, d3_geo_clipAntimeridianInterpolate, [
            -π,
            -π / 2
          ]);
        function d3_geo_clipAntimeridianLine(listener) {
          var λ0 = NaN, φ0 = NaN, sλ0 = NaN, clean;
          return {
            lineStart: function () {
              listener.lineStart();
              clean = 1;
            },
            point: function (λ1, φ1) {
              var sλ1 = λ1 > 0 ? π : -π, dλ = abs(λ1 - λ0);
              if (abs(dλ - π) < ε) {
                listener.point(λ0, φ0 = (φ0 + φ1) / 2 > 0 ? halfπ : -halfπ);
                listener.point(sλ0, φ0);
                listener.lineEnd();
                listener.lineStart();
                listener.point(sλ1, φ0);
                listener.point(λ1, φ0);
                clean = 0;
              } else if (sλ0 !== sλ1 && dλ >= π) {
                if (abs(λ0 - sλ0) < ε)
                  λ0 -= sλ0 * ε;
                if (abs(λ1 - sλ1) < ε)
                  λ1 -= sλ1 * ε;
                φ0 = d3_geo_clipAntimeridianIntersect(λ0, φ0, λ1, φ1);
                listener.point(sλ0, φ0);
                listener.lineEnd();
                listener.lineStart();
                listener.point(sλ1, φ0);
                clean = 0;
              }
              listener.point(λ0 = λ1, φ0 = φ1);
              sλ0 = sλ1;
            },
            lineEnd: function () {
              listener.lineEnd();
              λ0 = φ0 = NaN;
            },
            clean: function () {
              return 2 - clean;
            }
          };
        }
        function d3_geo_clipAntimeridianIntersect(λ0, φ0, λ1, φ1) {
          var cosφ0, cosφ1, sinλ0_λ1 = Math.sin(λ0 - λ1);
          return abs(sinλ0_λ1) > ε ? Math.atan((Math.sin(φ0) * (cosφ1 = Math.cos(φ1)) * Math.sin(λ1) - Math.sin(φ1) * (cosφ0 = Math.cos(φ0)) * Math.sin(λ0)) / (cosφ0 * cosφ1 * sinλ0_λ1)) : (φ0 + φ1) / 2;
        }
        function d3_geo_clipAntimeridianInterpolate(from, to, direction, listener) {
          var φ;
          if (from == null) {
            φ = direction * halfπ;
            listener.point(-π, φ);
            listener.point(0, φ);
            listener.point(π, φ);
            listener.point(π, 0);
            listener.point(π, -φ);
            listener.point(0, -φ);
            listener.point(-π, -φ);
            listener.point(-π, 0);
            listener.point(-π, φ);
          } else if (abs(from[0] - to[0]) > ε) {
            var s = from[0] < to[0] ? π : -π;
            φ = direction * s / 2;
            listener.point(-s, φ);
            listener.point(0, φ);
            listener.point(s, φ);
          } else {
            listener.point(to[0], to[1]);
          }
        }
        function d3_geo_clipCircle(radius) {
          var cr = Math.cos(radius), smallRadius = cr > 0, notHemisphere = abs(cr) > ε, interpolate = d3_geo_circleInterpolate(radius, 6 * d3_radians);
          return d3_geo_clip(visible, clipLine, interpolate, smallRadius ? [
            0,
            -radius
          ] : [
            -π,
            radius - π
          ]);
          function visible(λ, φ) {
            return Math.cos(λ) * Math.cos(φ) > cr;
          }
          function clipLine(listener) {
            var point0, c0, v0, v00, clean;
            return {
              lineStart: function () {
                v00 = v0 = false;
                clean = 1;
              },
              point: function (λ, φ) {
                var point1 = [
                    λ,
                    φ
                  ], point2, v = visible(λ, φ), c = smallRadius ? v ? 0 : code(λ, φ) : v ? code(λ + (λ < 0 ? π : -π), φ) : 0;
                if (!point0 && (v00 = v0 = v))
                  listener.lineStart();
                if (v !== v0) {
                  point2 = intersect(point0, point1);
                  if (d3_geo_sphericalEqual(point0, point2) || d3_geo_sphericalEqual(point1, point2)) {
                    point1[0] += ε;
                    point1[1] += ε;
                    v = visible(point1[0], point1[1]);
                  }
                }
                if (v !== v0) {
                  clean = 0;
                  if (v) {
                    listener.lineStart();
                    point2 = intersect(point1, point0);
                    listener.point(point2[0], point2[1]);
                  } else {
                    point2 = intersect(point0, point1);
                    listener.point(point2[0], point2[1]);
                    listener.lineEnd();
                  }
                  point0 = point2;
                } else if (notHemisphere && point0 && smallRadius ^ v) {
                  var t;
                  if (!(c & c0) && (t = intersect(point1, point0, true))) {
                    clean = 0;
                    if (smallRadius) {
                      listener.lineStart();
                      listener.point(t[0][0], t[0][1]);
                      listener.point(t[1][0], t[1][1]);
                      listener.lineEnd();
                    } else {
                      listener.point(t[1][0], t[1][1]);
                      listener.lineEnd();
                      listener.lineStart();
                      listener.point(t[0][0], t[0][1]);
                    }
                  }
                }
                if (v && (!point0 || !d3_geo_sphericalEqual(point0, point1))) {
                  listener.point(point1[0], point1[1]);
                }
                point0 = point1, v0 = v, c0 = c;
              },
              lineEnd: function () {
                if (v0)
                  listener.lineEnd();
                point0 = null;
              },
              clean: function () {
                return clean | (v00 && v0) << 1;
              }
            };
          }
          function intersect(a, b, two) {
            var pa = d3_geo_cartesian(a), pb = d3_geo_cartesian(b);
            var n1 = [
                1,
                0,
                0
              ], n2 = d3_geo_cartesianCross(pa, pb), n2n2 = d3_geo_cartesianDot(n2, n2), n1n2 = n2[0], determinant = n2n2 - n1n2 * n1n2;
            if (!determinant)
              return !two && a;
            var c1 = cr * n2n2 / determinant, c2 = -cr * n1n2 / determinant, n1xn2 = d3_geo_cartesianCross(n1, n2), A = d3_geo_cartesianScale(n1, c1), B = d3_geo_cartesianScale(n2, c2);
            d3_geo_cartesianAdd(A, B);
            var u = n1xn2, w = d3_geo_cartesianDot(A, u), uu = d3_geo_cartesianDot(u, u), t2 = w * w - uu * (d3_geo_cartesianDot(A, A) - 1);
            if (t2 < 0)
              return;
            var t = Math.sqrt(t2), q = d3_geo_cartesianScale(u, (-w - t) / uu);
            d3_geo_cartesianAdd(q, A);
            q = d3_geo_spherical(q);
            if (!two)
              return q;
            var λ0 = a[0], λ1 = b[0], φ0 = a[1], φ1 = b[1], z;
            if (λ1 < λ0)
              z = λ0, λ0 = λ1, λ1 = z;
            var δλ = λ1 - λ0, polar = abs(δλ - π) < ε, meridian = polar || δλ < ε;
            if (!polar && φ1 < φ0)
              z = φ0, φ0 = φ1, φ1 = z;
            if (meridian ? polar ? φ0 + φ1 > 0 ^ q[1] < (abs(q[0] - λ0) < ε ? φ0 : φ1) : φ0 <= q[1] && q[1] <= φ1 : δλ > π ^ (λ0 <= q[0] && q[0] <= λ1)) {
              var q1 = d3_geo_cartesianScale(u, (-w + t) / uu);
              d3_geo_cartesianAdd(q1, A);
              return [
                q,
                d3_geo_spherical(q1)
              ];
            }
          }
          function code(λ, φ) {
            var r = smallRadius ? radius : π - radius, code = 0;
            if (λ < -r)
              code |= 1;
            else if (λ > r)
              code |= 2;
            if (φ < -r)
              code |= 4;
            else if (φ > r)
              code |= 8;
            return code;
          }
        }
        function d3_geom_clipLine(x0, y0, x1, y1) {
          return function (line) {
            var a = line.a, b = line.b, ax = a.x, ay = a.y, bx = b.x, by = b.y, t0 = 0, t1 = 1, dx = bx - ax, dy = by - ay, r;
            r = x0 - ax;
            if (!dx && r > 0)
              return;
            r /= dx;
            if (dx < 0) {
              if (r < t0)
                return;
              if (r < t1)
                t1 = r;
            } else if (dx > 0) {
              if (r > t1)
                return;
              if (r > t0)
                t0 = r;
            }
            r = x1 - ax;
            if (!dx && r < 0)
              return;
            r /= dx;
            if (dx < 0) {
              if (r > t1)
                return;
              if (r > t0)
                t0 = r;
            } else if (dx > 0) {
              if (r < t0)
                return;
              if (r < t1)
                t1 = r;
            }
            r = y0 - ay;
            if (!dy && r > 0)
              return;
            r /= dy;
            if (dy < 0) {
              if (r < t0)
                return;
              if (r < t1)
                t1 = r;
            } else if (dy > 0) {
              if (r > t1)
                return;
              if (r > t0)
                t0 = r;
            }
            r = y1 - ay;
            if (!dy && r < 0)
              return;
            r /= dy;
            if (dy < 0) {
              if (r > t1)
                return;
              if (r > t0)
                t0 = r;
            } else if (dy > 0) {
              if (r < t0)
                return;
              if (r < t1)
                t1 = r;
            }
            if (t0 > 0)
              line.a = {
                x: ax + t0 * dx,
                y: ay + t0 * dy
              };
            if (t1 < 1)
              line.b = {
                x: ax + t1 * dx,
                y: ay + t1 * dy
              };
            return line;
          };
        }
        var d3_geo_clipExtentMAX = 1000000000;
        d3.geo.clipExtent = function () {
          var x0, y0, x1, y1, stream, clip, clipExtent = {
              stream: function (output) {
                if (stream)
                  stream.valid = false;
                stream = clip(output);
                stream.valid = true;
                return stream;
              },
              extent: function (_) {
                if (!arguments.length)
                  return [
                    [
                      x0,
                      y0
                    ],
                    [
                      x1,
                      y1
                    ]
                  ];
                clip = d3_geo_clipExtent(x0 = +_[0][0], y0 = +_[0][1], x1 = +_[1][0], y1 = +_[1][1]);
                if (stream)
                  stream.valid = false, stream = null;
                return clipExtent;
              }
            };
          return clipExtent.extent([
            [
              0,
              0
            ],
            [
              960,
              500
            ]
          ]);
        };
        function d3_geo_clipExtent(x0, y0, x1, y1) {
          return function (listener) {
            var listener_ = listener, bufferListener = d3_geo_clipBufferListener(), clipLine = d3_geom_clipLine(x0, y0, x1, y1), segments, polygon, ring;
            var clip = {
                point: point,
                lineStart: lineStart,
                lineEnd: lineEnd,
                polygonStart: function () {
                  listener = bufferListener;
                  segments = [];
                  polygon = [];
                  clean = true;
                },
                polygonEnd: function () {
                  listener = listener_;
                  segments = d3.merge(segments);
                  var clipStartInside = insidePolygon([
                      x0,
                      y1
                    ]), inside = clean && clipStartInside, visible = segments.length;
                  if (inside || visible) {
                    listener.polygonStart();
                    if (inside) {
                      listener.lineStart();
                      interpolate(null, null, 1, listener);
                      listener.lineEnd();
                    }
                    if (visible) {
                      d3_geo_clipPolygon(segments, compare, clipStartInside, interpolate, listener);
                    }
                    listener.polygonEnd();
                  }
                  segments = polygon = ring = null;
                }
              };
            function insidePolygon(p) {
              var wn = 0, n = polygon.length, y = p[1];
              for (var i = 0; i < n; ++i) {
                for (var j = 1, v = polygon[i], m = v.length, a = v[0], b; j < m; ++j) {
                  b = v[j];
                  if (a[1] <= y) {
                    if (b[1] > y && isLeft(a, b, p) > 0)
                      ++wn;
                  } else {
                    if (b[1] <= y && isLeft(a, b, p) < 0)
                      --wn;
                  }
                  a = b;
                }
              }
              return wn !== 0;
            }
            function isLeft(a, b, c) {
              return (b[0] - a[0]) * (c[1] - a[1]) - (c[0] - a[0]) * (b[1] - a[1]);
            }
            function interpolate(from, to, direction, listener) {
              var a = 0, a1 = 0;
              if (from == null || (a = corner(from, direction)) !== (a1 = corner(to, direction)) || comparePoints(from, to) < 0 ^ direction > 0) {
                do {
                  listener.point(a === 0 || a === 3 ? x0 : x1, a > 1 ? y1 : y0);
                } while ((a = (a + direction + 4) % 4) !== a1);
              } else {
                listener.point(to[0], to[1]);
              }
            }
            function pointVisible(x, y) {
              return x0 <= x && x <= x1 && y0 <= y && y <= y1;
            }
            function point(x, y) {
              if (pointVisible(x, y))
                listener.point(x, y);
            }
            var x__, y__, v__, x_, y_, v_, first, clean;
            function lineStart() {
              clip.point = linePoint;
              if (polygon)
                polygon.push(ring = []);
              first = true;
              v_ = false;
              x_ = y_ = NaN;
            }
            function lineEnd() {
              if (segments) {
                linePoint(x__, y__);
                if (v__ && v_)
                  bufferListener.rejoin();
                segments.push(bufferListener.buffer());
              }
              clip.point = point;
              if (v_)
                listener.lineEnd();
            }
            function linePoint(x, y) {
              x = Math.max(-d3_geo_clipExtentMAX, Math.min(d3_geo_clipExtentMAX, x));
              y = Math.max(-d3_geo_clipExtentMAX, Math.min(d3_geo_clipExtentMAX, y));
              var v = pointVisible(x, y);
              if (polygon)
                ring.push([
                  x,
                  y
                ]);
              if (first) {
                x__ = x, y__ = y, v__ = v;
                first = false;
                if (v) {
                  listener.lineStart();
                  listener.point(x, y);
                }
              } else {
                if (v && v_)
                  listener.point(x, y);
                else {
                  var l = {
                      a: {
                        x: x_,
                        y: y_
                      },
                      b: {
                        x: x,
                        y: y
                      }
                    };
                  if (clipLine(l)) {
                    if (!v_) {
                      listener.lineStart();
                      listener.point(l.a.x, l.a.y);
                    }
                    listener.point(l.b.x, l.b.y);
                    if (!v)
                      listener.lineEnd();
                    clean = false;
                  } else if (v) {
                    listener.lineStart();
                    listener.point(x, y);
                    clean = false;
                  }
                }
              }
              x_ = x, y_ = y, v_ = v;
            }
            return clip;
          };
          function corner(p, direction) {
            return abs(p[0] - x0) < ε ? direction > 0 ? 0 : 3 : abs(p[0] - x1) < ε ? direction > 0 ? 2 : 1 : abs(p[1] - y0) < ε ? direction > 0 ? 1 : 0 : direction > 0 ? 3 : 2;
          }
          function compare(a, b) {
            return comparePoints(a.x, b.x);
          }
          function comparePoints(a, b) {
            var ca = corner(a, 1), cb = corner(b, 1);
            return ca !== cb ? ca - cb : ca === 0 ? b[1] - a[1] : ca === 1 ? a[0] - b[0] : ca === 2 ? a[1] - b[1] : b[0] - a[0];
          }
        }
        function d3_geo_compose(a, b) {
          function compose(x, y) {
            return x = a(x, y), b(x[0], x[1]);
          }
          if (a.invert && b.invert)
            compose.invert = function (x, y) {
              return x = b.invert(x, y), x && a.invert(x[0], x[1]);
            };
          return compose;
        }
        function d3_geo_conic(projectAt) {
          var φ0 = 0, φ1 = π / 3, m = d3_geo_projectionMutator(projectAt), p = m(φ0, φ1);
          p.parallels = function (_) {
            if (!arguments.length)
              return [
                φ0 / π * 180,
                φ1 / π * 180
              ];
            return m(φ0 = _[0] * π / 180, φ1 = _[1] * π / 180);
          };
          return p;
        }
        function d3_geo_conicEqualArea(φ0, φ1) {
          var sinφ0 = Math.sin(φ0), n = (sinφ0 + Math.sin(φ1)) / 2, C = 1 + sinφ0 * (2 * n - sinφ0), ρ0 = Math.sqrt(C) / n;
          function forward(λ, φ) {
            var ρ = Math.sqrt(C - 2 * n * Math.sin(φ)) / n;
            return [
              ρ * Math.sin(λ *= n),
              ρ0 - ρ * Math.cos(λ)
            ];
          }
          forward.invert = function (x, y) {
            var ρ0_y = ρ0 - y;
            return [
              Math.atan2(x, ρ0_y) / n,
              d3_asin((C - (x * x + ρ0_y * ρ0_y) * n * n) / (2 * n))
            ];
          };
          return forward;
        }
        (d3.geo.conicEqualArea = function () {
          return d3_geo_conic(d3_geo_conicEqualArea);
        }).raw = d3_geo_conicEqualArea;
        d3.geo.albers = function () {
          return d3.geo.conicEqualArea().rotate([
            96,
            0
          ]).center([
            -0.6,
            38.7
          ]).parallels([
            29.5,
            45.5
          ]).scale(1070);
        };
        d3.geo.albersUsa = function () {
          var lower48 = d3.geo.albers();
          var alaska = d3.geo.conicEqualArea().rotate([
              154,
              0
            ]).center([
              -2,
              58.5
            ]).parallels([
              55,
              65
            ]);
          var hawaii = d3.geo.conicEqualArea().rotate([
              157,
              0
            ]).center([
              -3,
              19.9
            ]).parallels([
              8,
              18
            ]);
          var point, pointStream = {
              point: function (x, y) {
                point = [
                  x,
                  y
                ];
              }
            }, lower48Point, alaskaPoint, hawaiiPoint;
          function albersUsa(coordinates) {
            var x = coordinates[0], y = coordinates[1];
            point = null;
            (lower48Point(x, y), point) || (alaskaPoint(x, y), point) || hawaiiPoint(x, y);
            return point;
          }
          albersUsa.invert = function (coordinates) {
            var k = lower48.scale(), t = lower48.translate(), x = (coordinates[0] - t[0]) / k, y = (coordinates[1] - t[1]) / k;
            return (y >= 0.12 && y < 0.234 && x >= -0.425 && x < -0.214 ? alaska : y >= 0.166 && y < 0.234 && x >= -0.214 && x < -0.115 ? hawaii : lower48).invert(coordinates);
          };
          albersUsa.stream = function (stream) {
            var lower48Stream = lower48.stream(stream), alaskaStream = alaska.stream(stream), hawaiiStream = hawaii.stream(stream);
            return {
              point: function (x, y) {
                lower48Stream.point(x, y);
                alaskaStream.point(x, y);
                hawaiiStream.point(x, y);
              },
              sphere: function () {
                lower48Stream.sphere();
                alaskaStream.sphere();
                hawaiiStream.sphere();
              },
              lineStart: function () {
                lower48Stream.lineStart();
                alaskaStream.lineStart();
                hawaiiStream.lineStart();
              },
              lineEnd: function () {
                lower48Stream.lineEnd();
                alaskaStream.lineEnd();
                hawaiiStream.lineEnd();
              },
              polygonStart: function () {
                lower48Stream.polygonStart();
                alaskaStream.polygonStart();
                hawaiiStream.polygonStart();
              },
              polygonEnd: function () {
                lower48Stream.polygonEnd();
                alaskaStream.polygonEnd();
                hawaiiStream.polygonEnd();
              }
            };
          };
          albersUsa.precision = function (_) {
            if (!arguments.length)
              return lower48.precision();
            lower48.precision(_);
            alaska.precision(_);
            hawaii.precision(_);
            return albersUsa;
          };
          albersUsa.scale = function (_) {
            if (!arguments.length)
              return lower48.scale();
            lower48.scale(_);
            alaska.scale(_ * 0.35);
            hawaii.scale(_);
            return albersUsa.translate(lower48.translate());
          };
          albersUsa.translate = function (_) {
            if (!arguments.length)
              return lower48.translate();
            var k = lower48.scale(), x = +_[0], y = +_[1];
            lower48Point = lower48.translate(_).clipExtent([
              [
                x - 0.455 * k,
                y - 0.238 * k
              ],
              [
                x + 0.455 * k,
                y + 0.238 * k
              ]
            ]).stream(pointStream).point;
            alaskaPoint = alaska.translate([
              x - 0.307 * k,
              y + 0.201 * k
            ]).clipExtent([
              [
                x - 0.425 * k + ε,
                y + 0.12 * k + ε
              ],
              [
                x - 0.214 * k - ε,
                y + 0.234 * k - ε
              ]
            ]).stream(pointStream).point;
            hawaiiPoint = hawaii.translate([
              x - 0.205 * k,
              y + 0.212 * k
            ]).clipExtent([
              [
                x - 0.214 * k + ε,
                y + 0.166 * k + ε
              ],
              [
                x - 0.115 * k - ε,
                y + 0.234 * k - ε
              ]
            ]).stream(pointStream).point;
            return albersUsa;
          };
          return albersUsa.scale(1070);
        };
        var d3_geo_pathAreaSum, d3_geo_pathAreaPolygon, d3_geo_pathArea = {
            point: d3_noop,
            lineStart: d3_noop,
            lineEnd: d3_noop,
            polygonStart: function () {
              d3_geo_pathAreaPolygon = 0;
              d3_geo_pathArea.lineStart = d3_geo_pathAreaRingStart;
            },
            polygonEnd: function () {
              d3_geo_pathArea.lineStart = d3_geo_pathArea.lineEnd = d3_geo_pathArea.point = d3_noop;
              d3_geo_pathAreaSum += abs(d3_geo_pathAreaPolygon / 2);
            }
          };
        function d3_geo_pathAreaRingStart() {
          var x00, y00, x0, y0;
          d3_geo_pathArea.point = function (x, y) {
            d3_geo_pathArea.point = nextPoint;
            x00 = x0 = x, y00 = y0 = y;
          };
          function nextPoint(x, y) {
            d3_geo_pathAreaPolygon += y0 * x - x0 * y;
            x0 = x, y0 = y;
          }
          d3_geo_pathArea.lineEnd = function () {
            nextPoint(x00, y00);
          };
        }
        var d3_geo_pathBoundsX0, d3_geo_pathBoundsY0, d3_geo_pathBoundsX1, d3_geo_pathBoundsY1;
        var d3_geo_pathBounds = {
            point: d3_geo_pathBoundsPoint,
            lineStart: d3_noop,
            lineEnd: d3_noop,
            polygonStart: d3_noop,
            polygonEnd: d3_noop
          };
        function d3_geo_pathBoundsPoint(x, y) {
          if (x < d3_geo_pathBoundsX0)
            d3_geo_pathBoundsX0 = x;
          if (x > d3_geo_pathBoundsX1)
            d3_geo_pathBoundsX1 = x;
          if (y < d3_geo_pathBoundsY0)
            d3_geo_pathBoundsY0 = y;
          if (y > d3_geo_pathBoundsY1)
            d3_geo_pathBoundsY1 = y;
        }
        function d3_geo_pathBuffer() {
          var pointCircle = d3_geo_pathBufferCircle(4.5), buffer = [];
          var stream = {
              point: point,
              lineStart: function () {
                stream.point = pointLineStart;
              },
              lineEnd: lineEnd,
              polygonStart: function () {
                stream.lineEnd = lineEndPolygon;
              },
              polygonEnd: function () {
                stream.lineEnd = lineEnd;
                stream.point = point;
              },
              pointRadius: function (_) {
                pointCircle = d3_geo_pathBufferCircle(_);
                return stream;
              },
              result: function () {
                if (buffer.length) {
                  var result = buffer.join('');
                  buffer = [];
                  return result;
                }
              }
            };
          function point(x, y) {
            buffer.push('M', x, ',', y, pointCircle);
          }
          function pointLineStart(x, y) {
            buffer.push('M', x, ',', y);
            stream.point = pointLine;
          }
          function pointLine(x, y) {
            buffer.push('L', x, ',', y);
          }
          function lineEnd() {
            stream.point = point;
          }
          function lineEndPolygon() {
            buffer.push('Z');
          }
          return stream;
        }
        function d3_geo_pathBufferCircle(radius) {
          return 'm0,' + radius + 'a' + radius + ',' + radius + ' 0 1,1 0,' + -2 * radius + 'a' + radius + ',' + radius + ' 0 1,1 0,' + 2 * radius + 'z';
        }
        var d3_geo_pathCentroid = {
            point: d3_geo_pathCentroidPoint,
            lineStart: d3_geo_pathCentroidLineStart,
            lineEnd: d3_geo_pathCentroidLineEnd,
            polygonStart: function () {
              d3_geo_pathCentroid.lineStart = d3_geo_pathCentroidRingStart;
            },
            polygonEnd: function () {
              d3_geo_pathCentroid.point = d3_geo_pathCentroidPoint;
              d3_geo_pathCentroid.lineStart = d3_geo_pathCentroidLineStart;
              d3_geo_pathCentroid.lineEnd = d3_geo_pathCentroidLineEnd;
            }
          };
        function d3_geo_pathCentroidPoint(x, y) {
          d3_geo_centroidX0 += x;
          d3_geo_centroidY0 += y;
          ++d3_geo_centroidZ0;
        }
        function d3_geo_pathCentroidLineStart() {
          var x0, y0;
          d3_geo_pathCentroid.point = function (x, y) {
            d3_geo_pathCentroid.point = nextPoint;
            d3_geo_pathCentroidPoint(x0 = x, y0 = y);
          };
          function nextPoint(x, y) {
            var dx = x - x0, dy = y - y0, z = Math.sqrt(dx * dx + dy * dy);
            d3_geo_centroidX1 += z * (x0 + x) / 2;
            d3_geo_centroidY1 += z * (y0 + y) / 2;
            d3_geo_centroidZ1 += z;
            d3_geo_pathCentroidPoint(x0 = x, y0 = y);
          }
        }
        function d3_geo_pathCentroidLineEnd() {
          d3_geo_pathCentroid.point = d3_geo_pathCentroidPoint;
        }
        function d3_geo_pathCentroidRingStart() {
          var x00, y00, x0, y0;
          d3_geo_pathCentroid.point = function (x, y) {
            d3_geo_pathCentroid.point = nextPoint;
            d3_geo_pathCentroidPoint(x00 = x0 = x, y00 = y0 = y);
          };
          function nextPoint(x, y) {
            var dx = x - x0, dy = y - y0, z = Math.sqrt(dx * dx + dy * dy);
            d3_geo_centroidX1 += z * (x0 + x) / 2;
            d3_geo_centroidY1 += z * (y0 + y) / 2;
            d3_geo_centroidZ1 += z;
            z = y0 * x - x0 * y;
            d3_geo_centroidX2 += z * (x0 + x);
            d3_geo_centroidY2 += z * (y0 + y);
            d3_geo_centroidZ2 += z * 3;
            d3_geo_pathCentroidPoint(x0 = x, y0 = y);
          }
          d3_geo_pathCentroid.lineEnd = function () {
            nextPoint(x00, y00);
          };
        }
        function d3_geo_pathContext(context) {
          var pointRadius = 4.5;
          var stream = {
              point: point,
              lineStart: function () {
                stream.point = pointLineStart;
              },
              lineEnd: lineEnd,
              polygonStart: function () {
                stream.lineEnd = lineEndPolygon;
              },
              polygonEnd: function () {
                stream.lineEnd = lineEnd;
                stream.point = point;
              },
              pointRadius: function (_) {
                pointRadius = _;
                return stream;
              },
              result: d3_noop
            };
          function point(x, y) {
            context.moveTo(x, y);
            context.arc(x, y, pointRadius, 0, τ);
          }
          function pointLineStart(x, y) {
            context.moveTo(x, y);
            stream.point = pointLine;
          }
          function pointLine(x, y) {
            context.lineTo(x, y);
          }
          function lineEnd() {
            stream.point = point;
          }
          function lineEndPolygon() {
            context.closePath();
          }
          return stream;
        }
        function d3_geo_resample(project) {
          var δ2 = 0.5, cosMinDistance = Math.cos(30 * d3_radians), maxDepth = 16;
          function resample(stream) {
            var λ00, φ00, x00, y00, a00, b00, c00, λ0, x0, y0, a0, b0, c0;
            var resample = {
                point: point,
                lineStart: lineStart,
                lineEnd: lineEnd,
                polygonStart: function () {
                  stream.polygonStart();
                  resample.lineStart = ringStart;
                },
                polygonEnd: function () {
                  stream.polygonEnd();
                  resample.lineStart = lineStart;
                }
              };
            function point(x, y) {
              x = project(x, y);
              stream.point(x[0], x[1]);
            }
            function lineStart() {
              x0 = NaN;
              resample.point = linePoint;
              stream.lineStart();
            }
            function linePoint(λ, φ) {
              var c = d3_geo_cartesian([
                  λ,
                  φ
                ]), p = project(λ, φ);
              resampleLineTo(x0, y0, λ0, a0, b0, c0, x0 = p[0], y0 = p[1], λ0 = λ, a0 = c[0], b0 = c[1], c0 = c[2], maxDepth, stream);
              stream.point(x0, y0);
            }
            function lineEnd() {
              resample.point = point;
              stream.lineEnd();
            }
            function ringStart() {
              lineStart();
              resample.point = ringPoint;
              resample.lineEnd = ringEnd;
            }
            function ringPoint(λ, φ) {
              linePoint(λ00 = λ, φ00 = φ), x00 = x0, y00 = y0, a00 = a0, b00 = b0, c00 = c0;
              resample.point = linePoint;
            }
            function ringEnd() {
              resampleLineTo(x0, y0, λ0, a0, b0, c0, x00, y00, λ00, a00, b00, c00, maxDepth, stream);
              resample.lineEnd = lineEnd;
              lineEnd();
            }
            return resample;
          }
          function resampleLineTo(x0, y0, λ0, a0, b0, c0, x1, y1, λ1, a1, b1, c1, depth, stream) {
            var dx = x1 - x0, dy = y1 - y0, d2 = dx * dx + dy * dy;
            if (d2 > 4 * δ2 && depth--) {
              var a = a0 + a1, b = b0 + b1, c = c0 + c1, m = Math.sqrt(a * a + b * b + c * c), φ2 = Math.asin(c /= m), λ2 = abs(abs(c) - 1) < ε ? (λ0 + λ1) / 2 : Math.atan2(b, a), p = project(λ2, φ2), x2 = p[0], y2 = p[1], dx2 = x2 - x0, dy2 = y2 - y0, dz = dy * dx2 - dx * dy2;
              if (dz * dz / d2 > δ2 || abs((dx * dx2 + dy * dy2) / d2 - 0.5) > 0.3 || a0 * a1 + b0 * b1 + c0 * c1 < cosMinDistance) {
                resampleLineTo(x0, y0, λ0, a0, b0, c0, x2, y2, λ2, a /= m, b /= m, c, depth, stream);
                stream.point(x2, y2);
                resampleLineTo(x2, y2, λ2, a, b, c, x1, y1, λ1, a1, b1, c1, depth, stream);
              }
            }
          }
          resample.precision = function (_) {
            if (!arguments.length)
              return Math.sqrt(δ2);
            maxDepth = (δ2 = _ * _) > 0 && 16;
            return resample;
          };
          return resample;
        }
        d3.geo.transform = function (methods) {
          return {
            stream: function (stream) {
              var transform = new d3_geo_transform(stream);
              for (var k in methods)
                transform[k] = methods[k];
              return transform;
            }
          };
        };
        function d3_geo_transform(stream) {
          this.stream = stream;
        }
        d3_geo_transform.prototype = {
          point: function (x, y) {
            this.stream.point(x, y);
          },
          sphere: function () {
            this.stream.sphere();
          },
          lineStart: function () {
            this.stream.lineStart();
          },
          lineEnd: function () {
            this.stream.lineEnd();
          },
          polygonStart: function () {
            this.stream.polygonStart();
          },
          polygonEnd: function () {
            this.stream.polygonEnd();
          }
        };
        d3.geo.path = function () {
          var pointRadius = 4.5, projection, context, projectStream, contextStream, cacheStream;
          function path(object) {
            if (object) {
              if (typeof pointRadius === 'function')
                contextStream.pointRadius(+pointRadius.apply(this, arguments));
              if (!cacheStream || !cacheStream.valid)
                cacheStream = projectStream(contextStream);
              d3.geo.stream(object, cacheStream);
            }
            return contextStream.result();
          }
          path.area = function (object) {
            d3_geo_pathAreaSum = 0;
            d3.geo.stream(object, projectStream(d3_geo_pathArea));
            return d3_geo_pathAreaSum;
          };
          path.centroid = function (object) {
            d3_geo_centroidX0 = d3_geo_centroidY0 = d3_geo_centroidZ0 = d3_geo_centroidX1 = d3_geo_centroidY1 = d3_geo_centroidZ1 = d3_geo_centroidX2 = d3_geo_centroidY2 = d3_geo_centroidZ2 = 0;
            d3.geo.stream(object, projectStream(d3_geo_pathCentroid));
            return d3_geo_centroidZ2 ? [
              d3_geo_centroidX2 / d3_geo_centroidZ2,
              d3_geo_centroidY2 / d3_geo_centroidZ2
            ] : d3_geo_centroidZ1 ? [
              d3_geo_centroidX1 / d3_geo_centroidZ1,
              d3_geo_centroidY1 / d3_geo_centroidZ1
            ] : d3_geo_centroidZ0 ? [
              d3_geo_centroidX0 / d3_geo_centroidZ0,
              d3_geo_centroidY0 / d3_geo_centroidZ0
            ] : [
              NaN,
              NaN
            ];
          };
          path.bounds = function (object) {
            d3_geo_pathBoundsX1 = d3_geo_pathBoundsY1 = -(d3_geo_pathBoundsX0 = d3_geo_pathBoundsY0 = Infinity);
            d3.geo.stream(object, projectStream(d3_geo_pathBounds));
            return [
              [
                d3_geo_pathBoundsX0,
                d3_geo_pathBoundsY0
              ],
              [
                d3_geo_pathBoundsX1,
                d3_geo_pathBoundsY1
              ]
            ];
          };
          path.projection = function (_) {
            if (!arguments.length)
              return projection;
            projectStream = (projection = _) ? _.stream || d3_geo_pathProjectStream(_) : d3_identity;
            return reset();
          };
          path.context = function (_) {
            if (!arguments.length)
              return context;
            contextStream = (context = _) == null ? new d3_geo_pathBuffer() : new d3_geo_pathContext(_);
            if (typeof pointRadius !== 'function')
              contextStream.pointRadius(pointRadius);
            return reset();
          };
          path.pointRadius = function (_) {
            if (!arguments.length)
              return pointRadius;
            pointRadius = typeof _ === 'function' ? _ : (contextStream.pointRadius(+_), +_);
            return path;
          };
          function reset() {
            cacheStream = null;
            return path;
          }
          return path.projection(d3.geo.albersUsa()).context(null);
        };
        function d3_geo_pathProjectStream(project) {
          var resample = d3_geo_resample(function (x, y) {
              return project([
                x * d3_degrees,
                y * d3_degrees
              ]);
            });
          return function (stream) {
            var transform = new d3_geo_transform(stream = resample(stream));
            transform.point = function (x, y) {
              stream.point(x * d3_radians, y * d3_radians);
            };
            return transform;
          };
        }
        d3.geo.projection = d3_geo_projection;
        d3.geo.projectionMutator = d3_geo_projectionMutator;
        function d3_geo_projection(project) {
          return d3_geo_projectionMutator(function () {
            return project;
          })();
        }
        function d3_geo_projectionMutator(projectAt) {
          var project, rotate, projectRotate, projectResample = d3_geo_resample(function (x, y) {
              x = project(x, y);
              return [
                x[0] * k + δx,
                δy - x[1] * k
              ];
            }), k = 150, x = 480, y = 250, λ = 0, φ = 0, δλ = 0, δφ = 0, δγ = 0, δx, δy, preclip = d3_geo_clipAntimeridian, postclip = d3_identity, clipAngle = null, clipExtent = null, stream;
          function projection(point) {
            point = projectRotate(point[0] * d3_radians, point[1] * d3_radians);
            return [
              point[0] * k + δx,
              δy - point[1] * k
            ];
          }
          function invert(point) {
            point = projectRotate.invert((point[0] - δx) / k, (δy - point[1]) / k);
            return point && [
              point[0] * d3_degrees,
              point[1] * d3_degrees
            ];
          }
          projection.stream = function (output) {
            if (stream)
              stream.valid = false;
            stream = d3_geo_projectionRadians(preclip(rotate, projectResample(postclip(output))));
            stream.valid = true;
            return stream;
          };
          projection.clipAngle = function (_) {
            if (!arguments.length)
              return clipAngle;
            preclip = _ == null ? (clipAngle = _, d3_geo_clipAntimeridian) : d3_geo_clipCircle((clipAngle = +_) * d3_radians);
            return invalidate();
          };
          projection.clipExtent = function (_) {
            if (!arguments.length)
              return clipExtent;
            clipExtent = _;
            postclip = _ ? d3_geo_clipExtent(_[0][0], _[0][1], _[1][0], _[1][1]) : d3_identity;
            return invalidate();
          };
          projection.scale = function (_) {
            if (!arguments.length)
              return k;
            k = +_;
            return reset();
          };
          projection.translate = function (_) {
            if (!arguments.length)
              return [
                x,
                y
              ];
            x = +_[0];
            y = +_[1];
            return reset();
          };
          projection.center = function (_) {
            if (!arguments.length)
              return [
                λ * d3_degrees,
                φ * d3_degrees
              ];
            λ = _[0] % 360 * d3_radians;
            φ = _[1] % 360 * d3_radians;
            return reset();
          };
          projection.rotate = function (_) {
            if (!arguments.length)
              return [
                δλ * d3_degrees,
                δφ * d3_degrees,
                δγ * d3_degrees
              ];
            δλ = _[0] % 360 * d3_radians;
            δφ = _[1] % 360 * d3_radians;
            δγ = _.length > 2 ? _[2] % 360 * d3_radians : 0;
            return reset();
          };
          d3.rebind(projection, projectResample, 'precision');
          function reset() {
            projectRotate = d3_geo_compose(rotate = d3_geo_rotation(δλ, δφ, δγ), project);
            var center = project(λ, φ);
            δx = x - center[0] * k;
            δy = y + center[1] * k;
            return invalidate();
          }
          function invalidate() {
            if (stream)
              stream.valid = false, stream = null;
            return projection;
          }
          return function () {
            project = projectAt.apply(this, arguments);
            projection.invert = project.invert && invert;
            return reset();
          };
        }
        function d3_geo_projectionRadians(stream) {
          var transform = new d3_geo_transform(stream);
          transform.point = function (λ, φ) {
            stream.point(λ * d3_radians, φ * d3_radians);
          };
          return transform;
        }
        function d3_geo_equirectangular(λ, φ) {
          return [
            λ,
            φ
          ];
        }
        (d3.geo.equirectangular = function () {
          return d3_geo_projection(d3_geo_equirectangular);
        }).raw = d3_geo_equirectangular.invert = d3_geo_equirectangular;
        d3.geo.rotation = function (rotate) {
          rotate = d3_geo_rotation(rotate[0] % 360 * d3_radians, rotate[1] * d3_radians, rotate.length > 2 ? rotate[2] * d3_radians : 0);
          function forward(coordinates) {
            coordinates = rotate(coordinates[0] * d3_radians, coordinates[1] * d3_radians);
            return coordinates[0] *= d3_degrees, coordinates[1] *= d3_degrees, coordinates;
          }
          forward.invert = function (coordinates) {
            coordinates = rotate.invert(coordinates[0] * d3_radians, coordinates[1] * d3_radians);
            return coordinates[0] *= d3_degrees, coordinates[1] *= d3_degrees, coordinates;
          };
          return forward;
        };
        function d3_geo_identityRotation(λ, φ) {
          return [
            λ > π ? λ - τ : λ < -π ? λ + τ : λ,
            φ
          ];
        }
        d3_geo_identityRotation.invert = d3_geo_equirectangular;
        function d3_geo_rotation(δλ, δφ, δγ) {
          return δλ ? δφ || δγ ? d3_geo_compose(d3_geo_rotationλ(δλ), d3_geo_rotationφγ(δφ, δγ)) : d3_geo_rotationλ(δλ) : δφ || δγ ? d3_geo_rotationφγ(δφ, δγ) : d3_geo_identityRotation;
        }
        function d3_geo_forwardRotationλ(δλ) {
          return function (λ, φ) {
            return λ += δλ, [
              λ > π ? λ - τ : λ < -π ? λ + τ : λ,
              φ
            ];
          };
        }
        function d3_geo_rotationλ(δλ) {
          var rotation = d3_geo_forwardRotationλ(δλ);
          rotation.invert = d3_geo_forwardRotationλ(-δλ);
          return rotation;
        }
        function d3_geo_rotationφγ(δφ, δγ) {
          var cosδφ = Math.cos(δφ), sinδφ = Math.sin(δφ), cosδγ = Math.cos(δγ), sinδγ = Math.sin(δγ);
          function rotation(λ, φ) {
            var cosφ = Math.cos(φ), x = Math.cos(λ) * cosφ, y = Math.sin(λ) * cosφ, z = Math.sin(φ), k = z * cosδφ + x * sinδφ;
            return [
              Math.atan2(y * cosδγ - k * sinδγ, x * cosδφ - z * sinδφ),
              d3_asin(k * cosδγ + y * sinδγ)
            ];
          }
          rotation.invert = function (λ, φ) {
            var cosφ = Math.cos(φ), x = Math.cos(λ) * cosφ, y = Math.sin(λ) * cosφ, z = Math.sin(φ), k = z * cosδγ - y * sinδγ;
            return [
              Math.atan2(y * cosδγ + z * sinδγ, x * cosδφ + k * sinδφ),
              d3_asin(k * cosδφ - x * sinδφ)
            ];
          };
          return rotation;
        }
        d3.geo.circle = function () {
          var origin = [
              0,
              0
            ], angle, precision = 6, interpolate;
          function circle() {
            var center = typeof origin === 'function' ? origin.apply(this, arguments) : origin, rotate = d3_geo_rotation(-center[0] * d3_radians, -center[1] * d3_radians, 0).invert, ring = [];
            interpolate(null, null, 1, {
              point: function (x, y) {
                ring.push(x = rotate(x, y));
                x[0] *= d3_degrees, x[1] *= d3_degrees;
              }
            });
            return {
              type: 'Polygon',
              coordinates: [ring]
            };
          }
          circle.origin = function (x) {
            if (!arguments.length)
              return origin;
            origin = x;
            return circle;
          };
          circle.angle = function (x) {
            if (!arguments.length)
              return angle;
            interpolate = d3_geo_circleInterpolate((angle = +x) * d3_radians, precision * d3_radians);
            return circle;
          };
          circle.precision = function (_) {
            if (!arguments.length)
              return precision;
            interpolate = d3_geo_circleInterpolate(angle * d3_radians, (precision = +_) * d3_radians);
            return circle;
          };
          return circle.angle(90);
        };
        function d3_geo_circleInterpolate(radius, precision) {
          var cr = Math.cos(radius), sr = Math.sin(radius);
          return function (from, to, direction, listener) {
            var step = direction * precision;
            if (from != null) {
              from = d3_geo_circleAngle(cr, from);
              to = d3_geo_circleAngle(cr, to);
              if (direction > 0 ? from < to : from > to)
                from += direction * τ;
            } else {
              from = radius + direction * τ;
              to = radius - 0.5 * step;
            }
            for (var point, t = from; direction > 0 ? t > to : t < to; t -= step) {
              listener.point((point = d3_geo_spherical([
                cr,
                -sr * Math.cos(t),
                -sr * Math.sin(t)
              ]))[0], point[1]);
            }
          };
        }
        function d3_geo_circleAngle(cr, point) {
          var a = d3_geo_cartesian(point);
          a[0] -= cr;
          d3_geo_cartesianNormalize(a);
          var angle = d3_acos(-a[1]);
          return ((-a[2] < 0 ? -angle : angle) + 2 * Math.PI - ε) % (2 * Math.PI);
        }
        d3.geo.distance = function (a, b) {
          var Δλ = (b[0] - a[0]) * d3_radians, φ0 = a[1] * d3_radians, φ1 = b[1] * d3_radians, sinΔλ = Math.sin(Δλ), cosΔλ = Math.cos(Δλ), sinφ0 = Math.sin(φ0), cosφ0 = Math.cos(φ0), sinφ1 = Math.sin(φ1), cosφ1 = Math.cos(φ1), t;
          return Math.atan2(Math.sqrt((t = cosφ1 * sinΔλ) * t + (t = cosφ0 * sinφ1 - sinφ0 * cosφ1 * cosΔλ) * t), sinφ0 * sinφ1 + cosφ0 * cosφ1 * cosΔλ);
        };
        d3.geo.graticule = function () {
          var x1, x0, X1, X0, y1, y0, Y1, Y0, dx = 10, dy = dx, DX = 90, DY = 360, x, y, X, Y, precision = 2.5;
          function graticule() {
            return {
              type: 'MultiLineString',
              coordinates: lines()
            };
          }
          function lines() {
            return d3.range(Math.ceil(X0 / DX) * DX, X1, DX).map(X).concat(d3.range(Math.ceil(Y0 / DY) * DY, Y1, DY).map(Y)).concat(d3.range(Math.ceil(x0 / dx) * dx, x1, dx).filter(function (x) {
              return abs(x % DX) > ε;
            }).map(x)).concat(d3.range(Math.ceil(y0 / dy) * dy, y1, dy).filter(function (y) {
              return abs(y % DY) > ε;
            }).map(y));
          }
          graticule.lines = function () {
            return lines().map(function (coordinates) {
              return {
                type: 'LineString',
                coordinates: coordinates
              };
            });
          };
          graticule.outline = function () {
            return {
              type: 'Polygon',
              coordinates: [X(X0).concat(Y(Y1).slice(1), X(X1).reverse().slice(1), Y(Y0).reverse().slice(1))]
            };
          };
          graticule.extent = function (_) {
            if (!arguments.length)
              return graticule.minorExtent();
            return graticule.majorExtent(_).minorExtent(_);
          };
          graticule.majorExtent = function (_) {
            if (!arguments.length)
              return [
                [
                  X0,
                  Y0
                ],
                [
                  X1,
                  Y1
                ]
              ];
            X0 = +_[0][0], X1 = +_[1][0];
            Y0 = +_[0][1], Y1 = +_[1][1];
            if (X0 > X1)
              _ = X0, X0 = X1, X1 = _;
            if (Y0 > Y1)
              _ = Y0, Y0 = Y1, Y1 = _;
            return graticule.precision(precision);
          };
          graticule.minorExtent = function (_) {
            if (!arguments.length)
              return [
                [
                  x0,
                  y0
                ],
                [
                  x1,
                  y1
                ]
              ];
            x0 = +_[0][0], x1 = +_[1][0];
            y0 = +_[0][1], y1 = +_[1][1];
            if (x0 > x1)
              _ = x0, x0 = x1, x1 = _;
            if (y0 > y1)
              _ = y0, y0 = y1, y1 = _;
            return graticule.precision(precision);
          };
          graticule.step = function (_) {
            if (!arguments.length)
              return graticule.minorStep();
            return graticule.majorStep(_).minorStep(_);
          };
          graticule.majorStep = function (_) {
            if (!arguments.length)
              return [
                DX,
                DY
              ];
            DX = +_[0], DY = +_[1];
            return graticule;
          };
          graticule.minorStep = function (_) {
            if (!arguments.length)
              return [
                dx,
                dy
              ];
            dx = +_[0], dy = +_[1];
            return graticule;
          };
          graticule.precision = function (_) {
            if (!arguments.length)
              return precision;
            precision = +_;
            x = d3_geo_graticuleX(y0, y1, 90);
            y = d3_geo_graticuleY(x0, x1, precision);
            X = d3_geo_graticuleX(Y0, Y1, 90);
            Y = d3_geo_graticuleY(X0, X1, precision);
            return graticule;
          };
          return graticule.majorExtent([
            [
              -180,
              -90 + ε
            ],
            [
              180,
              90 - ε
            ]
          ]).minorExtent([
            [
              -180,
              -80 - ε
            ],
            [
              180,
              80 + ε
            ]
          ]);
        };
        function d3_geo_graticuleX(y0, y1, dy) {
          var y = d3.range(y0, y1 - ε, dy).concat(y1);
          return function (x) {
            return y.map(function (y) {
              return [
                x,
                y
              ];
            });
          };
        }
        function d3_geo_graticuleY(x0, x1, dx) {
          var x = d3.range(x0, x1 - ε, dx).concat(x1);
          return function (y) {
            return x.map(function (x) {
              return [
                x,
                y
              ];
            });
          };
        }
        function d3_source(d) {
          return d.source;
        }
        function d3_target(d) {
          return d.target;
        }
        d3.geo.greatArc = function () {
          var source = d3_source, source_, target = d3_target, target_;
          function greatArc() {
            return {
              type: 'LineString',
              coordinates: [
                source_ || source.apply(this, arguments),
                target_ || target.apply(this, arguments)
              ]
            };
          }
          greatArc.distance = function () {
            return d3.geo.distance(source_ || source.apply(this, arguments), target_ || target.apply(this, arguments));
          };
          greatArc.source = function (_) {
            if (!arguments.length)
              return source;
            source = _, source_ = typeof _ === 'function' ? null : _;
            return greatArc;
          };
          greatArc.target = function (_) {
            if (!arguments.length)
              return target;
            target = _, target_ = typeof _ === 'function' ? null : _;
            return greatArc;
          };
          greatArc.precision = function () {
            return arguments.length ? greatArc : 0;
          };
          return greatArc;
        };
        d3.geo.interpolate = function (source, target) {
          return d3_geo_interpolate(source[0] * d3_radians, source[1] * d3_radians, target[0] * d3_radians, target[1] * d3_radians);
        };
        function d3_geo_interpolate(x0, y0, x1, y1) {
          var cy0 = Math.cos(y0), sy0 = Math.sin(y0), cy1 = Math.cos(y1), sy1 = Math.sin(y1), kx0 = cy0 * Math.cos(x0), ky0 = cy0 * Math.sin(x0), kx1 = cy1 * Math.cos(x1), ky1 = cy1 * Math.sin(x1), d = 2 * Math.asin(Math.sqrt(d3_haversin(y1 - y0) + cy0 * cy1 * d3_haversin(x1 - x0))), k = 1 / Math.sin(d);
          var interpolate = d ? function (t) {
              var B = Math.sin(t *= d) * k, A = Math.sin(d - t) * k, x = A * kx0 + B * kx1, y = A * ky0 + B * ky1, z = A * sy0 + B * sy1;
              return [
                Math.atan2(y, x) * d3_degrees,
                Math.atan2(z, Math.sqrt(x * x + y * y)) * d3_degrees
              ];
            } : function () {
              return [
                x0 * d3_degrees,
                y0 * d3_degrees
              ];
            };
          interpolate.distance = d;
          return interpolate;
        }
        d3.geo.length = function (object) {
          d3_geo_lengthSum = 0;
          d3.geo.stream(object, d3_geo_length);
          return d3_geo_lengthSum;
        };
        var d3_geo_lengthSum;
        var d3_geo_length = {
            sphere: d3_noop,
            point: d3_noop,
            lineStart: d3_geo_lengthLineStart,
            lineEnd: d3_noop,
            polygonStart: d3_noop,
            polygonEnd: d3_noop
          };
        function d3_geo_lengthLineStart() {
          var λ0, sinφ0, cosφ0;
          d3_geo_length.point = function (λ, φ) {
            λ0 = λ * d3_radians, sinφ0 = Math.sin(φ *= d3_radians), cosφ0 = Math.cos(φ);
            d3_geo_length.point = nextPoint;
          };
          d3_geo_length.lineEnd = function () {
            d3_geo_length.point = d3_geo_length.lineEnd = d3_noop;
          };
          function nextPoint(λ, φ) {
            var sinφ = Math.sin(φ *= d3_radians), cosφ = Math.cos(φ), t = abs((λ *= d3_radians) - λ0), cosΔλ = Math.cos(t);
            d3_geo_lengthSum += Math.atan2(Math.sqrt((t = cosφ * Math.sin(t)) * t + (t = cosφ0 * sinφ - sinφ0 * cosφ * cosΔλ) * t), sinφ0 * sinφ + cosφ0 * cosφ * cosΔλ);
            λ0 = λ, sinφ0 = sinφ, cosφ0 = cosφ;
          }
        }
        function d3_geo_azimuthal(scale, angle) {
          function azimuthal(λ, φ) {
            var cosλ = Math.cos(λ), cosφ = Math.cos(φ), k = scale(cosλ * cosφ);
            return [
              k * cosφ * Math.sin(λ),
              k * Math.sin(φ)
            ];
          }
          azimuthal.invert = function (x, y) {
            var ρ = Math.sqrt(x * x + y * y), c = angle(ρ), sinc = Math.sin(c), cosc = Math.cos(c);
            return [
              Math.atan2(x * sinc, ρ * cosc),
              Math.asin(ρ && y * sinc / ρ)
            ];
          };
          return azimuthal;
        }
        var d3_geo_azimuthalEqualArea = d3_geo_azimuthal(function (cosλcosφ) {
            return Math.sqrt(2 / (1 + cosλcosφ));
          }, function (ρ) {
            return 2 * Math.asin(ρ / 2);
          });
        (d3.geo.azimuthalEqualArea = function () {
          return d3_geo_projection(d3_geo_azimuthalEqualArea);
        }).raw = d3_geo_azimuthalEqualArea;
        var d3_geo_azimuthalEquidistant = d3_geo_azimuthal(function (cosλcosφ) {
            var c = Math.acos(cosλcosφ);
            return c && c / Math.sin(c);
          }, d3_identity);
        (d3.geo.azimuthalEquidistant = function () {
          return d3_geo_projection(d3_geo_azimuthalEquidistant);
        }).raw = d3_geo_azimuthalEquidistant;
        function d3_geo_conicConformal(φ0, φ1) {
          var cosφ0 = Math.cos(φ0), t = function (φ) {
              return Math.tan(π / 4 + φ / 2);
            }, n = φ0 === φ1 ? Math.sin(φ0) : Math.log(cosφ0 / Math.cos(φ1)) / Math.log(t(φ1) / t(φ0)), F = cosφ0 * Math.pow(t(φ0), n) / n;
          if (!n)
            return d3_geo_mercator;
          function forward(λ, φ) {
            var ρ = abs(abs(φ) - halfπ) < ε ? 0 : F / Math.pow(t(φ), n);
            return [
              ρ * Math.sin(n * λ),
              F - ρ * Math.cos(n * λ)
            ];
          }
          forward.invert = function (x, y) {
            var ρ0_y = F - y, ρ = d3_sgn(n) * Math.sqrt(x * x + ρ0_y * ρ0_y);
            return [
              Math.atan2(x, ρ0_y) / n,
              2 * Math.atan(Math.pow(F / ρ, 1 / n)) - halfπ
            ];
          };
          return forward;
        }
        (d3.geo.conicConformal = function () {
          return d3_geo_conic(d3_geo_conicConformal);
        }).raw = d3_geo_conicConformal;
        function d3_geo_conicEquidistant(φ0, φ1) {
          var cosφ0 = Math.cos(φ0), n = φ0 === φ1 ? Math.sin(φ0) : (cosφ0 - Math.cos(φ1)) / (φ1 - φ0), G = cosφ0 / n + φ0;
          if (abs(n) < ε)
            return d3_geo_equirectangular;
          function forward(λ, φ) {
            var ρ = G - φ;
            return [
              ρ * Math.sin(n * λ),
              G - ρ * Math.cos(n * λ)
            ];
          }
          forward.invert = function (x, y) {
            var ρ0_y = G - y;
            return [
              Math.atan2(x, ρ0_y) / n,
              G - d3_sgn(n) * Math.sqrt(x * x + ρ0_y * ρ0_y)
            ];
          };
          return forward;
        }
        (d3.geo.conicEquidistant = function () {
          return d3_geo_conic(d3_geo_conicEquidistant);
        }).raw = d3_geo_conicEquidistant;
        var d3_geo_gnomonic = d3_geo_azimuthal(function (cosλcosφ) {
            return 1 / cosλcosφ;
          }, Math.atan);
        (d3.geo.gnomonic = function () {
          return d3_geo_projection(d3_geo_gnomonic);
        }).raw = d3_geo_gnomonic;
        function d3_geo_mercator(λ, φ) {
          return [
            λ,
            Math.log(Math.tan(π / 4 + φ / 2))
          ];
        }
        d3_geo_mercator.invert = function (x, y) {
          return [
            x,
            2 * Math.atan(Math.exp(y)) - halfπ
          ];
        };
        function d3_geo_mercatorProjection(project) {
          var m = d3_geo_projection(project), scale = m.scale, translate = m.translate, clipExtent = m.clipExtent, clipAuto;
          m.scale = function () {
            var v = scale.apply(m, arguments);
            return v === m ? clipAuto ? m.clipExtent(null) : m : v;
          };
          m.translate = function () {
            var v = translate.apply(m, arguments);
            return v === m ? clipAuto ? m.clipExtent(null) : m : v;
          };
          m.clipExtent = function (_) {
            var v = clipExtent.apply(m, arguments);
            if (v === m) {
              if (clipAuto = _ == null) {
                var k = π * scale(), t = translate();
                clipExtent([
                  [
                    t[0] - k,
                    t[1] - k
                  ],
                  [
                    t[0] + k,
                    t[1] + k
                  ]
                ]);
              }
            } else if (clipAuto) {
              v = null;
            }
            return v;
          };
          return m.clipExtent(null);
        }
        (d3.geo.mercator = function () {
          return d3_geo_mercatorProjection(d3_geo_mercator);
        }).raw = d3_geo_mercator;
        var d3_geo_orthographic = d3_geo_azimuthal(function () {
            return 1;
          }, Math.asin);
        (d3.geo.orthographic = function () {
          return d3_geo_projection(d3_geo_orthographic);
        }).raw = d3_geo_orthographic;
        var d3_geo_stereographic = d3_geo_azimuthal(function (cosλcosφ) {
            return 1 / (1 + cosλcosφ);
          }, function (ρ) {
            return 2 * Math.atan(ρ);
          });
        (d3.geo.stereographic = function () {
          return d3_geo_projection(d3_geo_stereographic);
        }).raw = d3_geo_stereographic;
        function d3_geo_transverseMercator(λ, φ) {
          var B = Math.cos(φ) * Math.sin(λ);
          return [
            Math.log((1 + B) / (1 - B)) / 2,
            Math.atan2(Math.tan(φ), Math.cos(λ))
          ];
        }
        d3_geo_transverseMercator.invert = function (x, y) {
          return [
            Math.atan2(d3_sinh(x), Math.cos(y)),
            d3_asin(Math.sin(y) / d3_cosh(x))
          ];
        };
        (d3.geo.transverseMercator = function () {
          return d3_geo_mercatorProjection(d3_geo_transverseMercator);
        }).raw = d3_geo_transverseMercator;
        d3.geom = {};
        function d3_geom_pointX(d) {
          return d[0];
        }
        function d3_geom_pointY(d) {
          return d[1];
        }
        d3.geom.hull = function (vertices) {
          var x = d3_geom_pointX, y = d3_geom_pointY;
          if (arguments.length)
            return hull(vertices);
          function hull(data) {
            if (data.length < 3)
              return [];
            var fx = d3_functor(x), fy = d3_functor(y), n = data.length, vertices, plen = n - 1, points = [], stack = [], d, i, j, h = 0, x1, y1, x2, y2, u, v, a, sp;
            if (fx === d3_geom_pointX && y === d3_geom_pointY)
              vertices = data;
            else
              for (i = 0, vertices = []; i < n; ++i) {
                vertices.push([
                  +fx.call(this, d = data[i], i),
                  +fy.call(this, d, i)
                ]);
              }
            for (i = 1; i < n; ++i) {
              if (vertices[i][1] < vertices[h][1] || vertices[i][1] == vertices[h][1] && vertices[i][0] < vertices[h][0])
                h = i;
            }
            for (i = 0; i < n; ++i) {
              if (i === h)
                continue;
              y1 = vertices[i][1] - vertices[h][1];
              x1 = vertices[i][0] - vertices[h][0];
              points.push({
                angle: Math.atan2(y1, x1),
                index: i
              });
            }
            points.sort(function (a, b) {
              return a.angle - b.angle;
            });
            a = points[0].angle;
            v = points[0].index;
            u = 0;
            for (i = 1; i < plen; ++i) {
              j = points[i].index;
              if (a == points[i].angle) {
                x1 = vertices[v][0] - vertices[h][0];
                y1 = vertices[v][1] - vertices[h][1];
                x2 = vertices[j][0] - vertices[h][0];
                y2 = vertices[j][1] - vertices[h][1];
                if (x1 * x1 + y1 * y1 >= x2 * x2 + y2 * y2) {
                  points[i].index = -1;
                  continue;
                } else {
                  points[u].index = -1;
                }
              }
              a = points[i].angle;
              u = i;
              v = j;
            }
            stack.push(h);
            for (i = 0, j = 0; i < 2; ++j) {
              if (points[j].index > -1) {
                stack.push(points[j].index);
                i++;
              }
            }
            sp = stack.length;
            for (; j < plen; ++j) {
              if (points[j].index < 0)
                continue;
              while (!d3_geom_hullCCW(stack[sp - 2], stack[sp - 1], points[j].index, vertices)) {
                --sp;
              }
              stack[sp++] = points[j].index;
            }
            var poly = [];
            for (i = sp - 1; i >= 0; --i)
              poly.push(data[stack[i]]);
            return poly;
          }
          hull.x = function (_) {
            return arguments.length ? (x = _, hull) : x;
          };
          hull.y = function (_) {
            return arguments.length ? (y = _, hull) : y;
          };
          return hull;
        };
        function d3_geom_hullCCW(i1, i2, i3, v) {
          var t, a, b, c, d, e, f;
          t = v[i1];
          a = t[0];
          b = t[1];
          t = v[i2];
          c = t[0];
          d = t[1];
          t = v[i3];
          e = t[0];
          f = t[1];
          return (f - b) * (c - a) - (d - b) * (e - a) > 0;
        }
        d3.geom.polygon = function (coordinates) {
          d3_subclass(coordinates, d3_geom_polygonPrototype);
          return coordinates;
        };
        var d3_geom_polygonPrototype = d3.geom.polygon.prototype = [];
        d3_geom_polygonPrototype.area = function () {
          var i = -1, n = this.length, a, b = this[n - 1], area = 0;
          while (++i < n) {
            a = b;
            b = this[i];
            area += a[1] * b[0] - a[0] * b[1];
          }
          return area * 0.5;
        };
        d3_geom_polygonPrototype.centroid = function (k) {
          var i = -1, n = this.length, x = 0, y = 0, a, b = this[n - 1], c;
          if (!arguments.length)
            k = -1 / (6 * this.area());
          while (++i < n) {
            a = b;
            b = this[i];
            c = a[0] * b[1] - b[0] * a[1];
            x += (a[0] + b[0]) * c;
            y += (a[1] + b[1]) * c;
          }
          return [
            x * k,
            y * k
          ];
        };
        d3_geom_polygonPrototype.clip = function (subject) {
          var input, closed = d3_geom_polygonClosed(subject), i = -1, n = this.length - d3_geom_polygonClosed(this), j, m, a = this[n - 1], b, c, d;
          while (++i < n) {
            input = subject.slice();
            subject.length = 0;
            b = this[i];
            c = input[(m = input.length - closed) - 1];
            j = -1;
            while (++j < m) {
              d = input[j];
              if (d3_geom_polygonInside(d, a, b)) {
                if (!d3_geom_polygonInside(c, a, b)) {
                  subject.push(d3_geom_polygonIntersect(c, d, a, b));
                }
                subject.push(d);
              } else if (d3_geom_polygonInside(c, a, b)) {
                subject.push(d3_geom_polygonIntersect(c, d, a, b));
              }
              c = d;
            }
            if (closed)
              subject.push(subject[0]);
            a = b;
          }
          return subject;
        };
        function d3_geom_polygonInside(p, a, b) {
          return (b[0] - a[0]) * (p[1] - a[1]) < (b[1] - a[1]) * (p[0] - a[0]);
        }
        function d3_geom_polygonIntersect(c, d, a, b) {
          var x1 = c[0], x3 = a[0], x21 = d[0] - x1, x43 = b[0] - x3, y1 = c[1], y3 = a[1], y21 = d[1] - y1, y43 = b[1] - y3, ua = (x43 * (y1 - y3) - y43 * (x1 - x3)) / (y43 * x21 - x43 * y21);
          return [
            x1 + ua * x21,
            y1 + ua * y21
          ];
        }
        function d3_geom_polygonClosed(coordinates) {
          var a = coordinates[0], b = coordinates[coordinates.length - 1];
          return !(a[0] - b[0] || a[1] - b[1]);
        }
        var d3_geom_voronoiEdges, d3_geom_voronoiCells, d3_geom_voronoiBeaches, d3_geom_voronoiBeachPool = [], d3_geom_voronoiFirstCircle, d3_geom_voronoiCircles, d3_geom_voronoiCirclePool = [];
        function d3_geom_voronoiBeach() {
          d3_geom_voronoiRedBlackNode(this);
          this.edge = this.site = this.circle = null;
        }
        function d3_geom_voronoiCreateBeach(site) {
          var beach = d3_geom_voronoiBeachPool.pop() || new d3_geom_voronoiBeach();
          beach.site = site;
          return beach;
        }
        function d3_geom_voronoiDetachBeach(beach) {
          d3_geom_voronoiDetachCircle(beach);
          d3_geom_voronoiBeaches.remove(beach);
          d3_geom_voronoiBeachPool.push(beach);
          d3_geom_voronoiRedBlackNode(beach);
        }
        function d3_geom_voronoiRemoveBeach(beach) {
          var circle = beach.circle, x = circle.x, y = circle.cy, vertex = {
              x: x,
              y: y
            }, previous = beach.P, next = beach.N, disappearing = [beach];
          d3_geom_voronoiDetachBeach(beach);
          var lArc = previous;
          while (lArc.circle && abs(x - lArc.circle.x) < ε && abs(y - lArc.circle.cy) < ε) {
            previous = lArc.P;
            disappearing.unshift(lArc);
            d3_geom_voronoiDetachBeach(lArc);
            lArc = previous;
          }
          disappearing.unshift(lArc);
          d3_geom_voronoiDetachCircle(lArc);
          var rArc = next;
          while (rArc.circle && abs(x - rArc.circle.x) < ε && abs(y - rArc.circle.cy) < ε) {
            next = rArc.N;
            disappearing.push(rArc);
            d3_geom_voronoiDetachBeach(rArc);
            rArc = next;
          }
          disappearing.push(rArc);
          d3_geom_voronoiDetachCircle(rArc);
          var nArcs = disappearing.length, iArc;
          for (iArc = 1; iArc < nArcs; ++iArc) {
            rArc = disappearing[iArc];
            lArc = disappearing[iArc - 1];
            d3_geom_voronoiSetEdgeEnd(rArc.edge, lArc.site, rArc.site, vertex);
          }
          lArc = disappearing[0];
          rArc = disappearing[nArcs - 1];
          rArc.edge = d3_geom_voronoiCreateEdge(lArc.site, rArc.site, null, vertex);
          d3_geom_voronoiAttachCircle(lArc);
          d3_geom_voronoiAttachCircle(rArc);
        }
        function d3_geom_voronoiAddBeach(site) {
          var x = site.x, directrix = site.y, lArc, rArc, dxl, dxr, node = d3_geom_voronoiBeaches._;
          while (node) {
            dxl = d3_geom_voronoiLeftBreakPoint(node, directrix) - x;
            if (dxl > ε)
              node = node.L;
            else {
              dxr = x - d3_geom_voronoiRightBreakPoint(node, directrix);
              if (dxr > ε) {
                if (!node.R) {
                  lArc = node;
                  break;
                }
                node = node.R;
              } else {
                if (dxl > -ε) {
                  lArc = node.P;
                  rArc = node;
                } else if (dxr > -ε) {
                  lArc = node;
                  rArc = node.N;
                } else {
                  lArc = rArc = node;
                }
                break;
              }
            }
          }
          var newArc = d3_geom_voronoiCreateBeach(site);
          d3_geom_voronoiBeaches.insert(lArc, newArc);
          if (!lArc && !rArc)
            return;
          if (lArc === rArc) {
            d3_geom_voronoiDetachCircle(lArc);
            rArc = d3_geom_voronoiCreateBeach(lArc.site);
            d3_geom_voronoiBeaches.insert(newArc, rArc);
            newArc.edge = rArc.edge = d3_geom_voronoiCreateEdge(lArc.site, newArc.site);
            d3_geom_voronoiAttachCircle(lArc);
            d3_geom_voronoiAttachCircle(rArc);
            return;
          }
          if (!rArc) {
            newArc.edge = d3_geom_voronoiCreateEdge(lArc.site, newArc.site);
            return;
          }
          d3_geom_voronoiDetachCircle(lArc);
          d3_geom_voronoiDetachCircle(rArc);
          var lSite = lArc.site, ax = lSite.x, ay = lSite.y, bx = site.x - ax, by = site.y - ay, rSite = rArc.site, cx = rSite.x - ax, cy = rSite.y - ay, d = 2 * (bx * cy - by * cx), hb = bx * bx + by * by, hc = cx * cx + cy * cy, vertex = {
              x: (cy * hb - by * hc) / d + ax,
              y: (bx * hc - cx * hb) / d + ay
            };
          d3_geom_voronoiSetEdgeEnd(rArc.edge, lSite, rSite, vertex);
          newArc.edge = d3_geom_voronoiCreateEdge(lSite, site, null, vertex);
          rArc.edge = d3_geom_voronoiCreateEdge(site, rSite, null, vertex);
          d3_geom_voronoiAttachCircle(lArc);
          d3_geom_voronoiAttachCircle(rArc);
        }
        function d3_geom_voronoiLeftBreakPoint(arc, directrix) {
          var site = arc.site, rfocx = site.x, rfocy = site.y, pby2 = rfocy - directrix;
          if (!pby2)
            return rfocx;
          var lArc = arc.P;
          if (!lArc)
            return -Infinity;
          site = lArc.site;
          var lfocx = site.x, lfocy = site.y, plby2 = lfocy - directrix;
          if (!plby2)
            return lfocx;
          var hl = lfocx - rfocx, aby2 = 1 / pby2 - 1 / plby2, b = hl / plby2;
          if (aby2)
            return (-b + Math.sqrt(b * b - 2 * aby2 * (hl * hl / (-2 * plby2) - lfocy + plby2 / 2 + rfocy - pby2 / 2))) / aby2 + rfocx;
          return (rfocx + lfocx) / 2;
        }
        function d3_geom_voronoiRightBreakPoint(arc, directrix) {
          var rArc = arc.N;
          if (rArc)
            return d3_geom_voronoiLeftBreakPoint(rArc, directrix);
          var site = arc.site;
          return site.y === directrix ? site.x : Infinity;
        }
        function d3_geom_voronoiCell(site) {
          this.site = site;
          this.edges = [];
        }
        d3_geom_voronoiCell.prototype.prepare = function () {
          var halfEdges = this.edges, iHalfEdge = halfEdges.length, edge;
          while (iHalfEdge--) {
            edge = halfEdges[iHalfEdge].edge;
            if (!edge.b || !edge.a)
              halfEdges.splice(iHalfEdge, 1);
          }
          halfEdges.sort(d3_geom_voronoiHalfEdgeOrder);
          return halfEdges.length;
        };
        function d3_geom_voronoiCloseCells(extent) {
          var x0 = extent[0][0], x1 = extent[1][0], y0 = extent[0][1], y1 = extent[1][1], x2, y2, x3, y3, cells = d3_geom_voronoiCells, iCell = cells.length, cell, iHalfEdge, halfEdges, nHalfEdges, start, end;
          while (iCell--) {
            cell = cells[iCell];
            if (!cell || !cell.prepare())
              continue;
            halfEdges = cell.edges;
            nHalfEdges = halfEdges.length;
            iHalfEdge = 0;
            while (iHalfEdge < nHalfEdges) {
              end = halfEdges[iHalfEdge].end(), x3 = end.x, y3 = end.y;
              start = halfEdges[++iHalfEdge % nHalfEdges].start(), x2 = start.x, y2 = start.y;
              if (abs(x3 - x2) > ε || abs(y3 - y2) > ε) {
                halfEdges.splice(iHalfEdge, 0, new d3_geom_voronoiHalfEdge(d3_geom_voronoiCreateBorderEdge(cell.site, end, abs(x3 - x0) < ε && y1 - y3 > ε ? {
                  x: x0,
                  y: abs(x2 - x0) < ε ? y2 : y1
                } : abs(y3 - y1) < ε && x1 - x3 > ε ? {
                  x: abs(y2 - y1) < ε ? x2 : x1,
                  y: y1
                } : abs(x3 - x1) < ε && y3 - y0 > ε ? {
                  x: x1,
                  y: abs(x2 - x1) < ε ? y2 : y0
                } : abs(y3 - y0) < ε && x3 - x0 > ε ? {
                  x: abs(y2 - y0) < ε ? x2 : x0,
                  y: y0
                } : null), cell.site, null));
                ++nHalfEdges;
              }
            }
          }
        }
        function d3_geom_voronoiHalfEdgeOrder(a, b) {
          return b.angle - a.angle;
        }
        function d3_geom_voronoiCircle() {
          d3_geom_voronoiRedBlackNode(this);
          this.x = this.y = this.arc = this.site = this.cy = null;
        }
        function d3_geom_voronoiAttachCircle(arc) {
          var lArc = arc.P, rArc = arc.N;
          if (!lArc || !rArc)
            return;
          var lSite = lArc.site, cSite = arc.site, rSite = rArc.site;
          if (lSite === rSite)
            return;
          var bx = cSite.x, by = cSite.y, ax = lSite.x - bx, ay = lSite.y - by, cx = rSite.x - bx, cy = rSite.y - by;
          var d = 2 * (ax * cy - ay * cx);
          if (d >= -ε2)
            return;
          var ha = ax * ax + ay * ay, hc = cx * cx + cy * cy, x = (cy * ha - ay * hc) / d, y = (ax * hc - cx * ha) / d, cy = y + by;
          var circle = d3_geom_voronoiCirclePool.pop() || new d3_geom_voronoiCircle();
          circle.arc = arc;
          circle.site = cSite;
          circle.x = x + bx;
          circle.y = cy + Math.sqrt(x * x + y * y);
          circle.cy = cy;
          arc.circle = circle;
          var before = null, node = d3_geom_voronoiCircles._;
          while (node) {
            if (circle.y < node.y || circle.y === node.y && circle.x <= node.x) {
              if (node.L)
                node = node.L;
              else {
                before = node.P;
                break;
              }
            } else {
              if (node.R)
                node = node.R;
              else {
                before = node;
                break;
              }
            }
          }
          d3_geom_voronoiCircles.insert(before, circle);
          if (!before)
            d3_geom_voronoiFirstCircle = circle;
        }
        function d3_geom_voronoiDetachCircle(arc) {
          var circle = arc.circle;
          if (circle) {
            if (!circle.P)
              d3_geom_voronoiFirstCircle = circle.N;
            d3_geom_voronoiCircles.remove(circle);
            d3_geom_voronoiCirclePool.push(circle);
            d3_geom_voronoiRedBlackNode(circle);
            arc.circle = null;
          }
        }
        function d3_geom_voronoiClipEdges(extent) {
          var edges = d3_geom_voronoiEdges, clip = d3_geom_clipLine(extent[0][0], extent[0][1], extent[1][0], extent[1][1]), i = edges.length, e;
          while (i--) {
            e = edges[i];
            if (!d3_geom_voronoiConnectEdge(e, extent) || !clip(e) || abs(e.a.x - e.b.x) < ε && abs(e.a.y - e.b.y) < ε) {
              e.a = e.b = null;
              edges.splice(i, 1);
            }
          }
        }
        function d3_geom_voronoiConnectEdge(edge, extent) {
          var vb = edge.b;
          if (vb)
            return true;
          var va = edge.a, x0 = extent[0][0], x1 = extent[1][0], y0 = extent[0][1], y1 = extent[1][1], lSite = edge.l, rSite = edge.r, lx = lSite.x, ly = lSite.y, rx = rSite.x, ry = rSite.y, fx = (lx + rx) / 2, fy = (ly + ry) / 2, fm, fb;
          if (ry === ly) {
            if (fx < x0 || fx >= x1)
              return;
            if (lx > rx) {
              if (!va)
                va = {
                  x: fx,
                  y: y0
                };
              else if (va.y >= y1)
                return;
              vb = {
                x: fx,
                y: y1
              };
            } else {
              if (!va)
                va = {
                  x: fx,
                  y: y1
                };
              else if (va.y < y0)
                return;
              vb = {
                x: fx,
                y: y0
              };
            }
          } else {
            fm = (lx - rx) / (ry - ly);
            fb = fy - fm * fx;
            if (fm < -1 || fm > 1) {
              if (lx > rx) {
                if (!va)
                  va = {
                    x: (y0 - fb) / fm,
                    y: y0
                  };
                else if (va.y >= y1)
                  return;
                vb = {
                  x: (y1 - fb) / fm,
                  y: y1
                };
              } else {
                if (!va)
                  va = {
                    x: (y1 - fb) / fm,
                    y: y1
                  };
                else if (va.y < y0)
                  return;
                vb = {
                  x: (y0 - fb) / fm,
                  y: y0
                };
              }
            } else {
              if (ly < ry) {
                if (!va)
                  va = {
                    x: x0,
                    y: fm * x0 + fb
                  };
                else if (va.x >= x1)
                  return;
                vb = {
                  x: x1,
                  y: fm * x1 + fb
                };
              } else {
                if (!va)
                  va = {
                    x: x1,
                    y: fm * x1 + fb
                  };
                else if (va.x < x0)
                  return;
                vb = {
                  x: x0,
                  y: fm * x0 + fb
                };
              }
            }
          }
          edge.a = va;
          edge.b = vb;
          return true;
        }
        function d3_geom_voronoiEdge(lSite, rSite) {
          this.l = lSite;
          this.r = rSite;
          this.a = this.b = null;
        }
        function d3_geom_voronoiCreateEdge(lSite, rSite, va, vb) {
          var edge = new d3_geom_voronoiEdge(lSite, rSite);
          d3_geom_voronoiEdges.push(edge);
          if (va)
            d3_geom_voronoiSetEdgeEnd(edge, lSite, rSite, va);
          if (vb)
            d3_geom_voronoiSetEdgeEnd(edge, rSite, lSite, vb);
          d3_geom_voronoiCells[lSite.i].edges.push(new d3_geom_voronoiHalfEdge(edge, lSite, rSite));
          d3_geom_voronoiCells[rSite.i].edges.push(new d3_geom_voronoiHalfEdge(edge, rSite, lSite));
          return edge;
        }
        function d3_geom_voronoiCreateBorderEdge(lSite, va, vb) {
          var edge = new d3_geom_voronoiEdge(lSite, null);
          edge.a = va;
          edge.b = vb;
          d3_geom_voronoiEdges.push(edge);
          return edge;
        }
        function d3_geom_voronoiSetEdgeEnd(edge, lSite, rSite, vertex) {
          if (!edge.a && !edge.b) {
            edge.a = vertex;
            edge.l = lSite;
            edge.r = rSite;
          } else if (edge.l === rSite) {
            edge.b = vertex;
          } else {
            edge.a = vertex;
          }
        }
        function d3_geom_voronoiHalfEdge(edge, lSite, rSite) {
          var va = edge.a, vb = edge.b;
          this.edge = edge;
          this.site = lSite;
          this.angle = rSite ? Math.atan2(rSite.y - lSite.y, rSite.x - lSite.x) : edge.l === lSite ? Math.atan2(vb.x - va.x, va.y - vb.y) : Math.atan2(va.x - vb.x, vb.y - va.y);
        }
        d3_geom_voronoiHalfEdge.prototype = {
          start: function () {
            return this.edge.l === this.site ? this.edge.a : this.edge.b;
          },
          end: function () {
            return this.edge.l === this.site ? this.edge.b : this.edge.a;
          }
        };
        function d3_geom_voronoiRedBlackTree() {
          this._ = null;
        }
        function d3_geom_voronoiRedBlackNode(node) {
          node.U = node.C = node.L = node.R = node.P = node.N = null;
        }
        d3_geom_voronoiRedBlackTree.prototype = {
          insert: function (after, node) {
            var parent, grandpa, uncle;
            if (after) {
              node.P = after;
              node.N = after.N;
              if (after.N)
                after.N.P = node;
              after.N = node;
              if (after.R) {
                after = after.R;
                while (after.L)
                  after = after.L;
                after.L = node;
              } else {
                after.R = node;
              }
              parent = after;
            } else if (this._) {
              after = d3_geom_voronoiRedBlackFirst(this._);
              node.P = null;
              node.N = after;
              after.P = after.L = node;
              parent = after;
            } else {
              node.P = node.N = null;
              this._ = node;
              parent = null;
            }
            node.L = node.R = null;
            node.U = parent;
            node.C = true;
            after = node;
            while (parent && parent.C) {
              grandpa = parent.U;
              if (parent === grandpa.L) {
                uncle = grandpa.R;
                if (uncle && uncle.C) {
                  parent.C = uncle.C = false;
                  grandpa.C = true;
                  after = grandpa;
                } else {
                  if (after === parent.R) {
                    d3_geom_voronoiRedBlackRotateLeft(this, parent);
                    after = parent;
                    parent = after.U;
                  }
                  parent.C = false;
                  grandpa.C = true;
                  d3_geom_voronoiRedBlackRotateRight(this, grandpa);
                }
              } else {
                uncle = grandpa.L;
                if (uncle && uncle.C) {
                  parent.C = uncle.C = false;
                  grandpa.C = true;
                  after = grandpa;
                } else {
                  if (after === parent.L) {
                    d3_geom_voronoiRedBlackRotateRight(this, parent);
                    after = parent;
                    parent = after.U;
                  }
                  parent.C = false;
                  grandpa.C = true;
                  d3_geom_voronoiRedBlackRotateLeft(this, grandpa);
                }
              }
              parent = after.U;
            }
            this._.C = false;
          },
          remove: function (node) {
            if (node.N)
              node.N.P = node.P;
            if (node.P)
              node.P.N = node.N;
            node.N = node.P = null;
            var parent = node.U, sibling, left = node.L, right = node.R, next, red;
            if (!left)
              next = right;
            else if (!right)
              next = left;
            else
              next = d3_geom_voronoiRedBlackFirst(right);
            if (parent) {
              if (parent.L === node)
                parent.L = next;
              else
                parent.R = next;
            } else {
              this._ = next;
            }
            if (left && right) {
              red = next.C;
              next.C = node.C;
              next.L = left;
              left.U = next;
              if (next !== right) {
                parent = next.U;
                next.U = node.U;
                node = next.R;
                parent.L = node;
                next.R = right;
                right.U = next;
              } else {
                next.U = parent;
                parent = next;
                node = next.R;
              }
            } else {
              red = node.C;
              node = next;
            }
            if (node)
              node.U = parent;
            if (red)
              return;
            if (node && node.C) {
              node.C = false;
              return;
            }
            do {
              if (node === this._)
                break;
              if (node === parent.L) {
                sibling = parent.R;
                if (sibling.C) {
                  sibling.C = false;
                  parent.C = true;
                  d3_geom_voronoiRedBlackRotateLeft(this, parent);
                  sibling = parent.R;
                }
                if (sibling.L && sibling.L.C || sibling.R && sibling.R.C) {
                  if (!sibling.R || !sibling.R.C) {
                    sibling.L.C = false;
                    sibling.C = true;
                    d3_geom_voronoiRedBlackRotateRight(this, sibling);
                    sibling = parent.R;
                  }
                  sibling.C = parent.C;
                  parent.C = sibling.R.C = false;
                  d3_geom_voronoiRedBlackRotateLeft(this, parent);
                  node = this._;
                  break;
                }
              } else {
                sibling = parent.L;
                if (sibling.C) {
                  sibling.C = false;
                  parent.C = true;
                  d3_geom_voronoiRedBlackRotateRight(this, parent);
                  sibling = parent.L;
                }
                if (sibling.L && sibling.L.C || sibling.R && sibling.R.C) {
                  if (!sibling.L || !sibling.L.C) {
                    sibling.R.C = false;
                    sibling.C = true;
                    d3_geom_voronoiRedBlackRotateLeft(this, sibling);
                    sibling = parent.L;
                  }
                  sibling.C = parent.C;
                  parent.C = sibling.L.C = false;
                  d3_geom_voronoiRedBlackRotateRight(this, parent);
                  node = this._;
                  break;
                }
              }
              sibling.C = true;
              node = parent;
              parent = parent.U;
            } while (!node.C);
            if (node)
              node.C = false;
          }
        };
        function d3_geom_voronoiRedBlackRotateLeft(tree, node) {
          var p = node, q = node.R, parent = p.U;
          if (parent) {
            if (parent.L === p)
              parent.L = q;
            else
              parent.R = q;
          } else {
            tree._ = q;
          }
          q.U = parent;
          p.U = q;
          p.R = q.L;
          if (p.R)
            p.R.U = p;
          q.L = p;
        }
        function d3_geom_voronoiRedBlackRotateRight(tree, node) {
          var p = node, q = node.L, parent = p.U;
          if (parent) {
            if (parent.L === p)
              parent.L = q;
            else
              parent.R = q;
          } else {
            tree._ = q;
          }
          q.U = parent;
          p.U = q;
          p.L = q.R;
          if (p.L)
            p.L.U = p;
          q.R = p;
        }
        function d3_geom_voronoiRedBlackFirst(node) {
          while (node.L)
            node = node.L;
          return node;
        }
        function d3_geom_voronoi(sites, bbox) {
          var site = sites.sort(d3_geom_voronoiVertexOrder).pop(), x0, y0, circle;
          d3_geom_voronoiEdges = [];
          d3_geom_voronoiCells = new Array(sites.length);
          d3_geom_voronoiBeaches = new d3_geom_voronoiRedBlackTree();
          d3_geom_voronoiCircles = new d3_geom_voronoiRedBlackTree();
          while (true) {
            circle = d3_geom_voronoiFirstCircle;
            if (site && (!circle || site.y < circle.y || site.y === circle.y && site.x < circle.x)) {
              if (site.x !== x0 || site.y !== y0) {
                d3_geom_voronoiCells[site.i] = new d3_geom_voronoiCell(site);
                d3_geom_voronoiAddBeach(site);
                x0 = site.x, y0 = site.y;
              }
              site = sites.pop();
            } else if (circle) {
              d3_geom_voronoiRemoveBeach(circle.arc);
            } else {
              break;
            }
          }
          if (bbox)
            d3_geom_voronoiClipEdges(bbox), d3_geom_voronoiCloseCells(bbox);
          var diagram = {
              cells: d3_geom_voronoiCells,
              edges: d3_geom_voronoiEdges
            };
          d3_geom_voronoiBeaches = d3_geom_voronoiCircles = d3_geom_voronoiEdges = d3_geom_voronoiCells = null;
          return diagram;
        }
        function d3_geom_voronoiVertexOrder(a, b) {
          return b.y - a.y || b.x - a.x;
        }
        d3.geom.voronoi = function (points) {
          var x = d3_geom_pointX, y = d3_geom_pointY, fx = x, fy = y, clipExtent = d3_geom_voronoiClipExtent;
          if (points)
            return voronoi(points);
          function voronoi(data) {
            var polygons = new Array(data.length), x0 = clipExtent[0][0], y0 = clipExtent[0][1], x1 = clipExtent[1][0], y1 = clipExtent[1][1];
            d3_geom_voronoi(sites(data), clipExtent).cells.forEach(function (cell, i) {
              var edges = cell.edges, site = cell.site, polygon = polygons[i] = edges.length ? edges.map(function (e) {
                  var s = e.start();
                  return [
                    s.x,
                    s.y
                  ];
                }) : site.x >= x0 && site.x <= x1 && site.y >= y0 && site.y <= y1 ? [
                  [
                    x0,
                    y1
                  ],
                  [
                    x1,
                    y1
                  ],
                  [
                    x1,
                    y0
                  ],
                  [
                    x0,
                    y0
                  ]
                ] : [];
              polygon.point = data[i];
            });
            return polygons;
          }
          function sites(data) {
            return data.map(function (d, i) {
              return {
                x: Math.round(fx(d, i) / ε) * ε,
                y: Math.round(fy(d, i) / ε) * ε,
                i: i
              };
            });
          }
          voronoi.links = function (data) {
            return d3_geom_voronoi(sites(data)).edges.filter(function (edge) {
              return edge.l && edge.r;
            }).map(function (edge) {
              return {
                source: data[edge.l.i],
                target: data[edge.r.i]
              };
            });
          };
          voronoi.triangles = function (data) {
            var triangles = [];
            d3_geom_voronoi(sites(data)).cells.forEach(function (cell, i) {
              var site = cell.site, edges = cell.edges.sort(d3_geom_voronoiHalfEdgeOrder), j = -1, m = edges.length, e0, s0, e1 = edges[m - 1].edge, s1 = e1.l === site ? e1.r : e1.l;
              while (++j < m) {
                e0 = e1;
                s0 = s1;
                e1 = edges[j].edge;
                s1 = e1.l === site ? e1.r : e1.l;
                if (i < s0.i && i < s1.i && d3_geom_voronoiTriangleArea(site, s0, s1) < 0) {
                  triangles.push([
                    data[i],
                    data[s0.i],
                    data[s1.i]
                  ]);
                }
              }
            });
            return triangles;
          };
          voronoi.x = function (_) {
            return arguments.length ? (fx = d3_functor(x = _), voronoi) : x;
          };
          voronoi.y = function (_) {
            return arguments.length ? (fy = d3_functor(y = _), voronoi) : y;
          };
          voronoi.clipExtent = function (_) {
            if (!arguments.length)
              return clipExtent === d3_geom_voronoiClipExtent ? null : clipExtent;
            clipExtent = _ == null ? d3_geom_voronoiClipExtent : _;
            return voronoi;
          };
          voronoi.size = function (_) {
            if (!arguments.length)
              return clipExtent === d3_geom_voronoiClipExtent ? null : clipExtent && clipExtent[1];
            return voronoi.clipExtent(_ && [
              [
                0,
                0
              ],
              _
            ]);
          };
          return voronoi;
        };
        var d3_geom_voronoiClipExtent = [
            [
              -1000000,
              -1000000
            ],
            [
              1000000,
              1000000
            ]
          ];
        function d3_geom_voronoiTriangleArea(a, b, c) {
          return (a.x - c.x) * (b.y - a.y) - (a.x - b.x) * (c.y - a.y);
        }
        d3.geom.delaunay = function (vertices) {
          return d3.geom.voronoi().triangles(vertices);
        };
        d3.geom.quadtree = function (points, x1, y1, x2, y2) {
          var x = d3_geom_pointX, y = d3_geom_pointY, compat;
          if (compat = arguments.length) {
            x = d3_geom_quadtreeCompatX;
            y = d3_geom_quadtreeCompatY;
            if (compat === 3) {
              y2 = y1;
              x2 = x1;
              y1 = x1 = 0;
            }
            return quadtree(points);
          }
          function quadtree(data) {
            var d, fx = d3_functor(x), fy = d3_functor(y), xs, ys, i, n, x1_, y1_, x2_, y2_;
            if (x1 != null) {
              x1_ = x1, y1_ = y1, x2_ = x2, y2_ = y2;
            } else {
              x2_ = y2_ = -(x1_ = y1_ = Infinity);
              xs = [], ys = [];
              n = data.length;
              if (compat)
                for (i = 0; i < n; ++i) {
                  d = data[i];
                  if (d.x < x1_)
                    x1_ = d.x;
                  if (d.y < y1_)
                    y1_ = d.y;
                  if (d.x > x2_)
                    x2_ = d.x;
                  if (d.y > y2_)
                    y2_ = d.y;
                  xs.push(d.x);
                  ys.push(d.y);
                }
              else
                for (i = 0; i < n; ++i) {
                  var x_ = +fx(d = data[i], i), y_ = +fy(d, i);
                  if (x_ < x1_)
                    x1_ = x_;
                  if (y_ < y1_)
                    y1_ = y_;
                  if (x_ > x2_)
                    x2_ = x_;
                  if (y_ > y2_)
                    y2_ = y_;
                  xs.push(x_);
                  ys.push(y_);
                }
            }
            var dx = x2_ - x1_, dy = y2_ - y1_;
            if (dx > dy)
              y2_ = y1_ + dx;
            else
              x2_ = x1_ + dy;
            function insert(n, d, x, y, x1, y1, x2, y2) {
              if (isNaN(x) || isNaN(y))
                return;
              if (n.leaf) {
                var nx = n.x, ny = n.y;
                if (nx != null) {
                  if (abs(nx - x) + abs(ny - y) < 0.01) {
                    insertChild(n, d, x, y, x1, y1, x2, y2);
                  } else {
                    var nPoint = n.point;
                    n.x = n.y = n.point = null;
                    insertChild(n, nPoint, nx, ny, x1, y1, x2, y2);
                    insertChild(n, d, x, y, x1, y1, x2, y2);
                  }
                } else {
                  n.x = x, n.y = y, n.point = d;
                }
              } else {
                insertChild(n, d, x, y, x1, y1, x2, y2);
              }
            }
            function insertChild(n, d, x, y, x1, y1, x2, y2) {
              var sx = (x1 + x2) * 0.5, sy = (y1 + y2) * 0.5, right = x >= sx, bottom = y >= sy, i = (bottom << 1) + right;
              n.leaf = false;
              n = n.nodes[i] || (n.nodes[i] = d3_geom_quadtreeNode());
              if (right)
                x1 = sx;
              else
                x2 = sx;
              if (bottom)
                y1 = sy;
              else
                y2 = sy;
              insert(n, d, x, y, x1, y1, x2, y2);
            }
            var root = d3_geom_quadtreeNode();
            root.add = function (d) {
              insert(root, d, +fx(d, ++i), +fy(d, i), x1_, y1_, x2_, y2_);
            };
            root.visit = function (f) {
              d3_geom_quadtreeVisit(f, root, x1_, y1_, x2_, y2_);
            };
            i = -1;
            if (x1 == null) {
              while (++i < n) {
                insert(root, data[i], xs[i], ys[i], x1_, y1_, x2_, y2_);
              }
              --i;
            } else
              data.forEach(root.add);
            xs = ys = data = d = null;
            return root;
          }
          quadtree.x = function (_) {
            return arguments.length ? (x = _, quadtree) : x;
          };
          quadtree.y = function (_) {
            return arguments.length ? (y = _, quadtree) : y;
          };
          quadtree.extent = function (_) {
            if (!arguments.length)
              return x1 == null ? null : [
                [
                  x1,
                  y1
                ],
                [
                  x2,
                  y2
                ]
              ];
            if (_ == null)
              x1 = y1 = x2 = y2 = null;
            else
              x1 = +_[0][0], y1 = +_[0][1], x2 = +_[1][0], y2 = +_[1][1];
            return quadtree;
          };
          quadtree.size = function (_) {
            if (!arguments.length)
              return x1 == null ? null : [
                x2 - x1,
                y2 - y1
              ];
            if (_ == null)
              x1 = y1 = x2 = y2 = null;
            else
              x1 = y1 = 0, x2 = +_[0], y2 = +_[1];
            return quadtree;
          };
          return quadtree;
        };
        function d3_geom_quadtreeCompatX(d) {
          return d.x;
        }
        function d3_geom_quadtreeCompatY(d) {
          return d.y;
        }
        function d3_geom_quadtreeNode() {
          return {
            leaf: true,
            nodes: [],
            point: null,
            x: null,
            y: null
          };
        }
        function d3_geom_quadtreeVisit(f, node, x1, y1, x2, y2) {
          if (!f(node, x1, y1, x2, y2)) {
            var sx = (x1 + x2) * 0.5, sy = (y1 + y2) * 0.5, children = node.nodes;
            if (children[0])
              d3_geom_quadtreeVisit(f, children[0], x1, y1, sx, sy);
            if (children[1])
              d3_geom_quadtreeVisit(f, children[1], sx, y1, x2, sy);
            if (children[2])
              d3_geom_quadtreeVisit(f, children[2], x1, sy, sx, y2);
            if (children[3])
              d3_geom_quadtreeVisit(f, children[3], sx, sy, x2, y2);
          }
        }
        d3.interpolateRgb = d3_interpolateRgb;
        function d3_interpolateRgb(a, b) {
          a = d3.rgb(a);
          b = d3.rgb(b);
          var ar = a.r, ag = a.g, ab = a.b, br = b.r - ar, bg = b.g - ag, bb = b.b - ab;
          return function (t) {
            return '#' + d3_rgb_hex(Math.round(ar + br * t)) + d3_rgb_hex(Math.round(ag + bg * t)) + d3_rgb_hex(Math.round(ab + bb * t));
          };
        }
        d3.interpolateObject = d3_interpolateObject;
        function d3_interpolateObject(a, b) {
          var i = {}, c = {}, k;
          for (k in a) {
            if (k in b) {
              i[k] = d3_interpolate(a[k], b[k]);
            } else {
              c[k] = a[k];
            }
          }
          for (k in b) {
            if (!(k in a)) {
              c[k] = b[k];
            }
          }
          return function (t) {
            for (k in i)
              c[k] = i[k](t);
            return c;
          };
        }
        d3.interpolateNumber = d3_interpolateNumber;
        function d3_interpolateNumber(a, b) {
          b -= a = +a;
          return function (t) {
            return a + b * t;
          };
        }
        d3.interpolateString = d3_interpolateString;
        function d3_interpolateString(a, b) {
          var m, i, j, s0 = 0, s1 = 0, s = [], q = [], n, o;
          a = a + '', b = b + '';
          d3_interpolate_number.lastIndex = 0;
          for (i = 0; m = d3_interpolate_number.exec(b); ++i) {
            if (m.index)
              s.push(b.substring(s0, s1 = m.index));
            q.push({
              i: s.length,
              x: m[0]
            });
            s.push(null);
            s0 = d3_interpolate_number.lastIndex;
          }
          if (s0 < b.length)
            s.push(b.substring(s0));
          for (i = 0, n = q.length; (m = d3_interpolate_number.exec(a)) && i < n; ++i) {
            o = q[i];
            if (o.x == m[0]) {
              if (o.i) {
                if (s[o.i + 1] == null) {
                  s[o.i - 1] += o.x;
                  s.splice(o.i, 1);
                  for (j = i + 1; j < n; ++j)
                    q[j].i--;
                } else {
                  s[o.i - 1] += o.x + s[o.i + 1];
                  s.splice(o.i, 2);
                  for (j = i + 1; j < n; ++j)
                    q[j].i -= 2;
                }
              } else {
                if (s[o.i + 1] == null) {
                  s[o.i] = o.x;
                } else {
                  s[o.i] = o.x + s[o.i + 1];
                  s.splice(o.i + 1, 1);
                  for (j = i + 1; j < n; ++j)
                    q[j].i--;
                }
              }
              q.splice(i, 1);
              n--;
              i--;
            } else {
              o.x = d3_interpolateNumber(parseFloat(m[0]), parseFloat(o.x));
            }
          }
          while (i < n) {
            o = q.pop();
            if (s[o.i + 1] == null) {
              s[o.i] = o.x;
            } else {
              s[o.i] = o.x + s[o.i + 1];
              s.splice(o.i + 1, 1);
            }
            n--;
          }
          if (s.length === 1) {
            return s[0] == null ? (o = q[0].x, function (t) {
              return o(t) + '';
            }) : function () {
              return b;
            };
          }
          return function (t) {
            for (i = 0; i < n; ++i)
              s[(o = q[i]).i] = o.x(t);
            return s.join('');
          };
        }
        var d3_interpolate_number = /[-+]?(?:\d+\.?\d*|\.?\d+)(?:[eE][-+]?\d+)?/g;
        d3.interpolate = d3_interpolate;
        function d3_interpolate(a, b) {
          var i = d3.interpolators.length, f;
          while (--i >= 0 && !(f = d3.interpolators[i](a, b)));
          return f;
        }
        d3.interpolators = [function (a, b) {
            var t = typeof b;
            return (t === 'string' ? d3_rgb_names.has(b) || /^(#|rgb\(|hsl\()/.test(b) ? d3_interpolateRgb : d3_interpolateString : b instanceof d3_Color ? d3_interpolateRgb : t === 'object' ? Array.isArray(b) ? d3_interpolateArray : d3_interpolateObject : d3_interpolateNumber)(a, b);
          }];
        d3.interpolateArray = d3_interpolateArray;
        function d3_interpolateArray(a, b) {
          var x = [], c = [], na = a.length, nb = b.length, n0 = Math.min(a.length, b.length), i;
          for (i = 0; i < n0; ++i)
            x.push(d3_interpolate(a[i], b[i]));
          for (; i < na; ++i)
            c[i] = a[i];
          for (; i < nb; ++i)
            c[i] = b[i];
          return function (t) {
            for (i = 0; i < n0; ++i)
              c[i] = x[i](t);
            return c;
          };
        }
        var d3_ease_default = function () {
          return d3_identity;
        };
        var d3_ease = d3.map({
            linear: d3_ease_default,
            poly: d3_ease_poly,
            quad: function () {
              return d3_ease_quad;
            },
            cubic: function () {
              return d3_ease_cubic;
            },
            sin: function () {
              return d3_ease_sin;
            },
            exp: function () {
              return d3_ease_exp;
            },
            circle: function () {
              return d3_ease_circle;
            },
            elastic: d3_ease_elastic,
            back: d3_ease_back,
            bounce: function () {
              return d3_ease_bounce;
            }
          });
        var d3_ease_mode = d3.map({
            'in': d3_identity,
            out: d3_ease_reverse,
            'in-out': d3_ease_reflect,
            'out-in': function (f) {
              return d3_ease_reflect(d3_ease_reverse(f));
            }
          });
        d3.ease = function (name) {
          var i = name.indexOf('-'), t = i >= 0 ? name.substring(0, i) : name, m = i >= 0 ? name.substring(i + 1) : 'in';
          t = d3_ease.get(t) || d3_ease_default;
          m = d3_ease_mode.get(m) || d3_identity;
          return d3_ease_clamp(m(t.apply(null, d3_arraySlice.call(arguments, 1))));
        };
        function d3_ease_clamp(f) {
          return function (t) {
            return t <= 0 ? 0 : t >= 1 ? 1 : f(t);
          };
        }
        function d3_ease_reverse(f) {
          return function (t) {
            return 1 - f(1 - t);
          };
        }
        function d3_ease_reflect(f) {
          return function (t) {
            return 0.5 * (t < 0.5 ? f(2 * t) : 2 - f(2 - 2 * t));
          };
        }
        function d3_ease_quad(t) {
          return t * t;
        }
        function d3_ease_cubic(t) {
          return t * t * t;
        }
        function d3_ease_cubicInOut(t) {
          if (t <= 0)
            return 0;
          if (t >= 1)
            return 1;
          var t2 = t * t, t3 = t2 * t;
          return 4 * (t < 0.5 ? t3 : 3 * (t - t2) + t3 - 0.75);
        }
        function d3_ease_poly(e) {
          return function (t) {
            return Math.pow(t, e);
          };
        }
        function d3_ease_sin(t) {
          return 1 - Math.cos(t * halfπ);
        }
        function d3_ease_exp(t) {
          return Math.pow(2, 10 * (t - 1));
        }
        function d3_ease_circle(t) {
          return 1 - Math.sqrt(1 - t * t);
        }
        function d3_ease_elastic(a, p) {
          var s;
          if (arguments.length < 2)
            p = 0.45;
          if (arguments.length)
            s = p / τ * Math.asin(1 / a);
          else
            a = 1, s = p / 4;
          return function (t) {
            return 1 + a * Math.pow(2, -10 * t) * Math.sin((t - s) * τ / p);
          };
        }
        function d3_ease_back(s) {
          if (!s)
            s = 1.70158;
          return function (t) {
            return t * t * ((s + 1) * t - s);
          };
        }
        function d3_ease_bounce(t) {
          return t < 1 / 2.75 ? 7.5625 * t * t : t < 2 / 2.75 ? 7.5625 * (t -= 1.5 / 2.75) * t + 0.75 : t < 2.5 / 2.75 ? 7.5625 * (t -= 2.25 / 2.75) * t + 0.9375 : 7.5625 * (t -= 2.625 / 2.75) * t + 0.984375;
        }
        d3.interpolateHcl = d3_interpolateHcl;
        function d3_interpolateHcl(a, b) {
          a = d3.hcl(a);
          b = d3.hcl(b);
          var ah = a.h, ac = a.c, al = a.l, bh = b.h - ah, bc = b.c - ac, bl = b.l - al;
          if (isNaN(bc))
            bc = 0, ac = isNaN(ac) ? b.c : ac;
          if (isNaN(bh))
            bh = 0, ah = isNaN(ah) ? b.h : ah;
          else if (bh > 180)
            bh -= 360;
          else if (bh < -180)
            bh += 360;
          return function (t) {
            return d3_hcl_lab(ah + bh * t, ac + bc * t, al + bl * t) + '';
          };
        }
        d3.interpolateHsl = d3_interpolateHsl;
        function d3_interpolateHsl(a, b) {
          a = d3.hsl(a);
          b = d3.hsl(b);
          var ah = a.h, as = a.s, al = a.l, bh = b.h - ah, bs = b.s - as, bl = b.l - al;
          if (isNaN(bs))
            bs = 0, as = isNaN(as) ? b.s : as;
          if (isNaN(bh))
            bh = 0, ah = isNaN(ah) ? b.h : ah;
          else if (bh > 180)
            bh -= 360;
          else if (bh < -180)
            bh += 360;
          return function (t) {
            return d3_hsl_rgb(ah + bh * t, as + bs * t, al + bl * t) + '';
          };
        }
        d3.interpolateLab = d3_interpolateLab;
        function d3_interpolateLab(a, b) {
          a = d3.lab(a);
          b = d3.lab(b);
          var al = a.l, aa = a.a, ab = a.b, bl = b.l - al, ba = b.a - aa, bb = b.b - ab;
          return function (t) {
            return d3_lab_rgb(al + bl * t, aa + ba * t, ab + bb * t) + '';
          };
        }
        d3.interpolateRound = d3_interpolateRound;
        function d3_interpolateRound(a, b) {
          b -= a;
          return function (t) {
            return Math.round(a + b * t);
          };
        }
        d3.transform = function (string) {
          var g = d3_document.createElementNS(d3.ns.prefix.svg, 'g');
          return (d3.transform = function (string) {
            if (string != null) {
              g.setAttribute('transform', string);
              var t = g.transform.baseVal.consolidate();
            }
            return new d3_transform(t ? t.matrix : d3_transformIdentity);
          })(string);
        };
        function d3_transform(m) {
          var r0 = [
              m.a,
              m.b
            ], r1 = [
              m.c,
              m.d
            ], kx = d3_transformNormalize(r0), kz = d3_transformDot(r0, r1), ky = d3_transformNormalize(d3_transformCombine(r1, r0, -kz)) || 0;
          if (r0[0] * r1[1] < r1[0] * r0[1]) {
            r0[0] *= -1;
            r0[1] *= -1;
            kx *= -1;
            kz *= -1;
          }
          this.rotate = (kx ? Math.atan2(r0[1], r0[0]) : Math.atan2(-r1[0], r1[1])) * d3_degrees;
          this.translate = [
            m.e,
            m.f
          ];
          this.scale = [
            kx,
            ky
          ];
          this.skew = ky ? Math.atan2(kz, ky) * d3_degrees : 0;
        }
        d3_transform.prototype.toString = function () {
          return 'translate(' + this.translate + ')rotate(' + this.rotate + ')skewX(' + this.skew + ')scale(' + this.scale + ')';
        };
        function d3_transformDot(a, b) {
          return a[0] * b[0] + a[1] * b[1];
        }
        function d3_transformNormalize(a) {
          var k = Math.sqrt(d3_transformDot(a, a));
          if (k) {
            a[0] /= k;
            a[1] /= k;
          }
          return k;
        }
        function d3_transformCombine(a, b, k) {
          a[0] += k * b[0];
          a[1] += k * b[1];
          return a;
        }
        var d3_transformIdentity = {
            a: 1,
            b: 0,
            c: 0,
            d: 1,
            e: 0,
            f: 0
          };
        d3.interpolateTransform = d3_interpolateTransform;
        function d3_interpolateTransform(a, b) {
          var s = [], q = [], n, A = d3.transform(a), B = d3.transform(b), ta = A.translate, tb = B.translate, ra = A.rotate, rb = B.rotate, wa = A.skew, wb = B.skew, ka = A.scale, kb = B.scale;
          if (ta[0] != tb[0] || ta[1] != tb[1]) {
            s.push('translate(', null, ',', null, ')');
            q.push({
              i: 1,
              x: d3_interpolateNumber(ta[0], tb[0])
            }, {
              i: 3,
              x: d3_interpolateNumber(ta[1], tb[1])
            });
          } else if (tb[0] || tb[1]) {
            s.push('translate(' + tb + ')');
          } else {
            s.push('');
          }
          if (ra != rb) {
            if (ra - rb > 180)
              rb += 360;
            else if (rb - ra > 180)
              ra += 360;
            q.push({
              i: s.push(s.pop() + 'rotate(', null, ')') - 2,
              x: d3_interpolateNumber(ra, rb)
            });
          } else if (rb) {
            s.push(s.pop() + 'rotate(' + rb + ')');
          }
          if (wa != wb) {
            q.push({
              i: s.push(s.pop() + 'skewX(', null, ')') - 2,
              x: d3_interpolateNumber(wa, wb)
            });
          } else if (wb) {
            s.push(s.pop() + 'skewX(' + wb + ')');
          }
          if (ka[0] != kb[0] || ka[1] != kb[1]) {
            n = s.push(s.pop() + 'scale(', null, ',', null, ')');
            q.push({
              i: n - 4,
              x: d3_interpolateNumber(ka[0], kb[0])
            }, {
              i: n - 2,
              x: d3_interpolateNumber(ka[1], kb[1])
            });
          } else if (kb[0] != 1 || kb[1] != 1) {
            s.push(s.pop() + 'scale(' + kb + ')');
          }
          n = q.length;
          return function (t) {
            var i = -1, o;
            while (++i < n)
              s[(o = q[i]).i] = o.x(t);
            return s.join('');
          };
        }
        function d3_uninterpolateNumber(a, b) {
          b = b - (a = +a) ? 1 / (b - a) : 0;
          return function (x) {
            return (x - a) * b;
          };
        }
        function d3_uninterpolateClamp(a, b) {
          b = b - (a = +a) ? 1 / (b - a) : 0;
          return function (x) {
            return Math.max(0, Math.min(1, (x - a) * b));
          };
        }
        d3.layout = {};
        d3.layout.bundle = function () {
          return function (links) {
            var paths = [], i = -1, n = links.length;
            while (++i < n)
              paths.push(d3_layout_bundlePath(links[i]));
            return paths;
          };
        };
        function d3_layout_bundlePath(link) {
          var start = link.source, end = link.target, lca = d3_layout_bundleLeastCommonAncestor(start, end), points = [start];
          while (start !== lca) {
            start = start.parent;
            points.push(start);
          }
          var k = points.length;
          while (end !== lca) {
            points.splice(k, 0, end);
            end = end.parent;
          }
          return points;
        }
        function d3_layout_bundleAncestors(node) {
          var ancestors = [], parent = node.parent;
          while (parent != null) {
            ancestors.push(node);
            node = parent;
            parent = parent.parent;
          }
          ancestors.push(node);
          return ancestors;
        }
        function d3_layout_bundleLeastCommonAncestor(a, b) {
          if (a === b)
            return a;
          var aNodes = d3_layout_bundleAncestors(a), bNodes = d3_layout_bundleAncestors(b), aNode = aNodes.pop(), bNode = bNodes.pop(), sharedNode = null;
          while (aNode === bNode) {
            sharedNode = aNode;
            aNode = aNodes.pop();
            bNode = bNodes.pop();
          }
          return sharedNode;
        }
        d3.layout.chord = function () {
          var chord = {}, chords, groups, matrix, n, padding = 0, sortGroups, sortSubgroups, sortChords;
          function relayout() {
            var subgroups = {}, groupSums = [], groupIndex = d3.range(n), subgroupIndex = [], k, x, x0, i, j;
            chords = [];
            groups = [];
            k = 0, i = -1;
            while (++i < n) {
              x = 0, j = -1;
              while (++j < n) {
                x += matrix[i][j];
              }
              groupSums.push(x);
              subgroupIndex.push(d3.range(n));
              k += x;
            }
            if (sortGroups) {
              groupIndex.sort(function (a, b) {
                return sortGroups(groupSums[a], groupSums[b]);
              });
            }
            if (sortSubgroups) {
              subgroupIndex.forEach(function (d, i) {
                d.sort(function (a, b) {
                  return sortSubgroups(matrix[i][a], matrix[i][b]);
                });
              });
            }
            k = (τ - padding * n) / k;
            x = 0, i = -1;
            while (++i < n) {
              x0 = x, j = -1;
              while (++j < n) {
                var di = groupIndex[i], dj = subgroupIndex[di][j], v = matrix[di][dj], a0 = x, a1 = x += v * k;
                subgroups[di + '-' + dj] = {
                  index: di,
                  subindex: dj,
                  startAngle: a0,
                  endAngle: a1,
                  value: v
                };
              }
              groups[di] = {
                index: di,
                startAngle: x0,
                endAngle: x,
                value: (x - x0) / k
              };
              x += padding;
            }
            i = -1;
            while (++i < n) {
              j = i - 1;
              while (++j < n) {
                var source = subgroups[i + '-' + j], target = subgroups[j + '-' + i];
                if (source.value || target.value) {
                  chords.push(source.value < target.value ? {
                    source: target,
                    target: source
                  } : {
                    source: source,
                    target: target
                  });
                }
              }
            }
            if (sortChords)
              resort();
          }
          function resort() {
            chords.sort(function (a, b) {
              return sortChords((a.source.value + a.target.value) / 2, (b.source.value + b.target.value) / 2);
            });
          }
          chord.matrix = function (x) {
            if (!arguments.length)
              return matrix;
            n = (matrix = x) && matrix.length;
            chords = groups = null;
            return chord;
          };
          chord.padding = function (x) {
            if (!arguments.length)
              return padding;
            padding = x;
            chords = groups = null;
            return chord;
          };
          chord.sortGroups = function (x) {
            if (!arguments.length)
              return sortGroups;
            sortGroups = x;
            chords = groups = null;
            return chord;
          };
          chord.sortSubgroups = function (x) {
            if (!arguments.length)
              return sortSubgroups;
            sortSubgroups = x;
            chords = null;
            return chord;
          };
          chord.sortChords = function (x) {
            if (!arguments.length)
              return sortChords;
            sortChords = x;
            if (chords)
              resort();
            return chord;
          };
          chord.chords = function () {
            if (!chords)
              relayout();
            return chords;
          };
          chord.groups = function () {
            if (!groups)
              relayout();
            return groups;
          };
          return chord;
        };
        d3.layout.force = function () {
          var force = {}, event = d3.dispatch('start', 'tick', 'end'), size = [
              1,
              1
            ], drag, alpha, friction = 0.9, linkDistance = d3_layout_forceLinkDistance, linkStrength = d3_layout_forceLinkStrength, charge = -30, gravity = 0.1, theta = 0.8, nodes = [], links = [], distances, strengths, charges;
          function repulse(node) {
            return function (quad, x1, _, x2) {
              if (quad.point !== node) {
                var dx = quad.cx - node.x, dy = quad.cy - node.y, dn = 1 / Math.sqrt(dx * dx + dy * dy);
                if ((x2 - x1) * dn < theta) {
                  var k = quad.charge * dn * dn;
                  node.px -= dx * k;
                  node.py -= dy * k;
                  return true;
                }
                if (quad.point && isFinite(dn)) {
                  var k = quad.pointCharge * dn * dn;
                  node.px -= dx * k;
                  node.py -= dy * k;
                }
              }
              return !quad.charge;
            };
          }
          force.tick = function () {
            if ((alpha *= 0.99) < 0.005) {
              event.end({
                type: 'end',
                alpha: alpha = 0
              });
              return true;
            }
            var n = nodes.length, m = links.length, q, i, o, s, t, l, k, x, y;
            for (i = 0; i < m; ++i) {
              o = links[i];
              s = o.source;
              t = o.target;
              x = t.x - s.x;
              y = t.y - s.y;
              if (l = x * x + y * y) {
                l = alpha * strengths[i] * ((l = Math.sqrt(l)) - distances[i]) / l;
                x *= l;
                y *= l;
                t.x -= x * (k = s.weight / (t.weight + s.weight));
                t.y -= y * k;
                s.x += x * (k = 1 - k);
                s.y += y * k;
              }
            }
            if (k = alpha * gravity) {
              x = size[0] / 2;
              y = size[1] / 2;
              i = -1;
              if (k)
                while (++i < n) {
                  o = nodes[i];
                  o.x += (x - o.x) * k;
                  o.y += (y - o.y) * k;
                }
            }
            if (charge) {
              d3_layout_forceAccumulate(q = d3.geom.quadtree(nodes), alpha, charges);
              i = -1;
              while (++i < n) {
                if (!(o = nodes[i]).fixed) {
                  q.visit(repulse(o));
                }
              }
            }
            i = -1;
            while (++i < n) {
              o = nodes[i];
              if (o.fixed) {
                o.x = o.px;
                o.y = o.py;
              } else {
                o.x -= (o.px - (o.px = o.x)) * friction;
                o.y -= (o.py - (o.py = o.y)) * friction;
              }
            }
            event.tick({
              type: 'tick',
              alpha: alpha
            });
          };
          force.nodes = function (x) {
            if (!arguments.length)
              return nodes;
            nodes = x;
            return force;
          };
          force.links = function (x) {
            if (!arguments.length)
              return links;
            links = x;
            return force;
          };
          force.size = function (x) {
            if (!arguments.length)
              return size;
            size = x;
            return force;
          };
          force.linkDistance = function (x) {
            if (!arguments.length)
              return linkDistance;
            linkDistance = typeof x === 'function' ? x : +x;
            return force;
          };
          force.distance = force.linkDistance;
          force.linkStrength = function (x) {
            if (!arguments.length)
              return linkStrength;
            linkStrength = typeof x === 'function' ? x : +x;
            return force;
          };
          force.friction = function (x) {
            if (!arguments.length)
              return friction;
            friction = +x;
            return force;
          };
          force.charge = function (x) {
            if (!arguments.length)
              return charge;
            charge = typeof x === 'function' ? x : +x;
            return force;
          };
          force.gravity = function (x) {
            if (!arguments.length)
              return gravity;
            gravity = +x;
            return force;
          };
          force.theta = function (x) {
            if (!arguments.length)
              return theta;
            theta = +x;
            return force;
          };
          force.alpha = function (x) {
            if (!arguments.length)
              return alpha;
            x = +x;
            if (alpha) {
              if (x > 0)
                alpha = x;
              else
                alpha = 0;
            } else if (x > 0) {
              event.start({
                type: 'start',
                alpha: alpha = x
              });
              d3.timer(force.tick);
            }
            return force;
          };
          force.start = function () {
            var i, n = nodes.length, m = links.length, w = size[0], h = size[1], neighbors, o;
            for (i = 0; i < n; ++i) {
              (o = nodes[i]).index = i;
              o.weight = 0;
            }
            for (i = 0; i < m; ++i) {
              o = links[i];
              if (typeof o.source == 'number')
                o.source = nodes[o.source];
              if (typeof o.target == 'number')
                o.target = nodes[o.target];
              ++o.source.weight;
              ++o.target.weight;
            }
            for (i = 0; i < n; ++i) {
              o = nodes[i];
              if (isNaN(o.x))
                o.x = position('x', w);
              if (isNaN(o.y))
                o.y = position('y', h);
              if (isNaN(o.px))
                o.px = o.x;
              if (isNaN(o.py))
                o.py = o.y;
            }
            distances = [];
            if (typeof linkDistance === 'function')
              for (i = 0; i < m; ++i)
                distances[i] = +linkDistance.call(this, links[i], i);
            else
              for (i = 0; i < m; ++i)
                distances[i] = linkDistance;
            strengths = [];
            if (typeof linkStrength === 'function')
              for (i = 0; i < m; ++i)
                strengths[i] = +linkStrength.call(this, links[i], i);
            else
              for (i = 0; i < m; ++i)
                strengths[i] = linkStrength;
            charges = [];
            if (typeof charge === 'function')
              for (i = 0; i < n; ++i)
                charges[i] = +charge.call(this, nodes[i], i);
            else
              for (i = 0; i < n; ++i)
                charges[i] = charge;
            function position(dimension, size) {
              if (!neighbors) {
                neighbors = new Array(n);
                for (j = 0; j < n; ++j) {
                  neighbors[j] = [];
                }
                for (j = 0; j < m; ++j) {
                  var o = links[j];
                  neighbors[o.source.index].push(o.target);
                  neighbors[o.target.index].push(o.source);
                }
              }
              var candidates = neighbors[i], j = -1, m = candidates.length, x;
              while (++j < m)
                if (!isNaN(x = candidates[j][dimension]))
                  return x;
              return Math.random() * size;
            }
            return force.resume();
          };
          force.resume = function () {
            return force.alpha(0.1);
          };
          force.stop = function () {
            return force.alpha(0);
          };
          force.drag = function () {
            if (!drag)
              drag = d3.behavior.drag().origin(d3_identity).on('dragstart.force', d3_layout_forceDragstart).on('drag.force', dragmove).on('dragend.force', d3_layout_forceDragend);
            if (!arguments.length)
              return drag;
            this.on('mouseover.force', d3_layout_forceMouseover).on('mouseout.force', d3_layout_forceMouseout).call(drag);
          };
          function dragmove(d) {
            d.px = d3.event.x, d.py = d3.event.y;
            force.resume();
          }
          return d3.rebind(force, event, 'on');
        };
        function d3_layout_forceDragstart(d) {
          d.fixed |= 2;
        }
        function d3_layout_forceDragend(d) {
          d.fixed &= ~6;
        }
        function d3_layout_forceMouseover(d) {
          d.fixed |= 4;
          d.px = d.x, d.py = d.y;
        }
        function d3_layout_forceMouseout(d) {
          d.fixed &= ~4;
        }
        function d3_layout_forceAccumulate(quad, alpha, charges) {
          var cx = 0, cy = 0;
          quad.charge = 0;
          if (!quad.leaf) {
            var nodes = quad.nodes, n = nodes.length, i = -1, c;
            while (++i < n) {
              c = nodes[i];
              if (c == null)
                continue;
              d3_layout_forceAccumulate(c, alpha, charges);
              quad.charge += c.charge;
              cx += c.charge * c.cx;
              cy += c.charge * c.cy;
            }
          }
          if (quad.point) {
            if (!quad.leaf) {
              quad.point.x += Math.random() - 0.5;
              quad.point.y += Math.random() - 0.5;
            }
            var k = alpha * charges[quad.point.index];
            quad.charge += quad.pointCharge = k;
            cx += k * quad.point.x;
            cy += k * quad.point.y;
          }
          quad.cx = cx / quad.charge;
          quad.cy = cy / quad.charge;
        }
        var d3_layout_forceLinkDistance = 20, d3_layout_forceLinkStrength = 1;
        d3.layout.hierarchy = function () {
          var sort = d3_layout_hierarchySort, children = d3_layout_hierarchyChildren, value = d3_layout_hierarchyValue;
          function recurse(node, depth, nodes) {
            var childs = children.call(hierarchy, node, depth);
            node.depth = depth;
            nodes.push(node);
            if (childs && (n = childs.length)) {
              var i = -1, n, c = node.children = new Array(n), v = 0, j = depth + 1, d;
              while (++i < n) {
                d = c[i] = recurse(childs[i], j, nodes);
                d.parent = node;
                v += d.value;
              }
              if (sort)
                c.sort(sort);
              if (value)
                node.value = v;
            } else {
              delete node.children;
              if (value) {
                node.value = +value.call(hierarchy, node, depth) || 0;
              }
            }
            return node;
          }
          function revalue(node, depth) {
            var children = node.children, v = 0;
            if (children && (n = children.length)) {
              var i = -1, n, j = depth + 1;
              while (++i < n)
                v += revalue(children[i], j);
            } else if (value) {
              v = +value.call(hierarchy, node, depth) || 0;
            }
            if (value)
              node.value = v;
            return v;
          }
          function hierarchy(d) {
            var nodes = [];
            recurse(d, 0, nodes);
            return nodes;
          }
          hierarchy.sort = function (x) {
            if (!arguments.length)
              return sort;
            sort = x;
            return hierarchy;
          };
          hierarchy.children = function (x) {
            if (!arguments.length)
              return children;
            children = x;
            return hierarchy;
          };
          hierarchy.value = function (x) {
            if (!arguments.length)
              return value;
            value = x;
            return hierarchy;
          };
          hierarchy.revalue = function (root) {
            revalue(root, 0);
            return root;
          };
          return hierarchy;
        };
        function d3_layout_hierarchyRebind(object, hierarchy) {
          d3.rebind(object, hierarchy, 'sort', 'children', 'value');
          object.nodes = object;
          object.links = d3_layout_hierarchyLinks;
          return object;
        }
        function d3_layout_hierarchyChildren(d) {
          return d.children;
        }
        function d3_layout_hierarchyValue(d) {
          return d.value;
        }
        function d3_layout_hierarchySort(a, b) {
          return b.value - a.value;
        }
        function d3_layout_hierarchyLinks(nodes) {
          return d3.merge(nodes.map(function (parent) {
            return (parent.children || []).map(function (child) {
              return {
                source: parent,
                target: child
              };
            });
          }));
        }
        d3.layout.partition = function () {
          var hierarchy = d3.layout.hierarchy(), size = [
              1,
              1
            ];
          function position(node, x, dx, dy) {
            var children = node.children;
            node.x = x;
            node.y = node.depth * dy;
            node.dx = dx;
            node.dy = dy;
            if (children && (n = children.length)) {
              var i = -1, n, c, d;
              dx = node.value ? dx / node.value : 0;
              while (++i < n) {
                position(c = children[i], x, d = c.value * dx, dy);
                x += d;
              }
            }
          }
          function depth(node) {
            var children = node.children, d = 0;
            if (children && (n = children.length)) {
              var i = -1, n;
              while (++i < n)
                d = Math.max(d, depth(children[i]));
            }
            return 1 + d;
          }
          function partition(d, i) {
            var nodes = hierarchy.call(this, d, i);
            position(nodes[0], 0, size[0], size[1] / depth(nodes[0]));
            return nodes;
          }
          partition.size = function (x) {
            if (!arguments.length)
              return size;
            size = x;
            return partition;
          };
          return d3_layout_hierarchyRebind(partition, hierarchy);
        };
        d3.layout.pie = function () {
          var value = Number, sort = d3_layout_pieSortByValue, startAngle = 0, endAngle = τ;
          function pie(data) {
            var values = data.map(function (d, i) {
                return +value.call(pie, d, i);
              });
            var a = +(typeof startAngle === 'function' ? startAngle.apply(this, arguments) : startAngle);
            var k = ((typeof endAngle === 'function' ? endAngle.apply(this, arguments) : endAngle) - a) / d3.sum(values);
            var index = d3.range(data.length);
            if (sort != null)
              index.sort(sort === d3_layout_pieSortByValue ? function (i, j) {
                return values[j] - values[i];
              } : function (i, j) {
                return sort(data[i], data[j]);
              });
            var arcs = [];
            index.forEach(function (i) {
              var d;
              arcs[i] = {
                data: data[i],
                value: d = values[i],
                startAngle: a,
                endAngle: a += d * k
              };
            });
            return arcs;
          }
          pie.value = function (x) {
            if (!arguments.length)
              return value;
            value = x;
            return pie;
          };
          pie.sort = function (x) {
            if (!arguments.length)
              return sort;
            sort = x;
            return pie;
          };
          pie.startAngle = function (x) {
            if (!arguments.length)
              return startAngle;
            startAngle = x;
            return pie;
          };
          pie.endAngle = function (x) {
            if (!arguments.length)
              return endAngle;
            endAngle = x;
            return pie;
          };
          return pie;
        };
        var d3_layout_pieSortByValue = {};
        d3.layout.stack = function () {
          var values = d3_identity, order = d3_layout_stackOrderDefault, offset = d3_layout_stackOffsetZero, out = d3_layout_stackOut, x = d3_layout_stackX, y = d3_layout_stackY;
          function stack(data, index) {
            var series = data.map(function (d, i) {
                return values.call(stack, d, i);
              });
            var points = series.map(function (d) {
                return d.map(function (v, i) {
                  return [
                    x.call(stack, v, i),
                    y.call(stack, v, i)
                  ];
                });
              });
            var orders = order.call(stack, points, index);
            series = d3.permute(series, orders);
            points = d3.permute(points, orders);
            var offsets = offset.call(stack, points, index);
            var n = series.length, m = series[0].length, i, j, o;
            for (j = 0; j < m; ++j) {
              out.call(stack, series[0][j], o = offsets[j], points[0][j][1]);
              for (i = 1; i < n; ++i) {
                out.call(stack, series[i][j], o += points[i - 1][j][1], points[i][j][1]);
              }
            }
            return data;
          }
          stack.values = function (x) {
            if (!arguments.length)
              return values;
            values = x;
            return stack;
          };
          stack.order = function (x) {
            if (!arguments.length)
              return order;
            order = typeof x === 'function' ? x : d3_layout_stackOrders.get(x) || d3_layout_stackOrderDefault;
            return stack;
          };
          stack.offset = function (x) {
            if (!arguments.length)
              return offset;
            offset = typeof x === 'function' ? x : d3_layout_stackOffsets.get(x) || d3_layout_stackOffsetZero;
            return stack;
          };
          stack.x = function (z) {
            if (!arguments.length)
              return x;
            x = z;
            return stack;
          };
          stack.y = function (z) {
            if (!arguments.length)
              return y;
            y = z;
            return stack;
          };
          stack.out = function (z) {
            if (!arguments.length)
              return out;
            out = z;
            return stack;
          };
          return stack;
        };
        function d3_layout_stackX(d) {
          return d.x;
        }
        function d3_layout_stackY(d) {
          return d.y;
        }
        function d3_layout_stackOut(d, y0, y) {
          d.y0 = y0;
          d.y = y;
        }
        var d3_layout_stackOrders = d3.map({
            'inside-out': function (data) {
              var n = data.length, i, j, max = data.map(d3_layout_stackMaxIndex), sums = data.map(d3_layout_stackReduceSum), index = d3.range(n).sort(function (a, b) {
                  return max[a] - max[b];
                }), top = 0, bottom = 0, tops = [], bottoms = [];
              for (i = 0; i < n; ++i) {
                j = index[i];
                if (top < bottom) {
                  top += sums[j];
                  tops.push(j);
                } else {
                  bottom += sums[j];
                  bottoms.push(j);
                }
              }
              return bottoms.reverse().concat(tops);
            },
            reverse: function (data) {
              return d3.range(data.length).reverse();
            },
            'default': d3_layout_stackOrderDefault
          });
        var d3_layout_stackOffsets = d3.map({
            silhouette: function (data) {
              var n = data.length, m = data[0].length, sums = [], max = 0, i, j, o, y0 = [];
              for (j = 0; j < m; ++j) {
                for (i = 0, o = 0; i < n; i++)
                  o += data[i][j][1];
                if (o > max)
                  max = o;
                sums.push(o);
              }
              for (j = 0; j < m; ++j) {
                y0[j] = (max - sums[j]) / 2;
              }
              return y0;
            },
            wiggle: function (data) {
              var n = data.length, x = data[0], m = x.length, i, j, k, s1, s2, s3, dx, o, o0, y0 = [];
              y0[0] = o = o0 = 0;
              for (j = 1; j < m; ++j) {
                for (i = 0, s1 = 0; i < n; ++i)
                  s1 += data[i][j][1];
                for (i = 0, s2 = 0, dx = x[j][0] - x[j - 1][0]; i < n; ++i) {
                  for (k = 0, s3 = (data[i][j][1] - data[i][j - 1][1]) / (2 * dx); k < i; ++k) {
                    s3 += (data[k][j][1] - data[k][j - 1][1]) / dx;
                  }
                  s2 += s3 * data[i][j][1];
                }
                y0[j] = o -= s1 ? s2 / s1 * dx : 0;
                if (o < o0)
                  o0 = o;
              }
              for (j = 0; j < m; ++j)
                y0[j] -= o0;
              return y0;
            },
            expand: function (data) {
              var n = data.length, m = data[0].length, k = 1 / n, i, j, o, y0 = [];
              for (j = 0; j < m; ++j) {
                for (i = 0, o = 0; i < n; i++)
                  o += data[i][j][1];
                if (o)
                  for (i = 0; i < n; i++)
                    data[i][j][1] /= o;
                else
                  for (i = 0; i < n; i++)
                    data[i][j][1] = k;
              }
              for (j = 0; j < m; ++j)
                y0[j] = 0;
              return y0;
            },
            zero: d3_layout_stackOffsetZero
          });
        function d3_layout_stackOrderDefault(data) {
          return d3.range(data.length);
        }
        function d3_layout_stackOffsetZero(data) {
          var j = -1, m = data[0].length, y0 = [];
          while (++j < m)
            y0[j] = 0;
          return y0;
        }
        function d3_layout_stackMaxIndex(array) {
          var i = 1, j = 0, v = array[0][1], k, n = array.length;
          for (; i < n; ++i) {
            if ((k = array[i][1]) > v) {
              j = i;
              v = k;
            }
          }
          return j;
        }
        function d3_layout_stackReduceSum(d) {
          return d.reduce(d3_layout_stackSum, 0);
        }
        function d3_layout_stackSum(p, d) {
          return p + d[1];
        }
        d3.layout.histogram = function () {
          var frequency = true, valuer = Number, ranger = d3_layout_histogramRange, binner = d3_layout_histogramBinSturges;
          function histogram(data, i) {
            var bins = [], values = data.map(valuer, this), range = ranger.call(this, values, i), thresholds = binner.call(this, range, values, i), bin, i = -1, n = values.length, m = thresholds.length - 1, k = frequency ? 1 : 1 / n, x;
            while (++i < m) {
              bin = bins[i] = [];
              bin.dx = thresholds[i + 1] - (bin.x = thresholds[i]);
              bin.y = 0;
            }
            if (m > 0) {
              i = -1;
              while (++i < n) {
                x = values[i];
                if (x >= range[0] && x <= range[1]) {
                  bin = bins[d3.bisect(thresholds, x, 1, m) - 1];
                  bin.y += k;
                  bin.push(data[i]);
                }
              }
            }
            return bins;
          }
          histogram.value = function (x) {
            if (!arguments.length)
              return valuer;
            valuer = x;
            return histogram;
          };
          histogram.range = function (x) {
            if (!arguments.length)
              return ranger;
            ranger = d3_functor(x);
            return histogram;
          };
          histogram.bins = function (x) {
            if (!arguments.length)
              return binner;
            binner = typeof x === 'number' ? function (range) {
              return d3_layout_histogramBinFixed(range, x);
            } : d3_functor(x);
            return histogram;
          };
          histogram.frequency = function (x) {
            if (!arguments.length)
              return frequency;
            frequency = !!x;
            return histogram;
          };
          return histogram;
        };
        function d3_layout_histogramBinSturges(range, values) {
          return d3_layout_histogramBinFixed(range, Math.ceil(Math.log(values.length) / Math.LN2 + 1));
        }
        function d3_layout_histogramBinFixed(range, n) {
          var x = -1, b = +range[0], m = (range[1] - b) / n, f = [];
          while (++x <= n)
            f[x] = m * x + b;
          return f;
        }
        function d3_layout_histogramRange(values) {
          return [
            d3.min(values),
            d3.max(values)
          ];
        }
        d3.layout.tree = function () {
          var hierarchy = d3.layout.hierarchy().sort(null).value(null), separation = d3_layout_treeSeparation, size = [
              1,
              1
            ], nodeSize = false;
          function tree(d, i) {
            var nodes = hierarchy.call(this, d, i), root = nodes[0];
            function firstWalk(node, previousSibling) {
              var children = node.children, layout = node._tree;
              if (children && (n = children.length)) {
                var n, firstChild = children[0], previousChild, ancestor = firstChild, child, i = -1;
                while (++i < n) {
                  child = children[i];
                  firstWalk(child, previousChild);
                  ancestor = apportion(child, previousChild, ancestor);
                  previousChild = child;
                }
                d3_layout_treeShift(node);
                var midpoint = 0.5 * (firstChild._tree.prelim + child._tree.prelim);
                if (previousSibling) {
                  layout.prelim = previousSibling._tree.prelim + separation(node, previousSibling);
                  layout.mod = layout.prelim - midpoint;
                } else {
                  layout.prelim = midpoint;
                }
              } else {
                if (previousSibling) {
                  layout.prelim = previousSibling._tree.prelim + separation(node, previousSibling);
                }
              }
            }
            function secondWalk(node, x) {
              node.x = node._tree.prelim + x;
              var children = node.children;
              if (children && (n = children.length)) {
                var i = -1, n;
                x += node._tree.mod;
                while (++i < n) {
                  secondWalk(children[i], x);
                }
              }
            }
            function apportion(node, previousSibling, ancestor) {
              if (previousSibling) {
                var vip = node, vop = node, vim = previousSibling, vom = node.parent.children[0], sip = vip._tree.mod, sop = vop._tree.mod, sim = vim._tree.mod, som = vom._tree.mod, shift;
                while (vim = d3_layout_treeRight(vim), vip = d3_layout_treeLeft(vip), vim && vip) {
                  vom = d3_layout_treeLeft(vom);
                  vop = d3_layout_treeRight(vop);
                  vop._tree.ancestor = node;
                  shift = vim._tree.prelim + sim - vip._tree.prelim - sip + separation(vim, vip);
                  if (shift > 0) {
                    d3_layout_treeMove(d3_layout_treeAncestor(vim, node, ancestor), node, shift);
                    sip += shift;
                    sop += shift;
                  }
                  sim += vim._tree.mod;
                  sip += vip._tree.mod;
                  som += vom._tree.mod;
                  sop += vop._tree.mod;
                }
                if (vim && !d3_layout_treeRight(vop)) {
                  vop._tree.thread = vim;
                  vop._tree.mod += sim - sop;
                }
                if (vip && !d3_layout_treeLeft(vom)) {
                  vom._tree.thread = vip;
                  vom._tree.mod += sip - som;
                  ancestor = node;
                }
              }
              return ancestor;
            }
            d3_layout_treeVisitAfter(root, function (node, previousSibling) {
              node._tree = {
                ancestor: node,
                prelim: 0,
                mod: 0,
                change: 0,
                shift: 0,
                number: previousSibling ? previousSibling._tree.number + 1 : 0
              };
            });
            firstWalk(root);
            secondWalk(root, -root._tree.prelim);
            var left = d3_layout_treeSearch(root, d3_layout_treeLeftmost), right = d3_layout_treeSearch(root, d3_layout_treeRightmost), deep = d3_layout_treeSearch(root, d3_layout_treeDeepest), x0 = left.x - separation(left, right) / 2, x1 = right.x + separation(right, left) / 2, y1 = deep.depth || 1;
            d3_layout_treeVisitAfter(root, nodeSize ? function (node) {
              node.x *= size[0];
              node.y = node.depth * size[1];
              delete node._tree;
            } : function (node) {
              node.x = (node.x - x0) / (x1 - x0) * size[0];
              node.y = node.depth / y1 * size[1];
              delete node._tree;
            });
            return nodes;
          }
          tree.separation = function (x) {
            if (!arguments.length)
              return separation;
            separation = x;
            return tree;
          };
          tree.size = function (x) {
            if (!arguments.length)
              return nodeSize ? null : size;
            nodeSize = (size = x) == null;
            return tree;
          };
          tree.nodeSize = function (x) {
            if (!arguments.length)
              return nodeSize ? size : null;
            nodeSize = (size = x) != null;
            return tree;
          };
          return d3_layout_hierarchyRebind(tree, hierarchy);
        };
        function d3_layout_treeSeparation(a, b) {
          return a.parent == b.parent ? 1 : 2;
        }
        function d3_layout_treeLeft(node) {
          var children = node.children;
          return children && children.length ? children[0] : node._tree.thread;
        }
        function d3_layout_treeRight(node) {
          var children = node.children, n;
          return children && (n = children.length) ? children[n - 1] : node._tree.thread;
        }
        function d3_layout_treeSearch(node, compare) {
          var children = node.children;
          if (children && (n = children.length)) {
            var child, n, i = -1;
            while (++i < n) {
              if (compare(child = d3_layout_treeSearch(children[i], compare), node) > 0) {
                node = child;
              }
            }
          }
          return node;
        }
        function d3_layout_treeRightmost(a, b) {
          return a.x - b.x;
        }
        function d3_layout_treeLeftmost(a, b) {
          return b.x - a.x;
        }
        function d3_layout_treeDeepest(a, b) {
          return a.depth - b.depth;
        }
        function d3_layout_treeVisitAfter(node, callback) {
          function visit(node, previousSibling) {
            var children = node.children;
            if (children && (n = children.length)) {
              var child, previousChild = null, i = -1, n;
              while (++i < n) {
                child = children[i];
                visit(child, previousChild);
                previousChild = child;
              }
            }
            callback(node, previousSibling);
          }
          visit(node, null);
        }
        function d3_layout_treeShift(node) {
          var shift = 0, change = 0, children = node.children, i = children.length, child;
          while (--i >= 0) {
            child = children[i]._tree;
            child.prelim += shift;
            child.mod += shift;
            shift += child.shift + (change += child.change);
          }
        }
        function d3_layout_treeMove(ancestor, node, shift) {
          ancestor = ancestor._tree;
          node = node._tree;
          var change = shift / (node.number - ancestor.number);
          ancestor.change += change;
          node.change -= change;
          node.shift += shift;
          node.prelim += shift;
          node.mod += shift;
        }
        function d3_layout_treeAncestor(vim, node, ancestor) {
          return vim._tree.ancestor.parent == node.parent ? vim._tree.ancestor : ancestor;
        }
        d3.layout.pack = function () {
          var hierarchy = d3.layout.hierarchy().sort(d3_layout_packSort), padding = 0, size = [
              1,
              1
            ], radius;
          function pack(d, i) {
            var nodes = hierarchy.call(this, d, i), root = nodes[0], w = size[0], h = size[1], r = radius == null ? Math.sqrt : typeof radius === 'function' ? radius : function () {
                return radius;
              };
            root.x = root.y = 0;
            d3_layout_treeVisitAfter(root, function (d) {
              d.r = +r(d.value);
            });
            d3_layout_treeVisitAfter(root, d3_layout_packSiblings);
            if (padding) {
              var dr = padding * (radius ? 1 : Math.max(2 * root.r / w, 2 * root.r / h)) / 2;
              d3_layout_treeVisitAfter(root, function (d) {
                d.r += dr;
              });
              d3_layout_treeVisitAfter(root, d3_layout_packSiblings);
              d3_layout_treeVisitAfter(root, function (d) {
                d.r -= dr;
              });
            }
            d3_layout_packTransform(root, w / 2, h / 2, radius ? 1 : 1 / Math.max(2 * root.r / w, 2 * root.r / h));
            return nodes;
          }
          pack.size = function (_) {
            if (!arguments.length)
              return size;
            size = _;
            return pack;
          };
          pack.radius = function (_) {
            if (!arguments.length)
              return radius;
            radius = _ == null || typeof _ === 'function' ? _ : +_;
            return pack;
          };
          pack.padding = function (_) {
            if (!arguments.length)
              return padding;
            padding = +_;
            return pack;
          };
          return d3_layout_hierarchyRebind(pack, hierarchy);
        };
        function d3_layout_packSort(a, b) {
          return a.value - b.value;
        }
        function d3_layout_packInsert(a, b) {
          var c = a._pack_next;
          a._pack_next = b;
          b._pack_prev = a;
          b._pack_next = c;
          c._pack_prev = b;
        }
        function d3_layout_packSplice(a, b) {
          a._pack_next = b;
          b._pack_prev = a;
        }
        function d3_layout_packIntersects(a, b) {
          var dx = b.x - a.x, dy = b.y - a.y, dr = a.r + b.r;
          return 0.999 * dr * dr > dx * dx + dy * dy;
        }
        function d3_layout_packSiblings(node) {
          if (!(nodes = node.children) || !(n = nodes.length))
            return;
          var nodes, xMin = Infinity, xMax = -Infinity, yMin = Infinity, yMax = -Infinity, a, b, c, i, j, k, n;
          function bound(node) {
            xMin = Math.min(node.x - node.r, xMin);
            xMax = Math.max(node.x + node.r, xMax);
            yMin = Math.min(node.y - node.r, yMin);
            yMax = Math.max(node.y + node.r, yMax);
          }
          nodes.forEach(d3_layout_packLink);
          a = nodes[0];
          a.x = -a.r;
          a.y = 0;
          bound(a);
          if (n > 1) {
            b = nodes[1];
            b.x = b.r;
            b.y = 0;
            bound(b);
            if (n > 2) {
              c = nodes[2];
              d3_layout_packPlace(a, b, c);
              bound(c);
              d3_layout_packInsert(a, c);
              a._pack_prev = c;
              d3_layout_packInsert(c, b);
              b = a._pack_next;
              for (i = 3; i < n; i++) {
                d3_layout_packPlace(a, b, c = nodes[i]);
                var isect = 0, s1 = 1, s2 = 1;
                for (j = b._pack_next; j !== b; j = j._pack_next, s1++) {
                  if (d3_layout_packIntersects(j, c)) {
                    isect = 1;
                    break;
                  }
                }
                if (isect == 1) {
                  for (k = a._pack_prev; k !== j._pack_prev; k = k._pack_prev, s2++) {
                    if (d3_layout_packIntersects(k, c)) {
                      break;
                    }
                  }
                }
                if (isect) {
                  if (s1 < s2 || s1 == s2 && b.r < a.r)
                    d3_layout_packSplice(a, b = j);
                  else
                    d3_layout_packSplice(a = k, b);
                  i--;
                } else {
                  d3_layout_packInsert(a, c);
                  b = c;
                  bound(c);
                }
              }
            }
          }
          var cx = (xMin + xMax) / 2, cy = (yMin + yMax) / 2, cr = 0;
          for (i = 0; i < n; i++) {
            c = nodes[i];
            c.x -= cx;
            c.y -= cy;
            cr = Math.max(cr, c.r + Math.sqrt(c.x * c.x + c.y * c.y));
          }
          node.r = cr;
          nodes.forEach(d3_layout_packUnlink);
        }
        function d3_layout_packLink(node) {
          node._pack_next = node._pack_prev = node;
        }
        function d3_layout_packUnlink(node) {
          delete node._pack_next;
          delete node._pack_prev;
        }
        function d3_layout_packTransform(node, x, y, k) {
          var children = node.children;
          node.x = x += k * node.x;
          node.y = y += k * node.y;
          node.r *= k;
          if (children) {
            var i = -1, n = children.length;
            while (++i < n)
              d3_layout_packTransform(children[i], x, y, k);
          }
        }
        function d3_layout_packPlace(a, b, c) {
          var db = a.r + c.r, dx = b.x - a.x, dy = b.y - a.y;
          if (db && (dx || dy)) {
            var da = b.r + c.r, dc = dx * dx + dy * dy;
            da *= da;
            db *= db;
            var x = 0.5 + (db - da) / (2 * dc), y = Math.sqrt(Math.max(0, 2 * da * (db + dc) - (db -= dc) * db - da * da)) / (2 * dc);
            c.x = a.x + x * dx + y * dy;
            c.y = a.y + x * dy - y * dx;
          } else {
            c.x = a.x + db;
            c.y = a.y;
          }
        }
        d3.layout.cluster = function () {
          var hierarchy = d3.layout.hierarchy().sort(null).value(null), separation = d3_layout_treeSeparation, size = [
              1,
              1
            ], nodeSize = false;
          function cluster(d, i) {
            var nodes = hierarchy.call(this, d, i), root = nodes[0], previousNode, x = 0;
            d3_layout_treeVisitAfter(root, function (node) {
              var children = node.children;
              if (children && children.length) {
                node.x = d3_layout_clusterX(children);
                node.y = d3_layout_clusterY(children);
              } else {
                node.x = previousNode ? x += separation(node, previousNode) : 0;
                node.y = 0;
                previousNode = node;
              }
            });
            var left = d3_layout_clusterLeft(root), right = d3_layout_clusterRight(root), x0 = left.x - separation(left, right) / 2, x1 = right.x + separation(right, left) / 2;
            d3_layout_treeVisitAfter(root, nodeSize ? function (node) {
              node.x = (node.x - root.x) * size[0];
              node.y = (root.y - node.y) * size[1];
            } : function (node) {
              node.x = (node.x - x0) / (x1 - x0) * size[0];
              node.y = (1 - (root.y ? node.y / root.y : 1)) * size[1];
            });
            return nodes;
          }
          cluster.separation = function (x) {
            if (!arguments.length)
              return separation;
            separation = x;
            return cluster;
          };
          cluster.size = function (x) {
            if (!arguments.length)
              return nodeSize ? null : size;
            nodeSize = (size = x) == null;
            return cluster;
          };
          cluster.nodeSize = function (x) {
            if (!arguments.length)
              return nodeSize ? size : null;
            nodeSize = (size = x) != null;
            return cluster;
          };
          return d3_layout_hierarchyRebind(cluster, hierarchy);
        };
        function d3_layout_clusterY(children) {
          return 1 + d3.max(children, function (child) {
            return child.y;
          });
        }
        function d3_layout_clusterX(children) {
          return children.reduce(function (x, child) {
            return x + child.x;
          }, 0) / children.length;
        }
        function d3_layout_clusterLeft(node) {
          var children = node.children;
          return children && children.length ? d3_layout_clusterLeft(children[0]) : node;
        }
        function d3_layout_clusterRight(node) {
          var children = node.children, n;
          return children && (n = children.length) ? d3_layout_clusterRight(children[n - 1]) : node;
        }
        d3.layout.treemap = function () {
          var hierarchy = d3.layout.hierarchy(), round = Math.round, size = [
              1,
              1
            ], padding = null, pad = d3_layout_treemapPadNull, sticky = false, stickies, mode = 'squarify', ratio = 0.5 * (1 + Math.sqrt(5));
          function scale(children, k) {
            var i = -1, n = children.length, child, area;
            while (++i < n) {
              area = (child = children[i]).value * (k < 0 ? 0 : k);
              child.area = isNaN(area) || area <= 0 ? 0 : area;
            }
          }
          function squarify(node) {
            var children = node.children;
            if (children && children.length) {
              var rect = pad(node), row = [], remaining = children.slice(), child, best = Infinity, score, u = mode === 'slice' ? rect.dx : mode === 'dice' ? rect.dy : mode === 'slice-dice' ? node.depth & 1 ? rect.dy : rect.dx : Math.min(rect.dx, rect.dy), n;
              scale(remaining, rect.dx * rect.dy / node.value);
              row.area = 0;
              while ((n = remaining.length) > 0) {
                row.push(child = remaining[n - 1]);
                row.area += child.area;
                if (mode !== 'squarify' || (score = worst(row, u)) <= best) {
                  remaining.pop();
                  best = score;
                } else {
                  row.area -= row.pop().area;
                  position(row, u, rect, false);
                  u = Math.min(rect.dx, rect.dy);
                  row.length = row.area = 0;
                  best = Infinity;
                }
              }
              if (row.length) {
                position(row, u, rect, true);
                row.length = row.area = 0;
              }
              children.forEach(squarify);
            }
          }
          function stickify(node) {
            var children = node.children;
            if (children && children.length) {
              var rect = pad(node), remaining = children.slice(), child, row = [];
              scale(remaining, rect.dx * rect.dy / node.value);
              row.area = 0;
              while (child = remaining.pop()) {
                row.push(child);
                row.area += child.area;
                if (child.z != null) {
                  position(row, child.z ? rect.dx : rect.dy, rect, !remaining.length);
                  row.length = row.area = 0;
                }
              }
              children.forEach(stickify);
            }
          }
          function worst(row, u) {
            var s = row.area, r, rmax = 0, rmin = Infinity, i = -1, n = row.length;
            while (++i < n) {
              if (!(r = row[i].area))
                continue;
              if (r < rmin)
                rmin = r;
              if (r > rmax)
                rmax = r;
            }
            s *= s;
            u *= u;
            return s ? Math.max(u * rmax * ratio / s, s / (u * rmin * ratio)) : Infinity;
          }
          function position(row, u, rect, flush) {
            var i = -1, n = row.length, x = rect.x, y = rect.y, v = u ? round(row.area / u) : 0, o;
            if (u == rect.dx) {
              if (flush || v > rect.dy)
                v = rect.dy;
              while (++i < n) {
                o = row[i];
                o.x = x;
                o.y = y;
                o.dy = v;
                x += o.dx = Math.min(rect.x + rect.dx - x, v ? round(o.area / v) : 0);
              }
              o.z = true;
              o.dx += rect.x + rect.dx - x;
              rect.y += v;
              rect.dy -= v;
            } else {
              if (flush || v > rect.dx)
                v = rect.dx;
              while (++i < n) {
                o = row[i];
                o.x = x;
                o.y = y;
                o.dx = v;
                y += o.dy = Math.min(rect.y + rect.dy - y, v ? round(o.area / v) : 0);
              }
              o.z = false;
              o.dy += rect.y + rect.dy - y;
              rect.x += v;
              rect.dx -= v;
            }
          }
          function treemap(d) {
            var nodes = stickies || hierarchy(d), root = nodes[0];
            root.x = 0;
            root.y = 0;
            root.dx = size[0];
            root.dy = size[1];
            if (stickies)
              hierarchy.revalue(root);
            scale([root], root.dx * root.dy / root.value);
            (stickies ? stickify : squarify)(root);
            if (sticky)
              stickies = nodes;
            return nodes;
          }
          treemap.size = function (x) {
            if (!arguments.length)
              return size;
            size = x;
            return treemap;
          };
          treemap.padding = function (x) {
            if (!arguments.length)
              return padding;
            function padFunction(node) {
              var p = x.call(treemap, node, node.depth);
              return p == null ? d3_layout_treemapPadNull(node) : d3_layout_treemapPad(node, typeof p === 'number' ? [
                p,
                p,
                p,
                p
              ] : p);
            }
            function padConstant(node) {
              return d3_layout_treemapPad(node, x);
            }
            var type;
            pad = (padding = x) == null ? d3_layout_treemapPadNull : (type = typeof x) === 'function' ? padFunction : type === 'number' ? (x = [
              x,
              x,
              x,
              x
            ], padConstant) : padConstant;
            return treemap;
          };
          treemap.round = function (x) {
            if (!arguments.length)
              return round != Number;
            round = x ? Math.round : Number;
            return treemap;
          };
          treemap.sticky = function (x) {
            if (!arguments.length)
              return sticky;
            sticky = x;
            stickies = null;
            return treemap;
          };
          treemap.ratio = function (x) {
            if (!arguments.length)
              return ratio;
            ratio = x;
            return treemap;
          };
          treemap.mode = function (x) {
            if (!arguments.length)
              return mode;
            mode = x + '';
            return treemap;
          };
          return d3_layout_hierarchyRebind(treemap, hierarchy);
        };
        function d3_layout_treemapPadNull(node) {
          return {
            x: node.x,
            y: node.y,
            dx: node.dx,
            dy: node.dy
          };
        }
        function d3_layout_treemapPad(node, padding) {
          var x = node.x + padding[3], y = node.y + padding[0], dx = node.dx - padding[1] - padding[3], dy = node.dy - padding[0] - padding[2];
          if (dx < 0) {
            x += dx / 2;
            dx = 0;
          }
          if (dy < 0) {
            y += dy / 2;
            dy = 0;
          }
          return {
            x: x,
            y: y,
            dx: dx,
            dy: dy
          };
        }
        d3.random = {
          normal: function (µ, σ) {
            var n = arguments.length;
            if (n < 2)
              σ = 1;
            if (n < 1)
              µ = 0;
            return function () {
              var x, y, r;
              do {
                x = Math.random() * 2 - 1;
                y = Math.random() * 2 - 1;
                r = x * x + y * y;
              } while (!r || r > 1);
              return µ + σ * x * Math.sqrt(-2 * Math.log(r) / r);
            };
          },
          logNormal: function () {
            var random = d3.random.normal.apply(d3, arguments);
            return function () {
              return Math.exp(random());
            };
          },
          irwinHall: function (m) {
            return function () {
              for (var s = 0, j = 0; j < m; j++)
                s += Math.random();
              return s / m;
            };
          }
        };
        d3.scale = {};
        function d3_scaleExtent(domain) {
          var start = domain[0], stop = domain[domain.length - 1];
          return start < stop ? [
            start,
            stop
          ] : [
            stop,
            start
          ];
        }
        function d3_scaleRange(scale) {
          return scale.rangeExtent ? scale.rangeExtent() : d3_scaleExtent(scale.range());
        }
        function d3_scale_bilinear(domain, range, uninterpolate, interpolate) {
          var u = uninterpolate(domain[0], domain[1]), i = interpolate(range[0], range[1]);
          return function (x) {
            return i(u(x));
          };
        }
        function d3_scale_nice(domain, nice) {
          var i0 = 0, i1 = domain.length - 1, x0 = domain[i0], x1 = domain[i1], dx;
          if (x1 < x0) {
            dx = i0, i0 = i1, i1 = dx;
            dx = x0, x0 = x1, x1 = dx;
          }
          domain[i0] = nice.floor(x0);
          domain[i1] = nice.ceil(x1);
          return domain;
        }
        function d3_scale_niceStep(step) {
          return step ? {
            floor: function (x) {
              return Math.floor(x / step) * step;
            },
            ceil: function (x) {
              return Math.ceil(x / step) * step;
            }
          } : d3_scale_niceIdentity;
        }
        var d3_scale_niceIdentity = {
            floor: d3_identity,
            ceil: d3_identity
          };
        function d3_scale_polylinear(domain, range, uninterpolate, interpolate) {
          var u = [], i = [], j = 0, k = Math.min(domain.length, range.length) - 1;
          if (domain[k] < domain[0]) {
            domain = domain.slice().reverse();
            range = range.slice().reverse();
          }
          while (++j <= k) {
            u.push(uninterpolate(domain[j - 1], domain[j]));
            i.push(interpolate(range[j - 1], range[j]));
          }
          return function (x) {
            var j = d3.bisect(domain, x, 1, k) - 1;
            return i[j](u[j](x));
          };
        }
        d3.scale.linear = function () {
          return d3_scale_linear([
            0,
            1
          ], [
            0,
            1
          ], d3_interpolate, false);
        };
        function d3_scale_linear(domain, range, interpolate, clamp) {
          var output, input;
          function rescale() {
            var linear = Math.min(domain.length, range.length) > 2 ? d3_scale_polylinear : d3_scale_bilinear, uninterpolate = clamp ? d3_uninterpolateClamp : d3_uninterpolateNumber;
            output = linear(domain, range, uninterpolate, interpolate);
            input = linear(range, domain, uninterpolate, d3_interpolate);
            return scale;
          }
          function scale(x) {
            return output(x);
          }
          scale.invert = function (y) {
            return input(y);
          };
          scale.domain = function (x) {
            if (!arguments.length)
              return domain;
            domain = x.map(Number);
            return rescale();
          };
          scale.range = function (x) {
            if (!arguments.length)
              return range;
            range = x;
            return rescale();
          };
          scale.rangeRound = function (x) {
            return scale.range(x).interpolate(d3_interpolateRound);
          };
          scale.clamp = function (x) {
            if (!arguments.length)
              return clamp;
            clamp = x;
            return rescale();
          };
          scale.interpolate = function (x) {
            if (!arguments.length)
              return interpolate;
            interpolate = x;
            return rescale();
          };
          scale.ticks = function (m) {
            return d3_scale_linearTicks(domain, m);
          };
          scale.tickFormat = function (m, format) {
            return d3_scale_linearTickFormat(domain, m, format);
          };
          scale.nice = function (m) {
            d3_scale_linearNice(domain, m);
            return rescale();
          };
          scale.copy = function () {
            return d3_scale_linear(domain, range, interpolate, clamp);
          };
          return rescale();
        }
        function d3_scale_linearRebind(scale, linear) {
          return d3.rebind(scale, linear, 'range', 'rangeRound', 'interpolate', 'clamp');
        }
        function d3_scale_linearNice(domain, m) {
          return d3_scale_nice(domain, d3_scale_niceStep(d3_scale_linearTickRange(domain, m)[2]));
        }
        function d3_scale_linearTickRange(domain, m) {
          if (m == null)
            m = 10;
          var extent = d3_scaleExtent(domain), span = extent[1] - extent[0], step = Math.pow(10, Math.floor(Math.log(span / m) / Math.LN10)), err = m / span * step;
          if (err <= 0.15)
            step *= 10;
          else if (err <= 0.35)
            step *= 5;
          else if (err <= 0.75)
            step *= 2;
          extent[0] = Math.ceil(extent[0] / step) * step;
          extent[1] = Math.floor(extent[1] / step) * step + step * 0.5;
          extent[2] = step;
          return extent;
        }
        function d3_scale_linearTicks(domain, m) {
          return d3.range.apply(d3, d3_scale_linearTickRange(domain, m));
        }
        function d3_scale_linearTickFormat(domain, m, format) {
          var precision = -Math.floor(Math.log(d3_scale_linearTickRange(domain, m)[2]) / Math.LN10 + 0.01);
          return d3.format(format ? format.replace(d3_format_re, function (a, b, c, d, e, f, g, h, i, j) {
            return [
              b,
              c,
              d,
              e,
              f,
              g,
              h,
              i || '.' + (precision - (j === '%') * 2),
              j
            ].join('');
          }) : ',.' + precision + 'f');
        }
        d3.scale.log = function () {
          return d3_scale_log(d3.scale.linear().domain([
            0,
            1
          ]), 10, true, [
            1,
            10
          ]);
        };
        function d3_scale_log(linear, base, positive, domain) {
          function log(x) {
            return (positive ? Math.log(x < 0 ? 0 : x) : -Math.log(x > 0 ? 0 : -x)) / Math.log(base);
          }
          function pow(x) {
            return positive ? Math.pow(base, x) : -Math.pow(base, -x);
          }
          function scale(x) {
            return linear(log(x));
          }
          scale.invert = function (x) {
            return pow(linear.invert(x));
          };
          scale.domain = function (x) {
            if (!arguments.length)
              return domain;
            positive = x[0] >= 0;
            linear.domain((domain = x.map(Number)).map(log));
            return scale;
          };
          scale.base = function (_) {
            if (!arguments.length)
              return base;
            base = +_;
            linear.domain(domain.map(log));
            return scale;
          };
          scale.nice = function () {
            var niced = d3_scale_nice(domain.map(log), positive ? Math : d3_scale_logNiceNegative);
            linear.domain(niced);
            domain = niced.map(pow);
            return scale;
          };
          scale.ticks = function () {
            var extent = d3_scaleExtent(domain), ticks = [], u = extent[0], v = extent[1], i = Math.floor(log(u)), j = Math.ceil(log(v)), n = base % 1 ? 2 : base;
            if (isFinite(j - i)) {
              if (positive) {
                for (; i < j; i++)
                  for (var k = 1; k < n; k++)
                    ticks.push(pow(i) * k);
                ticks.push(pow(i));
              } else {
                ticks.push(pow(i));
                for (; i++ < j;)
                  for (var k = n - 1; k > 0; k--)
                    ticks.push(pow(i) * k);
              }
              for (i = 0; ticks[i] < u; i++) {
              }
              for (j = ticks.length; ticks[j - 1] > v; j--) {
              }
              ticks = ticks.slice(i, j);
            }
            return ticks;
          };
          scale.tickFormat = function (n, format) {
            if (!arguments.length)
              return d3_scale_logFormat;
            if (arguments.length < 2)
              format = d3_scale_logFormat;
            else if (typeof format !== 'function')
              format = d3.format(format);
            var k = Math.max(0.1, n / scale.ticks().length), f = positive ? (e = 1e-12, Math.ceil) : (e = -1e-12, Math.floor), e;
            return function (d) {
              return d / pow(f(log(d) + e)) <= k ? format(d) : '';
            };
          };
          scale.copy = function () {
            return d3_scale_log(linear.copy(), base, positive, domain);
          };
          return d3_scale_linearRebind(scale, linear);
        }
        var d3_scale_logFormat = d3.format('.0e'), d3_scale_logNiceNegative = {
            floor: function (x) {
              return -Math.ceil(-x);
            },
            ceil: function (x) {
              return -Math.floor(-x);
            }
          };
        d3.scale.pow = function () {
          return d3_scale_pow(d3.scale.linear(), 1, [
            0,
            1
          ]);
        };
        function d3_scale_pow(linear, exponent, domain) {
          var powp = d3_scale_powPow(exponent), powb = d3_scale_powPow(1 / exponent);
          function scale(x) {
            return linear(powp(x));
          }
          scale.invert = function (x) {
            return powb(linear.invert(x));
          };
          scale.domain = function (x) {
            if (!arguments.length)
              return domain;
            linear.domain((domain = x.map(Number)).map(powp));
            return scale;
          };
          scale.ticks = function (m) {
            return d3_scale_linearTicks(domain, m);
          };
          scale.tickFormat = function (m, format) {
            return d3_scale_linearTickFormat(domain, m, format);
          };
          scale.nice = function (m) {
            return scale.domain(d3_scale_linearNice(domain, m));
          };
          scale.exponent = function (x) {
            if (!arguments.length)
              return exponent;
            powp = d3_scale_powPow(exponent = x);
            powb = d3_scale_powPow(1 / exponent);
            linear.domain(domain.map(powp));
            return scale;
          };
          scale.copy = function () {
            return d3_scale_pow(linear.copy(), exponent, domain);
          };
          return d3_scale_linearRebind(scale, linear);
        }
        function d3_scale_powPow(e) {
          return function (x) {
            return x < 0 ? -Math.pow(-x, e) : Math.pow(x, e);
          };
        }
        d3.scale.sqrt = function () {
          return d3.scale.pow().exponent(0.5);
        };
        d3.scale.ordinal = function () {
          return d3_scale_ordinal([], {
            t: 'range',
            a: [[]]
          });
        };
        function d3_scale_ordinal(domain, ranger) {
          var index, range, rangeBand;
          function scale(x) {
            return range[((index.get(x) || ranger.t === 'range' && index.set(x, domain.push(x))) - 1) % range.length];
          }
          function steps(start, step) {
            return d3.range(domain.length).map(function (i) {
              return start + step * i;
            });
          }
          scale.domain = function (x) {
            if (!arguments.length)
              return domain;
            domain = [];
            index = new d3_Map();
            var i = -1, n = x.length, xi;
            while (++i < n)
              if (!index.has(xi = x[i]))
                index.set(xi, domain.push(xi));
            return scale[ranger.t].apply(scale, ranger.a);
          };
          scale.range = function (x) {
            if (!arguments.length)
              return range;
            range = x;
            rangeBand = 0;
            ranger = {
              t: 'range',
              a: arguments
            };
            return scale;
          };
          scale.rangePoints = function (x, padding) {
            if (arguments.length < 2)
              padding = 0;
            var start = x[0], stop = x[1], step = (stop - start) / (Math.max(1, domain.length - 1) + padding);
            range = steps(domain.length < 2 ? (start + stop) / 2 : start + step * padding / 2, step);
            rangeBand = 0;
            ranger = {
              t: 'rangePoints',
              a: arguments
            };
            return scale;
          };
          scale.rangeBands = function (x, padding, outerPadding) {
            if (arguments.length < 2)
              padding = 0;
            if (arguments.length < 3)
              outerPadding = padding;
            var reverse = x[1] < x[0], start = x[reverse - 0], stop = x[1 - reverse], step = (stop - start) / (domain.length - padding + 2 * outerPadding);
            range = steps(start + step * outerPadding, step);
            if (reverse)
              range.reverse();
            rangeBand = step * (1 - padding);
            ranger = {
              t: 'rangeBands',
              a: arguments
            };
            return scale;
          };
          scale.rangeRoundBands = function (x, padding, outerPadding) {
            if (arguments.length < 2)
              padding = 0;
            if (arguments.length < 3)
              outerPadding = padding;
            var reverse = x[1] < x[0], start = x[reverse - 0], stop = x[1 - reverse], step = Math.floor((stop - start) / (domain.length - padding + 2 * outerPadding)), error = stop - start - (domain.length - padding) * step;
            range = steps(start + Math.round(error / 2), step);
            if (reverse)
              range.reverse();
            rangeBand = Math.round(step * (1 - padding));
            ranger = {
              t: 'rangeRoundBands',
              a: arguments
            };
            return scale;
          };
          scale.rangeBand = function () {
            return rangeBand;
          };
          scale.rangeExtent = function () {
            return d3_scaleExtent(ranger.a[0]);
          };
          scale.copy = function () {
            return d3_scale_ordinal(domain, ranger);
          };
          return scale.domain(domain);
        }
        d3.scale.category10 = function () {
          return d3.scale.ordinal().range(d3_category10);
        };
        d3.scale.category20 = function () {
          return d3.scale.ordinal().range(d3_category20);
        };
        d3.scale.category20b = function () {
          return d3.scale.ordinal().range(d3_category20b);
        };
        d3.scale.category20c = function () {
          return d3.scale.ordinal().range(d3_category20c);
        };
        var d3_category10 = [
            2062260,
            16744206,
            2924588,
            14034728,
            9725885,
            9197131,
            14907330,
            8355711,
            12369186,
            1556175
          ].map(d3_rgbString);
        var d3_category20 = [
            2062260,
            11454440,
            16744206,
            16759672,
            2924588,
            10018698,
            14034728,
            16750742,
            9725885,
            12955861,
            9197131,
            12885140,
            14907330,
            16234194,
            8355711,
            13092807,
            12369186,
            14408589,
            1556175,
            10410725
          ].map(d3_rgbString);
        var d3_category20b = [
            3750777,
            5395619,
            7040719,
            10264286,
            6519097,
            9216594,
            11915115,
            13556636,
            9202993,
            12426809,
            15186514,
            15190932,
            8666169,
            11356490,
            14049643,
            15177372,
            8077683,
            10834324,
            13528509,
            14589654
          ].map(d3_rgbString);
        var d3_category20c = [
            3244733,
            7057110,
            10406625,
            13032431,
            15095053,
            16616764,
            16625259,
            16634018,
            3253076,
            7652470,
            10607003,
            13101504,
            7695281,
            10394312,
            12369372,
            14342891,
            6513507,
            9868950,
            12434877,
            14277081
          ].map(d3_rgbString);
        d3.scale.quantile = function () {
          return d3_scale_quantile([], []);
        };
        function d3_scale_quantile(domain, range) {
          var thresholds;
          function rescale() {
            var k = 0, q = range.length;
            thresholds = [];
            while (++k < q)
              thresholds[k - 1] = d3.quantile(domain, k / q);
            return scale;
          }
          function scale(x) {
            if (!isNaN(x = +x))
              return range[d3.bisect(thresholds, x)];
          }
          scale.domain = function (x) {
            if (!arguments.length)
              return domain;
            domain = x.filter(function (d) {
              return !isNaN(d);
            }).sort(d3.ascending);
            return rescale();
          };
          scale.range = function (x) {
            if (!arguments.length)
              return range;
            range = x;
            return rescale();
          };
          scale.quantiles = function () {
            return thresholds;
          };
          scale.invertExtent = function (y) {
            y = range.indexOf(y);
            return y < 0 ? [
              NaN,
              NaN
            ] : [
              y > 0 ? thresholds[y - 1] : domain[0],
              y < thresholds.length ? thresholds[y] : domain[domain.length - 1]
            ];
          };
          scale.copy = function () {
            return d3_scale_quantile(domain, range);
          };
          return rescale();
        }
        d3.scale.quantize = function () {
          return d3_scale_quantize(0, 1, [
            0,
            1
          ]);
        };
        function d3_scale_quantize(x0, x1, range) {
          var kx, i;
          function scale(x) {
            return range[Math.max(0, Math.min(i, Math.floor(kx * (x - x0))))];
          }
          function rescale() {
            kx = range.length / (x1 - x0);
            i = range.length - 1;
            return scale;
          }
          scale.domain = function (x) {
            if (!arguments.length)
              return [
                x0,
                x1
              ];
            x0 = +x[0];
            x1 = +x[x.length - 1];
            return rescale();
          };
          scale.range = function (x) {
            if (!arguments.length)
              return range;
            range = x;
            return rescale();
          };
          scale.invertExtent = function (y) {
            y = range.indexOf(y);
            y = y < 0 ? NaN : y / kx + x0;
            return [
              y,
              y + 1 / kx
            ];
          };
          scale.copy = function () {
            return d3_scale_quantize(x0, x1, range);
          };
          return rescale();
        }
        d3.scale.threshold = function () {
          return d3_scale_threshold([0.5], [
            0,
            1
          ]);
        };
        function d3_scale_threshold(domain, range) {
          function scale(x) {
            if (x <= x)
              return range[d3.bisect(domain, x)];
          }
          scale.domain = function (_) {
            if (!arguments.length)
              return domain;
            domain = _;
            return scale;
          };
          scale.range = function (_) {
            if (!arguments.length)
              return range;
            range = _;
            return scale;
          };
          scale.invertExtent = function (y) {
            y = range.indexOf(y);
            return [
              domain[y - 1],
              domain[y]
            ];
          };
          scale.copy = function () {
            return d3_scale_threshold(domain, range);
          };
          return scale;
        }
        d3.scale.identity = function () {
          return d3_scale_identity([
            0,
            1
          ]);
        };
        function d3_scale_identity(domain) {
          function identity(x) {
            return +x;
          }
          identity.invert = identity;
          identity.domain = identity.range = function (x) {
            if (!arguments.length)
              return domain;
            domain = x.map(identity);
            return identity;
          };
          identity.ticks = function (m) {
            return d3_scale_linearTicks(domain, m);
          };
          identity.tickFormat = function (m, format) {
            return d3_scale_linearTickFormat(domain, m, format);
          };
          identity.copy = function () {
            return d3_scale_identity(domain);
          };
          return identity;
        }
        d3.svg = {};
        d3.svg.arc = function () {
          var innerRadius = d3_svg_arcInnerRadius, outerRadius = d3_svg_arcOuterRadius, startAngle = d3_svg_arcStartAngle, endAngle = d3_svg_arcEndAngle;
          function arc() {
            var r0 = innerRadius.apply(this, arguments), r1 = outerRadius.apply(this, arguments), a0 = startAngle.apply(this, arguments) + d3_svg_arcOffset, a1 = endAngle.apply(this, arguments) + d3_svg_arcOffset, da = (a1 < a0 && (da = a0, a0 = a1, a1 = da), a1 - a0), df = da < π ? '0' : '1', c0 = Math.cos(a0), s0 = Math.sin(a0), c1 = Math.cos(a1), s1 = Math.sin(a1);
            return da >= d3_svg_arcMax ? r0 ? 'M0,' + r1 + 'A' + r1 + ',' + r1 + ' 0 1,1 0,' + -r1 + 'A' + r1 + ',' + r1 + ' 0 1,1 0,' + r1 + 'M0,' + r0 + 'A' + r0 + ',' + r0 + ' 0 1,0 0,' + -r0 + 'A' + r0 + ',' + r0 + ' 0 1,0 0,' + r0 + 'Z' : 'M0,' + r1 + 'A' + r1 + ',' + r1 + ' 0 1,1 0,' + -r1 + 'A' + r1 + ',' + r1 + ' 0 1,1 0,' + r1 + 'Z' : r0 ? 'M' + r1 * c0 + ',' + r1 * s0 + 'A' + r1 + ',' + r1 + ' 0 ' + df + ',1 ' + r1 * c1 + ',' + r1 * s1 + 'L' + r0 * c1 + ',' + r0 * s1 + 'A' + r0 + ',' + r0 + ' 0 ' + df + ',0 ' + r0 * c0 + ',' + r0 * s0 + 'Z' : 'M' + r1 * c0 + ',' + r1 * s0 + 'A' + r1 + ',' + r1 + ' 0 ' + df + ',1 ' + r1 * c1 + ',' + r1 * s1 + 'L0,0' + 'Z';
          }
          arc.innerRadius = function (v) {
            if (!arguments.length)
              return innerRadius;
            innerRadius = d3_functor(v);
            return arc;
          };
          arc.outerRadius = function (v) {
            if (!arguments.length)
              return outerRadius;
            outerRadius = d3_functor(v);
            return arc;
          };
          arc.startAngle = function (v) {
            if (!arguments.length)
              return startAngle;
            startAngle = d3_functor(v);
            return arc;
          };
          arc.endAngle = function (v) {
            if (!arguments.length)
              return endAngle;
            endAngle = d3_functor(v);
            return arc;
          };
          arc.centroid = function () {
            var r = (innerRadius.apply(this, arguments) + outerRadius.apply(this, arguments)) / 2, a = (startAngle.apply(this, arguments) + endAngle.apply(this, arguments)) / 2 + d3_svg_arcOffset;
            return [
              Math.cos(a) * r,
              Math.sin(a) * r
            ];
          };
          return arc;
        };
        var d3_svg_arcOffset = -halfπ, d3_svg_arcMax = τ - ε;
        function d3_svg_arcInnerRadius(d) {
          return d.innerRadius;
        }
        function d3_svg_arcOuterRadius(d) {
          return d.outerRadius;
        }
        function d3_svg_arcStartAngle(d) {
          return d.startAngle;
        }
        function d3_svg_arcEndAngle(d) {
          return d.endAngle;
        }
        function d3_svg_line(projection) {
          var x = d3_geom_pointX, y = d3_geom_pointY, defined = d3_true, interpolate = d3_svg_lineLinear, interpolateKey = interpolate.key, tension = 0.7;
          function line(data) {
            var segments = [], points = [], i = -1, n = data.length, d, fx = d3_functor(x), fy = d3_functor(y);
            function segment() {
              segments.push('M', interpolate(projection(points), tension));
            }
            while (++i < n) {
              if (defined.call(this, d = data[i], i)) {
                points.push([
                  +fx.call(this, d, i),
                  +fy.call(this, d, i)
                ]);
              } else if (points.length) {
                segment();
                points = [];
              }
            }
            if (points.length)
              segment();
            return segments.length ? segments.join('') : null;
          }
          line.x = function (_) {
            if (!arguments.length)
              return x;
            x = _;
            return line;
          };
          line.y = function (_) {
            if (!arguments.length)
              return y;
            y = _;
            return line;
          };
          line.defined = function (_) {
            if (!arguments.length)
              return defined;
            defined = _;
            return line;
          };
          line.interpolate = function (_) {
            if (!arguments.length)
              return interpolateKey;
            if (typeof _ === 'function')
              interpolateKey = interpolate = _;
            else
              interpolateKey = (interpolate = d3_svg_lineInterpolators.get(_) || d3_svg_lineLinear).key;
            return line;
          };
          line.tension = function (_) {
            if (!arguments.length)
              return tension;
            tension = _;
            return line;
          };
          return line;
        }
        d3.svg.line = function () {
          return d3_svg_line(d3_identity);
        };
        var d3_svg_lineInterpolators = d3.map({
            linear: d3_svg_lineLinear,
            'linear-closed': d3_svg_lineLinearClosed,
            step: d3_svg_lineStep,
            'step-before': d3_svg_lineStepBefore,
            'step-after': d3_svg_lineStepAfter,
            basis: d3_svg_lineBasis,
            'basis-open': d3_svg_lineBasisOpen,
            'basis-closed': d3_svg_lineBasisClosed,
            bundle: d3_svg_lineBundle,
            cardinal: d3_svg_lineCardinal,
            'cardinal-open': d3_svg_lineCardinalOpen,
            'cardinal-closed': d3_svg_lineCardinalClosed,
            monotone: d3_svg_lineMonotone
          });
        d3_svg_lineInterpolators.forEach(function (key, value) {
          value.key = key;
          value.closed = /-closed$/.test(key);
        });
        function d3_svg_lineLinear(points) {
          return points.join('L');
        }
        function d3_svg_lineLinearClosed(points) {
          return d3_svg_lineLinear(points) + 'Z';
        }
        function d3_svg_lineStep(points) {
          var i = 0, n = points.length, p = points[0], path = [
              p[0],
              ',',
              p[1]
            ];
          while (++i < n)
            path.push('H', (p[0] + (p = points[i])[0]) / 2, 'V', p[1]);
          if (n > 1)
            path.push('H', p[0]);
          return path.join('');
        }
        function d3_svg_lineStepBefore(points) {
          var i = 0, n = points.length, p = points[0], path = [
              p[0],
              ',',
              p[1]
            ];
          while (++i < n)
            path.push('V', (p = points[i])[1], 'H', p[0]);
          return path.join('');
        }
        function d3_svg_lineStepAfter(points) {
          var i = 0, n = points.length, p = points[0], path = [
              p[0],
              ',',
              p[1]
            ];
          while (++i < n)
            path.push('H', (p = points[i])[0], 'V', p[1]);
          return path.join('');
        }
        function d3_svg_lineCardinalOpen(points, tension) {
          return points.length < 4 ? d3_svg_lineLinear(points) : points[1] + d3_svg_lineHermite(points.slice(1, points.length - 1), d3_svg_lineCardinalTangents(points, tension));
        }
        function d3_svg_lineCardinalClosed(points, tension) {
          return points.length < 3 ? d3_svg_lineLinear(points) : points[0] + d3_svg_lineHermite((points.push(points[0]), points), d3_svg_lineCardinalTangents([points[points.length - 2]].concat(points, [points[1]]), tension));
        }
        function d3_svg_lineCardinal(points, tension) {
          return points.length < 3 ? d3_svg_lineLinear(points) : points[0] + d3_svg_lineHermite(points, d3_svg_lineCardinalTangents(points, tension));
        }
        function d3_svg_lineHermite(points, tangents) {
          if (tangents.length < 1 || points.length != tangents.length && points.length != tangents.length + 2) {
            return d3_svg_lineLinear(points);
          }
          var quad = points.length != tangents.length, path = '', p0 = points[0], p = points[1], t0 = tangents[0], t = t0, pi = 1;
          if (quad) {
            path += 'Q' + (p[0] - t0[0] * 2 / 3) + ',' + (p[1] - t0[1] * 2 / 3) + ',' + p[0] + ',' + p[1];
            p0 = points[1];
            pi = 2;
          }
          if (tangents.length > 1) {
            t = tangents[1];
            p = points[pi];
            pi++;
            path += 'C' + (p0[0] + t0[0]) + ',' + (p0[1] + t0[1]) + ',' + (p[0] - t[0]) + ',' + (p[1] - t[1]) + ',' + p[0] + ',' + p[1];
            for (var i = 2; i < tangents.length; i++, pi++) {
              p = points[pi];
              t = tangents[i];
              path += 'S' + (p[0] - t[0]) + ',' + (p[1] - t[1]) + ',' + p[0] + ',' + p[1];
            }
          }
          if (quad) {
            var lp = points[pi];
            path += 'Q' + (p[0] + t[0] * 2 / 3) + ',' + (p[1] + t[1] * 2 / 3) + ',' + lp[0] + ',' + lp[1];
          }
          return path;
        }
        function d3_svg_lineCardinalTangents(points, tension) {
          var tangents = [], a = (1 - tension) / 2, p0, p1 = points[0], p2 = points[1], i = 1, n = points.length;
          while (++i < n) {
            p0 = p1;
            p1 = p2;
            p2 = points[i];
            tangents.push([
              a * (p2[0] - p0[0]),
              a * (p2[1] - p0[1])
            ]);
          }
          return tangents;
        }
        function d3_svg_lineBasis(points) {
          if (points.length < 3)
            return d3_svg_lineLinear(points);
          var i = 1, n = points.length, pi = points[0], x0 = pi[0], y0 = pi[1], px = [
              x0,
              x0,
              x0,
              (pi = points[1])[0]
            ], py = [
              y0,
              y0,
              y0,
              pi[1]
            ], path = [
              x0,
              ',',
              y0,
              'L',
              d3_svg_lineDot4(d3_svg_lineBasisBezier3, px),
              ',',
              d3_svg_lineDot4(d3_svg_lineBasisBezier3, py)
            ];
          points.push(points[n - 1]);
          while (++i <= n) {
            pi = points[i];
            px.shift();
            px.push(pi[0]);
            py.shift();
            py.push(pi[1]);
            d3_svg_lineBasisBezier(path, px, py);
          }
          points.pop();
          path.push('L', pi);
          return path.join('');
        }
        function d3_svg_lineBasisOpen(points) {
          if (points.length < 4)
            return d3_svg_lineLinear(points);
          var path = [], i = -1, n = points.length, pi, px = [0], py = [0];
          while (++i < 3) {
            pi = points[i];
            px.push(pi[0]);
            py.push(pi[1]);
          }
          path.push(d3_svg_lineDot4(d3_svg_lineBasisBezier3, px) + ',' + d3_svg_lineDot4(d3_svg_lineBasisBezier3, py));
          --i;
          while (++i < n) {
            pi = points[i];
            px.shift();
            px.push(pi[0]);
            py.shift();
            py.push(pi[1]);
            d3_svg_lineBasisBezier(path, px, py);
          }
          return path.join('');
        }
        function d3_svg_lineBasisClosed(points) {
          var path, i = -1, n = points.length, m = n + 4, pi, px = [], py = [];
          while (++i < 4) {
            pi = points[i % n];
            px.push(pi[0]);
            py.push(pi[1]);
          }
          path = [
            d3_svg_lineDot4(d3_svg_lineBasisBezier3, px),
            ',',
            d3_svg_lineDot4(d3_svg_lineBasisBezier3, py)
          ];
          --i;
          while (++i < m) {
            pi = points[i % n];
            px.shift();
            px.push(pi[0]);
            py.shift();
            py.push(pi[1]);
            d3_svg_lineBasisBezier(path, px, py);
          }
          return path.join('');
        }
        function d3_svg_lineBundle(points, tension) {
          var n = points.length - 1;
          if (n) {
            var x0 = points[0][0], y0 = points[0][1], dx = points[n][0] - x0, dy = points[n][1] - y0, i = -1, p, t;
            while (++i <= n) {
              p = points[i];
              t = i / n;
              p[0] = tension * p[0] + (1 - tension) * (x0 + t * dx);
              p[1] = tension * p[1] + (1 - tension) * (y0 + t * dy);
            }
          }
          return d3_svg_lineBasis(points);
        }
        function d3_svg_lineDot4(a, b) {
          return a[0] * b[0] + a[1] * b[1] + a[2] * b[2] + a[3] * b[3];
        }
        var d3_svg_lineBasisBezier1 = [
            0,
            2 / 3,
            1 / 3,
            0
          ], d3_svg_lineBasisBezier2 = [
            0,
            1 / 3,
            2 / 3,
            0
          ], d3_svg_lineBasisBezier3 = [
            0,
            1 / 6,
            2 / 3,
            1 / 6
          ];
        function d3_svg_lineBasisBezier(path, x, y) {
          path.push('C', d3_svg_lineDot4(d3_svg_lineBasisBezier1, x), ',', d3_svg_lineDot4(d3_svg_lineBasisBezier1, y), ',', d3_svg_lineDot4(d3_svg_lineBasisBezier2, x), ',', d3_svg_lineDot4(d3_svg_lineBasisBezier2, y), ',', d3_svg_lineDot4(d3_svg_lineBasisBezier3, x), ',', d3_svg_lineDot4(d3_svg_lineBasisBezier3, y));
        }
        function d3_svg_lineSlope(p0, p1) {
          return (p1[1] - p0[1]) / (p1[0] - p0[0]);
        }
        function d3_svg_lineFiniteDifferences(points) {
          var i = 0, j = points.length - 1, m = [], p0 = points[0], p1 = points[1], d = m[0] = d3_svg_lineSlope(p0, p1);
          while (++i < j) {
            m[i] = (d + (d = d3_svg_lineSlope(p0 = p1, p1 = points[i + 1]))) / 2;
          }
          m[i] = d;
          return m;
        }
        function d3_svg_lineMonotoneTangents(points) {
          var tangents = [], d, a, b, s, m = d3_svg_lineFiniteDifferences(points), i = -1, j = points.length - 1;
          while (++i < j) {
            d = d3_svg_lineSlope(points[i], points[i + 1]);
            if (abs(d) < ε) {
              m[i] = m[i + 1] = 0;
            } else {
              a = m[i] / d;
              b = m[i + 1] / d;
              s = a * a + b * b;
              if (s > 9) {
                s = d * 3 / Math.sqrt(s);
                m[i] = s * a;
                m[i + 1] = s * b;
              }
            }
          }
          i = -1;
          while (++i <= j) {
            s = (points[Math.min(j, i + 1)][0] - points[Math.max(0, i - 1)][0]) / (6 * (1 + m[i] * m[i]));
            tangents.push([
              s || 0,
              m[i] * s || 0
            ]);
          }
          return tangents;
        }
        function d3_svg_lineMonotone(points) {
          return points.length < 3 ? d3_svg_lineLinear(points) : points[0] + d3_svg_lineHermite(points, d3_svg_lineMonotoneTangents(points));
        }
        d3.svg.line.radial = function () {
          var line = d3_svg_line(d3_svg_lineRadial);
          line.radius = line.x, delete line.x;
          line.angle = line.y, delete line.y;
          return line;
        };
        function d3_svg_lineRadial(points) {
          var point, i = -1, n = points.length, r, a;
          while (++i < n) {
            point = points[i];
            r = point[0];
            a = point[1] + d3_svg_arcOffset;
            point[0] = r * Math.cos(a);
            point[1] = r * Math.sin(a);
          }
          return points;
        }
        function d3_svg_area(projection) {
          var x0 = d3_geom_pointX, x1 = d3_geom_pointX, y0 = 0, y1 = d3_geom_pointY, defined = d3_true, interpolate = d3_svg_lineLinear, interpolateKey = interpolate.key, interpolateReverse = interpolate, L = 'L', tension = 0.7;
          function area(data) {
            var segments = [], points0 = [], points1 = [], i = -1, n = data.length, d, fx0 = d3_functor(x0), fy0 = d3_functor(y0), fx1 = x0 === x1 ? function () {
                return x;
              } : d3_functor(x1), fy1 = y0 === y1 ? function () {
                return y;
              } : d3_functor(y1), x, y;
            function segment() {
              segments.push('M', interpolate(projection(points1), tension), L, interpolateReverse(projection(points0.reverse()), tension), 'Z');
            }
            while (++i < n) {
              if (defined.call(this, d = data[i], i)) {
                points0.push([
                  x = +fx0.call(this, d, i),
                  y = +fy0.call(this, d, i)
                ]);
                points1.push([
                  +fx1.call(this, d, i),
                  +fy1.call(this, d, i)
                ]);
              } else if (points0.length) {
                segment();
                points0 = [];
                points1 = [];
              }
            }
            if (points0.length)
              segment();
            return segments.length ? segments.join('') : null;
          }
          area.x = function (_) {
            if (!arguments.length)
              return x1;
            x0 = x1 = _;
            return area;
          };
          area.x0 = function (_) {
            if (!arguments.length)
              return x0;
            x0 = _;
            return area;
          };
          area.x1 = function (_) {
            if (!arguments.length)
              return x1;
            x1 = _;
            return area;
          };
          area.y = function (_) {
            if (!arguments.length)
              return y1;
            y0 = y1 = _;
            return area;
          };
          area.y0 = function (_) {
            if (!arguments.length)
              return y0;
            y0 = _;
            return area;
          };
          area.y1 = function (_) {
            if (!arguments.length)
              return y1;
            y1 = _;
            return area;
          };
          area.defined = function (_) {
            if (!arguments.length)
              return defined;
            defined = _;
            return area;
          };
          area.interpolate = function (_) {
            if (!arguments.length)
              return interpolateKey;
            if (typeof _ === 'function')
              interpolateKey = interpolate = _;
            else
              interpolateKey = (interpolate = d3_svg_lineInterpolators.get(_) || d3_svg_lineLinear).key;
            interpolateReverse = interpolate.reverse || interpolate;
            L = interpolate.closed ? 'M' : 'L';
            return area;
          };
          area.tension = function (_) {
            if (!arguments.length)
              return tension;
            tension = _;
            return area;
          };
          return area;
        }
        d3_svg_lineStepBefore.reverse = d3_svg_lineStepAfter;
        d3_svg_lineStepAfter.reverse = d3_svg_lineStepBefore;
        d3.svg.area = function () {
          return d3_svg_area(d3_identity);
        };
        d3.svg.area.radial = function () {
          var area = d3_svg_area(d3_svg_lineRadial);
          area.radius = area.x, delete area.x;
          area.innerRadius = area.x0, delete area.x0;
          area.outerRadius = area.x1, delete area.x1;
          area.angle = area.y, delete area.y;
          area.startAngle = area.y0, delete area.y0;
          area.endAngle = area.y1, delete area.y1;
          return area;
        };
        d3.svg.chord = function () {
          var source = d3_source, target = d3_target, radius = d3_svg_chordRadius, startAngle = d3_svg_arcStartAngle, endAngle = d3_svg_arcEndAngle;
          function chord(d, i) {
            var s = subgroup(this, source, d, i), t = subgroup(this, target, d, i);
            return 'M' + s.p0 + arc(s.r, s.p1, s.a1 - s.a0) + (equals(s, t) ? curve(s.r, s.p1, s.r, s.p0) : curve(s.r, s.p1, t.r, t.p0) + arc(t.r, t.p1, t.a1 - t.a0) + curve(t.r, t.p1, s.r, s.p0)) + 'Z';
          }
          function subgroup(self, f, d, i) {
            var subgroup = f.call(self, d, i), r = radius.call(self, subgroup, i), a0 = startAngle.call(self, subgroup, i) + d3_svg_arcOffset, a1 = endAngle.call(self, subgroup, i) + d3_svg_arcOffset;
            return {
              r: r,
              a0: a0,
              a1: a1,
              p0: [
                r * Math.cos(a0),
                r * Math.sin(a0)
              ],
              p1: [
                r * Math.cos(a1),
                r * Math.sin(a1)
              ]
            };
          }
          function equals(a, b) {
            return a.a0 == b.a0 && a.a1 == b.a1;
          }
          function arc(r, p, a) {
            return 'A' + r + ',' + r + ' 0 ' + +(a > π) + ',1 ' + p;
          }
          function curve(r0, p0, r1, p1) {
            return 'Q 0,0 ' + p1;
          }
          chord.radius = function (v) {
            if (!arguments.length)
              return radius;
            radius = d3_functor(v);
            return chord;
          };
          chord.source = function (v) {
            if (!arguments.length)
              return source;
            source = d3_functor(v);
            return chord;
          };
          chord.target = function (v) {
            if (!arguments.length)
              return target;
            target = d3_functor(v);
            return chord;
          };
          chord.startAngle = function (v) {
            if (!arguments.length)
              return startAngle;
            startAngle = d3_functor(v);
            return chord;
          };
          chord.endAngle = function (v) {
            if (!arguments.length)
              return endAngle;
            endAngle = d3_functor(v);
            return chord;
          };
          return chord;
        };
        function d3_svg_chordRadius(d) {
          return d.radius;
        }
        d3.svg.diagonal = function () {
          var source = d3_source, target = d3_target, projection = d3_svg_diagonalProjection;
          function diagonal(d, i) {
            var p0 = source.call(this, d, i), p3 = target.call(this, d, i), m = (p0.y + p3.y) / 2, p = [
                p0,
                {
                  x: p0.x,
                  y: m
                },
                {
                  x: p3.x,
                  y: m
                },
                p3
              ];
            p = p.map(projection);
            return 'M' + p[0] + 'C' + p[1] + ' ' + p[2] + ' ' + p[3];
          }
          diagonal.source = function (x) {
            if (!arguments.length)
              return source;
            source = d3_functor(x);
            return diagonal;
          };
          diagonal.target = function (x) {
            if (!arguments.length)
              return target;
            target = d3_functor(x);
            return diagonal;
          };
          diagonal.projection = function (x) {
            if (!arguments.length)
              return projection;
            projection = x;
            return diagonal;
          };
          return diagonal;
        };
        function d3_svg_diagonalProjection(d) {
          return [
            d.x,
            d.y
          ];
        }
        d3.svg.diagonal.radial = function () {
          var diagonal = d3.svg.diagonal(), projection = d3_svg_diagonalProjection, projection_ = diagonal.projection;
          diagonal.projection = function (x) {
            return arguments.length ? projection_(d3_svg_diagonalRadialProjection(projection = x)) : projection;
          };
          return diagonal;
        };
        function d3_svg_diagonalRadialProjection(projection) {
          return function () {
            var d = projection.apply(this, arguments), r = d[0], a = d[1] + d3_svg_arcOffset;
            return [
              r * Math.cos(a),
              r * Math.sin(a)
            ];
          };
        }
        d3.svg.symbol = function () {
          var type = d3_svg_symbolType, size = d3_svg_symbolSize;
          function symbol(d, i) {
            return (d3_svg_symbols.get(type.call(this, d, i)) || d3_svg_symbolCircle)(size.call(this, d, i));
          }
          symbol.type = function (x) {
            if (!arguments.length)
              return type;
            type = d3_functor(x);
            return symbol;
          };
          symbol.size = function (x) {
            if (!arguments.length)
              return size;
            size = d3_functor(x);
            return symbol;
          };
          return symbol;
        };
        function d3_svg_symbolSize() {
          return 64;
        }
        function d3_svg_symbolType() {
          return 'circle';
        }
        function d3_svg_symbolCircle(size) {
          var r = Math.sqrt(size / π);
          return 'M0,' + r + 'A' + r + ',' + r + ' 0 1,1 0,' + -r + 'A' + r + ',' + r + ' 0 1,1 0,' + r + 'Z';
        }
        var d3_svg_symbols = d3.map({
            circle: d3_svg_symbolCircle,
            cross: function (size) {
              var r = Math.sqrt(size / 5) / 2;
              return 'M' + -3 * r + ',' + -r + 'H' + -r + 'V' + -3 * r + 'H' + r + 'V' + -r + 'H' + 3 * r + 'V' + r + 'H' + r + 'V' + 3 * r + 'H' + -r + 'V' + r + 'H' + -3 * r + 'Z';
            },
            diamond: function (size) {
              var ry = Math.sqrt(size / (2 * d3_svg_symbolTan30)), rx = ry * d3_svg_symbolTan30;
              return 'M0,' + -ry + 'L' + rx + ',0' + ' 0,' + ry + ' ' + -rx + ',0' + 'Z';
            },
            square: function (size) {
              var r = Math.sqrt(size) / 2;
              return 'M' + -r + ',' + -r + 'L' + r + ',' + -r + ' ' + r + ',' + r + ' ' + -r + ',' + r + 'Z';
            },
            'triangle-down': function (size) {
              var rx = Math.sqrt(size / d3_svg_symbolSqrt3), ry = rx * d3_svg_symbolSqrt3 / 2;
              return 'M0,' + ry + 'L' + rx + ',' + -ry + ' ' + -rx + ',' + -ry + 'Z';
            },
            'triangle-up': function (size) {
              var rx = Math.sqrt(size / d3_svg_symbolSqrt3), ry = rx * d3_svg_symbolSqrt3 / 2;
              return 'M0,' + -ry + 'L' + rx + ',' + ry + ' ' + -rx + ',' + ry + 'Z';
            }
          });
        d3.svg.symbolTypes = d3_svg_symbols.keys();
        var d3_svg_symbolSqrt3 = Math.sqrt(3), d3_svg_symbolTan30 = Math.tan(30 * d3_radians);
        function d3_transition(groups, id) {
          d3_subclass(groups, d3_transitionPrototype);
          groups.id = id;
          return groups;
        }
        var d3_transitionPrototype = [], d3_transitionId = 0, d3_transitionInheritId, d3_transitionInherit;
        d3_transitionPrototype.call = d3_selectionPrototype.call;
        d3_transitionPrototype.empty = d3_selectionPrototype.empty;
        d3_transitionPrototype.node = d3_selectionPrototype.node;
        d3_transitionPrototype.size = d3_selectionPrototype.size;
        d3.transition = function (selection) {
          return arguments.length ? d3_transitionInheritId ? selection.transition() : selection : d3_selectionRoot.transition();
        };
        d3.transition.prototype = d3_transitionPrototype;
        d3_transitionPrototype.select = function (selector) {
          var id = this.id, subgroups = [], subgroup, subnode, node;
          selector = d3_selection_selector(selector);
          for (var j = -1, m = this.length; ++j < m;) {
            subgroups.push(subgroup = []);
            for (var group = this[j], i = -1, n = group.length; ++i < n;) {
              if ((node = group[i]) && (subnode = selector.call(node, node.__data__, i, j))) {
                if ('__data__' in node)
                  subnode.__data__ = node.__data__;
                d3_transitionNode(subnode, i, id, node.__transition__[id]);
                subgroup.push(subnode);
              } else {
                subgroup.push(null);
              }
            }
          }
          return d3_transition(subgroups, id);
        };
        d3_transitionPrototype.selectAll = function (selector) {
          var id = this.id, subgroups = [], subgroup, subnodes, node, subnode, transition;
          selector = d3_selection_selectorAll(selector);
          for (var j = -1, m = this.length; ++j < m;) {
            for (var group = this[j], i = -1, n = group.length; ++i < n;) {
              if (node = group[i]) {
                transition = node.__transition__[id];
                subnodes = selector.call(node, node.__data__, i, j);
                subgroups.push(subgroup = []);
                for (var k = -1, o = subnodes.length; ++k < o;) {
                  if (subnode = subnodes[k])
                    d3_transitionNode(subnode, k, id, transition);
                  subgroup.push(subnode);
                }
              }
            }
          }
          return d3_transition(subgroups, id);
        };
        d3_transitionPrototype.filter = function (filter) {
          var subgroups = [], subgroup, group, node;
          if (typeof filter !== 'function')
            filter = d3_selection_filter(filter);
          for (var j = 0, m = this.length; j < m; j++) {
            subgroups.push(subgroup = []);
            for (var group = this[j], i = 0, n = group.length; i < n; i++) {
              if ((node = group[i]) && filter.call(node, node.__data__, i)) {
                subgroup.push(node);
              }
            }
          }
          return d3_transition(subgroups, this.id);
        };
        d3_transitionPrototype.tween = function (name, tween) {
          var id = this.id;
          if (arguments.length < 2)
            return this.node().__transition__[id].tween.get(name);
          return d3_selection_each(this, tween == null ? function (node) {
            node.__transition__[id].tween.remove(name);
          } : function (node) {
            node.__transition__[id].tween.set(name, tween);
          });
        };
        function d3_transition_tween(groups, name, value, tween) {
          var id = groups.id;
          return d3_selection_each(groups, typeof value === 'function' ? function (node, i, j) {
            node.__transition__[id].tween.set(name, tween(value.call(node, node.__data__, i, j)));
          } : (value = tween(value), function (node) {
            node.__transition__[id].tween.set(name, value);
          }));
        }
        d3_transitionPrototype.attr = function (nameNS, value) {
          if (arguments.length < 2) {
            for (value in nameNS)
              this.attr(value, nameNS[value]);
            return this;
          }
          var interpolate = nameNS == 'transform' ? d3_interpolateTransform : d3_interpolate, name = d3.ns.qualify(nameNS);
          function attrNull() {
            this.removeAttribute(name);
          }
          function attrNullNS() {
            this.removeAttributeNS(name.space, name.local);
          }
          function attrTween(b) {
            return b == null ? attrNull : (b += '', function () {
              var a = this.getAttribute(name), i;
              return a !== b && (i = interpolate(a, b), function (t) {
                this.setAttribute(name, i(t));
              });
            });
          }
          function attrTweenNS(b) {
            return b == null ? attrNullNS : (b += '', function () {
              var a = this.getAttributeNS(name.space, name.local), i;
              return a !== b && (i = interpolate(a, b), function (t) {
                this.setAttributeNS(name.space, name.local, i(t));
              });
            });
          }
          return d3_transition_tween(this, 'attr.' + nameNS, value, name.local ? attrTweenNS : attrTween);
        };
        d3_transitionPrototype.attrTween = function (nameNS, tween) {
          var name = d3.ns.qualify(nameNS);
          function attrTween(d, i) {
            var f = tween.call(this, d, i, this.getAttribute(name));
            return f && function (t) {
              this.setAttribute(name, f(t));
            };
          }
          function attrTweenNS(d, i) {
            var f = tween.call(this, d, i, this.getAttributeNS(name.space, name.local));
            return f && function (t) {
              this.setAttributeNS(name.space, name.local, f(t));
            };
          }
          return this.tween('attr.' + nameNS, name.local ? attrTweenNS : attrTween);
        };
        d3_transitionPrototype.style = function (name, value, priority) {
          var n = arguments.length;
          if (n < 3) {
            if (typeof name !== 'string') {
              if (n < 2)
                value = '';
              for (priority in name)
                this.style(priority, name[priority], value);
              return this;
            }
            priority = '';
          }
          function styleNull() {
            this.style.removeProperty(name);
          }
          function styleString(b) {
            return b == null ? styleNull : (b += '', function () {
              var a = d3_window.getComputedStyle(this, null).getPropertyValue(name), i;
              return a !== b && (i = d3_interpolate(a, b), function (t) {
                this.style.setProperty(name, i(t), priority);
              });
            });
          }
          return d3_transition_tween(this, 'style.' + name, value, styleString);
        };
        d3_transitionPrototype.styleTween = function (name, tween, priority) {
          if (arguments.length < 3)
            priority = '';
          function styleTween(d, i) {
            var f = tween.call(this, d, i, d3_window.getComputedStyle(this, null).getPropertyValue(name));
            return f && function (t) {
              this.style.setProperty(name, f(t), priority);
            };
          }
          return this.tween('style.' + name, styleTween);
        };
        d3_transitionPrototype.text = function (value) {
          return d3_transition_tween(this, 'text', value, d3_transition_text);
        };
        function d3_transition_text(b) {
          if (b == null)
            b = '';
          return function () {
            this.textContent = b;
          };
        }
        d3_transitionPrototype.remove = function () {
          return this.each('end.transition', function () {
            var p;
            if (this.__transition__.count < 2 && (p = this.parentNode))
              p.removeChild(this);
          });
        };
        d3_transitionPrototype.ease = function (value) {
          var id = this.id;
          if (arguments.length < 1)
            return this.node().__transition__[id].ease;
          if (typeof value !== 'function')
            value = d3.ease.apply(d3, arguments);
          return d3_selection_each(this, function (node) {
            node.__transition__[id].ease = value;
          });
        };
        d3_transitionPrototype.delay = function (value) {
          var id = this.id;
          return d3_selection_each(this, typeof value === 'function' ? function (node, i, j) {
            node.__transition__[id].delay = +value.call(node, node.__data__, i, j);
          } : (value = +value, function (node) {
            node.__transition__[id].delay = value;
          }));
        };
        d3_transitionPrototype.duration = function (value) {
          var id = this.id;
          return d3_selection_each(this, typeof value === 'function' ? function (node, i, j) {
            node.__transition__[id].duration = Math.max(1, value.call(node, node.__data__, i, j));
          } : (value = Math.max(1, value), function (node) {
            node.__transition__[id].duration = value;
          }));
        };
        d3_transitionPrototype.each = function (type, listener) {
          var id = this.id;
          if (arguments.length < 2) {
            var inherit = d3_transitionInherit, inheritId = d3_transitionInheritId;
            d3_transitionInheritId = id;
            d3_selection_each(this, function (node, i, j) {
              d3_transitionInherit = node.__transition__[id];
              type.call(node, node.__data__, i, j);
            });
            d3_transitionInherit = inherit;
            d3_transitionInheritId = inheritId;
          } else {
            d3_selection_each(this, function (node) {
              var transition = node.__transition__[id];
              (transition.event || (transition.event = d3.dispatch('start', 'end'))).on(type, listener);
            });
          }
          return this;
        };
        d3_transitionPrototype.transition = function () {
          var id0 = this.id, id1 = ++d3_transitionId, subgroups = [], subgroup, group, node, transition;
          for (var j = 0, m = this.length; j < m; j++) {
            subgroups.push(subgroup = []);
            for (var group = this[j], i = 0, n = group.length; i < n; i++) {
              if (node = group[i]) {
                transition = Object.create(node.__transition__[id0]);
                transition.delay += transition.duration;
                d3_transitionNode(node, i, id1, transition);
              }
              subgroup.push(node);
            }
          }
          return d3_transition(subgroups, id1);
        };
        function d3_transitionNode(node, i, id, inherit) {
          var lock = node.__transition__ || (node.__transition__ = {
              active: 0,
              count: 0
            }), transition = lock[id];
          if (!transition) {
            var time = inherit.time;
            transition = lock[id] = {
              tween: new d3_Map(),
              time: time,
              ease: inherit.ease,
              delay: inherit.delay,
              duration: inherit.duration
            };
            ++lock.count;
            d3.timer(function (elapsed) {
              var d = node.__data__, ease = transition.ease, delay = transition.delay, duration = transition.duration, timer = d3_timer_active, tweened = [];
              timer.t = delay + time;
              if (delay <= elapsed)
                return start(elapsed - delay);
              timer.c = start;
              function start(elapsed) {
                if (lock.active > id)
                  return stop();
                lock.active = id;
                transition.event && transition.event.start.call(node, d, i);
                transition.tween.forEach(function (key, value) {
                  if (value = value.call(node, d, i)) {
                    tweened.push(value);
                  }
                });
                d3.timer(function () {
                  timer.c = tick(elapsed || 1) ? d3_true : tick;
                  return 1;
                }, 0, time);
              }
              function tick(elapsed) {
                if (lock.active !== id)
                  return stop();
                var t = elapsed / duration, e = ease(t), n = tweened.length;
                while (n > 0) {
                  tweened[--n].call(node, e);
                }
                if (t >= 1) {
                  transition.event && transition.event.end.call(node, d, i);
                  return stop();
                }
              }
              function stop() {
                if (--lock.count)
                  delete lock[id];
                else
                  delete node.__transition__;
                return 1;
              }
            }, 0, time);
          }
        }
        d3.svg.axis = function () {
          var scale = d3.scale.linear(), orient = d3_svg_axisDefaultOrient, innerTickSize = 6, outerTickSize = 6, tickPadding = 3, tickArguments_ = [10], tickValues = null, tickFormat_;
          function axis(g) {
            g.each(function () {
              var g = d3.select(this);
              var scale0 = this.__chart__ || scale, scale1 = this.__chart__ = scale.copy();
              var ticks = tickValues == null ? scale1.ticks ? scale1.ticks.apply(scale1, tickArguments_) : scale1.domain() : tickValues, tickFormat = tickFormat_ == null ? scale1.tickFormat ? scale1.tickFormat.apply(scale1, tickArguments_) : d3_identity : tickFormat_, tick = g.selectAll('.tick').data(ticks, scale1), tickEnter = tick.enter().insert('g', '.domain').attr('class', 'tick').style('opacity', ε), tickExit = d3.transition(tick.exit()).style('opacity', ε).remove(), tickUpdate = d3.transition(tick).style('opacity', 1), tickTransform;
              var range = d3_scaleRange(scale1), path = g.selectAll('.domain').data([0]), pathUpdate = (path.enter().append('path').attr('class', 'domain'), d3.transition(path));
              tickEnter.append('line');
              tickEnter.append('text');
              var lineEnter = tickEnter.select('line'), lineUpdate = tickUpdate.select('line'), text = tick.select('text').text(tickFormat), textEnter = tickEnter.select('text'), textUpdate = tickUpdate.select('text');
              switch (orient) {
              case 'bottom': {
                  tickTransform = d3_svg_axisX;
                  lineEnter.attr('y2', innerTickSize);
                  textEnter.attr('y', Math.max(innerTickSize, 0) + tickPadding);
                  lineUpdate.attr('x2', 0).attr('y2', innerTickSize);
                  textUpdate.attr('x', 0).attr('y', Math.max(innerTickSize, 0) + tickPadding);
                  text.attr('dy', '.71em').style('text-anchor', 'middle');
                  pathUpdate.attr('d', 'M' + range[0] + ',' + outerTickSize + 'V0H' + range[1] + 'V' + outerTickSize);
                  break;
                }
              case 'top': {
                  tickTransform = d3_svg_axisX;
                  lineEnter.attr('y2', -innerTickSize);
                  textEnter.attr('y', -(Math.max(innerTickSize, 0) + tickPadding));
                  lineUpdate.attr('x2', 0).attr('y2', -innerTickSize);
                  textUpdate.attr('x', 0).attr('y', -(Math.max(innerTickSize, 0) + tickPadding));
                  text.attr('dy', '0em').style('text-anchor', 'middle');
                  pathUpdate.attr('d', 'M' + range[0] + ',' + -outerTickSize + 'V0H' + range[1] + 'V' + -outerTickSize);
                  break;
                }
              case 'left': {
                  tickTransform = d3_svg_axisY;
                  lineEnter.attr('x2', -innerTickSize);
                  textEnter.attr('x', -(Math.max(innerTickSize, 0) + tickPadding));
                  lineUpdate.attr('x2', -innerTickSize).attr('y2', 0);
                  textUpdate.attr('x', -(Math.max(innerTickSize, 0) + tickPadding)).attr('y', 0);
                  text.attr('dy', '.32em').style('text-anchor', 'end');
                  pathUpdate.attr('d', 'M' + -outerTickSize + ',' + range[0] + 'H0V' + range[1] + 'H' + -outerTickSize);
                  break;
                }
              case 'right': {
                  tickTransform = d3_svg_axisY;
                  lineEnter.attr('x2', innerTickSize);
                  textEnter.attr('x', Math.max(innerTickSize, 0) + tickPadding);
                  lineUpdate.attr('x2', innerTickSize).attr('y2', 0);
                  textUpdate.attr('x', Math.max(innerTickSize, 0) + tickPadding).attr('y', 0);
                  text.attr('dy', '.32em').style('text-anchor', 'start');
                  pathUpdate.attr('d', 'M' + outerTickSize + ',' + range[0] + 'H0V' + range[1] + 'H' + outerTickSize);
                  break;
                }
              }
              if (scale1.rangeBand) {
                var dx = scale1.rangeBand() / 2, x = function (d) {
                    return scale1(d) + dx;
                  };
                tickEnter.call(tickTransform, x);
                tickUpdate.call(tickTransform, x);
              } else {
                tickEnter.call(tickTransform, scale0);
                tickUpdate.call(tickTransform, scale1);
                tickExit.call(tickTransform, scale1);
              }
            });
          }
          axis.scale = function (x) {
            if (!arguments.length)
              return scale;
            scale = x;
            return axis;
          };
          axis.orient = function (x) {
            if (!arguments.length)
              return orient;
            orient = x in d3_svg_axisOrients ? x + '' : d3_svg_axisDefaultOrient;
            return axis;
          };
          axis.ticks = function () {
            if (!arguments.length)
              return tickArguments_;
            tickArguments_ = arguments;
            return axis;
          };
          axis.tickValues = function (x) {
            if (!arguments.length)
              return tickValues;
            tickValues = x;
            return axis;
          };
          axis.tickFormat = function (x) {
            if (!arguments.length)
              return tickFormat_;
            tickFormat_ = x;
            return axis;
          };
          axis.tickSize = function (x) {
            var n = arguments.length;
            if (!n)
              return innerTickSize;
            innerTickSize = +x;
            outerTickSize = +arguments[n - 1];
            return axis;
          };
          axis.innerTickSize = function (x) {
            if (!arguments.length)
              return innerTickSize;
            innerTickSize = +x;
            return axis;
          };
          axis.outerTickSize = function (x) {
            if (!arguments.length)
              return outerTickSize;
            outerTickSize = +x;
            return axis;
          };
          axis.tickPadding = function (x) {
            if (!arguments.length)
              return tickPadding;
            tickPadding = +x;
            return axis;
          };
          axis.tickSubdivide = function () {
            return arguments.length && axis;
          };
          return axis;
        };
        var d3_svg_axisDefaultOrient = 'bottom', d3_svg_axisOrients = {
            top: 1,
            right: 1,
            bottom: 1,
            left: 1
          };
        function d3_svg_axisX(selection, x) {
          selection.attr('transform', function (d) {
            return 'translate(' + x(d) + ',0)';
          });
        }
        function d3_svg_axisY(selection, y) {
          selection.attr('transform', function (d) {
            return 'translate(0,' + y(d) + ')';
          });
        }
        d3.svg.brush = function () {
          var event = d3_eventDispatch(brush, 'brushstart', 'brush', 'brushend'), x = null, y = null, xExtent = [
              0,
              0
            ], yExtent = [
              0,
              0
            ], xExtentDomain, yExtentDomain, xClamp = true, yClamp = true, resizes = d3_svg_brushResizes[0];
          function brush(g) {
            g.each(function () {
              var g = d3.select(this).style('pointer-events', 'all').style('-webkit-tap-highlight-color', 'rgba(0,0,0,0)').on('mousedown.brush', brushstart).on('touchstart.brush', brushstart);
              var background = g.selectAll('.background').data([0]);
              background.enter().append('rect').attr('class', 'background').style('visibility', 'hidden').style('cursor', 'crosshair');
              g.selectAll('.extent').data([0]).enter().append('rect').attr('class', 'extent').style('cursor', 'move');
              var resize = g.selectAll('.resize').data(resizes, d3_identity);
              resize.exit().remove();
              resize.enter().append('g').attr('class', function (d) {
                return 'resize ' + d;
              }).style('cursor', function (d) {
                return d3_svg_brushCursor[d];
              }).append('rect').attr('x', function (d) {
                return /[ew]$/.test(d) ? -3 : null;
              }).attr('y', function (d) {
                return /^[ns]/.test(d) ? -3 : null;
              }).attr('width', 6).attr('height', 6).style('visibility', 'hidden');
              resize.style('display', brush.empty() ? 'none' : null);
              var gUpdate = d3.transition(g), backgroundUpdate = d3.transition(background), range;
              if (x) {
                range = d3_scaleRange(x);
                backgroundUpdate.attr('x', range[0]).attr('width', range[1] - range[0]);
                redrawX(gUpdate);
              }
              if (y) {
                range = d3_scaleRange(y);
                backgroundUpdate.attr('y', range[0]).attr('height', range[1] - range[0]);
                redrawY(gUpdate);
              }
              redraw(gUpdate);
            });
          }
          brush.event = function (g) {
            g.each(function () {
              var event_ = event.of(this, arguments), extent1 = {
                  x: xExtent,
                  y: yExtent,
                  i: xExtentDomain,
                  j: yExtentDomain
                }, extent0 = this.__chart__ || extent1;
              this.__chart__ = extent1;
              if (d3_transitionInheritId) {
                d3.select(this).transition().each('start.brush', function () {
                  xExtentDomain = extent0.i;
                  yExtentDomain = extent0.j;
                  xExtent = extent0.x;
                  yExtent = extent0.y;
                  event_({ type: 'brushstart' });
                }).tween('brush:brush', function () {
                  var xi = d3_interpolateArray(xExtent, extent1.x), yi = d3_interpolateArray(yExtent, extent1.y);
                  xExtentDomain = yExtentDomain = null;
                  return function (t) {
                    xExtent = extent1.x = xi(t);
                    yExtent = extent1.y = yi(t);
                    event_({
                      type: 'brush',
                      mode: 'resize'
                    });
                  };
                }).each('end.brush', function () {
                  xExtentDomain = extent1.i;
                  yExtentDomain = extent1.j;
                  event_({
                    type: 'brush',
                    mode: 'resize'
                  });
                  event_({ type: 'brushend' });
                });
              } else {
                event_({ type: 'brushstart' });
                event_({
                  type: 'brush',
                  mode: 'resize'
                });
                event_({ type: 'brushend' });
              }
            });
          };
          function redraw(g) {
            g.selectAll('.resize').attr('transform', function (d) {
              return 'translate(' + xExtent[+/e$/.test(d)] + ',' + yExtent[+/^s/.test(d)] + ')';
            });
          }
          function redrawX(g) {
            g.select('.extent').attr('x', xExtent[0]);
            g.selectAll('.extent,.n>rect,.s>rect').attr('width', xExtent[1] - xExtent[0]);
          }
          function redrawY(g) {
            g.select('.extent').attr('y', yExtent[0]);
            g.selectAll('.extent,.e>rect,.w>rect').attr('height', yExtent[1] - yExtent[0]);
          }
          function brushstart() {
            var target = this, eventTarget = d3.select(d3.event.target), event_ = event.of(target, arguments), g = d3.select(target), resizing = eventTarget.datum(), resizingX = !/^(n|s)$/.test(resizing) && x, resizingY = !/^(e|w)$/.test(resizing) && y, dragging = eventTarget.classed('extent'), dragRestore = d3_event_dragSuppress(), center, origin = d3.mouse(target), offset;
            var w = d3.select(d3_window).on('keydown.brush', keydown).on('keyup.brush', keyup);
            if (d3.event.changedTouches) {
              w.on('touchmove.brush', brushmove).on('touchend.brush', brushend);
            } else {
              w.on('mousemove.brush', brushmove).on('mouseup.brush', brushend);
            }
            g.interrupt().selectAll('*').interrupt();
            if (dragging) {
              origin[0] = xExtent[0] - origin[0];
              origin[1] = yExtent[0] - origin[1];
            } else if (resizing) {
              var ex = +/w$/.test(resizing), ey = +/^n/.test(resizing);
              offset = [
                xExtent[1 - ex] - origin[0],
                yExtent[1 - ey] - origin[1]
              ];
              origin[0] = xExtent[ex];
              origin[1] = yExtent[ey];
            } else if (d3.event.altKey)
              center = origin.slice();
            g.style('pointer-events', 'none').selectAll('.resize').style('display', null);
            d3.select('body').style('cursor', eventTarget.style('cursor'));
            event_({ type: 'brushstart' });
            brushmove();
            function keydown() {
              if (d3.event.keyCode == 32) {
                if (!dragging) {
                  center = null;
                  origin[0] -= xExtent[1];
                  origin[1] -= yExtent[1];
                  dragging = 2;
                }
                d3_eventPreventDefault();
              }
            }
            function keyup() {
              if (d3.event.keyCode == 32 && dragging == 2) {
                origin[0] += xExtent[1];
                origin[1] += yExtent[1];
                dragging = 0;
                d3_eventPreventDefault();
              }
            }
            function brushmove() {
              var point = d3.mouse(target), moved = false;
              if (offset) {
                point[0] += offset[0];
                point[1] += offset[1];
              }
              if (!dragging) {
                if (d3.event.altKey) {
                  if (!center)
                    center = [
                      (xExtent[0] + xExtent[1]) / 2,
                      (yExtent[0] + yExtent[1]) / 2
                    ];
                  origin[0] = xExtent[+(point[0] < center[0])];
                  origin[1] = yExtent[+(point[1] < center[1])];
                } else
                  center = null;
              }
              if (resizingX && move1(point, x, 0)) {
                redrawX(g);
                moved = true;
              }
              if (resizingY && move1(point, y, 1)) {
                redrawY(g);
                moved = true;
              }
              if (moved) {
                redraw(g);
                event_({
                  type: 'brush',
                  mode: dragging ? 'move' : 'resize'
                });
              }
            }
            function move1(point, scale, i) {
              var range = d3_scaleRange(scale), r0 = range[0], r1 = range[1], position = origin[i], extent = i ? yExtent : xExtent, size = extent[1] - extent[0], min, max;
              if (dragging) {
                r0 -= position;
                r1 -= size + position;
              }
              min = (i ? yClamp : xClamp) ? Math.max(r0, Math.min(r1, point[i])) : point[i];
              if (dragging) {
                max = (min += position) + size;
              } else {
                if (center)
                  position = Math.max(r0, Math.min(r1, 2 * center[i] - min));
                if (position < min) {
                  max = min;
                  min = position;
                } else {
                  max = position;
                }
              }
              if (extent[0] != min || extent[1] != max) {
                if (i)
                  yExtentDomain = null;
                else
                  xExtentDomain = null;
                extent[0] = min;
                extent[1] = max;
                return true;
              }
            }
            function brushend() {
              brushmove();
              g.style('pointer-events', 'all').selectAll('.resize').style('display', brush.empty() ? 'none' : null);
              d3.select('body').style('cursor', null);
              w.on('mousemove.brush', null).on('mouseup.brush', null).on('touchmove.brush', null).on('touchend.brush', null).on('keydown.brush', null).on('keyup.brush', null);
              dragRestore();
              event_({ type: 'brushend' });
            }
          }
          brush.x = function (z) {
            if (!arguments.length)
              return x;
            x = z;
            resizes = d3_svg_brushResizes[!x << 1 | !y];
            return brush;
          };
          brush.y = function (z) {
            if (!arguments.length)
              return y;
            y = z;
            resizes = d3_svg_brushResizes[!x << 1 | !y];
            return brush;
          };
          brush.clamp = function (z) {
            if (!arguments.length)
              return x && y ? [
                xClamp,
                yClamp
              ] : x ? xClamp : y ? yClamp : null;
            if (x && y)
              xClamp = !!z[0], yClamp = !!z[1];
            else if (x)
              xClamp = !!z;
            else if (y)
              yClamp = !!z;
            return brush;
          };
          brush.extent = function (z) {
            var x0, x1, y0, y1, t;
            if (!arguments.length) {
              if (x) {
                if (xExtentDomain) {
                  x0 = xExtentDomain[0], x1 = xExtentDomain[1];
                } else {
                  x0 = xExtent[0], x1 = xExtent[1];
                  if (x.invert)
                    x0 = x.invert(x0), x1 = x.invert(x1);
                  if (x1 < x0)
                    t = x0, x0 = x1, x1 = t;
                }
              }
              if (y) {
                if (yExtentDomain) {
                  y0 = yExtentDomain[0], y1 = yExtentDomain[1];
                } else {
                  y0 = yExtent[0], y1 = yExtent[1];
                  if (y.invert)
                    y0 = y.invert(y0), y1 = y.invert(y1);
                  if (y1 < y0)
                    t = y0, y0 = y1, y1 = t;
                }
              }
              return x && y ? [
                [
                  x0,
                  y0
                ],
                [
                  x1,
                  y1
                ]
              ] : x ? [
                x0,
                x1
              ] : y && [
                y0,
                y1
              ];
            }
            if (x) {
              x0 = z[0], x1 = z[1];
              if (y)
                x0 = x0[0], x1 = x1[0];
              xExtentDomain = [
                x0,
                x1
              ];
              if (x.invert)
                x0 = x(x0), x1 = x(x1);
              if (x1 < x0)
                t = x0, x0 = x1, x1 = t;
              if (x0 != xExtent[0] || x1 != xExtent[1])
                xExtent = [
                  x0,
                  x1
                ];
            }
            if (y) {
              y0 = z[0], y1 = z[1];
              if (x)
                y0 = y0[1], y1 = y1[1];
              yExtentDomain = [
                y0,
                y1
              ];
              if (y.invert)
                y0 = y(y0), y1 = y(y1);
              if (y1 < y0)
                t = y0, y0 = y1, y1 = t;
              if (y0 != yExtent[0] || y1 != yExtent[1])
                yExtent = [
                  y0,
                  y1
                ];
            }
            return brush;
          };
          brush.clear = function () {
            if (!brush.empty()) {
              xExtent = [
                0,
                0
              ], yExtent = [
                0,
                0
              ];
              xExtentDomain = yExtentDomain = null;
            }
            return brush;
          };
          brush.empty = function () {
            return !!x && xExtent[0] == xExtent[1] || !!y && yExtent[0] == yExtent[1];
          };
          return d3.rebind(brush, event, 'on');
        };
        var d3_svg_brushCursor = {
            n: 'ns-resize',
            e: 'ew-resize',
            s: 'ns-resize',
            w: 'ew-resize',
            nw: 'nwse-resize',
            ne: 'nesw-resize',
            se: 'nwse-resize',
            sw: 'nesw-resize'
          };
        var d3_svg_brushResizes = [
            [
              'n',
              'e',
              's',
              'w',
              'nw',
              'ne',
              'se',
              'sw'
            ],
            [
              'e',
              'w'
            ],
            [
              'n',
              's'
            ],
            []
          ];
        var d3_time = d3.time = {}, d3_date = Date, d3_time_daySymbols = [
            'Sunday',
            'Monday',
            'Tuesday',
            'Wednesday',
            'Thursday',
            'Friday',
            'Saturday'
          ];
        function d3_date_utc() {
          this._ = new Date(arguments.length > 1 ? Date.UTC.apply(this, arguments) : arguments[0]);
        }
        d3_date_utc.prototype = {
          getDate: function () {
            return this._.getUTCDate();
          },
          getDay: function () {
            return this._.getUTCDay();
          },
          getFullYear: function () {
            return this._.getUTCFullYear();
          },
          getHours: function () {
            return this._.getUTCHours();
          },
          getMilliseconds: function () {
            return this._.getUTCMilliseconds();
          },
          getMinutes: function () {
            return this._.getUTCMinutes();
          },
          getMonth: function () {
            return this._.getUTCMonth();
          },
          getSeconds: function () {
            return this._.getUTCSeconds();
          },
          getTime: function () {
            return this._.getTime();
          },
          getTimezoneOffset: function () {
            return 0;
          },
          valueOf: function () {
            return this._.valueOf();
          },
          setDate: function () {
            d3_time_prototype.setUTCDate.apply(this._, arguments);
          },
          setDay: function () {
            d3_time_prototype.setUTCDay.apply(this._, arguments);
          },
          setFullYear: function () {
            d3_time_prototype.setUTCFullYear.apply(this._, arguments);
          },
          setHours: function () {
            d3_time_prototype.setUTCHours.apply(this._, arguments);
          },
          setMilliseconds: function () {
            d3_time_prototype.setUTCMilliseconds.apply(this._, arguments);
          },
          setMinutes: function () {
            d3_time_prototype.setUTCMinutes.apply(this._, arguments);
          },
          setMonth: function () {
            d3_time_prototype.setUTCMonth.apply(this._, arguments);
          },
          setSeconds: function () {
            d3_time_prototype.setUTCSeconds.apply(this._, arguments);
          },
          setTime: function () {
            d3_time_prototype.setTime.apply(this._, arguments);
          }
        };
        var d3_time_prototype = Date.prototype;
        var d3_time_formatDateTime = '%a %b %e %X %Y', d3_time_formatDate = '%m/%d/%Y', d3_time_formatTime = '%H:%M:%S';
        var d3_time_days = [
            'Sunday',
            'Monday',
            'Tuesday',
            'Wednesday',
            'Thursday',
            'Friday',
            'Saturday'
          ], d3_time_dayAbbreviations = [
            'Sun',
            'Mon',
            'Tue',
            'Wed',
            'Thu',
            'Fri',
            'Sat'
          ], d3_time_months = [
            'January',
            'February',
            'March',
            'April',
            'May',
            'June',
            'July',
            'August',
            'September',
            'October',
            'November',
            'December'
          ], d3_time_monthAbbreviations = [
            'Jan',
            'Feb',
            'Mar',
            'Apr',
            'May',
            'Jun',
            'Jul',
            'Aug',
            'Sep',
            'Oct',
            'Nov',
            'Dec'
          ];
        function d3_time_interval(local, step, number) {
          function round(date) {
            var d0 = local(date), d1 = offset(d0, 1);
            return date - d0 < d1 - date ? d0 : d1;
          }
          function ceil(date) {
            step(date = local(new d3_date(date - 1)), 1);
            return date;
          }
          function offset(date, k) {
            step(date = new d3_date(+date), k);
            return date;
          }
          function range(t0, t1, dt) {
            var time = ceil(t0), times = [];
            if (dt > 1) {
              while (time < t1) {
                if (!(number(time) % dt))
                  times.push(new Date(+time));
                step(time, 1);
              }
            } else {
              while (time < t1)
                times.push(new Date(+time)), step(time, 1);
            }
            return times;
          }
          function range_utc(t0, t1, dt) {
            try {
              d3_date = d3_date_utc;
              var utc = new d3_date_utc();
              utc._ = t0;
              return range(utc, t1, dt);
            } finally {
              d3_date = Date;
            }
          }
          local.floor = local;
          local.round = round;
          local.ceil = ceil;
          local.offset = offset;
          local.range = range;
          var utc = local.utc = d3_time_interval_utc(local);
          utc.floor = utc;
          utc.round = d3_time_interval_utc(round);
          utc.ceil = d3_time_interval_utc(ceil);
          utc.offset = d3_time_interval_utc(offset);
          utc.range = range_utc;
          return local;
        }
        function d3_time_interval_utc(method) {
          return function (date, k) {
            try {
              d3_date = d3_date_utc;
              var utc = new d3_date_utc();
              utc._ = date;
              return method(utc, k)._;
            } finally {
              d3_date = Date;
            }
          };
        }
        d3_time.year = d3_time_interval(function (date) {
          date = d3_time.day(date);
          date.setMonth(0, 1);
          return date;
        }, function (date, offset) {
          date.setFullYear(date.getFullYear() + offset);
        }, function (date) {
          return date.getFullYear();
        });
        d3_time.years = d3_time.year.range;
        d3_time.years.utc = d3_time.year.utc.range;
        d3_time.day = d3_time_interval(function (date) {
          var day = new d3_date(2000, 0);
          day.setFullYear(date.getFullYear(), date.getMonth(), date.getDate());
          return day;
        }, function (date, offset) {
          date.setDate(date.getDate() + offset);
        }, function (date) {
          return date.getDate() - 1;
        });
        d3_time.days = d3_time.day.range;
        d3_time.days.utc = d3_time.day.utc.range;
        d3_time.dayOfYear = function (date) {
          var year = d3_time.year(date);
          return Math.floor((date - year - (date.getTimezoneOffset() - year.getTimezoneOffset()) * 60000) / 86400000);
        };
        d3_time_daySymbols.forEach(function (day, i) {
          day = day.toLowerCase();
          i = 7 - i;
          var interval = d3_time[day] = d3_time_interval(function (date) {
              (date = d3_time.day(date)).setDate(date.getDate() - (date.getDay() + i) % 7);
              return date;
            }, function (date, offset) {
              date.setDate(date.getDate() + Math.floor(offset) * 7);
            }, function (date) {
              var day = d3_time.year(date).getDay();
              return Math.floor((d3_time.dayOfYear(date) + (day + i) % 7) / 7) - (day !== i);
            });
          d3_time[day + 's'] = interval.range;
          d3_time[day + 's'].utc = interval.utc.range;
          d3_time[day + 'OfYear'] = function (date) {
            var day = d3_time.year(date).getDay();
            return Math.floor((d3_time.dayOfYear(date) + (day + i) % 7) / 7);
          };
        });
        d3_time.week = d3_time.sunday;
        d3_time.weeks = d3_time.sunday.range;
        d3_time.weeks.utc = d3_time.sunday.utc.range;
        d3_time.weekOfYear = d3_time.sundayOfYear;
        d3_time.format = d3_time_format;
        function d3_time_format(template) {
          var n = template.length;
          function format(date) {
            var string = [], i = -1, j = 0, c, p, f;
            while (++i < n) {
              if (template.charCodeAt(i) === 37) {
                string.push(template.substring(j, i));
                if ((p = d3_time_formatPads[c = template.charAt(++i)]) != null)
                  c = template.charAt(++i);
                if (f = d3_time_formats[c])
                  c = f(date, p == null ? c === 'e' ? ' ' : '0' : p);
                string.push(c);
                j = i + 1;
              }
            }
            string.push(template.substring(j, i));
            return string.join('');
          }
          format.parse = function (string) {
            var d = {
                y: 1900,
                m: 0,
                d: 1,
                H: 0,
                M: 0,
                S: 0,
                L: 0,
                Z: null
              }, i = d3_time_parse(d, template, string, 0);
            if (i != string.length)
              return null;
            if ('p' in d)
              d.H = d.H % 12 + d.p * 12;
            var localZ = d.Z != null && d3_date !== d3_date_utc, date = new (localZ ? d3_date_utc : d3_date)();
            if ('j' in d)
              date.setFullYear(d.y, 0, d.j);
            else if ('w' in d && ('W' in d || 'U' in d)) {
              date.setFullYear(d.y, 0, 1);
              date.setFullYear(d.y, 0, 'W' in d ? (d.w + 6) % 7 + d.W * 7 - (date.getDay() + 5) % 7 : d.w + d.U * 7 - (date.getDay() + 6) % 7);
            } else
              date.setFullYear(d.y, d.m, d.d);
            date.setHours(d.H + Math.floor(d.Z / 100), d.M + d.Z % 100, d.S, d.L);
            return localZ ? date._ : date;
          };
          format.toString = function () {
            return template;
          };
          return format;
        }
        function d3_time_parse(date, template, string, j) {
          var c, p, t, i = 0, n = template.length, m = string.length;
          while (i < n) {
            if (j >= m)
              return -1;
            c = template.charCodeAt(i++);
            if (c === 37) {
              t = template.charAt(i++);
              p = d3_time_parsers[t in d3_time_formatPads ? template.charAt(i++) : t];
              if (!p || (j = p(date, string, j)) < 0)
                return -1;
            } else if (c != string.charCodeAt(j++)) {
              return -1;
            }
          }
          return j;
        }
        function d3_time_formatRe(names) {
          return new RegExp('^(?:' + names.map(d3.requote).join('|') + ')', 'i');
        }
        function d3_time_formatLookup(names) {
          var map = new d3_Map(), i = -1, n = names.length;
          while (++i < n)
            map.set(names[i].toLowerCase(), i);
          return map;
        }
        function d3_time_formatPad(value, fill, width) {
          var sign = value < 0 ? '-' : '', string = (sign ? -value : value) + '', length = string.length;
          return sign + (length < width ? new Array(width - length + 1).join(fill) + string : string);
        }
        var d3_time_dayRe = d3_time_formatRe(d3_time_days), d3_time_dayLookup = d3_time_formatLookup(d3_time_days), d3_time_dayAbbrevRe = d3_time_formatRe(d3_time_dayAbbreviations), d3_time_dayAbbrevLookup = d3_time_formatLookup(d3_time_dayAbbreviations), d3_time_monthRe = d3_time_formatRe(d3_time_months), d3_time_monthLookup = d3_time_formatLookup(d3_time_months), d3_time_monthAbbrevRe = d3_time_formatRe(d3_time_monthAbbreviations), d3_time_monthAbbrevLookup = d3_time_formatLookup(d3_time_monthAbbreviations), d3_time_percentRe = /^%/;
        var d3_time_formatPads = {
            '-': '',
            _: ' ',
            '0': '0'
          };
        var d3_time_formats = {
            a: function (d) {
              return d3_time_dayAbbreviations[d.getDay()];
            },
            A: function (d) {
              return d3_time_days[d.getDay()];
            },
            b: function (d) {
              return d3_time_monthAbbreviations[d.getMonth()];
            },
            B: function (d) {
              return d3_time_months[d.getMonth()];
            },
            c: d3_time_format(d3_time_formatDateTime),
            d: function (d, p) {
              return d3_time_formatPad(d.getDate(), p, 2);
            },
            e: function (d, p) {
              return d3_time_formatPad(d.getDate(), p, 2);
            },
            H: function (d, p) {
              return d3_time_formatPad(d.getHours(), p, 2);
            },
            I: function (d, p) {
              return d3_time_formatPad(d.getHours() % 12 || 12, p, 2);
            },
            j: function (d, p) {
              return d3_time_formatPad(1 + d3_time.dayOfYear(d), p, 3);
            },
            L: function (d, p) {
              return d3_time_formatPad(d.getMilliseconds(), p, 3);
            },
            m: function (d, p) {
              return d3_time_formatPad(d.getMonth() + 1, p, 2);
            },
            M: function (d, p) {
              return d3_time_formatPad(d.getMinutes(), p, 2);
            },
            p: function (d) {
              return d.getHours() >= 12 ? 'PM' : 'AM';
            },
            S: function (d, p) {
              return d3_time_formatPad(d.getSeconds(), p, 2);
            },
            U: function (d, p) {
              return d3_time_formatPad(d3_time.sundayOfYear(d), p, 2);
            },
            w: function (d) {
              return d.getDay();
            },
            W: function (d, p) {
              return d3_time_formatPad(d3_time.mondayOfYear(d), p, 2);
            },
            x: d3_time_format(d3_time_formatDate),
            X: d3_time_format(d3_time_formatTime),
            y: function (d, p) {
              return d3_time_formatPad(d.getFullYear() % 100, p, 2);
            },
            Y: function (d, p) {
              return d3_time_formatPad(d.getFullYear() % 10000, p, 4);
            },
            Z: d3_time_zone,
            '%': function () {
              return '%';
            }
          };
        var d3_time_parsers = {
            a: d3_time_parseWeekdayAbbrev,
            A: d3_time_parseWeekday,
            b: d3_time_parseMonthAbbrev,
            B: d3_time_parseMonth,
            c: d3_time_parseLocaleFull,
            d: d3_time_parseDay,
            e: d3_time_parseDay,
            H: d3_time_parseHour24,
            I: d3_time_parseHour24,
            j: d3_time_parseDayOfYear,
            L: d3_time_parseMilliseconds,
            m: d3_time_parseMonthNumber,
            M: d3_time_parseMinutes,
            p: d3_time_parseAmPm,
            S: d3_time_parseSeconds,
            U: d3_time_parseWeekNumberSunday,
            w: d3_time_parseWeekdayNumber,
            W: d3_time_parseWeekNumberMonday,
            x: d3_time_parseLocaleDate,
            X: d3_time_parseLocaleTime,
            y: d3_time_parseYear,
            Y: d3_time_parseFullYear,
            Z: d3_time_parseZone,
            '%': d3_time_parseLiteralPercent
          };
        function d3_time_parseWeekdayAbbrev(date, string, i) {
          d3_time_dayAbbrevRe.lastIndex = 0;
          var n = d3_time_dayAbbrevRe.exec(string.substring(i));
          return n ? (date.w = d3_time_dayAbbrevLookup.get(n[0].toLowerCase()), i + n[0].length) : -1;
        }
        function d3_time_parseWeekday(date, string, i) {
          d3_time_dayRe.lastIndex = 0;
          var n = d3_time_dayRe.exec(string.substring(i));
          return n ? (date.w = d3_time_dayLookup.get(n[0].toLowerCase()), i + n[0].length) : -1;
        }
        function d3_time_parseWeekdayNumber(date, string, i) {
          d3_time_numberRe.lastIndex = 0;
          var n = d3_time_numberRe.exec(string.substring(i, i + 1));
          return n ? (date.w = +n[0], i + n[0].length) : -1;
        }
        function d3_time_parseWeekNumberSunday(date, string, i) {
          d3_time_numberRe.lastIndex = 0;
          var n = d3_time_numberRe.exec(string.substring(i));
          return n ? (date.U = +n[0], i + n[0].length) : -1;
        }
        function d3_time_parseWeekNumberMonday(date, string, i) {
          d3_time_numberRe.lastIndex = 0;
          var n = d3_time_numberRe.exec(string.substring(i));
          return n ? (date.W = +n[0], i + n[0].length) : -1;
        }
        function d3_time_parseMonthAbbrev(date, string, i) {
          d3_time_monthAbbrevRe.lastIndex = 0;
          var n = d3_time_monthAbbrevRe.exec(string.substring(i));
          return n ? (date.m = d3_time_monthAbbrevLookup.get(n[0].toLowerCase()), i + n[0].length) : -1;
        }
        function d3_time_parseMonth(date, string, i) {
          d3_time_monthRe.lastIndex = 0;
          var n = d3_time_monthRe.exec(string.substring(i));
          return n ? (date.m = d3_time_monthLookup.get(n[0].toLowerCase()), i + n[0].length) : -1;
        }
        function d3_time_parseLocaleFull(date, string, i) {
          return d3_time_parse(date, d3_time_formats.c.toString(), string, i);
        }
        function d3_time_parseLocaleDate(date, string, i) {
          return d3_time_parse(date, d3_time_formats.x.toString(), string, i);
        }
        function d3_time_parseLocaleTime(date, string, i) {
          return d3_time_parse(date, d3_time_formats.X.toString(), string, i);
        }
        function d3_time_parseFullYear(date, string, i) {
          d3_time_numberRe.lastIndex = 0;
          var n = d3_time_numberRe.exec(string.substring(i, i + 4));
          return n ? (date.y = +n[0], i + n[0].length) : -1;
        }
        function d3_time_parseYear(date, string, i) {
          d3_time_numberRe.lastIndex = 0;
          var n = d3_time_numberRe.exec(string.substring(i, i + 2));
          return n ? (date.y = d3_time_expandYear(+n[0]), i + n[0].length) : -1;
        }
        function d3_time_parseZone(date, string, i) {
          return /^[+-]\d{4}$/.test(string = string.substring(i, i + 5)) ? (date.Z = +string, i + 5) : -1;
        }
        function d3_time_expandYear(d) {
          return d + (d > 68 ? 1900 : 2000);
        }
        function d3_time_parseMonthNumber(date, string, i) {
          d3_time_numberRe.lastIndex = 0;
          var n = d3_time_numberRe.exec(string.substring(i, i + 2));
          return n ? (date.m = n[0] - 1, i + n[0].length) : -1;
        }
        function d3_time_parseDay(date, string, i) {
          d3_time_numberRe.lastIndex = 0;
          var n = d3_time_numberRe.exec(string.substring(i, i + 2));
          return n ? (date.d = +n[0], i + n[0].length) : -1;
        }
        function d3_time_parseDayOfYear(date, string, i) {
          d3_time_numberRe.lastIndex = 0;
          var n = d3_time_numberRe.exec(string.substring(i, i + 3));
          return n ? (date.j = +n[0], i + n[0].length) : -1;
        }
        function d3_time_parseHour24(date, string, i) {
          d3_time_numberRe.lastIndex = 0;
          var n = d3_time_numberRe.exec(string.substring(i, i + 2));
          return n ? (date.H = +n[0], i + n[0].length) : -1;
        }
        function d3_time_parseMinutes(date, string, i) {
          d3_time_numberRe.lastIndex = 0;
          var n = d3_time_numberRe.exec(string.substring(i, i + 2));
          return n ? (date.M = +n[0], i + n[0].length) : -1;
        }
        function d3_time_parseSeconds(date, string, i) {
          d3_time_numberRe.lastIndex = 0;
          var n = d3_time_numberRe.exec(string.substring(i, i + 2));
          return n ? (date.S = +n[0], i + n[0].length) : -1;
        }
        function d3_time_parseMilliseconds(date, string, i) {
          d3_time_numberRe.lastIndex = 0;
          var n = d3_time_numberRe.exec(string.substring(i, i + 3));
          return n ? (date.L = +n[0], i + n[0].length) : -1;
        }
        var d3_time_numberRe = /^\s*\d+/;
        function d3_time_parseAmPm(date, string, i) {
          var n = d3_time_amPmLookup.get(string.substring(i, i += 2).toLowerCase());
          return n == null ? -1 : (date.p = n, i);
        }
        var d3_time_amPmLookup = d3.map({
            am: 0,
            pm: 1
          });
        function d3_time_zone(d) {
          var z = d.getTimezoneOffset(), zs = z > 0 ? '-' : '+', zh = ~~(abs(z) / 60), zm = abs(z) % 60;
          return zs + d3_time_formatPad(zh, '0', 2) + d3_time_formatPad(zm, '0', 2);
        }
        function d3_time_parseLiteralPercent(date, string, i) {
          d3_time_percentRe.lastIndex = 0;
          var n = d3_time_percentRe.exec(string.substring(i, i + 1));
          return n ? i + n[0].length : -1;
        }
        d3_time_format.utc = d3_time_formatUtc;
        function d3_time_formatUtc(template) {
          var local = d3_time_format(template);
          function format(date) {
            try {
              d3_date = d3_date_utc;
              var utc = new d3_date();
              utc._ = date;
              return local(utc);
            } finally {
              d3_date = Date;
            }
          }
          format.parse = function (string) {
            try {
              d3_date = d3_date_utc;
              var date = local.parse(string);
              return date && date._;
            } finally {
              d3_date = Date;
            }
          };
          format.toString = local.toString;
          return format;
        }
        var d3_time_formatIso = d3_time_formatUtc('%Y-%m-%dT%H:%M:%S.%LZ');
        d3_time_format.iso = Date.prototype.toISOString && +new Date('2000-01-01T00:00:00.000Z') ? d3_time_formatIsoNative : d3_time_formatIso;
        function d3_time_formatIsoNative(date) {
          return date.toISOString();
        }
        d3_time_formatIsoNative.parse = function (string) {
          var date = new Date(string);
          return isNaN(date) ? null : date;
        };
        d3_time_formatIsoNative.toString = d3_time_formatIso.toString;
        d3_time.second = d3_time_interval(function (date) {
          return new d3_date(Math.floor(date / 1000) * 1000);
        }, function (date, offset) {
          date.setTime(date.getTime() + Math.floor(offset) * 1000);
        }, function (date) {
          return date.getSeconds();
        });
        d3_time.seconds = d3_time.second.range;
        d3_time.seconds.utc = d3_time.second.utc.range;
        d3_time.minute = d3_time_interval(function (date) {
          return new d3_date(Math.floor(date / 60000) * 60000);
        }, function (date, offset) {
          date.setTime(date.getTime() + Math.floor(offset) * 60000);
        }, function (date) {
          return date.getMinutes();
        });
        d3_time.minutes = d3_time.minute.range;
        d3_time.minutes.utc = d3_time.minute.utc.range;
        d3_time.hour = d3_time_interval(function (date) {
          var timezone = date.getTimezoneOffset() / 60;
          return new d3_date((Math.floor(date / 3600000 - timezone) + timezone) * 3600000);
        }, function (date, offset) {
          date.setTime(date.getTime() + Math.floor(offset) * 3600000);
        }, function (date) {
          return date.getHours();
        });
        d3_time.hours = d3_time.hour.range;
        d3_time.hours.utc = d3_time.hour.utc.range;
        d3_time.month = d3_time_interval(function (date) {
          date = d3_time.day(date);
          date.setDate(1);
          return date;
        }, function (date, offset) {
          date.setMonth(date.getMonth() + offset);
        }, function (date) {
          return date.getMonth();
        });
        d3_time.months = d3_time.month.range;
        d3_time.months.utc = d3_time.month.utc.range;
        function d3_time_scale(linear, methods, format) {
          function scale(x) {
            return linear(x);
          }
          scale.invert = function (x) {
            return d3_time_scaleDate(linear.invert(x));
          };
          scale.domain = function (x) {
            if (!arguments.length)
              return linear.domain().map(d3_time_scaleDate);
            linear.domain(x);
            return scale;
          };
          function tickMethod(extent, count) {
            var span = extent[1] - extent[0], target = span / count, i = d3.bisect(d3_time_scaleSteps, target);
            return i == d3_time_scaleSteps.length ? [
              methods.year,
              d3_scale_linearTickRange(extent.map(function (d) {
                return d / 31536000000;
              }), count)[2]
            ] : !i ? [
              d3_time_scaleMilliseconds,
              d3_scale_linearTickRange(extent, count)[2]
            ] : methods[target / d3_time_scaleSteps[i - 1] < d3_time_scaleSteps[i] / target ? i - 1 : i];
          }
          scale.nice = function (interval, skip) {
            var domain = scale.domain(), extent = d3_scaleExtent(domain), method = interval == null ? tickMethod(extent, 10) : typeof interval === 'number' && tickMethod(extent, interval);
            if (method)
              interval = method[0], skip = method[1];
            function skipped(date) {
              return !isNaN(date) && !interval.range(date, d3_time_scaleDate(+date + 1), skip).length;
            }
            return scale.domain(d3_scale_nice(domain, skip > 1 ? {
              floor: function (date) {
                while (skipped(date = interval.floor(date)))
                  date = d3_time_scaleDate(date - 1);
                return date;
              },
              ceil: function (date) {
                while (skipped(date = interval.ceil(date)))
                  date = d3_time_scaleDate(+date + 1);
                return date;
              }
            } : interval));
          };
          scale.ticks = function (interval, skip) {
            var extent = d3_scaleExtent(scale.domain()), method = interval == null ? tickMethod(extent, 10) : typeof interval === 'number' ? tickMethod(extent, interval) : !interval.range && [
                { range: interval },
                skip
              ];
            if (method)
              interval = method[0], skip = method[1];
            return interval.range(extent[0], d3_time_scaleDate(+extent[1] + 1), skip < 1 ? 1 : skip);
          };
          scale.tickFormat = function () {
            return format;
          };
          scale.copy = function () {
            return d3_time_scale(linear.copy(), methods, format);
          };
          return d3_scale_linearRebind(scale, linear);
        }
        function d3_time_scaleDate(t) {
          return new Date(t);
        }
        function d3_time_scaleFormat(formats) {
          return function (date) {
            var i = formats.length - 1, f = formats[i];
            while (!f[1](date))
              f = formats[--i];
            return f[0](date);
          };
        }
        var d3_time_scaleSteps = [
            1000,
            5000,
            15000,
            30000,
            60000,
            300000,
            900000,
            1800000,
            3600000,
            10800000,
            21600000,
            43200000,
            86400000,
            172800000,
            604800000,
            2592000000,
            7776000000,
            31536000000
          ];
        var d3_time_scaleLocalMethods = [
            [
              d3_time.second,
              1
            ],
            [
              d3_time.second,
              5
            ],
            [
              d3_time.second,
              15
            ],
            [
              d3_time.second,
              30
            ],
            [
              d3_time.minute,
              1
            ],
            [
              d3_time.minute,
              5
            ],
            [
              d3_time.minute,
              15
            ],
            [
              d3_time.minute,
              30
            ],
            [
              d3_time.hour,
              1
            ],
            [
              d3_time.hour,
              3
            ],
            [
              d3_time.hour,
              6
            ],
            [
              d3_time.hour,
              12
            ],
            [
              d3_time.day,
              1
            ],
            [
              d3_time.day,
              2
            ],
            [
              d3_time.week,
              1
            ],
            [
              d3_time.month,
              1
            ],
            [
              d3_time.month,
              3
            ],
            [
              d3_time.year,
              1
            ]
          ];
        var d3_time_scaleLocalFormats = [
            [
              d3_time_format('%Y'),
              d3_true
            ],
            [
              d3_time_format('%B'),
              function (d) {
                return d.getMonth();
              }
            ],
            [
              d3_time_format('%b %d'),
              function (d) {
                return d.getDate() != 1;
              }
            ],
            [
              d3_time_format('%a %d'),
              function (d) {
                return d.getDay() && d.getDate() != 1;
              }
            ],
            [
              d3_time_format('%I %p'),
              function (d) {
                return d.getHours();
              }
            ],
            [
              d3_time_format('%I:%M'),
              function (d) {
                return d.getMinutes();
              }
            ],
            [
              d3_time_format(':%S'),
              function (d) {
                return d.getSeconds();
              }
            ],
            [
              d3_time_format('.%L'),
              function (d) {
                return d.getMilliseconds();
              }
            ]
          ];
        var d3_time_scaleLocalFormat = d3_time_scaleFormat(d3_time_scaleLocalFormats);
        d3_time_scaleLocalMethods.year = d3_time.year;
        d3_time.scale = function () {
          return d3_time_scale(d3.scale.linear(), d3_time_scaleLocalMethods, d3_time_scaleLocalFormat);
        };
        var d3_time_scaleMilliseconds = {
            range: function (start, stop, step) {
              return d3.range(+start, +stop, step).map(d3_time_scaleDate);
            }
          };
        var d3_time_scaleUTCMethods = d3_time_scaleLocalMethods.map(function (m) {
            return [
              m[0].utc,
              m[1]
            ];
          });
        var d3_time_scaleUTCFormats = [
            [
              d3_time_formatUtc('%Y'),
              d3_true
            ],
            [
              d3_time_formatUtc('%B'),
              function (d) {
                return d.getUTCMonth();
              }
            ],
            [
              d3_time_formatUtc('%b %d'),
              function (d) {
                return d.getUTCDate() != 1;
              }
            ],
            [
              d3_time_formatUtc('%a %d'),
              function (d) {
                return d.getUTCDay() && d.getUTCDate() != 1;
              }
            ],
            [
              d3_time_formatUtc('%I %p'),
              function (d) {
                return d.getUTCHours();
              }
            ],
            [
              d3_time_formatUtc('%I:%M'),
              function (d) {
                return d.getUTCMinutes();
              }
            ],
            [
              d3_time_formatUtc(':%S'),
              function (d) {
                return d.getUTCSeconds();
              }
            ],
            [
              d3_time_formatUtc('.%L'),
              function (d) {
                return d.getUTCMilliseconds();
              }
            ]
          ];
        var d3_time_scaleUTCFormat = d3_time_scaleFormat(d3_time_scaleUTCFormats);
        d3_time_scaleUTCMethods.year = d3_time.year.utc;
        d3_time.scale.utc = function () {
          return d3_time_scale(d3.scale.linear(), d3_time_scaleUTCMethods, d3_time_scaleUTCFormat);
        };
        d3.text = d3_xhrType(function (request) {
          return request.responseText;
        });
        d3.json = function (url, callback) {
          return d3_xhr(url, 'application/json', d3_json, callback);
        };
        function d3_json(request) {
          return JSON.parse(request.responseText);
        }
        d3.html = function (url, callback) {
          return d3_xhr(url, 'text/html', d3_html, callback);
        };
        function d3_html(request) {
          var range = d3_document.createRange();
          range.selectNode(d3_document.body);
          return range.createContextualFragment(request.responseText);
        }
        d3.xml = d3_xhrType(function (request) {
          return request.responseXML;
        });
        return d3;
      }();
      ;
      return {
        d3: function () {
          return d3;
        }
      };
    }
  ]);
}.call(this));
(function () {
  angular.module('wwwsplit-timer.charts', ['d3']).directive('lineChart', [
    'd3Service',
    '$window',
    '$timeout',
    function (d3Service, $window, $timeout) {
      return {
        scope: { data: '=' },
        restrict: 'C',
        link: function ($scope, elem, attrs) {
          var chart_height, chart_width, d3, g, id_function, init, line, margin, origin_line, prev_chart_height, prev_chart_width, relative_time_function, resize_timer, svg, time_function, transition_time, update_chart, x, y;
          d3 = d3Service.d3();
          time_function = function (d) {
            return d.x;
          };
          relative_time_function = function (d) {
            return d.y;
          };
          id_function = function (d) {
            return d.id;
          };
          prev_chart_width = 0;
          prev_chart_height = 0;
          transition_time = 750;
          init = true;
          margin = {
            left: 10,
            right: 10,
            top: 10,
            bottom: 10
          };
          chart_width = window.getComputedStyle(elem[0]).width.substring(0, window.getComputedStyle(elem[0]).width.length - 2) - (margin.left + margin.right);
          chart_height = window.getComputedStyle(elem[0]).height.substring(0, window.getComputedStyle(elem[0]).height.length - 2) - (margin.bottom + margin.top);
          x = d3.scale.linear();
          y = d3.scale.linear();
          svg = d3.select(elem[0]).append('svg').attr('width', chart_width + margin.left + margin.right).attr('height', chart_height + margin.top + margin.bottom);
          g = svg.append('g').attr('transform', 'translate(' + margin.left + ', ' + margin.top + ')');
          line = d3.svg.line().x(function (d) {
            return x(time_function(d));
          }).y(function (d) {
            return y(relative_time_function(d));
          }).interpolate('linear');
          origin_line = d3.svg.line().x(function (d) {
            return d[0];
          }).y(function (d) {
            return y(d[1]);
          }).interpolate('linear');
          g.append('svg:path').attr('class', 'origin_line');
          g.append('svg:path').attr('class', 'timer_line');
          update_chart = function (init) {
            var adjusted_y_extent, circles, max_y_extent, y_extent;
            chart_width = window.getComputedStyle(elem[0]).width.substring(0, window.getComputedStyle(elem[0]).width.length - 2) - (margin.left + margin.right);
            chart_height = window.getComputedStyle(elem[0]).height.substring(0, window.getComputedStyle(elem[0]).height.length - 2) - (margin.bottom + margin.top);
            prev_chart_width = chart_width;
            prev_chart_height = chart_height;
            svg.attr('width', chart_width + margin.left + margin.right);
            svg.attr('height', chart_height + margin.top + margin.bottom);
            x.domain(d3.extent($scope.data, time_function)).range([
              0,
              chart_width
            ]);
            y_extent = d3.extent($scope.data, relative_time_function);
            max_y_extent = Math.max(Math.abs(y_extent[0]), Math.abs(y_extent[1]));
            adjusted_y_extent = [
              -max_y_extent,
              max_y_extent
            ];
            y.domain(adjusted_y_extent).range([
              chart_height,
              0
            ]);
            g.selectAll('path.origin_line').data([[
                [
                  0,
                  0
                ],
                [
                  chart_width,
                  0
                ]
              ]]).attr('d', origin_line);
            g.selectAll('path.timer_line').data([$scope.data]).transition().duration(transition_time).attr('d', line);
            circles = g.selectAll('circle').data($scope.data, id_function);
            circles.transition().duration(transition_time).attr('cx', function (d) {
              return x(time_function(d));
            }).attr('cy', function (d) {
              return y(relative_time_function(d));
            });
            circles.enter().append('circle').attr('cx', function (d) {
              return x(time_function(d));
            }).attr('cy', function (d) {
              return y(relative_time_function(d));
            }).attr('r', 4).attr('class', 'circle');
            return circles.exit().remove();
          };
          resize_timer = void 0;
          $window.onresize = function () {
            if (resize_timer != null) {
              $timeout.cancel(resize_timer);
            }
            return resize_timer = $timeout(function () {
              return update_chart(init);
            }, 100);
          };
          return $scope.$watch('data', function (new_value, old_value) {
            if (!old_value) {
              return;
            }
            return update_chart(init);
          }, true);
        }
      };
    }
  ]);
}.call(this));
(function () {
  angular.module('wwwsplit-timer', [
    'wwwsplit-timer.templates',
    'wwwsplit-timer.charts'
  ]).directive('timer', [
    '$timeout',
    function ($timeout) {
      return {
        restrict: 'C',
        scope: {
          current_run: '=ngModel',
          running: '=isRunning'
        },
        templateUrl: 'timer.tmpl',
        link: function ($scope, elem, attrs) {
          var calculate_split_statistics, find_elapsed_time, reset_splits, update_time_on_timeout;
          $scope.running = false;
          $scope.chart_data = [];
          calculate_split_statistics = function (split, index) {
            var i, _i, _ref;
            if (split.split_time == null) {
              split.live_data.relative_time = null;
              split.live_data.segment_diff = null;
              if (index === 0) {
                split.live_data.live_segment_time = split.live_data.live_time;
                split.live_data.segment_diff = null;
              } else {
                split.live_data.live_segment_time = split.live_data.live_time - $scope.current_run.splits[index - 1].live_data.live_time;
              }
            } else {
              split.live_data.relative_time = split.live_data.live_time - split.split_time;
              if (index === 0) {
                split.live_data.live_segment_time = split.live_data.live_time;
                split.live_data.segment_diff = split.live_data.relative_time;
              } else {
                split.live_data.live_segment_time = split.live_data.live_time - $scope.current_run.splits[index - 1].live_data.live_time;
                for (i = _i = _ref = index - 1; _ref <= 0 ? _i <= 0 : _i >= 0; i = _ref <= 0 ? ++_i : --_i) {
                  if ($scope.current_run.splits[i].live_data.relative_time != null) {
                    split.live_data.segment_diff = split.live_data.relative_time - $scope.current_run.splits[i].live_data.relative_time;
                    break;
                  }
                }
              }
            }
            if (split.best_segment == null || split.best_segment > split.live_data.live_segment_time) {
              return split.live_data.best_segment = true;
            } else {
              return split.live_data.best_segment = false;
            }
          };
          find_elapsed_time = function () {
            return $scope.elapsed_time = Date.now() - $scope.start_time;
          };
          update_time_on_timeout = function () {
            find_elapsed_time();
            return $scope.timer_timeout_promise = $timeout(update_time_on_timeout, 25);
          };
          $scope.start_timer = function () {
            var split, _i, _len, _ref;
            if (!$scope.current_run.splits.length) {
              return;
            }
            _ref = $scope.current_run.splits;
            for (_i = 0, _len = _ref.length; _i < _len; _i++) {
              split = _ref[_i];
              split.live_data = {};
            }
            $scope.current_split = $scope.current_run.splits[0];
            $timeout.cancel($scope.timer_timeout_promise);
            $scope.start_time = Date.now();
            $scope.chart_data = [];
            $scope.timer_timeout_promise = $timeout(update_time_on_timeout, 25);
            $scope.current_run.attempts++;
            $scope.running = true;
            $scope.is_finished = false;
            return $scope.is_editing = false;
          };
          reset_splits = function () {
            var split, _i, _len, _ref, _results;
            if ($scope.current_run.splits) {
              _ref = $scope.current_run.splits;
              _results = [];
              for (_i = 0, _len = _ref.length; _i < _len; _i++) {
                split = _ref[_i];
                _results.push(split.live_data = {});
              }
              return _results;
            }
          };
          $scope.reset_timer = function () {
            $timeout.cancel($scope.timer_timeout_promise);
            reset_splits();
            $scope.current_split = null;
            $scope.chart_data = [];
            $scope.running = false;
            $scope.is_finished = false;
            $scope.elapsed_time = null;
            return $scope.start_time = null;
          };
          $scope.split = function () {
            var data_point_id;
            $scope.current_split.live_data = {};
            $scope.current_split.live_data.live_time = $scope.elapsed_time;
            calculate_split_statistics($scope.current_split, $scope.current_run.splits.indexOf($scope.current_split));
            if ($scope.current_split.split_time != null) {
              data_point_id = (Math.random() * 1000000).toString(16);
              $scope.chart_data.push({
                x: $scope.current_split.live_data.live_time / 1000,
                y: $scope.current_split.live_data.relative_time / 1000,
                name: $scope.current_split.title,
                id: data_point_id
              });
              $scope.current_split.live_data.data_point_id = data_point_id;
            }
            if ($scope.current_split === $scope.current_run.splits[$scope.current_run.splits.length - 1]) {
              $scope.finish_run();
              return;
            }
            return $scope.current_split = $scope.current_run.splits[$scope.current_run.splits.indexOf($scope.current_split) + 1];
          };
          $scope.unsplit = function () {
            var d, i, _i, _len, _ref;
            $scope.current_split = $scope.current_run.splits[$scope.current_run.splits.indexOf($scope.current_split) - 1];
            _ref = $scope.chart_data;
            for (i = _i = 0, _len = _ref.length; _i < _len; i = ++_i) {
              d = _ref[i];
              if (d.id === $scope.current_split.live_data.data_point_id) {
                $scope.chart_data.splice(i, 1);
              }
            }
            return $scope.current_split.live_data = {};
          };
          return $scope.finish_run = function () {
            $timeout.cancel($scope.timer_timeout_promise);
            $scope.current_split = null;
            $scope.running = false;
            return $scope.is_finished = true;
          };
        }
      };
    }
  ]).filter('milliseconds_to_HMS', function () {
    return function (milliseconds) {
      var h, is_negative, m, s, seconds;
      if (milliseconds == null) {
        return '-';
      }
      if (!milliseconds) {
        milliseconds = 0;
      }
      if (milliseconds < 0) {
        is_negative = true;
        milliseconds *= -1;
      }
      seconds = milliseconds / 1000;
      h = Math.floor(seconds / 3600);
      m = Math.floor(seconds % 3600 / 60);
      s = (seconds % 3600 % 60).toFixed(2);
      return (is_negative ? '-' : '') + (h > 0 ? h + ':' : '') + (m > 0 || h > 0 ? (h > 0 && m < 10 ? '0' : '') + m + ':' : '0:') + (s < 10 ? '0' : '') + s;
    };
  });
}.call(this));
angular.module('wwwsplit-timer.templates', ['timer.tmpl']), angular.module('timer.tmpl', []).run([
  '$templateCache',
  function (a) {
    a.put('timer.tmpl', '<div class="ng-scope" id="control_nav">\n  <button class="control" id="start" ng-click="start_timer()" ng-disabled="running || is_editing">\n    <i class="icon-play icon-2x icon-white"></i>\n  </button>\n  <button disabled="disabled" class="control" id="reset" ng-click="reset_timer()" ng-disabled="!(running || is_finished)">\n    <i class="icon-refresh icon-2x icon-white"></i>\n  </button>\n  <button disabled="disabled" class="control" id="split" ng-click="split()" ng-disabled="!running">\n    <i class="icon-forward icon-2x icon-white"></i>\n  </button>\n  <button disabled="disabled" class="control" id="unsplit" ng-click="unsplit()" ng-disabled="!running || current_split == current_run.splits[0]">\n    <i class="icon-backward icon-2x icon-white"></i>\n  </button>\n  <button style="display: none;" class="control" id="cancel_edit" ng-click="cancel_edit()" ng-disabled="running || run_editor_form.$invalid" ng-show="is_editing">\n    <i class="icon-ban-circle icon-2x icon-white"></i>\n  </button>\n</div>\n\n<div id=\'current_run\'>\n  <table class=\'table\' id=\'current_run_splits\' ng-class=\'{"table-hover": !running}\'>\n    <tr id=\'current_run_title\'>\n      <th colspan=\'2\'>\n        <h1>\n          {{current_run.title}} #{{current_run.attempts}}\n        </h1>\n        <h4 id=\'current_run_game_title\'>\n          <a ng-href=\'#/games/{{current_run.game.id}}\'>\n            {{current_run.game.title}}\n          </a>\n        </h4>\n      </th>\n    </tr>\n    <tr class=\'current_run_split\' ng-class=\'{active_split: split == current_split}\' ng-repeat=\'split in current_run.splits\'>\n      <td class=\'split_title\'>\n      {{split.title}}\n      </td>\n      <td class=\'split_time\' ng-class=\'{ahead: split.live_data.live_time < split.split_time, behind: split.live_data.live_time > split.split_time,\n      gained_time: split.live_data.segment_diff < 0, lost_time: split.live_data.segment_diff > 0 ,\n      unknown: split.live_data.live_time && !split.live_data.relative_time,\n      best: split.live_data.best_segment}\'>\n        <span>{{split.live_data.relative_time || split.live_data.live_time || split.split_time | milliseconds_to_HMS}}</span>\n      </td>\n    </tr>\n  </table>\n</div>\n\n<div class=\'text-right\' id=\'clock\'>\n  <h1 class=\'clock\'>\n    {{(elapsed_time | milliseconds_to_HMS) || \'\'}}\n  </h1>\n</div>\n\n<div class="lineChart" data="chart_data"></div>');
  }
]), function () {
  angular.module('d3', []).factory('d3Service', [
    '$document',
    '$q',
    '$rootScope',
    function () {
      var a;
      return a = void 0, a = function () {
        function a(a) {
          return null != a && !isNaN(a);
        }
        function b(a) {
          return a.length;
        }
        function c(a) {
          for (var b = 1; a * b % 1;)
            b *= 10;
          return b;
        }
        function d(a, b) {
          try {
            for (var c in b)
              Object.defineProperty(a.prototype, c, {
                value: b[c],
                enumerable: !1
              });
          } catch (d) {
            a.prototype = b;
          }
        }
        function e() {
        }
        function f() {
        }
        function g(a, b, c) {
          return function () {
            var d = c.apply(b, arguments);
            return d === b ? a : d;
          };
        }
        function h(a, b) {
          if (b in a)
            return b;
          b = b.charAt(0).toUpperCase() + b.substring(1);
          for (var c = 0, d = hh.length; d > c; ++c) {
            var e = hh[c] + b;
            if (e in a)
              return e;
          }
        }
        function i() {
        }
        function j() {
        }
        function k(a) {
          function b() {
            for (var b, d = c, e = -1, f = d.length; ++e < f;)
              (b = d[e].on) && b.apply(this, arguments);
            return a;
          }
          var c = [], d = new e();
          return b.on = function (b, e) {
            var f, g = d.get(b);
            return arguments.length < 2 ? g && g.on : (g && (g.on = null, c = c.slice(0, f = c.indexOf(g)).concat(c.slice(f + 1)), d.remove(b)), e && c.push(d.set(b, { on: e })), a);
          }, b;
        }
        function l() {
          Sg.event.preventDefault();
        }
        function m() {
          for (var a, b = Sg.event; a = b.sourceEvent;)
            b = a;
          return b;
        }
        function n(a) {
          for (var b = new j(), c = 0, d = arguments.length; ++c < d;)
            b[arguments[c]] = k(b);
          return b.of = function (c, d) {
            return function (e) {
              try {
                var f = e.sourceEvent = Sg.event;
                e.target = a, Sg.event = e, b[e.type].apply(c, d);
              } finally {
                Sg.event = f;
              }
            };
          }, b;
        }
        function o(a) {
          return jh(a, oh), a;
        }
        function p(a) {
          return 'function' == typeof a ? a : function () {
            return kh(a, this);
          };
        }
        function q(a) {
          return 'function' == typeof a ? a : function () {
            return lh(a, this);
          };
        }
        function r(a, b) {
          function c() {
            this.removeAttribute(a);
          }
          function d() {
            this.removeAttributeNS(a.space, a.local);
          }
          function e() {
            this.setAttribute(a, b);
          }
          function f() {
            this.setAttributeNS(a.space, a.local, b);
          }
          function g() {
            var c = b.apply(this, arguments);
            null == c ? this.removeAttribute(a) : this.setAttribute(a, c);
          }
          function h() {
            var c = b.apply(this, arguments);
            null == c ? this.removeAttributeNS(a.space, a.local) : this.setAttributeNS(a.space, a.local, c);
          }
          return a = Sg.ns.qualify(a), null == b ? a.local ? d : c : 'function' == typeof b ? a.local ? h : g : a.local ? f : e;
        }
        function s(a) {
          return a.trim().replace(/\s+/g, ' ');
        }
        function t(a) {
          return new RegExp('(?:^|\\s+)' + Sg.requote(a) + '(?:\\s+|$)', 'g');
        }
        function u(a, b) {
          function c() {
            for (var c = -1; ++c < e;)
              a[c](this, b);
          }
          function d() {
            for (var c = -1, d = b.apply(this, arguments); ++c < e;)
              a[c](this, d);
          }
          a = a.trim().split(/\s+/).map(v);
          var e = a.length;
          return 'function' == typeof b ? d : c;
        }
        function v(a) {
          var b = t(a);
          return function (c, d) {
            if (e = c.classList)
              return d ? e.add(a) : e.remove(a);
            var e = c.getAttribute('class') || '';
            d ? (b.lastIndex = 0, b.test(e) || c.setAttribute('class', s(e + ' ' + a))) : c.setAttribute('class', s(e.replace(b, ' ')));
          };
        }
        function w(a, b, c) {
          function d() {
            this.style.removeProperty(a);
          }
          function e() {
            this.style.setProperty(a, b, c);
          }
          function f() {
            var d = b.apply(this, arguments);
            null == d ? this.style.removeProperty(a) : this.style.setProperty(a, d, c);
          }
          return null == b ? d : 'function' == typeof b ? f : e;
        }
        function x(a, b) {
          function c() {
            delete this[a];
          }
          function d() {
            this[a] = b;
          }
          function e() {
            var c = b.apply(this, arguments);
            null == c ? delete this[a] : this[a] = c;
          }
          return null == b ? c : 'function' == typeof b ? e : d;
        }
        function y(a) {
          return 'function' == typeof a ? a : (a = Sg.ns.qualify(a)).local ? function () {
            return this.ownerDocument.createElementNS(a.space, a.local);
          } : function () {
            return this.ownerDocument.createElementNS(this.namespaceURI, a);
          };
        }
        function z(a) {
          return { __data__: a };
        }
        function A(a) {
          return function () {
            return nh(this, a);
          };
        }
        function B(a) {
          return arguments.length || (a = Sg.ascending), function (b, c) {
            return b && c ? a(b.__data__, c.__data__) : !b - !c;
          };
        }
        function C(a, b) {
          for (var c = 0, d = a.length; d > c; c++)
            for (var e, f = a[c], g = 0, h = f.length; h > g; g++)
              (e = f[g]) && b(e, g, c);
          return a;
        }
        function D(a) {
          return jh(a, qh), a;
        }
        function E(a) {
          var b, c;
          return function (d, e, f) {
            var g, h = a[f].update, i = h.length;
            for (f != c && (c = f, b = 0), e >= b && (b = e + 1); !(g = h[b]) && ++b < i;);
            return g;
          };
        }
        function F() {
          var a = this.__transition__;
          a && ++a.active;
        }
        function G(a, b, c) {
          function d() {
            var b = this[g];
            b && (this.removeEventListener(a, b, b.$), delete this[g]);
          }
          function e() {
            var e = j(b, Ug(arguments));
            d.call(this), this.addEventListener(a, this[g] = e, e.$ = c), e._ = b;
          }
          function f() {
            var b, c = new RegExp('^__on([^.]+)' + Sg.requote(a) + '$');
            for (var d in this)
              if (b = d.match(c)) {
                var e = this[d];
                this.removeEventListener(b[1], e, e.$), delete this[d];
              }
          }
          var g = '__on' + a, h = a.indexOf('.'), j = H;
          h > 0 && (a = a.substring(0, h));
          var k = sh.get(a);
          return k && (a = k, j = I), h ? b ? e : d : b ? i : f;
        }
        function H(a, b) {
          return function (c) {
            var d = Sg.event;
            Sg.event = c, b[0] = this.__data__;
            try {
              a.apply(this, b);
            } finally {
              Sg.event = d;
            }
          };
        }
        function I(a, b) {
          var c = H(a, b);
          return function (a) {
            var b = this, d = a.relatedTarget;
            d && (d === b || 8 & d.compareDocumentPosition(b)) || c.call(b, a);
          };
        }
        function J() {
          var a = '.dragsuppress-' + ++uh, b = 'touchmove' + a, c = 'selectstart' + a, d = 'dragstart' + a, e = 'click' + a, f = Sg.select(Xg).on(b, l).on(c, l).on(d, l), g = Wg.style, h = g[th];
          return g[th] = 'none', function (b) {
            function c() {
              f.on(e, null);
            }
            f.on(a, null), g[th] = h, b && (f.on(e, function () {
              l(), c();
            }, !0), setTimeout(c, 0));
          };
        }
        function K(a, b) {
          b.changedTouches && (b = b.changedTouches[0]);
          var c = a.ownerSVGElement || a;
          if (c.createSVGPoint) {
            var d = c.createSVGPoint();
            if (0 > vh && (Xg.scrollX || Xg.scrollY)) {
              c = Sg.select('body').append('svg').style({
                position: 'absolute',
                top: 0,
                left: 0,
                margin: 0,
                padding: 0,
                border: 'none'
              }, 'important');
              var e = c[0][0].getScreenCTM();
              vh = !(e.f || e.e), c.remove();
            }
            return vh ? (d.x = b.pageX, d.y = b.pageY) : (d.x = b.clientX, d.y = b.clientY), d = d.matrixTransform(a.getScreenCTM().inverse()), [
              d.x,
              d.y
            ];
          }
          var f = a.getBoundingClientRect();
          return [
            b.clientX - f.left - a.clientLeft,
            b.clientY - f.top - a.clientTop
          ];
        }
        function L(a) {
          return a > 0 ? 1 : 0 > a ? -1 : 0;
        }
        function M(a) {
          return a > 1 ? 0 : -1 > a ? wh : Math.acos(a);
        }
        function N(a) {
          return a > 1 ? yh : -1 > a ? -yh : Math.asin(a);
        }
        function O(a) {
          return ((a = Math.exp(a)) - 1 / a) / 2;
        }
        function P(a) {
          return ((a = Math.exp(a)) + 1 / a) / 2;
        }
        function Q(a) {
          return ((a = Math.exp(2 * a)) - 1) / (a + 1);
        }
        function R(a) {
          return (a = Math.sin(a / 2)) * a;
        }
        function S() {
        }
        function T(a, b, c) {
          return new U(a, b, c);
        }
        function U(a, b, c) {
          this.h = a, this.s = b, this.l = c;
        }
        function V(a, b, c) {
          function d(a) {
            return a > 360 ? a -= 360 : 0 > a && (a += 360), 60 > a ? f + (g - f) * a / 60 : 180 > a ? g : 240 > a ? f + (g - f) * (240 - a) / 60 : f;
          }
          function e(a) {
            return Math.round(255 * d(a));
          }
          var f, g;
          return a = isNaN(a) ? 0 : (a %= 360) < 0 ? a + 360 : a, b = isNaN(b) ? 0 : 0 > b ? 0 : b > 1 ? 1 : b, c = 0 > c ? 0 : c > 1 ? 1 : c, g = 0.5 >= c ? c * (1 + b) : c + b - c * b, f = 2 * c - g, gb(e(a + 120), e(a), e(a - 120));
        }
        function W(a, b, c) {
          return new X(a, b, c);
        }
        function X(a, b, c) {
          this.h = a, this.c = b, this.l = c;
        }
        function Y(a, b, c) {
          return isNaN(a) && (a = 0), isNaN(b) && (b = 0), Z(c, Math.cos(a *= Bh) * b, Math.sin(a) * b);
        }
        function Z(a, b, c) {
          return new $(a, b, c);
        }
        function $(a, b, c) {
          this.l = a, this.a = b, this.b = c;
        }
        function _(a, b, c) {
          var d = (a + 16) / 116, e = d + b / 500, f = d - c / 200;
          return e = bb(e) * Mh, d = bb(d) * Nh, f = bb(f) * Oh, gb(db(3.2404542 * e - 1.5371385 * d - 0.4985314 * f), db(-0.969266 * e + 1.8760108 * d + 0.041556 * f), db(0.0556434 * e - 0.2040259 * d + 1.0572252 * f));
        }
        function ab(a, b, c) {
          return a > 0 ? W(Math.atan2(c, b) * Ch, Math.sqrt(b * b + c * c), a) : W(0 / 0, 0 / 0, a);
        }
        function bb(a) {
          return a > 0.206893034 ? a * a * a : (a - 4 / 29) / 7.787037;
        }
        function cb(a) {
          return a > 0.008856 ? Math.pow(a, 1 / 3) : 7.787037 * a + 4 / 29;
        }
        function db(a) {
          return Math.round(255 * (0.00304 >= a ? 12.92 * a : 1.055 * Math.pow(a, 1 / 2.4) - 0.055));
        }
        function eb(a) {
          return gb(a >> 16, 255 & a >> 8, 255 & a);
        }
        function fb(a) {
          return eb(a) + '';
        }
        function gb(a, b, c) {
          return new hb(a, b, c);
        }
        function hb(a, b, c) {
          this.r = a, this.g = b, this.b = c;
        }
        function ib(a) {
          return 16 > a ? '0' + Math.max(0, a).toString(16) : Math.min(255, a).toString(16);
        }
        function jb(a, b, c) {
          var d, e, f, g = 0, h = 0, i = 0;
          if (d = /([a-z]+)\((.*)\)/i.exec(a))
            switch (e = d[2].split(','), d[1]) {
            case 'hsl':
              return c(parseFloat(e[0]), parseFloat(e[1]) / 100, parseFloat(e[2]) / 100);
            case 'rgb':
              return b(nb(e[0]), nb(e[1]), nb(e[2]));
            }
          return (f = Rh.get(a)) ? b(f.r, f.g, f.b) : (null != a && '#' === a.charAt(0) && (4 === a.length ? (g = a.charAt(1), g += g, h = a.charAt(2), h += h, i = a.charAt(3), i += i) : 7 === a.length && (g = a.substring(1, 3), h = a.substring(3, 5), i = a.substring(5, 7)), g = parseInt(g, 16), h = parseInt(h, 16), i = parseInt(i, 16)), b(g, h, i));
        }
        function kb(a, b, c) {
          var d, e, f = Math.min(a /= 255, b /= 255, c /= 255), g = Math.max(a, b, c), h = g - f, i = (g + f) / 2;
          return h ? (e = 0.5 > i ? h / (g + f) : h / (2 - g - f), d = a == g ? (b - c) / h + (c > b ? 6 : 0) : b == g ? (c - a) / h + 2 : (a - b) / h + 4, d *= 60) : (d = 0 / 0, e = i > 0 && 1 > i ? 0 : d), T(d, e, i);
        }
        function lb(a, b, c) {
          a = mb(a), b = mb(b), c = mb(c);
          var d = cb((0.4124564 * a + 0.3575761 * b + 0.1804375 * c) / Mh), e = cb((0.2126729 * a + 0.7151522 * b + 0.072175 * c) / Nh), f = cb((0.0193339 * a + 0.119192 * b + 0.9503041 * c) / Oh);
          return Z(116 * e - 16, 500 * (d - e), 200 * (e - f));
        }
        function mb(a) {
          return (a /= 255) <= 0.04045 ? a / 12.92 : Math.pow((a + 0.055) / 1.055, 2.4);
        }
        function nb(a) {
          var b = parseFloat(a);
          return '%' === a.charAt(a.length - 1) ? Math.round(2.55 * b) : b;
        }
        function ob(a) {
          return 'function' == typeof a ? a : function () {
            return a;
          };
        }
        function pb(a) {
          return a;
        }
        function qb(a) {
          return function (b, c, d) {
            return 2 === arguments.length && 'function' == typeof c && (d = c, c = null), rb(b, c, a, d);
          };
        }
        function rb(a, b, c, d) {
          function e() {
            var a, b = i.status;
            if (!b && i.responseText || b >= 200 && 300 > b || 304 === b) {
              try {
                a = c.call(f, i);
              } catch (d) {
                return g.error.call(f, d), void 0;
              }
              g.load.call(f, a);
            } else
              g.error.call(f, i);
          }
          var f = {}, g = Sg.dispatch('beforesend', 'progress', 'load', 'error'), h = {}, i = new XMLHttpRequest(), j = null;
          return !Xg.XDomainRequest || 'withCredentials' in i || !/^(http(s)?:)?\/\//.test(a) || (i = new XDomainRequest()), 'onload' in i ? i.onload = i.onerror = e : i.onreadystatechange = function () {
            i.readyState > 3 && e();
          }, i.onprogress = function (a) {
            var b = Sg.event;
            Sg.event = a;
            try {
              g.progress.call(f, i);
            } finally {
              Sg.event = b;
            }
          }, f.header = function (a, b) {
            return a = (a + '').toLowerCase(), arguments.length < 2 ? h[a] : (null == b ? delete h[a] : h[a] = b + '', f);
          }, f.mimeType = function (a) {
            return arguments.length ? (b = null == a ? null : a + '', f) : b;
          }, f.responseType = function (a) {
            return arguments.length ? (j = a, f) : j;
          }, f.response = function (a) {
            return c = a, f;
          }, [
            'get',
            'post'
          ].forEach(function (a) {
            f[a] = function () {
              return f.send.apply(f, [a].concat(Ug(arguments)));
            };
          }), f.send = function (c, d, e) {
            if (2 === arguments.length && 'function' == typeof d && (e = d, d = null), i.open(c, a, !0), null == b || 'accept' in h || (h.accept = b + ',*/*'), i.setRequestHeader)
              for (var k in h)
                i.setRequestHeader(k, h[k]);
            return null != b && i.overrideMimeType && i.overrideMimeType(b), null != j && (i.responseType = j), null != e && f.on('error', e).on('load', function (a) {
              e(null, a);
            }), g.beforesend.call(f, i), i.send(null == d ? null : d), f;
          }, f.abort = function () {
            return i.abort(), f;
          }, Sg.rebind(f, g, 'on'), null == d ? f : f.get(sb(d));
        }
        function sb(a) {
          return 1 === a.length ? function (b, c) {
            a(null == b ? c : null);
          } : a;
        }
        function tb() {
          var a = ub(), b = vb() - a;
          b > 24 ? (isFinite(b) && (clearTimeout(Vh), Vh = setTimeout(tb, b)), Uh = 0) : (Uh = 1, Xh(tb));
        }
        function ub() {
          var a = Date.now();
          for (Wh = Sh; Wh;)
            a >= Wh.t && (Wh.f = Wh.c(a - Wh.t)), Wh = Wh.n;
          return a;
        }
        function vb() {
          for (var a, b = Sh, c = 1 / 0; b;)
            b.f ? b = a ? a.n = b.n : Sh = b.n : (b.t < c && (c = b.t), b = (a = b).n);
          return Th = a, c;
        }
        function wb(a, b) {
          var c = Math.pow(10, 3 * eh(8 - b));
          return {
            scale: b > 8 ? function (a) {
              return a / c;
            } : function (a) {
              return a * c;
            },
            symbol: a
          };
        }
        function xb(a, b) {
          return b - (a ? Math.ceil(Math.log(a) / Math.LN10) : 1);
        }
        function yb(a) {
          return a + '';
        }
        function zb() {
        }
        function Ab(a, b, c) {
          var d = c.s = a + b, e = d - a, f = d - e;
          c.t = a - f + (b - e);
        }
        function Bb(a, b) {
          a && hi.hasOwnProperty(a.type) && hi[a.type](a, b);
        }
        function Cb(a, b, c) {
          var d, e = -1, f = a.length - c;
          for (b.lineStart(); ++e < f;)
            d = a[e], b.point(d[0], d[1], d[2]);
          b.lineEnd();
        }
        function Db(a, b) {
          var c = -1, d = a.length;
          for (b.polygonStart(); ++c < d;)
            Cb(a[c], b, 1);
          b.polygonEnd();
        }
        function Eb() {
          function a(a, b) {
            a *= Bh, b = b * Bh / 2 + wh / 4;
            var c = a - d, g = Math.cos(b), h = Math.sin(b), i = f * h, j = e * g + i * Math.cos(c), k = i * Math.sin(c);
            ji.add(Math.atan2(k, j)), d = a, e = g, f = h;
          }
          var b, c, d, e, f;
          ki.point = function (g, h) {
            ki.point = a, d = (b = g) * Bh, e = Math.cos(h = (c = h) * Bh / 2 + wh / 4), f = Math.sin(h);
          }, ki.lineEnd = function () {
            a(b, c);
          };
        }
        function Fb(a) {
          var b = a[0], c = a[1], d = Math.cos(c);
          return [
            d * Math.cos(b),
            d * Math.sin(b),
            Math.sin(c)
          ];
        }
        function Gb(a, b) {
          return a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
        }
        function Hb(a, b) {
          return [
            a[1] * b[2] - a[2] * b[1],
            a[2] * b[0] - a[0] * b[2],
            a[0] * b[1] - a[1] * b[0]
          ];
        }
        function Ib(a, b) {
          a[0] += b[0], a[1] += b[1], a[2] += b[2];
        }
        function Jb(a, b) {
          return [
            a[0] * b,
            a[1] * b,
            a[2] * b
          ];
        }
        function Kb(a) {
          var b = Math.sqrt(a[0] * a[0] + a[1] * a[1] + a[2] * a[2]);
          a[0] /= b, a[1] /= b, a[2] /= b;
        }
        function Lb(a) {
          return [
            Math.atan2(a[1], a[0]),
            N(a[2])
          ];
        }
        function Mb(a, b) {
          return eh(a[0] - b[0]) < zh && eh(a[1] - b[1]) < zh;
        }
        function Nb(a, b) {
          a *= Bh;
          var c = Math.cos(b *= Bh);
          Ob(c * Math.cos(a), c * Math.sin(a), Math.sin(b));
        }
        function Ob(a, b, c) {
          ++li, ni += (a - ni) / li, oi += (b - oi) / li, pi += (c - pi) / li;
        }
        function Pb() {
          function a(a, e) {
            a *= Bh;
            var f = Math.cos(e *= Bh), g = f * Math.cos(a), h = f * Math.sin(a), i = Math.sin(e), j = Math.atan2(Math.sqrt((j = c * i - d * h) * j + (j = d * g - b * i) * j + (j = b * h - c * g) * j), b * g + c * h + d * i);
            mi += j, qi += j * (b + (b = g)), ri += j * (c + (c = h)), si += j * (d + (d = i)), Ob(b, c, d);
          }
          var b, c, d;
          wi.point = function (e, f) {
            e *= Bh;
            var g = Math.cos(f *= Bh);
            b = g * Math.cos(e), c = g * Math.sin(e), d = Math.sin(f), wi.point = a, Ob(b, c, d);
          };
        }
        function Qb() {
          wi.point = Nb;
        }
        function Rb() {
          function a(a, b) {
            a *= Bh;
            var c = Math.cos(b *= Bh), g = c * Math.cos(a), h = c * Math.sin(a), i = Math.sin(b), j = e * i - f * h, k = f * g - d * i, l = d * h - e * g, m = Math.sqrt(j * j + k * k + l * l), n = d * g + e * h + f * i, o = m && -M(n) / m, p = Math.atan2(m, n);
            ti += o * j, ui += o * k, vi += o * l, mi += p, qi += p * (d + (d = g)), ri += p * (e + (e = h)), si += p * (f + (f = i)), Ob(d, e, f);
          }
          var b, c, d, e, f;
          wi.point = function (g, h) {
            b = g, c = h, wi.point = a, g *= Bh;
            var i = Math.cos(h *= Bh);
            d = i * Math.cos(g), e = i * Math.sin(g), f = Math.sin(h), Ob(d, e, f);
          }, wi.lineEnd = function () {
            a(b, c), wi.lineEnd = Qb, wi.point = Nb;
          };
        }
        function Sb() {
          return !0;
        }
        function Tb(a, b, c, d, e) {
          var f = [], g = [];
          if (a.forEach(function (a) {
              if (!((b = a.length - 1) <= 0)) {
                var b, c = a[0], d = a[b];
                if (Mb(c, d)) {
                  e.lineStart();
                  for (var h = 0; b > h; ++h)
                    e.point((c = a[h])[0], c[1]);
                  return e.lineEnd(), void 0;
                }
                var i = new Vb(c, a, null, !0), j = new Vb(c, null, i, !1);
                i.o = j, f.push(i), g.push(j), i = new Vb(d, a, null, !1), j = new Vb(d, null, i, !0), i.o = j, f.push(i), g.push(j);
              }
            }), g.sort(b), Ub(f), Ub(g), f.length) {
            for (var h = 0, i = c, j = g.length; j > h; ++h)
              g[h].e = i = !i;
            for (var k, l, m = f[0];;) {
              for (var n = m, o = !0; n.v;)
                if ((n = n.n) === m)
                  return;
              k = n.z, e.lineStart();
              do {
                if (n.v = n.o.v = !0, n.e) {
                  if (o)
                    for (var h = 0, j = k.length; j > h; ++h)
                      e.point((l = k[h])[0], l[1]);
                  else
                    d(n.x, n.n.x, 1, e);
                  n = n.n;
                } else {
                  if (o) {
                    k = n.p.z;
                    for (var h = k.length - 1; h >= 0; --h)
                      e.point((l = k[h])[0], l[1]);
                  } else
                    d(n.x, n.p.x, -1, e);
                  n = n.p;
                }
                n = n.o, k = n.z, o = !o;
              } while (!n.v);
              e.lineEnd();
            }
          }
        }
        function Ub(a) {
          if (b = a.length) {
            for (var b, c, d = 0, e = a[0]; ++d < b;)
              e.n = c = a[d], c.p = e, e = c;
            e.n = c = a[0], c.p = e;
          }
        }
        function Vb(a, b, c, d) {
          this.x = a, this.z = b, this.o = c, this.e = d, this.v = !1, this.n = this.p = null;
        }
        function Wb(a, b, c, d) {
          return function (e, f) {
            function g(b, c) {
              var d = e(b, c);
              a(b = d[0], c = d[1]) && f.point(b, c);
            }
            function h(a, b) {
              var c = e(a, b);
              q.point(c[0], c[1]);
            }
            function i() {
              s.point = h, q.lineStart();
            }
            function j() {
              s.point = g, q.lineEnd();
            }
            function k(a, b) {
              p.push([
                a,
                b
              ]);
              var c = e(a, b);
              u.point(c[0], c[1]);
            }
            function l() {
              u.lineStart(), p = [];
            }
            function m() {
              k(p[0][0], p[0][1]), u.lineEnd();
              var a, b = u.clean(), c = t.buffer(), d = c.length;
              if (p.pop(), o.push(p), p = null, d) {
                if (1 & b) {
                  a = c[0];
                  var e, d = a.length - 1, g = -1;
                  for (f.lineStart(); ++g < d;)
                    f.point((e = a[g])[0], e[1]);
                  return f.lineEnd(), void 0;
                }
                d > 1 && 2 & b && c.push(c.pop().concat(c.shift())), n.push(c.filter(Xb));
              }
            }
            var n, o, p, q = b(f), r = e.invert(d[0], d[1]), s = {
                point: g,
                lineStart: i,
                lineEnd: j,
                polygonStart: function () {
                  s.point = k, s.lineStart = l, s.lineEnd = m, n = [], o = [], f.polygonStart();
                },
                polygonEnd: function () {
                  s.point = g, s.lineStart = i, s.lineEnd = j, n = Sg.merge(n);
                  var a = $b(r, o);
                  n.length ? Tb(n, Zb, a, c, f) : a && (f.lineStart(), c(null, null, 1, f), f.lineEnd()), f.polygonEnd(), n = o = null;
                },
                sphere: function () {
                  f.polygonStart(), f.lineStart(), c(null, null, 1, f), f.lineEnd(), f.polygonEnd();
                }
              }, t = Yb(), u = b(t);
            return s;
          };
        }
        function Xb(a) {
          return a.length > 1;
        }
        function Yb() {
          var a, b = [];
          return {
            lineStart: function () {
              b.push(a = []);
            },
            point: function (b, c) {
              a.push([
                b,
                c
              ]);
            },
            lineEnd: i,
            buffer: function () {
              var c = b;
              return b = [], a = null, c;
            },
            rejoin: function () {
              b.length > 1 && b.push(b.pop().concat(b.shift()));
            }
          };
        }
        function Zb(a, b) {
          return ((a = a.x)[0] < 0 ? a[1] - yh - zh : yh - a[1]) - ((b = b.x)[0] < 0 ? b[1] - yh - zh : yh - b[1]);
        }
        function $b(a, b) {
          var c = a[0], d = a[1], e = [
              Math.sin(c),
              -Math.cos(c),
              0
            ], f = 0, g = 0;
          ji.reset();
          for (var h = 0, i = b.length; i > h; ++h) {
            var j = b[h], k = j.length;
            if (k)
              for (var l = j[0], m = l[0], n = l[1] / 2 + wh / 4, o = Math.sin(n), p = Math.cos(n), q = 1;;) {
                q === k && (q = 0), a = j[q];
                var r = a[0], s = a[1] / 2 + wh / 4, t = Math.sin(s), u = Math.cos(s), v = r - m, w = eh(v) > wh, x = o * t;
                if (ji.add(Math.atan2(x * Math.sin(v), p * u + x * Math.cos(v))), f += w ? v + (v >= 0 ? xh : -xh) : v, w ^ m >= c ^ r >= c) {
                  var y = Hb(Fb(l), Fb(a));
                  Kb(y);
                  var z = Hb(e, y);
                  Kb(z);
                  var A = (w ^ v >= 0 ? -1 : 1) * N(z[2]);
                  (d > A || d === A && (y[0] || y[1])) && (g += w ^ v >= 0 ? 1 : -1);
                }
                if (!q++)
                  break;
                m = r, o = t, p = u, l = a;
              }
          }
          return (-zh > f || zh > f && 0 > ji) ^ 1 & g;
        }
        function _b(a) {
          var b, c = 0 / 0, d = 0 / 0, e = 0 / 0;
          return {
            lineStart: function () {
              a.lineStart(), b = 1;
            },
            point: function (f, g) {
              var h = f > 0 ? wh : -wh, i = eh(f - c);
              eh(i - wh) < zh ? (a.point(c, d = (d + g) / 2 > 0 ? yh : -yh), a.point(e, d), a.lineEnd(), a.lineStart(), a.point(h, d), a.point(f, d), b = 0) : e !== h && i >= wh && (eh(c - e) < zh && (c -= e * zh), eh(f - h) < zh && (f -= h * zh), d = ac(c, d, f, g), a.point(e, d), a.lineEnd(), a.lineStart(), a.point(h, d), b = 0), a.point(c = f, d = g), e = h;
            },
            lineEnd: function () {
              a.lineEnd(), c = d = 0 / 0;
            },
            clean: function () {
              return 2 - b;
            }
          };
        }
        function ac(a, b, c, d) {
          var e, f, g = Math.sin(a - c);
          return eh(g) > zh ? Math.atan((Math.sin(b) * (f = Math.cos(d)) * Math.sin(c) - Math.sin(d) * (e = Math.cos(b)) * Math.sin(a)) / (e * f * g)) : (b + d) / 2;
        }
        function bc(a, b, c, d) {
          var e;
          if (null == a)
            e = c * yh, d.point(-wh, e), d.point(0, e), d.point(wh, e), d.point(wh, 0), d.point(wh, -e), d.point(0, -e), d.point(-wh, -e), d.point(-wh, 0), d.point(-wh, e);
          else if (eh(a[0] - b[0]) > zh) {
            var f = a[0] < b[0] ? wh : -wh;
            e = c * f / 2, d.point(-f, e), d.point(0, e), d.point(f, e);
          } else
            d.point(b[0], b[1]);
        }
        function cc(a) {
          function b(a, b) {
            return Math.cos(a) * Math.cos(b) > f;
          }
          function c(a) {
            var c, f, i, j, k;
            return {
              lineStart: function () {
                j = i = !1, k = 1;
              },
              point: function (l, m) {
                var n, o = [
                    l,
                    m
                  ], p = b(l, m), q = g ? p ? 0 : e(l, m) : p ? e(l + (0 > l ? wh : -wh), m) : 0;
                if (!c && (j = i = p) && a.lineStart(), p !== i && (n = d(c, o), (Mb(c, n) || Mb(o, n)) && (o[0] += zh, o[1] += zh, p = b(o[0], o[1]))), p !== i)
                  k = 0, p ? (a.lineStart(), n = d(o, c), a.point(n[0], n[1])) : (n = d(c, o), a.point(n[0], n[1]), a.lineEnd()), c = n;
                else if (h && c && g ^ p) {
                  var r;
                  q & f || !(r = d(o, c, !0)) || (k = 0, g ? (a.lineStart(), a.point(r[0][0], r[0][1]), a.point(r[1][0], r[1][1]), a.lineEnd()) : (a.point(r[1][0], r[1][1]), a.lineEnd(), a.lineStart(), a.point(r[0][0], r[0][1])));
                }
                !p || c && Mb(c, o) || a.point(o[0], o[1]), c = o, i = p, f = q;
              },
              lineEnd: function () {
                i && a.lineEnd(), c = null;
              },
              clean: function () {
                return k | (j && i) << 1;
              }
            };
          }
          function d(a, b, c) {
            var d = Fb(a), e = Fb(b), g = [
                1,
                0,
                0
              ], h = Hb(d, e), i = Gb(h, h), j = h[0], k = i - j * j;
            if (!k)
              return !c && a;
            var l = f * i / k, m = -f * j / k, n = Hb(g, h), o = Jb(g, l), p = Jb(h, m);
            Ib(o, p);
            var q = n, r = Gb(o, q), s = Gb(q, q), t = r * r - s * (Gb(o, o) - 1);
            if (!(0 > t)) {
              var u = Math.sqrt(t), v = Jb(q, (-r - u) / s);
              if (Ib(v, o), v = Lb(v), !c)
                return v;
              var w, x = a[0], y = b[0], z = a[1], A = b[1];
              x > y && (w = x, x = y, y = w);
              var B = y - x, C = eh(B - wh) < zh, D = C || zh > B;
              if (!C && z > A && (w = z, z = A, A = w), D ? C ? z + A > 0 ^ v[1] < (eh(v[0] - x) < zh ? z : A) : z <= v[1] && v[1] <= A : B > wh ^ (x <= v[0] && v[0] <= y)) {
                var E = Jb(q, (-r + u) / s);
                return Ib(E, o), [
                  v,
                  Lb(E)
                ];
              }
            }
          }
          function e(b, c) {
            var d = g ? a : wh - a, e = 0;
            return -d > b ? e |= 1 : b > d && (e |= 2), -d > c ? e |= 4 : c > d && (e |= 8), e;
          }
          var f = Math.cos(a), g = f > 0, h = eh(f) > zh, i = Dc(a, 6 * Bh);
          return Wb(b, c, i, g ? [
            0,
            -a
          ] : [
            -wh,
            a - wh
          ]);
        }
        function dc(a, b, c, d) {
          return function (e) {
            var f, g = e.a, h = e.b, i = g.x, j = g.y, k = h.x, l = h.y, m = 0, n = 1, o = k - i, p = l - j;
            if (f = a - i, o || !(f > 0)) {
              if (f /= o, 0 > o) {
                if (m > f)
                  return;
                n > f && (n = f);
              } else if (o > 0) {
                if (f > n)
                  return;
                f > m && (m = f);
              }
              if (f = c - i, o || !(0 > f)) {
                if (f /= o, 0 > o) {
                  if (f > n)
                    return;
                  f > m && (m = f);
                } else if (o > 0) {
                  if (m > f)
                    return;
                  n > f && (n = f);
                }
                if (f = b - j, p || !(f > 0)) {
                  if (f /= p, 0 > p) {
                    if (m > f)
                      return;
                    n > f && (n = f);
                  } else if (p > 0) {
                    if (f > n)
                      return;
                    f > m && (m = f);
                  }
                  if (f = d - j, p || !(0 > f)) {
                    if (f /= p, 0 > p) {
                      if (f > n)
                        return;
                      f > m && (m = f);
                    } else if (p > 0) {
                      if (m > f)
                        return;
                      n > f && (n = f);
                    }
                    return m > 0 && (e.a = {
                      x: i + m * o,
                      y: j + m * p
                    }), 1 > n && (e.b = {
                      x: i + n * o,
                      y: j + n * p
                    }), e;
                  }
                }
              }
            }
          };
        }
        function ec(a, b, c, d) {
          function e(d, e) {
            return eh(d[0] - a) < zh ? e > 0 ? 0 : 3 : eh(d[0] - c) < zh ? e > 0 ? 2 : 1 : eh(d[1] - b) < zh ? e > 0 ? 1 : 0 : e > 0 ? 3 : 2;
          }
          function f(a, b) {
            return g(a.x, b.x);
          }
          function g(a, b) {
            var c = e(a, 1), d = e(b, 1);
            return c !== d ? c - d : 0 === c ? b[1] - a[1] : 1 === c ? a[0] - b[0] : 2 === c ? a[1] - b[1] : b[0] - a[0];
          }
          return function (h) {
            function i(a) {
              for (var b = 0, c = r.length, d = a[1], e = 0; c > e; ++e)
                for (var f, g = 1, h = r[e], i = h.length, k = h[0]; i > g; ++g)
                  f = h[g], k[1] <= d ? f[1] > d && j(k, f, a) > 0 && ++b : f[1] <= d && j(k, f, a) < 0 && --b, k = f;
              return 0 !== b;
            }
            function j(a, b, c) {
              return (b[0] - a[0]) * (c[1] - a[1]) - (c[0] - a[0]) * (b[1] - a[1]);
            }
            function k(f, h, i, j) {
              var k = 0, l = 0;
              if (null == f || (k = e(f, i)) !== (l = e(h, i)) || g(f, h) < 0 ^ i > 0) {
                do
                  j.point(0 === k || 3 === k ? a : c, k > 1 ? d : b);
                while ((k = (k + i + 4) % 4) !== l);
              } else
                j.point(h[0], h[1]);
            }
            function l(e, f) {
              return e >= a && c >= e && f >= b && d >= f;
            }
            function m(a, b) {
              l(a, b) && h.point(a, b);
            }
            function n() {
              E.point = p, r && r.push(s = []), z = !0, y = !1, w = x = 0 / 0;
            }
            function o() {
              q && (p(t, u), v && y && C.rejoin(), q.push(C.buffer())), E.point = m, y && h.lineEnd();
            }
            function p(a, b) {
              a = Math.max(-yi, Math.min(yi, a)), b = Math.max(-yi, Math.min(yi, b));
              var c = l(a, b);
              if (r && s.push([
                  a,
                  b
                ]), z)
                t = a, u = b, v = c, z = !1, c && (h.lineStart(), h.point(a, b));
              else if (c && y)
                h.point(a, b);
              else {
                var d = {
                    a: {
                      x: w,
                      y: x
                    },
                    b: {
                      x: a,
                      y: b
                    }
                  };
                D(d) ? (y || (h.lineStart(), h.point(d.a.x, d.a.y)), h.point(d.b.x, d.b.y), c || h.lineEnd(), A = !1) : c && (h.lineStart(), h.point(a, b), A = !1);
              }
              w = a, x = b, y = c;
            }
            var q, r, s, t, u, v, w, x, y, z, A, B = h, C = Yb(), D = dc(a, b, c, d), E = {
                point: m,
                lineStart: n,
                lineEnd: o,
                polygonStart: function () {
                  h = C, q = [], r = [], A = !0;
                },
                polygonEnd: function () {
                  h = B, q = Sg.merge(q);
                  var b = i([
                      a,
                      d
                    ]), c = A && b, e = q.length;
                  (c || e) && (h.polygonStart(), c && (h.lineStart(), k(null, null, 1, h), h.lineEnd()), e && Tb(q, f, b, k, h), h.polygonEnd()), q = r = s = null;
                }
              };
            return E;
          };
        }
        function fc(a, b) {
          function c(c, d) {
            return c = a(c, d), b(c[0], c[1]);
          }
          return a.invert && b.invert && (c.invert = function (c, d) {
            return c = b.invert(c, d), c && a.invert(c[0], c[1]);
          }), c;
        }
        function gc(a) {
          var b = 0, c = wh / 3, d = vc(a), e = d(b, c);
          return e.parallels = function (a) {
            return arguments.length ? d(b = a[0] * wh / 180, c = a[1] * wh / 180) : [
              180 * (b / wh),
              180 * (c / wh)
            ];
          }, e;
        }
        function hc(a, b) {
          function c(a, b) {
            var c = Math.sqrt(f - 2 * e * Math.sin(b)) / e;
            return [
              c * Math.sin(a *= e),
              g - c * Math.cos(a)
            ];
          }
          var d = Math.sin(a), e = (d + Math.sin(b)) / 2, f = 1 + d * (2 * e - d), g = Math.sqrt(f) / e;
          return c.invert = function (a, b) {
            var c = g - b;
            return [
              Math.atan2(a, c) / e,
              N((f - (a * a + c * c) * e * e) / (2 * e))
            ];
          }, c;
        }
        function ic() {
          function a(a, b) {
            Ai += e * a - d * b, d = a, e = b;
          }
          var b, c, d, e;
          Fi.point = function (f, g) {
            Fi.point = a, b = d = f, c = e = g;
          }, Fi.lineEnd = function () {
            a(b, c);
          };
        }
        function jc(a, b) {
          Bi > a && (Bi = a), a > Di && (Di = a), Ci > b && (Ci = b), b > Ei && (Ei = b);
        }
        function kc() {
          function a(a, b) {
            g.push('M', a, ',', b, f);
          }
          function b(a, b) {
            g.push('M', a, ',', b), h.point = c;
          }
          function c(a, b) {
            g.push('L', a, ',', b);
          }
          function d() {
            h.point = a;
          }
          function e() {
            g.push('Z');
          }
          var f = lc(4.5), g = [], h = {
              point: a,
              lineStart: function () {
                h.point = b;
              },
              lineEnd: d,
              polygonStart: function () {
                h.lineEnd = e;
              },
              polygonEnd: function () {
                h.lineEnd = d, h.point = a;
              },
              pointRadius: function (a) {
                return f = lc(a), h;
              },
              result: function () {
                if (g.length) {
                  var a = g.join('');
                  return g = [], a;
                }
              }
            };
          return h;
        }
        function lc(a) {
          return 'm0,' + a + 'a' + a + ',' + a + ' 0 1,1 0,' + -2 * a + 'a' + a + ',' + a + ' 0 1,1 0,' + 2 * a + 'z';
        }
        function mc(a, b) {
          ni += a, oi += b, ++pi;
        }
        function nc() {
          function a(a, d) {
            var e = a - b, f = d - c, g = Math.sqrt(e * e + f * f);
            qi += g * (b + a) / 2, ri += g * (c + d) / 2, si += g, mc(b = a, c = d);
          }
          var b, c;
          Hi.point = function (d, e) {
            Hi.point = a, mc(b = d, c = e);
          };
        }
        function oc() {
          Hi.point = mc;
        }
        function pc() {
          function a(a, b) {
            var c = a - d, f = b - e, g = Math.sqrt(c * c + f * f);
            qi += g * (d + a) / 2, ri += g * (e + b) / 2, si += g, g = e * a - d * b, ti += g * (d + a), ui += g * (e + b), vi += 3 * g, mc(d = a, e = b);
          }
          var b, c, d, e;
          Hi.point = function (f, g) {
            Hi.point = a, mc(b = d = f, c = e = g);
          }, Hi.lineEnd = function () {
            a(b, c);
          };
        }
        function qc(a) {
          function b(b, c) {
            a.moveTo(b, c), a.arc(b, c, g, 0, xh);
          }
          function c(b, c) {
            a.moveTo(b, c), h.point = d;
          }
          function d(b, c) {
            a.lineTo(b, c);
          }
          function e() {
            h.point = b;
          }
          function f() {
            a.closePath();
          }
          var g = 4.5, h = {
              point: b,
              lineStart: function () {
                h.point = c;
              },
              lineEnd: e,
              polygonStart: function () {
                h.lineEnd = f;
              },
              polygonEnd: function () {
                h.lineEnd = e, h.point = b;
              },
              pointRadius: function (a) {
                return g = a, h;
              },
              result: i
            };
          return h;
        }
        function rc(a) {
          function b(b) {
            function d(c, d) {
              c = a(c, d), b.point(c[0], c[1]);
            }
            function e() {
              t = 0 / 0, y.point = g, b.lineStart();
            }
            function g(d, e) {
              var g = Fb([
                  d,
                  e
                ]), h = a(d, e);
              c(t, u, s, v, w, x, t = h[0], u = h[1], s = d, v = g[0], w = g[1], x = g[2], f, b), b.point(t, u);
            }
            function h() {
              y.point = d, b.lineEnd();
            }
            function i() {
              e(), y.point = j, y.lineEnd = k;
            }
            function j(a, b) {
              g(l = a, m = b), n = t, o = u, p = v, q = w, r = x, y.point = g;
            }
            function k() {
              c(t, u, s, v, w, x, n, o, l, p, q, r, f, b), y.lineEnd = h, h();
            }
            var l, m, n, o, p, q, r, s, t, u, v, w, x, y = {
                point: d,
                lineStart: e,
                lineEnd: h,
                polygonStart: function () {
                  b.polygonStart(), y.lineStart = i;
                },
                polygonEnd: function () {
                  b.polygonEnd(), y.lineStart = e;
                }
              };
            return y;
          }
          function c(b, f, g, h, i, j, k, l, m, n, o, p, q, r) {
            var s = k - b, t = l - f, u = s * s + t * t;
            if (u > 4 * d && q--) {
              var v = h + n, w = i + o, x = j + p, y = Math.sqrt(v * v + w * w + x * x), z = Math.asin(x /= y), A = eh(eh(x) - 1) < zh ? (g + m) / 2 : Math.atan2(w, v), B = a(A, z), C = B[0], D = B[1], E = C - b, F = D - f, G = t * E - s * F;
              (G * G / u > d || eh((s * E + t * F) / u - 0.5) > 0.3 || e > h * n + i * o + j * p) && (c(b, f, g, h, i, j, C, D, A, v /= y, w /= y, x, q, r), r.point(C, D), c(C, D, A, v, w, x, k, l, m, n, o, p, q, r));
            }
          }
          var d = 0.5, e = Math.cos(30 * Bh), f = 16;
          return b.precision = function (a) {
            return arguments.length ? (f = (d = a * a) > 0 && 16, b) : Math.sqrt(d);
          }, b;
        }
        function sc(a) {
          this.stream = a;
        }
        function tc(a) {
          var b = rc(function (b, c) {
              return a([
                b * Ch,
                c * Ch
              ]);
            });
          return function (a) {
            var c = new sc(a = b(a));
            return c.point = function (b, c) {
              a.point(b * Bh, c * Bh);
            }, c;
          };
        }
        function uc(a) {
          return vc(function () {
            return a;
          })();
        }
        function vc(a) {
          function b(a) {
            return a = h(a[0] * Bh, a[1] * Bh), [
              a[0] * m + i,
              j - a[1] * m
            ];
          }
          function c(a) {
            return a = h.invert((a[0] - i) / m, (j - a[1]) / m), a && [
              a[0] * Ch,
              a[1] * Ch
            ];
          }
          function d() {
            h = fc(g = zc(r, s, t), f);
            var a = f(p, q);
            return i = n - a[0] * m, j = o + a[1] * m, e();
          }
          function e() {
            return k && (k.valid = !1, k = null), b;
          }
          var f, g, h, i, j, k, l = rc(function (a, b) {
              return a = f(a, b), [
                a[0] * m + i,
                j - a[1] * m
              ];
            }), m = 150, n = 480, o = 250, p = 0, q = 0, r = 0, s = 0, t = 0, u = xi, v = pb, w = null, x = null;
          return b.stream = function (a) {
            return k && (k.valid = !1), k = wc(u(g, l(v(a)))), k.valid = !0, k;
          }, b.clipAngle = function (a) {
            return arguments.length ? (u = null == a ? (w = a, xi) : cc((w = +a) * Bh), e()) : w;
          }, b.clipExtent = function (a) {
            return arguments.length ? (x = a, v = a ? ec(a[0][0], a[0][1], a[1][0], a[1][1]) : pb, e()) : x;
          }, b.scale = function (a) {
            return arguments.length ? (m = +a, d()) : m;
          }, b.translate = function (a) {
            return arguments.length ? (n = +a[0], o = +a[1], d()) : [
              n,
              o
            ];
          }, b.center = function (a) {
            return arguments.length ? (p = a[0] % 360 * Bh, q = a[1] % 360 * Bh, d()) : [
              p * Ch,
              q * Ch
            ];
          }, b.rotate = function (a) {
            return arguments.length ? (r = a[0] % 360 * Bh, s = a[1] % 360 * Bh, t = a.length > 2 ? a[2] % 360 * Bh : 0, d()) : [
              r * Ch,
              s * Ch,
              t * Ch
            ];
          }, Sg.rebind(b, l, 'precision'), function () {
            return f = a.apply(this, arguments), b.invert = f.invert && c, d();
          };
        }
        function wc(a) {
          var b = new sc(a);
          return b.point = function (b, c) {
            a.point(b * Bh, c * Bh);
          }, b;
        }
        function xc(a, b) {
          return [
            a,
            b
          ];
        }
        function yc(a, b) {
          return [
            a > wh ? a - xh : -wh > a ? a + xh : a,
            b
          ];
        }
        function zc(a, b, c) {
          return a ? b || c ? fc(Bc(a), Cc(b, c)) : Bc(a) : b || c ? Cc(b, c) : yc;
        }
        function Ac(a) {
          return function (b, c) {
            return b += a, [
              b > wh ? b - xh : -wh > b ? b + xh : b,
              c
            ];
          };
        }
        function Bc(a) {
          var b = Ac(a);
          return b.invert = Ac(-a), b;
        }
        function Cc(a, b) {
          function c(a, b) {
            var c = Math.cos(b), h = Math.cos(a) * c, i = Math.sin(a) * c, j = Math.sin(b), k = j * d + h * e;
            return [
              Math.atan2(i * f - k * g, h * d - j * e),
              N(k * f + i * g)
            ];
          }
          var d = Math.cos(a), e = Math.sin(a), f = Math.cos(b), g = Math.sin(b);
          return c.invert = function (a, b) {
            var c = Math.cos(b), h = Math.cos(a) * c, i = Math.sin(a) * c, j = Math.sin(b), k = j * f - i * g;
            return [
              Math.atan2(i * f + j * g, h * d + k * e),
              N(k * d - h * e)
            ];
          }, c;
        }
        function Dc(a, b) {
          var c = Math.cos(a), d = Math.sin(a);
          return function (e, f, g, h) {
            var i = g * b;
            null != e ? (e = Ec(c, e), f = Ec(c, f), (g > 0 ? f > e : e > f) && (e += g * xh)) : (e = a + g * xh, f = a - 0.5 * i);
            for (var j, k = e; g > 0 ? k > f : f > k; k -= i)
              h.point((j = Lb([
                c,
                -d * Math.cos(k),
                -d * Math.sin(k)
              ]))[0], j[1]);
          };
        }
        function Ec(a, b) {
          var c = Fb(b);
          c[0] -= a, Kb(c);
          var d = M(-c[1]);
          return ((-c[2] < 0 ? -d : d) + 2 * Math.PI - zh) % (2 * Math.PI);
        }
        function Fc(a, b, c) {
          var d = Sg.range(a, b - zh, c).concat(b);
          return function (a) {
            return d.map(function (b) {
              return [
                a,
                b
              ];
            });
          };
        }
        function Gc(a, b, c) {
          var d = Sg.range(a, b - zh, c).concat(b);
          return function (a) {
            return d.map(function (b) {
              return [
                b,
                a
              ];
            });
          };
        }
        function Hc(a) {
          return a.source;
        }
        function Ic(a) {
          return a.target;
        }
        function Jc(a, b, c, d) {
          var e = Math.cos(b), f = Math.sin(b), g = Math.cos(d), h = Math.sin(d), i = e * Math.cos(a), j = e * Math.sin(a), k = g * Math.cos(c), l = g * Math.sin(c), m = 2 * Math.asin(Math.sqrt(R(d - b) + e * g * R(c - a))), n = 1 / Math.sin(m), o = m ? function (a) {
              var b = Math.sin(a *= m) * n, c = Math.sin(m - a) * n, d = c * i + b * k, e = c * j + b * l, g = c * f + b * h;
              return [
                Math.atan2(e, d) * Ch,
                Math.atan2(g, Math.sqrt(d * d + e * e)) * Ch
              ];
            } : function () {
              return [
                a * Ch,
                b * Ch
              ];
            };
          return o.distance = m, o;
        }
        function Kc() {
          function a(a, e) {
            var f = Math.sin(e *= Bh), g = Math.cos(e), h = eh((a *= Bh) - b), i = Math.cos(h);
            Ii += Math.atan2(Math.sqrt((h = g * Math.sin(h)) * h + (h = d * f - c * g * i) * h), c * f + d * g * i), b = a, c = f, d = g;
          }
          var b, c, d;
          Ji.point = function (e, f) {
            b = e * Bh, c = Math.sin(f *= Bh), d = Math.cos(f), Ji.point = a;
          }, Ji.lineEnd = function () {
            Ji.point = Ji.lineEnd = i;
          };
        }
        function Lc(a, b) {
          function c(b, c) {
            var d = Math.cos(b), e = Math.cos(c), f = a(d * e);
            return [
              f * e * Math.sin(b),
              f * Math.sin(c)
            ];
          }
          return c.invert = function (a, c) {
            var d = Math.sqrt(a * a + c * c), e = b(d), f = Math.sin(e), g = Math.cos(e);
            return [
              Math.atan2(a * f, d * g),
              Math.asin(d && c * f / d)
            ];
          }, c;
        }
        function Mc(a, b) {
          function c(a, b) {
            var c = eh(eh(b) - yh) < zh ? 0 : g / Math.pow(e(b), f);
            return [
              c * Math.sin(f * a),
              g - c * Math.cos(f * a)
            ];
          }
          var d = Math.cos(a), e = function (a) {
              return Math.tan(wh / 4 + a / 2);
            }, f = a === b ? Math.sin(a) : Math.log(d / Math.cos(b)) / Math.log(e(b) / e(a)), g = d * Math.pow(e(a), f) / f;
          return f ? (c.invert = function (a, b) {
            var c = g - b, d = L(f) * Math.sqrt(a * a + c * c);
            return [
              Math.atan2(a, c) / f,
              2 * Math.atan(Math.pow(g / d, 1 / f)) - yh
            ];
          }, c) : Oc;
        }
        function Nc(a, b) {
          function c(a, b) {
            var c = f - b;
            return [
              c * Math.sin(e * a),
              f - c * Math.cos(e * a)
            ];
          }
          var d = Math.cos(a), e = a === b ? Math.sin(a) : (d - Math.cos(b)) / (b - a), f = d / e + a;
          return eh(e) < zh ? xc : (c.invert = function (a, b) {
            var c = f - b;
            return [
              Math.atan2(a, c) / e,
              f - L(e) * Math.sqrt(a * a + c * c)
            ];
          }, c);
        }
        function Oc(a, b) {
          return [
            a,
            Math.log(Math.tan(wh / 4 + b / 2))
          ];
        }
        function Pc(a) {
          var b, c = uc(a), d = c.scale, e = c.translate, f = c.clipExtent;
          return c.scale = function () {
            var a = d.apply(c, arguments);
            return a === c ? b ? c.clipExtent(null) : c : a;
          }, c.translate = function () {
            var a = e.apply(c, arguments);
            return a === c ? b ? c.clipExtent(null) : c : a;
          }, c.clipExtent = function (a) {
            var g = f.apply(c, arguments);
            if (g === c) {
              if (b = null == a) {
                var h = wh * d(), i = e();
                f([
                  [
                    i[0] - h,
                    i[1] - h
                  ],
                  [
                    i[0] + h,
                    i[1] + h
                  ]
                ]);
              }
            } else
              b && (g = null);
            return g;
          }, c.clipExtent(null);
        }
        function Qc(a, b) {
          var c = Math.cos(b) * Math.sin(a);
          return [
            Math.log((1 + c) / (1 - c)) / 2,
            Math.atan2(Math.tan(b), Math.cos(a))
          ];
        }
        function Rc(a) {
          return a[0];
        }
        function Sc(a) {
          return a[1];
        }
        function Tc(a, b, c, d) {
          var e, f, g, h, i, j, k;
          return e = d[a], f = e[0], g = e[1], e = d[b], h = e[0], i = e[1], e = d[c], j = e[0], k = e[1], (k - g) * (h - f) - (i - g) * (j - f) > 0;
        }
        function Uc(a, b, c) {
          return (c[0] - b[0]) * (a[1] - b[1]) < (c[1] - b[1]) * (a[0] - b[0]);
        }
        function Vc(a, b, c, d) {
          var e = a[0], f = c[0], g = b[0] - e, h = d[0] - f, i = a[1], j = c[1], k = b[1] - i, l = d[1] - j, m = (h * (i - j) - l * (e - f)) / (l * g - h * k);
          return [
            e + m * g,
            i + m * k
          ];
        }
        function Wc(a) {
          var b = a[0], c = a[a.length - 1];
          return !(b[0] - c[0] || b[1] - c[1]);
        }
        function Xc() {
          qd(this), this.edge = this.site = this.circle = null;
        }
        function Yc(a) {
          var b = Vi.pop() || new Xc();
          return b.site = a, b;
        }
        function Zc(a) {
          hd(a), Si.remove(a), Vi.push(a), qd(a);
        }
        function $c(a) {
          var b = a.circle, c = b.x, d = b.cy, e = {
              x: c,
              y: d
            }, f = a.P, g = a.N, h = [a];
          Zc(a);
          for (var i = f; i.circle && eh(c - i.circle.x) < zh && eh(d - i.circle.cy) < zh;)
            f = i.P, h.unshift(i), Zc(i), i = f;
          h.unshift(i), hd(i);
          for (var j = g; j.circle && eh(c - j.circle.x) < zh && eh(d - j.circle.cy) < zh;)
            g = j.N, h.push(j), Zc(j), j = g;
          h.push(j), hd(j);
          var k, l = h.length;
          for (k = 1; l > k; ++k)
            j = h[k], i = h[k - 1], nd(j.edge, i.site, j.site, e);
          i = h[0], j = h[l - 1], j.edge = ld(i.site, j.site, null, e), gd(i), gd(j);
        }
        function _c(a) {
          for (var b, c, d, e, f = a.x, g = a.y, h = Si._; h;)
            if (d = ad(h, g) - f, d > zh)
              h = h.L;
            else {
              if (e = f - bd(h, g), !(e > zh)) {
                d > -zh ? (b = h.P, c = h) : e > -zh ? (b = h, c = h.N) : b = c = h;
                break;
              }
              if (!h.R) {
                b = h;
                break;
              }
              h = h.R;
            }
          var i = Yc(a);
          if (Si.insert(b, i), b || c) {
            if (b === c)
              return hd(b), c = Yc(b.site), Si.insert(i, c), i.edge = c.edge = ld(b.site, i.site), gd(b), gd(c), void 0;
            if (!c)
              return i.edge = ld(b.site, i.site), void 0;
            hd(b), hd(c);
            var j = b.site, k = j.x, l = j.y, m = a.x - k, n = a.y - l, o = c.site, p = o.x - k, q = o.y - l, r = 2 * (m * q - n * p), s = m * m + n * n, t = p * p + q * q, u = {
                x: (q * s - n * t) / r + k,
                y: (m * t - p * s) / r + l
              };
            nd(c.edge, j, o, u), i.edge = ld(j, a, null, u), c.edge = ld(a, o, null, u), gd(b), gd(c);
          }
        }
        function ad(a, b) {
          var c = a.site, d = c.x, e = c.y, f = e - b;
          if (!f)
            return d;
          var g = a.P;
          if (!g)
            return -1 / 0;
          c = g.site;
          var h = c.x, i = c.y, j = i - b;
          if (!j)
            return h;
          var k = h - d, l = 1 / f - 1 / j, m = k / j;
          return l ? (-m + Math.sqrt(m * m - 2 * l * (k * k / (-2 * j) - i + j / 2 + e - f / 2))) / l + d : (d + h) / 2;
        }
        function bd(a, b) {
          var c = a.N;
          if (c)
            return ad(c, b);
          var d = a.site;
          return d.y === b ? d.x : 1 / 0;
        }
        function cd(a) {
          this.site = a, this.edges = [];
        }
        function dd(a) {
          for (var b, c, d, e, f, g, h, i, j, k, l = a[0][0], m = a[1][0], n = a[0][1], o = a[1][1], p = Ri, q = p.length; q--;)
            if (f = p[q], f && f.prepare())
              for (h = f.edges, i = h.length, g = 0; i > g;)
                k = h[g].end(), d = k.x, e = k.y, j = h[++g % i].start(), b = j.x, c = j.y, (eh(d - b) > zh || eh(e - c) > zh) && (h.splice(g, 0, new od(md(f.site, k, eh(d - l) < zh && o - e > zh ? {
                  x: l,
                  y: eh(b - l) < zh ? c : o
                } : eh(e - o) < zh && m - d > zh ? {
                  x: eh(c - o) < zh ? b : m,
                  y: o
                } : eh(d - m) < zh && e - n > zh ? {
                  x: m,
                  y: eh(b - m) < zh ? c : n
                } : eh(e - n) < zh && d - l > zh ? {
                  x: eh(c - n) < zh ? b : l,
                  y: n
                } : null), f.site, null)), ++i);
        }
        function ed(a, b) {
          return b.angle - a.angle;
        }
        function fd() {
          qd(this), this.x = this.y = this.arc = this.site = this.cy = null;
        }
        function gd(a) {
          var b = a.P, c = a.N;
          if (b && c) {
            var d = b.site, e = a.site, f = c.site;
            if (d !== f) {
              var g = e.x, h = e.y, i = d.x - g, j = d.y - h, k = f.x - g, l = f.y - h, m = 2 * (i * l - j * k);
              if (!(m >= -Ah)) {
                var n = i * i + j * j, o = k * k + l * l, p = (l * n - j * o) / m, q = (i * o - k * n) / m, l = q + h, r = Wi.pop() || new fd();
                r.arc = a, r.site = e, r.x = p + g, r.y = l + Math.sqrt(p * p + q * q), r.cy = l, a.circle = r;
                for (var s = null, t = Ui._; t;)
                  if (r.y < t.y || r.y === t.y && r.x <= t.x) {
                    if (!t.L) {
                      s = t.P;
                      break;
                    }
                    t = t.L;
                  } else {
                    if (!t.R) {
                      s = t;
                      break;
                    }
                    t = t.R;
                  }
                Ui.insert(s, r), s || (Ti = r);
              }
            }
          }
        }
        function hd(a) {
          var b = a.circle;
          b && (b.P || (Ti = b.N), Ui.remove(b), Wi.push(b), qd(b), a.circle = null);
        }
        function id(a) {
          for (var b, c = Qi, d = dc(a[0][0], a[0][1], a[1][0], a[1][1]), e = c.length; e--;)
            b = c[e], (!jd(b, a) || !d(b) || eh(b.a.x - b.b.x) < zh && eh(b.a.y - b.b.y) < zh) && (b.a = b.b = null, c.splice(e, 1));
        }
        function jd(a, b) {
          var c = a.b;
          if (c)
            return !0;
          var d, e, f = a.a, g = b[0][0], h = b[1][0], i = b[0][1], j = b[1][1], k = a.l, l = a.r, m = k.x, n = k.y, o = l.x, p = l.y, q = (m + o) / 2, r = (n + p) / 2;
          if (p === n) {
            if (g > q || q >= h)
              return;
            if (m > o) {
              if (f) {
                if (f.y >= j)
                  return;
              } else
                f = {
                  x: q,
                  y: i
                };
              c = {
                x: q,
                y: j
              };
            } else {
              if (f) {
                if (f.y < i)
                  return;
              } else
                f = {
                  x: q,
                  y: j
                };
              c = {
                x: q,
                y: i
              };
            }
          } else if (d = (m - o) / (p - n), e = r - d * q, -1 > d || d > 1)
            if (m > o) {
              if (f) {
                if (f.y >= j)
                  return;
              } else
                f = {
                  x: (i - e) / d,
                  y: i
                };
              c = {
                x: (j - e) / d,
                y: j
              };
            } else {
              if (f) {
                if (f.y < i)
                  return;
              } else
                f = {
                  x: (j - e) / d,
                  y: j
                };
              c = {
                x: (i - e) / d,
                y: i
              };
            }
          else if (p > n) {
            if (f) {
              if (f.x >= h)
                return;
            } else
              f = {
                x: g,
                y: d * g + e
              };
            c = {
              x: h,
              y: d * h + e
            };
          } else {
            if (f) {
              if (f.x < g)
                return;
            } else
              f = {
                x: h,
                y: d * h + e
              };
            c = {
              x: g,
              y: d * g + e
            };
          }
          return a.a = f, a.b = c, !0;
        }
        function kd(a, b) {
          this.l = a, this.r = b, this.a = this.b = null;
        }
        function ld(a, b, c, d) {
          var e = new kd(a, b);
          return Qi.push(e), c && nd(e, a, b, c), d && nd(e, b, a, d), Ri[a.i].edges.push(new od(e, a, b)), Ri[b.i].edges.push(new od(e, b, a)), e;
        }
        function md(a, b, c) {
          var d = new kd(a, null);
          return d.a = b, d.b = c, Qi.push(d), d;
        }
        function nd(a, b, c, d) {
          a.a || a.b ? a.l === c ? a.b = d : a.a = d : (a.a = d, a.l = b, a.r = c);
        }
        function od(a, b, c) {
          var d = a.a, e = a.b;
          this.edge = a, this.site = b, this.angle = c ? Math.atan2(c.y - b.y, c.x - b.x) : a.l === b ? Math.atan2(e.x - d.x, d.y - e.y) : Math.atan2(d.x - e.x, e.y - d.y);
        }
        function pd() {
          this._ = null;
        }
        function qd(a) {
          a.U = a.C = a.L = a.R = a.P = a.N = null;
        }
        function rd(a, b) {
          var c = b, d = b.R, e = c.U;
          e ? e.L === c ? e.L = d : e.R = d : a._ = d, d.U = e, c.U = d, c.R = d.L, c.R && (c.R.U = c), d.L = c;
        }
        function sd(a, b) {
          var c = b, d = b.L, e = c.U;
          e ? e.L === c ? e.L = d : e.R = d : a._ = d, d.U = e, c.U = d, c.L = d.R, c.L && (c.L.U = c), d.R = c;
        }
        function td(a) {
          for (; a.L;)
            a = a.L;
          return a;
        }
        function ud(a, b) {
          var c, d, e, f = a.sort(vd).pop();
          for (Qi = [], Ri = new Array(a.length), Si = new pd(), Ui = new pd();;)
            if (e = Ti, f && (!e || f.y < e.y || f.y === e.y && f.x < e.x))
              (f.x !== c || f.y !== d) && (Ri[f.i] = new cd(f), _c(f), c = f.x, d = f.y), f = a.pop();
            else {
              if (!e)
                break;
              $c(e.arc);
            }
          b && (id(b), dd(b));
          var g = {
              cells: Ri,
              edges: Qi
            };
          return Si = Ui = Qi = Ri = null, g;
        }
        function vd(a, b) {
          return b.y - a.y || b.x - a.x;
        }
        function wd(a, b, c) {
          return (a.x - c.x) * (b.y - a.y) - (a.x - b.x) * (c.y - a.y);
        }
        function xd(a) {
          return a.x;
        }
        function yd(a) {
          return a.y;
        }
        function zd() {
          return {
            leaf: !0,
            nodes: [],
            point: null,
            x: null,
            y: null
          };
        }
        function Ad(a, b, c, d, e, f) {
          if (!a(b, c, d, e, f)) {
            var g = 0.5 * (c + e), h = 0.5 * (d + f), i = b.nodes;
            i[0] && Ad(a, i[0], c, d, g, h), i[1] && Ad(a, i[1], g, d, e, h), i[2] && Ad(a, i[2], c, h, g, f), i[3] && Ad(a, i[3], g, h, e, f);
          }
        }
        function Bd(a, b) {
          a = Sg.rgb(a), b = Sg.rgb(b);
          var c = a.r, d = a.g, e = a.b, f = b.r - c, g = b.g - d, h = b.b - e;
          return function (a) {
            return '#' + ib(Math.round(c + f * a)) + ib(Math.round(d + g * a)) + ib(Math.round(e + h * a));
          };
        }
        function Cd(a, b) {
          var c, d = {}, e = {};
          for (c in a)
            c in b ? d[c] = Fd(a[c], b[c]) : e[c] = a[c];
          for (c in b)
            c in a || (e[c] = b[c]);
          return function (a) {
            for (c in d)
              e[c] = d[c](a);
            return e;
          };
        }
        function Dd(a, b) {
          return b -= a = +a, function (c) {
            return a + b * c;
          };
        }
        function Ed(a, b) {
          var c, d, e, f, g, h = 0, i = 0, j = [], k = [];
          for (a += '', b += '', Yi.lastIndex = 0, d = 0; c = Yi.exec(b); ++d)
            c.index && j.push(b.substring(h, i = c.index)), k.push({
              i: j.length,
              x: c[0]
            }), j.push(null), h = Yi.lastIndex;
          for (h < b.length && j.push(b.substring(h)), d = 0, f = k.length; (c = Yi.exec(a)) && f > d; ++d)
            if (g = k[d], g.x == c[0]) {
              if (g.i)
                if (null == j[g.i + 1])
                  for (j[g.i - 1] += g.x, j.splice(g.i, 1), e = d + 1; f > e; ++e)
                    k[e].i--;
                else
                  for (j[g.i - 1] += g.x + j[g.i + 1], j.splice(g.i, 2), e = d + 1; f > e; ++e)
                    k[e].i -= 2;
              else if (null == j[g.i + 1])
                j[g.i] = g.x;
              else
                for (j[g.i] = g.x + j[g.i + 1], j.splice(g.i + 1, 1), e = d + 1; f > e; ++e)
                  k[e].i--;
              k.splice(d, 1), f--, d--;
            } else
              g.x = Dd(parseFloat(c[0]), parseFloat(g.x));
          for (; f > d;)
            g = k.pop(), null == j[g.i + 1] ? j[g.i] = g.x : (j[g.i] = g.x + j[g.i + 1], j.splice(g.i + 1, 1)), f--;
          return 1 === j.length ? null == j[0] ? (g = k[0].x, function (a) {
            return g(a) + '';
          }) : function () {
            return b;
          } : function (a) {
            for (d = 0; f > d; ++d)
              j[(g = k[d]).i] = g.x(a);
            return j.join('');
          };
        }
        function Fd(a, b) {
          for (var c, d = Sg.interpolators.length; --d >= 0 && !(c = Sg.interpolators[d](a, b)););
          return c;
        }
        function Gd(a, b) {
          var c, d = [], e = [], f = a.length, g = b.length, h = Math.min(a.length, b.length);
          for (c = 0; h > c; ++c)
            d.push(Fd(a[c], b[c]));
          for (; f > c; ++c)
            e[c] = a[c];
          for (; g > c; ++c)
            e[c] = b[c];
          return function (a) {
            for (c = 0; h > c; ++c)
              e[c] = d[c](a);
            return e;
          };
        }
        function Hd(a) {
          return function (b) {
            return 0 >= b ? 0 : b >= 1 ? 1 : a(b);
          };
        }
        function Id(a) {
          return function (b) {
            return 1 - a(1 - b);
          };
        }
        function Jd(a) {
          return function (b) {
            return 0.5 * (0.5 > b ? a(2 * b) : 2 - a(2 - 2 * b));
          };
        }
        function Kd(a) {
          return a * a;
        }
        function Ld(a) {
          return a * a * a;
        }
        function Md(a) {
          if (0 >= a)
            return 0;
          if (a >= 1)
            return 1;
          var b = a * a, c = b * a;
          return 4 * (0.5 > a ? c : 3 * (a - b) + c - 0.75);
        }
        function Nd(a) {
          return function (b) {
            return Math.pow(b, a);
          };
        }
        function Od(a) {
          return 1 - Math.cos(a * yh);
        }
        function Pd(a) {
          return Math.pow(2, 10 * (a - 1));
        }
        function Qd(a) {
          return 1 - Math.sqrt(1 - a * a);
        }
        function Rd(a, b) {
          var c;
          return arguments.length < 2 && (b = 0.45), arguments.length ? c = b / xh * Math.asin(1 / a) : (a = 1, c = b / 4), function (d) {
            return 1 + a * Math.pow(2, -10 * d) * Math.sin((d - c) * xh / b);
          };
        }
        function Sd(a) {
          return a || (a = 1.70158), function (b) {
            return b * b * ((a + 1) * b - a);
          };
        }
        function Td(a) {
          return 1 / 2.75 > a ? 7.5625 * a * a : 2 / 2.75 > a ? 7.5625 * (a -= 1.5 / 2.75) * a + 0.75 : 2.5 / 2.75 > a ? 7.5625 * (a -= 2.25 / 2.75) * a + 0.9375 : 7.5625 * (a -= 2.625 / 2.75) * a + 0.984375;
        }
        function Ud(a, b) {
          a = Sg.hcl(a), b = Sg.hcl(b);
          var c = a.h, d = a.c, e = a.l, f = b.h - c, g = b.c - d, h = b.l - e;
          return isNaN(g) && (g = 0, d = isNaN(d) ? b.c : d), isNaN(f) ? (f = 0, c = isNaN(c) ? b.h : c) : f > 180 ? f -= 360 : -180 > f && (f += 360), function (a) {
            return Y(c + f * a, d + g * a, e + h * a) + '';
          };
        }
        function Vd(a, b) {
          a = Sg.hsl(a), b = Sg.hsl(b);
          var c = a.h, d = a.s, e = a.l, f = b.h - c, g = b.s - d, h = b.l - e;
          return isNaN(g) && (g = 0, d = isNaN(d) ? b.s : d), isNaN(f) ? (f = 0, c = isNaN(c) ? b.h : c) : f > 180 ? f -= 360 : -180 > f && (f += 360), function (a) {
            return V(c + f * a, d + g * a, e + h * a) + '';
          };
        }
        function Wd(a, b) {
          a = Sg.lab(a), b = Sg.lab(b);
          var c = a.l, d = a.a, e = a.b, f = b.l - c, g = b.a - d, h = b.b - e;
          return function (a) {
            return _(c + f * a, d + g * a, e + h * a) + '';
          };
        }
        function Xd(a, b) {
          return b -= a, function (c) {
            return Math.round(a + b * c);
          };
        }
        function Yd(a) {
          var b = [
              a.a,
              a.b
            ], c = [
              a.c,
              a.d
            ], d = $d(b), e = Zd(b, c), f = $d(_d(c, b, -e)) || 0;
          b[0] * c[1] < c[0] * b[1] && (b[0] *= -1, b[1] *= -1, d *= -1, e *= -1), this.rotate = (d ? Math.atan2(b[1], b[0]) : Math.atan2(-c[0], c[1])) * Ch, this.translate = [
            a.e,
            a.f
          ], this.scale = [
            d,
            f
          ], this.skew = f ? Math.atan2(e, f) * Ch : 0;
        }
        function Zd(a, b) {
          return a[0] * b[0] + a[1] * b[1];
        }
        function $d(a) {
          var b = Math.sqrt(Zd(a, a));
          return b && (a[0] /= b, a[1] /= b), b;
        }
        function _d(a, b, c) {
          return a[0] += c * b[0], a[1] += c * b[1], a;
        }
        function ae(a, b) {
          var c, d = [], e = [], f = Sg.transform(a), g = Sg.transform(b), h = f.translate, i = g.translate, j = f.rotate, k = g.rotate, l = f.skew, m = g.skew, n = f.scale, o = g.scale;
          return h[0] != i[0] || h[1] != i[1] ? (d.push('translate(', null, ',', null, ')'), e.push({
            i: 1,
            x: Dd(h[0], i[0])
          }, {
            i: 3,
            x: Dd(h[1], i[1])
          })) : i[0] || i[1] ? d.push('translate(' + i + ')') : d.push(''), j != k ? (j - k > 180 ? k += 360 : k - j > 180 && (j += 360), e.push({
            i: d.push(d.pop() + 'rotate(', null, ')') - 2,
            x: Dd(j, k)
          })) : k && d.push(d.pop() + 'rotate(' + k + ')'), l != m ? e.push({
            i: d.push(d.pop() + 'skewX(', null, ')') - 2,
            x: Dd(l, m)
          }) : m && d.push(d.pop() + 'skewX(' + m + ')'), n[0] != o[0] || n[1] != o[1] ? (c = d.push(d.pop() + 'scale(', null, ',', null, ')'), e.push({
            i: c - 4,
            x: Dd(n[0], o[0])
          }, {
            i: c - 2,
            x: Dd(n[1], o[1])
          })) : (1 != o[0] || 1 != o[1]) && d.push(d.pop() + 'scale(' + o + ')'), c = e.length, function (a) {
            for (var b, f = -1; ++f < c;)
              d[(b = e[f]).i] = b.x(a);
            return d.join('');
          };
        }
        function be(a, b) {
          return b = b - (a = +a) ? 1 / (b - a) : 0, function (c) {
            return (c - a) * b;
          };
        }
        function ce(a, b) {
          return b = b - (a = +a) ? 1 / (b - a) : 0, function (c) {
            return Math.max(0, Math.min(1, (c - a) * b));
          };
        }
        function de(a) {
          for (var b = a.source, c = a.target, d = fe(b, c), e = [b]; b !== d;)
            b = b.parent, e.push(b);
          for (var f = e.length; c !== d;)
            e.splice(f, 0, c), c = c.parent;
          return e;
        }
        function ee(a) {
          for (var b = [], c = a.parent; null != c;)
            b.push(a), a = c, c = c.parent;
          return b.push(a), b;
        }
        function fe(a, b) {
          if (a === b)
            return a;
          for (var c = ee(a), d = ee(b), e = c.pop(), f = d.pop(), g = null; e === f;)
            g = e, e = c.pop(), f = d.pop();
          return g;
        }
        function ge(a) {
          a.fixed |= 2;
        }
        function he(a) {
          a.fixed &= -7;
        }
        function ie(a) {
          a.fixed |= 4, a.px = a.x, a.py = a.y;
        }
        function je(a) {
          a.fixed &= -5;
        }
        function ke(a, b, c) {
          var d = 0, e = 0;
          if (a.charge = 0, !a.leaf)
            for (var f, g = a.nodes, h = g.length, i = -1; ++i < h;)
              f = g[i], null != f && (ke(f, b, c), a.charge += f.charge, d += f.charge * f.cx, e += f.charge * f.cy);
          if (a.point) {
            a.leaf || (a.point.x += Math.random() - 0.5, a.point.y += Math.random() - 0.5);
            var j = b * c[a.point.index];
            a.charge += a.pointCharge = j, d += j * a.point.x, e += j * a.point.y;
          }
          a.cx = d / a.charge, a.cy = e / a.charge;
        }
        function le(a, b) {
          return Sg.rebind(a, b, 'sort', 'children', 'value'), a.nodes = a, a.links = pe, a;
        }
        function me(a) {
          return a.children;
        }
        function ne(a) {
          return a.value;
        }
        function oe(a, b) {
          return b.value - a.value;
        }
        function pe(a) {
          return Sg.merge(a.map(function (a) {
            return (a.children || []).map(function (b) {
              return {
                source: a,
                target: b
              };
            });
          }));
        }
        function qe(a) {
          return a.x;
        }
        function re(a) {
          return a.y;
        }
        function se(a, b, c) {
          a.y0 = b, a.y = c;
        }
        function te(a) {
          return Sg.range(a.length);
        }
        function ue(a) {
          for (var b = -1, c = a[0].length, d = []; ++b < c;)
            d[b] = 0;
          return d;
        }
        function ve(a) {
          for (var b, c = 1, d = 0, e = a[0][1], f = a.length; f > c; ++c)
            (b = a[c][1]) > e && (d = c, e = b);
          return d;
        }
        function we(a) {
          return a.reduce(xe, 0);
        }
        function xe(a, b) {
          return a + b[1];
        }
        function ye(a, b) {
          return ze(a, Math.ceil(Math.log(b.length) / Math.LN2 + 1));
        }
        function ze(a, b) {
          for (var c = -1, d = +a[0], e = (a[1] - d) / b, f = []; ++c <= b;)
            f[c] = e * c + d;
          return f;
        }
        function Ae(a) {
          return [
            Sg.min(a),
            Sg.max(a)
          ];
        }
        function Be(a, b) {
          return a.parent == b.parent ? 1 : 2;
        }
        function Ce(a) {
          var b = a.children;
          return b && b.length ? b[0] : a._tree.thread;
        }
        function De(a) {
          var b, c = a.children;
          return c && (b = c.length) ? c[b - 1] : a._tree.thread;
        }
        function Ee(a, b) {
          var c = a.children;
          if (c && (e = c.length))
            for (var d, e, f = -1; ++f < e;)
              b(d = Ee(c[f], b), a) > 0 && (a = d);
          return a;
        }
        function Fe(a, b) {
          return a.x - b.x;
        }
        function Ge(a, b) {
          return b.x - a.x;
        }
        function He(a, b) {
          return a.depth - b.depth;
        }
        function Ie(a, b) {
          function c(a, d) {
            var e = a.children;
            if (e && (g = e.length))
              for (var f, g, h = null, i = -1; ++i < g;)
                f = e[i], c(f, h), h = f;
            b(a, d);
          }
          c(a, null);
        }
        function Je(a) {
          for (var b, c = 0, d = 0, e = a.children, f = e.length; --f >= 0;)
            b = e[f]._tree, b.prelim += c, b.mod += c, c += b.shift + (d += b.change);
        }
        function Ke(a, b, c) {
          a = a._tree, b = b._tree;
          var d = c / (b.number - a.number);
          a.change += d, b.change -= d, b.shift += c, b.prelim += c, b.mod += c;
        }
        function Le(a, b, c) {
          return a._tree.ancestor.parent == b.parent ? a._tree.ancestor : c;
        }
        function Me(a, b) {
          return a.value - b.value;
        }
        function Ne(a, b) {
          var c = a._pack_next;
          a._pack_next = b, b._pack_prev = a, b._pack_next = c, c._pack_prev = b;
        }
        function Oe(a, b) {
          a._pack_next = b, b._pack_prev = a;
        }
        function Pe(a, b) {
          var c = b.x - a.x, d = b.y - a.y, e = a.r + b.r;
          return 0.999 * e * e > c * c + d * d;
        }
        function Qe(a) {
          function b(a) {
            k = Math.min(a.x - a.r, k), l = Math.max(a.x + a.r, l), m = Math.min(a.y - a.r, m), n = Math.max(a.y + a.r, n);
          }
          if ((c = a.children) && (j = c.length)) {
            var c, d, e, f, g, h, i, j, k = 1 / 0, l = -1 / 0, m = 1 / 0, n = -1 / 0;
            if (c.forEach(Re), d = c[0], d.x = -d.r, d.y = 0, b(d), j > 1 && (e = c[1], e.x = e.r, e.y = 0, b(e), j > 2))
              for (f = c[2], Ue(d, e, f), b(f), Ne(d, f), d._pack_prev = f, Ne(f, e), e = d._pack_next, g = 3; j > g; g++) {
                Ue(d, e, f = c[g]);
                var o = 0, p = 1, q = 1;
                for (h = e._pack_next; h !== e; h = h._pack_next, p++)
                  if (Pe(h, f)) {
                    o = 1;
                    break;
                  }
                if (1 == o)
                  for (i = d._pack_prev; i !== h._pack_prev && !Pe(i, f); i = i._pack_prev, q++);
                o ? (q > p || p == q && e.r < d.r ? Oe(d, e = h) : Oe(d = i, e), g--) : (Ne(d, f), e = f, b(f));
              }
            var r = (k + l) / 2, s = (m + n) / 2, t = 0;
            for (g = 0; j > g; g++)
              f = c[g], f.x -= r, f.y -= s, t = Math.max(t, f.r + Math.sqrt(f.x * f.x + f.y * f.y));
            a.r = t, c.forEach(Se);
          }
        }
        function Re(a) {
          a._pack_next = a._pack_prev = a;
        }
        function Se(a) {
          delete a._pack_next, delete a._pack_prev;
        }
        function Te(a, b, c, d) {
          var e = a.children;
          if (a.x = b += d * a.x, a.y = c += d * a.y, a.r *= d, e)
            for (var f = -1, g = e.length; ++f < g;)
              Te(e[f], b, c, d);
        }
        function Ue(a, b, c) {
          var d = a.r + c.r, e = b.x - a.x, f = b.y - a.y;
          if (d && (e || f)) {
            var g = b.r + c.r, h = e * e + f * f;
            g *= g, d *= d;
            var i = 0.5 + (d - g) / (2 * h), j = Math.sqrt(Math.max(0, 2 * g * (d + h) - (d -= h) * d - g * g)) / (2 * h);
            c.x = a.x + i * e + j * f, c.y = a.y + i * f - j * e;
          } else
            c.x = a.x + d, c.y = a.y;
        }
        function Ve(a) {
          return 1 + Sg.max(a, function (a) {
            return a.y;
          });
        }
        function We(a) {
          return a.reduce(function (a, b) {
            return a + b.x;
          }, 0) / a.length;
        }
        function Xe(a) {
          var b = a.children;
          return b && b.length ? Xe(b[0]) : a;
        }
        function Ye(a) {
          var b, c = a.children;
          return c && (b = c.length) ? Ye(c[b - 1]) : a;
        }
        function Ze(a) {
          return {
            x: a.x,
            y: a.y,
            dx: a.dx,
            dy: a.dy
          };
        }
        function $e(a, b) {
          var c = a.x + b[3], d = a.y + b[0], e = a.dx - b[1] - b[3], f = a.dy - b[0] - b[2];
          return 0 > e && (c += e / 2, e = 0), 0 > f && (d += f / 2, f = 0), {
            x: c,
            y: d,
            dx: e,
            dy: f
          };
        }
        function _e(a) {
          var b = a[0], c = a[a.length - 1];
          return c > b ? [
            b,
            c
          ] : [
            c,
            b
          ];
        }
        function af(a) {
          return a.rangeExtent ? a.rangeExtent() : _e(a.range());
        }
        function bf(a, b, c, d) {
          var e = c(a[0], a[1]), f = d(b[0], b[1]);
          return function (a) {
            return f(e(a));
          };
        }
        function cf(a, b) {
          var c, d = 0, e = a.length - 1, f = a[d], g = a[e];
          return f > g && (c = d, d = e, e = c, c = f, f = g, g = c), a[d] = b.floor(f), a[e] = b.ceil(g), a;
        }
        function df(a) {
          return a ? {
            floor: function (b) {
              return Math.floor(b / a) * a;
            },
            ceil: function (b) {
              return Math.ceil(b / a) * a;
            }
          } : gj;
        }
        function ef(a, b, c, d) {
          var e = [], f = [], g = 0, h = Math.min(a.length, b.length) - 1;
          for (a[h] < a[0] && (a = a.slice().reverse(), b = b.slice().reverse()); ++g <= h;)
            e.push(c(a[g - 1], a[g])), f.push(d(b[g - 1], b[g]));
          return function (b) {
            var c = Sg.bisect(a, b, 1, h) - 1;
            return f[c](e[c](b));
          };
        }
        function ff(a, b, c, d) {
          function e() {
            var e = Math.min(a.length, b.length) > 2 ? ef : bf, i = d ? ce : be;
            return g = e(a, b, i, c), h = e(b, a, i, Fd), f;
          }
          function f(a) {
            return g(a);
          }
          var g, h;
          return f.invert = function (a) {
            return h(a);
          }, f.domain = function (b) {
            return arguments.length ? (a = b.map(Number), e()) : a;
          }, f.range = function (a) {
            return arguments.length ? (b = a, e()) : b;
          }, f.rangeRound = function (a) {
            return f.range(a).interpolate(Xd);
          }, f.clamp = function (a) {
            return arguments.length ? (d = a, e()) : d;
          }, f.interpolate = function (a) {
            return arguments.length ? (c = a, e()) : c;
          }, f.ticks = function (b) {
            return kf(a, b);
          }, f.tickFormat = function (b, c) {
            return lf(a, b, c);
          }, f.nice = function (b) {
            return hf(a, b), e();
          }, f.copy = function () {
            return ff(a, b, c, d);
          }, e();
        }
        function gf(a, b) {
          return Sg.rebind(a, b, 'range', 'rangeRound', 'interpolate', 'clamp');
        }
        function hf(a, b) {
          return cf(a, df(jf(a, b)[2]));
        }
        function jf(a, b) {
          null == b && (b = 10);
          var c = _e(a), d = c[1] - c[0], e = Math.pow(10, Math.floor(Math.log(d / b) / Math.LN10)), f = b / d * e;
          return 0.15 >= f ? e *= 10 : 0.35 >= f ? e *= 5 : 0.75 >= f && (e *= 2), c[0] = Math.ceil(c[0] / e) * e, c[1] = Math.floor(c[1] / e) * e + 0.5 * e, c[2] = e, c;
        }
        function kf(a, b) {
          return Sg.range.apply(Sg, jf(a, b));
        }
        function lf(a, b, c) {
          var d = -Math.floor(Math.log(jf(a, b)[2]) / Math.LN10 + 0.01);
          return Sg.format(c ? c.replace(bi, function (a, b, c, e, f, g, h, i, j, k) {
            return [
              b,
              c,
              e,
              f,
              g,
              h,
              i,
              j || '.' + (d - 2 * ('%' === k)),
              k
            ].join('');
          }) : ',.' + d + 'f');
        }
        function mf(a, b, c, d) {
          function e(a) {
            return (c ? Math.log(0 > a ? 0 : a) : -Math.log(a > 0 ? 0 : -a)) / Math.log(b);
          }
          function f(a) {
            return c ? Math.pow(b, a) : -Math.pow(b, -a);
          }
          function g(b) {
            return a(e(b));
          }
          return g.invert = function (b) {
            return f(a.invert(b));
          }, g.domain = function (b) {
            return arguments.length ? (c = b[0] >= 0, a.domain((d = b.map(Number)).map(e)), g) : d;
          }, g.base = function (c) {
            return arguments.length ? (b = +c, a.domain(d.map(e)), g) : b;
          }, g.nice = function () {
            var b = cf(d.map(e), c ? Math : ij);
            return a.domain(b), d = b.map(f), g;
          }, g.ticks = function () {
            var a = _e(d), g = [], h = a[0], i = a[1], j = Math.floor(e(h)), k = Math.ceil(e(i)), l = b % 1 ? 2 : b;
            if (isFinite(k - j)) {
              if (c) {
                for (; k > j; j++)
                  for (var m = 1; l > m; m++)
                    g.push(f(j) * m);
                g.push(f(j));
              } else
                for (g.push(f(j)); j++ < k;)
                  for (var m = l - 1; m > 0; m--)
                    g.push(f(j) * m);
              for (j = 0; g[j] < h; j++);
              for (k = g.length; g[k - 1] > i; k--);
              g = g.slice(j, k);
            }
            return g;
          }, g.tickFormat = function (a, b) {
            if (!arguments.length)
              return hj;
            arguments.length < 2 ? b = hj : 'function' != typeof b && (b = Sg.format(b));
            var d, h = Math.max(0.1, a / g.ticks().length), i = c ? (d = 1e-12, Math.ceil) : (d = -1e-12, Math.floor);
            return function (a) {
              return a / f(i(e(a) + d)) <= h ? b(a) : '';
            };
          }, g.copy = function () {
            return mf(a.copy(), b, c, d);
          }, gf(g, a);
        }
        function nf(a, b, c) {
          function d(b) {
            return a(e(b));
          }
          var e = of(b), f = of(1 / b);
          return d.invert = function (b) {
            return f(a.invert(b));
          }, d.domain = function (b) {
            return arguments.length ? (a.domain((c = b.map(Number)).map(e)), d) : c;
          }, d.ticks = function (a) {
            return kf(c, a);
          }, d.tickFormat = function (a, b) {
            return lf(c, a, b);
          }, d.nice = function (a) {
            return d.domain(hf(c, a));
          }, d.exponent = function (g) {
            return arguments.length ? (e = of(b = g), f = of(1 / b), a.domain(c.map(e)), d) : b;
          }, d.copy = function () {
            return nf(a.copy(), b, c);
          }, gf(d, a);
        }
        function of(a) {
          return function (b) {
            return 0 > b ? -Math.pow(-b, a) : Math.pow(b, a);
          };
        }
        function pf(a, b) {
          function c(c) {
            return g[((f.get(c) || 'range' === b.t && f.set(c, a.push(c))) - 1) % g.length];
          }
          function d(b, c) {
            return Sg.range(a.length).map(function (a) {
              return b + c * a;
            });
          }
          var f, g, h;
          return c.domain = function (d) {
            if (!arguments.length)
              return a;
            a = [], f = new e();
            for (var g, h = -1, i = d.length; ++h < i;)
              f.has(g = d[h]) || f.set(g, a.push(g));
            return c[b.t].apply(c, b.a);
          }, c.range = function (a) {
            return arguments.length ? (g = a, h = 0, b = {
              t: 'range',
              a: arguments
            }, c) : g;
          }, c.rangePoints = function (e, f) {
            arguments.length < 2 && (f = 0);
            var i = e[0], j = e[1], k = (j - i) / (Math.max(1, a.length - 1) + f);
            return g = d(a.length < 2 ? (i + j) / 2 : i + k * f / 2, k), h = 0, b = {
              t: 'rangePoints',
              a: arguments
            }, c;
          }, c.rangeBands = function (e, f, i) {
            arguments.length < 2 && (f = 0), arguments.length < 3 && (i = f);
            var j = e[1] < e[0], k = e[j - 0], l = e[1 - j], m = (l - k) / (a.length - f + 2 * i);
            return g = d(k + m * i, m), j && g.reverse(), h = m * (1 - f), b = {
              t: 'rangeBands',
              a: arguments
            }, c;
          }, c.rangeRoundBands = function (e, f, i) {
            arguments.length < 2 && (f = 0), arguments.length < 3 && (i = f);
            var j = e[1] < e[0], k = e[j - 0], l = e[1 - j], m = Math.floor((l - k) / (a.length - f + 2 * i)), n = l - k - (a.length - f) * m;
            return g = d(k + Math.round(n / 2), m), j && g.reverse(), h = Math.round(m * (1 - f)), b = {
              t: 'rangeRoundBands',
              a: arguments
            }, c;
          }, c.rangeBand = function () {
            return h;
          }, c.rangeExtent = function () {
            return _e(b.a[0]);
          }, c.copy = function () {
            return pf(a, b);
          }, c.domain(a);
        }
        function qf(a, b) {
          function c() {
            var c = 0, f = b.length;
            for (e = []; ++c < f;)
              e[c - 1] = Sg.quantile(a, c / f);
            return d;
          }
          function d(a) {
            return isNaN(a = +a) ? void 0 : b[Sg.bisect(e, a)];
          }
          var e;
          return d.domain = function (b) {
            return arguments.length ? (a = b.filter(function (a) {
              return !isNaN(a);
            }).sort(Sg.ascending), c()) : a;
          }, d.range = function (a) {
            return arguments.length ? (b = a, c()) : b;
          }, d.quantiles = function () {
            return e;
          }, d.invertExtent = function (c) {
            return c = b.indexOf(c), 0 > c ? [
              0 / 0,
              0 / 0
            ] : [
              c > 0 ? e[c - 1] : a[0],
              c < e.length ? e[c] : a[a.length - 1]
            ];
          }, d.copy = function () {
            return qf(a, b);
          }, c();
        }
        function rf(a, b, c) {
          function d(b) {
            return c[Math.max(0, Math.min(g, Math.floor(f * (b - a))))];
          }
          function e() {
            return f = c.length / (b - a), g = c.length - 1, d;
          }
          var f, g;
          return d.domain = function (c) {
            return arguments.length ? (a = +c[0], b = +c[c.length - 1], e()) : [
              a,
              b
            ];
          }, d.range = function (a) {
            return arguments.length ? (c = a, e()) : c;
          }, d.invertExtent = function (b) {
            return b = c.indexOf(b), b = 0 > b ? 0 / 0 : b / f + a, [
              b,
              b + 1 / f
            ];
          }, d.copy = function () {
            return rf(a, b, c);
          }, e();
        }
        function sf(a, b) {
          function c(c) {
            return c >= c ? b[Sg.bisect(a, c)] : void 0;
          }
          return c.domain = function (b) {
            return arguments.length ? (a = b, c) : a;
          }, c.range = function (a) {
            return arguments.length ? (b = a, c) : b;
          }, c.invertExtent = function (c) {
            return c = b.indexOf(c), [
              a[c - 1],
              a[c]
            ];
          }, c.copy = function () {
            return sf(a, b);
          }, c;
        }
        function tf(a) {
          function b(a) {
            return +a;
          }
          return b.invert = b, b.domain = b.range = function (c) {
            return arguments.length ? (a = c.map(b), b) : a;
          }, b.ticks = function (b) {
            return kf(a, b);
          }, b.tickFormat = function (b, c) {
            return lf(a, b, c);
          }, b.copy = function () {
            return tf(a);
          }, b;
        }
        function uf(a) {
          return a.innerRadius;
        }
        function vf(a) {
          return a.outerRadius;
        }
        function wf(a) {
          return a.startAngle;
        }
        function xf(a) {
          return a.endAngle;
        }
        function yf(a) {
          function b(b) {
            function g() {
              j.push('M', f(a(k), h));
            }
            for (var i, j = [], k = [], l = -1, m = b.length, n = ob(c), o = ob(d); ++l < m;)
              e.call(this, i = b[l], l) ? k.push([
                +n.call(this, i, l),
                +o.call(this, i, l)
              ]) : k.length && (g(), k = []);
            return k.length && g(), j.length ? j.join('') : null;
          }
          var c = Rc, d = Sc, e = Sb, f = zf, g = f.key, h = 0.7;
          return b.x = function (a) {
            return arguments.length ? (c = a, b) : c;
          }, b.y = function (a) {
            return arguments.length ? (d = a, b) : d;
          }, b.defined = function (a) {
            return arguments.length ? (e = a, b) : e;
          }, b.interpolate = function (a) {
            return arguments.length ? (g = 'function' == typeof a ? f = a : (f = pj.get(a) || zf).key, b) : g;
          }, b.tension = function (a) {
            return arguments.length ? (h = a, b) : h;
          }, b;
        }
        function zf(a) {
          return a.join('L');
        }
        function Af(a) {
          return zf(a) + 'Z';
        }
        function Bf(a) {
          for (var b = 0, c = a.length, d = a[0], e = [
                d[0],
                ',',
                d[1]
              ]; ++b < c;)
            e.push('H', (d[0] + (d = a[b])[0]) / 2, 'V', d[1]);
          return c > 1 && e.push('H', d[0]), e.join('');
        }
        function Cf(a) {
          for (var b = 0, c = a.length, d = a[0], e = [
                d[0],
                ',',
                d[1]
              ]; ++b < c;)
            e.push('V', (d = a[b])[1], 'H', d[0]);
          return e.join('');
        }
        function Df(a) {
          for (var b = 0, c = a.length, d = a[0], e = [
                d[0],
                ',',
                d[1]
              ]; ++b < c;)
            e.push('H', (d = a[b])[0], 'V', d[1]);
          return e.join('');
        }
        function Ef(a, b) {
          return a.length < 4 ? zf(a) : a[1] + Hf(a.slice(1, a.length - 1), If(a, b));
        }
        function Ff(a, b) {
          return a.length < 3 ? zf(a) : a[0] + Hf((a.push(a[0]), a), If([a[a.length - 2]].concat(a, [a[1]]), b));
        }
        function Gf(a, b) {
          return a.length < 3 ? zf(a) : a[0] + Hf(a, If(a, b));
        }
        function Hf(a, b) {
          if (b.length < 1 || a.length != b.length && a.length != b.length + 2)
            return zf(a);
          var c = a.length != b.length, d = '', e = a[0], f = a[1], g = b[0], h = g, i = 1;
          if (c && (d += 'Q' + (f[0] - 2 * g[0] / 3) + ',' + (f[1] - 2 * g[1] / 3) + ',' + f[0] + ',' + f[1], e = a[1], i = 2), b.length > 1) {
            h = b[1], f = a[i], i++, d += 'C' + (e[0] + g[0]) + ',' + (e[1] + g[1]) + ',' + (f[0] - h[0]) + ',' + (f[1] - h[1]) + ',' + f[0] + ',' + f[1];
            for (var j = 2; j < b.length; j++, i++)
              f = a[i], h = b[j], d += 'S' + (f[0] - h[0]) + ',' + (f[1] - h[1]) + ',' + f[0] + ',' + f[1];
          }
          if (c) {
            var k = a[i];
            d += 'Q' + (f[0] + 2 * h[0] / 3) + ',' + (f[1] + 2 * h[1] / 3) + ',' + k[0] + ',' + k[1];
          }
          return d;
        }
        function If(a, b) {
          for (var c, d = [], e = (1 - b) / 2, f = a[0], g = a[1], h = 1, i = a.length; ++h < i;)
            c = f, f = g, g = a[h], d.push([
              e * (g[0] - c[0]),
              e * (g[1] - c[1])
            ]);
          return d;
        }
        function Jf(a) {
          if (a.length < 3)
            return zf(a);
          var b = 1, c = a.length, d = a[0], e = d[0], f = d[1], g = [
              e,
              e,
              e,
              (d = a[1])[0]
            ], h = [
              f,
              f,
              f,
              d[1]
            ], i = [
              e,
              ',',
              f,
              'L',
              Nf(sj, g),
              ',',
              Nf(sj, h)
            ];
          for (a.push(a[c - 1]); ++b <= c;)
            d = a[b], g.shift(), g.push(d[0]), h.shift(), h.push(d[1]), Of(i, g, h);
          return a.pop(), i.push('L', d), i.join('');
        }
        function Kf(a) {
          if (a.length < 4)
            return zf(a);
          for (var b, c = [], d = -1, e = a.length, f = [0], g = [0]; ++d < 3;)
            b = a[d], f.push(b[0]), g.push(b[1]);
          for (c.push(Nf(sj, f) + ',' + Nf(sj, g)), --d; ++d < e;)
            b = a[d], f.shift(), f.push(b[0]), g.shift(), g.push(b[1]), Of(c, f, g);
          return c.join('');
        }
        function Lf(a) {
          for (var b, c, d = -1, e = a.length, f = e + 4, g = [], h = []; ++d < 4;)
            c = a[d % e], g.push(c[0]), h.push(c[1]);
          for (b = [
              Nf(sj, g),
              ',',
              Nf(sj, h)
            ], --d; ++d < f;)
            c = a[d % e], g.shift(), g.push(c[0]), h.shift(), h.push(c[1]), Of(b, g, h);
          return b.join('');
        }
        function Mf(a, b) {
          var c = a.length - 1;
          if (c)
            for (var d, e, f = a[0][0], g = a[0][1], h = a[c][0] - f, i = a[c][1] - g, j = -1; ++j <= c;)
              d = a[j], e = j / c, d[0] = b * d[0] + (1 - b) * (f + e * h), d[1] = b * d[1] + (1 - b) * (g + e * i);
          return Jf(a);
        }
        function Nf(a, b) {
          return a[0] * b[0] + a[1] * b[1] + a[2] * b[2] + a[3] * b[3];
        }
        function Of(a, b, c) {
          a.push('C', Nf(qj, b), ',', Nf(qj, c), ',', Nf(rj, b), ',', Nf(rj, c), ',', Nf(sj, b), ',', Nf(sj, c));
        }
        function Pf(a, b) {
          return (b[1] - a[1]) / (b[0] - a[0]);
        }
        function Qf(a) {
          for (var b = 0, c = a.length - 1, d = [], e = a[0], f = a[1], g = d[0] = Pf(e, f); ++b < c;)
            d[b] = (g + (g = Pf(e = f, f = a[b + 1]))) / 2;
          return d[b] = g, d;
        }
        function Rf(a) {
          for (var b, c, d, e, f = [], g = Qf(a), h = -1, i = a.length - 1; ++h < i;)
            b = Pf(a[h], a[h + 1]), eh(b) < zh ? g[h] = g[h + 1] = 0 : (c = g[h] / b, d = g[h + 1] / b, e = c * c + d * d, e > 9 && (e = 3 * b / Math.sqrt(e), g[h] = e * c, g[h + 1] = e * d));
          for (h = -1; ++h <= i;)
            e = (a[Math.min(i, h + 1)][0] - a[Math.max(0, h - 1)][0]) / (6 * (1 + g[h] * g[h])), f.push([
              e || 0,
              g[h] * e || 0
            ]);
          return f;
        }
        function Sf(a) {
          return a.length < 3 ? zf(a) : a[0] + Hf(a, Rf(a));
        }
        function Tf(a) {
          for (var b, c, d, e = -1, f = a.length; ++e < f;)
            b = a[e], c = b[0], d = b[1] + nj, b[0] = c * Math.cos(d), b[1] = c * Math.sin(d);
          return a;
        }
        function Uf(a) {
          function b(b) {
            function i() {
              p.push('M', h(a(r), l), k, j(a(q.reverse()), l), 'Z');
            }
            for (var m, n, o, p = [], q = [], r = [], s = -1, t = b.length, u = ob(c), v = ob(e), w = c === d ? function () {
                  return n;
                } : ob(d), x = e === f ? function () {
                  return o;
                } : ob(f); ++s < t;)
              g.call(this, m = b[s], s) ? (q.push([
                n = +u.call(this, m, s),
                o = +v.call(this, m, s)
              ]), r.push([
                +w.call(this, m, s),
                +x.call(this, m, s)
              ])) : q.length && (i(), q = [], r = []);
            return q.length && i(), p.length ? p.join('') : null;
          }
          var c = Rc, d = Rc, e = 0, f = Sc, g = Sb, h = zf, i = h.key, j = h, k = 'L', l = 0.7;
          return b.x = function (a) {
            return arguments.length ? (c = d = a, b) : d;
          }, b.x0 = function (a) {
            return arguments.length ? (c = a, b) : c;
          }, b.x1 = function (a) {
            return arguments.length ? (d = a, b) : d;
          }, b.y = function (a) {
            return arguments.length ? (e = f = a, b) : f;
          }, b.y0 = function (a) {
            return arguments.length ? (e = a, b) : e;
          }, b.y1 = function (a) {
            return arguments.length ? (f = a, b) : f;
          }, b.defined = function (a) {
            return arguments.length ? (g = a, b) : g;
          }, b.interpolate = function (a) {
            return arguments.length ? (i = 'function' == typeof a ? h = a : (h = pj.get(a) || zf).key, j = h.reverse || h, k = h.closed ? 'M' : 'L', b) : i;
          }, b.tension = function (a) {
            return arguments.length ? (l = a, b) : l;
          }, b;
        }
        function Vf(a) {
          return a.radius;
        }
        function Wf(a) {
          return [
            a.x,
            a.y
          ];
        }
        function Xf(a) {
          return function () {
            var b = a.apply(this, arguments), c = b[0], d = b[1] + nj;
            return [
              c * Math.cos(d),
              c * Math.sin(d)
            ];
          };
        }
        function Yf() {
          return 64;
        }
        function Zf() {
          return 'circle';
        }
        function $f(a) {
          var b = Math.sqrt(a / wh);
          return 'M0,' + b + 'A' + b + ',' + b + ' 0 1,1 0,' + -b + 'A' + b + ',' + b + ' 0 1,1 0,' + b + 'Z';
        }
        function _f(a, b) {
          return jh(a, yj), a.id = b, a;
        }
        function ag(a, b, c, d) {
          var e = a.id;
          return C(a, 'function' == typeof c ? function (a, f, g) {
            a.__transition__[e].tween.set(b, d(c.call(a, a.__data__, f, g)));
          } : (c = d(c), function (a) {
            a.__transition__[e].tween.set(b, c);
          }));
        }
        function bg(a) {
          return null == a && (a = ''), function () {
            this.textContent = a;
          };
        }
        function cg(a, b, c, d) {
          var f = a.__transition__ || (a.__transition__ = {
              active: 0,
              count: 0
            }), g = f[c];
          if (!g) {
            var h = d.time;
            g = f[c] = {
              tween: new e(),
              time: h,
              ease: d.ease,
              delay: d.delay,
              duration: d.duration
            }, ++f.count, Sg.timer(function (d) {
              function e(d) {
                return f.active > c ? j() : (f.active = c, g.event && g.event.start.call(a, k, b), g.tween.forEach(function (c, d) {
                  (d = d.call(a, k, b)) && p.push(d);
                }), Sg.timer(function () {
                  return o.c = i(d || 1) ? Sb : i, 1;
                }, 0, h), void 0);
              }
              function i(d) {
                if (f.active !== c)
                  return j();
                for (var e = d / n, h = l(e), i = p.length; i > 0;)
                  p[--i].call(a, h);
                return e >= 1 ? (g.event && g.event.end.call(a, k, b), j()) : void 0;
              }
              function j() {
                return --f.count ? delete f[c] : delete a.__transition__, 1;
              }
              var k = a.__data__, l = g.ease, m = g.delay, n = g.duration, o = Wh, p = [];
              return o.t = m + h, d >= m ? e(d - m) : (o.c = e, void 0);
            }, 0, h);
          }
        }
        function dg(a, b) {
          a.attr('transform', function (a) {
            return 'translate(' + b(a) + ',0)';
          });
        }
        function eg(a, b) {
          a.attr('transform', function (a) {
            return 'translate(0,' + b(a) + ')';
          });
        }
        function fg() {
          this._ = new Date(arguments.length > 1 ? Date.UTC.apply(this, arguments) : arguments[0]);
        }
        function gg(a, b, c) {
          function d(b) {
            var c = a(b), d = f(c, 1);
            return d - b > b - c ? c : d;
          }
          function e(c) {
            return b(c = a(new Fj(c - 1)), 1), c;
          }
          function f(a, c) {
            return b(a = new Fj(+a), c), a;
          }
          function g(a, d, f) {
            var g = e(a), h = [];
            if (f > 1)
              for (; d > g;)
                c(g) % f || h.push(new Date(+g)), b(g, 1);
            else
              for (; d > g;)
                h.push(new Date(+g)), b(g, 1);
            return h;
          }
          function h(a, b, c) {
            try {
              Fj = fg;
              var d = new fg();
              return d._ = a, g(d, b, c);
            } finally {
              Fj = Date;
            }
          }
          a.floor = a, a.round = d, a.ceil = e, a.offset = f, a.range = g;
          var i = a.utc = hg(a);
          return i.floor = i, i.round = hg(d), i.ceil = hg(e), i.offset = hg(f), i.range = h, a;
        }
        function hg(a) {
          return function (b, c) {
            try {
              Fj = fg;
              var d = new fg();
              return d._ = b, a(d, c)._;
            } finally {
              Fj = Date;
            }
          };
        }
        function ig(a) {
          function b(b) {
            for (var d, e, f, g = [], h = -1, i = 0; ++h < c;)
              37 === a.charCodeAt(h) && (g.push(a.substring(i, h)), null != (e = Yj[d = a.charAt(++h)]) && (d = a.charAt(++h)), (f = Zj[d]) && (d = f(b, null == e ? 'e' === d ? ' ' : '0' : e)), g.push(d), i = h + 1);
            return g.push(a.substring(i, h)), g.join('');
          }
          var c = a.length;
          return b.parse = function (b) {
            var c = {
                y: 1900,
                m: 0,
                d: 1,
                H: 0,
                M: 0,
                S: 0,
                L: 0,
                Z: null
              }, d = jg(c, a, b, 0);
            if (d != b.length)
              return null;
            'p' in c && (c.H = c.H % 12 + 12 * c.p);
            var e = null != c.Z && Fj !== fg, f = new (e ? fg : Fj)();
            return 'j' in c ? f.setFullYear(c.y, 0, c.j) : 'w' in c && ('W' in c || 'U' in c) ? (f.setFullYear(c.y, 0, 1), f.setFullYear(c.y, 0, 'W' in c ? (c.w + 6) % 7 + 7 * c.W - (f.getDay() + 5) % 7 : c.w + 7 * c.U - (f.getDay() + 6) % 7)) : f.setFullYear(c.y, c.m, c.d), f.setHours(c.H + Math.floor(c.Z / 100), c.M + c.Z % 100, c.S, c.L), e ? f._ : f;
          }, b.toString = function () {
            return a;
          }, b;
        }
        function jg(a, b, c, d) {
          for (var e, f, g, h = 0, i = b.length, j = c.length; i > h;) {
            if (d >= j)
              return -1;
            if (e = b.charCodeAt(h++), 37 === e) {
              if (g = b.charAt(h++), f = $j[g in Yj ? b.charAt(h++) : g], !f || (d = f(a, c, d)) < 0)
                return -1;
            } else if (e != c.charCodeAt(d++))
              return -1;
          }
          return d;
        }
        function kg(a) {
          return new RegExp('^(?:' + a.map(Sg.requote).join('|') + ')', 'i');
        }
        function lg(a) {
          for (var b = new e(), c = -1, d = a.length; ++c < d;)
            b.set(a[c].toLowerCase(), c);
          return b;
        }
        function mg(a, b, c) {
          var d = 0 > a ? '-' : '', e = (d ? -a : a) + '', f = e.length;
          return d + (c > f ? new Array(c - f + 1).join(b) + e : e);
        }
        function ng(a, b, c) {
          Rj.lastIndex = 0;
          var d = Rj.exec(b.substring(c));
          return d ? (a.w = Sj.get(d[0].toLowerCase()), c + d[0].length) : -1;
        }
        function og(a, b, c) {
          Pj.lastIndex = 0;
          var d = Pj.exec(b.substring(c));
          return d ? (a.w = Qj.get(d[0].toLowerCase()), c + d[0].length) : -1;
        }
        function pg(a, b, c) {
          _j.lastIndex = 0;
          var d = _j.exec(b.substring(c, c + 1));
          return d ? (a.w = +d[0], c + d[0].length) : -1;
        }
        function qg(a, b, c) {
          _j.lastIndex = 0;
          var d = _j.exec(b.substring(c));
          return d ? (a.U = +d[0], c + d[0].length) : -1;
        }
        function rg(a, b, c) {
          _j.lastIndex = 0;
          var d = _j.exec(b.substring(c));
          return d ? (a.W = +d[0], c + d[0].length) : -1;
        }
        function sg(a, b, c) {
          Vj.lastIndex = 0;
          var d = Vj.exec(b.substring(c));
          return d ? (a.m = Wj.get(d[0].toLowerCase()), c + d[0].length) : -1;
        }
        function tg(a, b, c) {
          Tj.lastIndex = 0;
          var d = Tj.exec(b.substring(c));
          return d ? (a.m = Uj.get(d[0].toLowerCase()), c + d[0].length) : -1;
        }
        function ug(a, b, c) {
          return jg(a, Zj.c.toString(), b, c);
        }
        function vg(a, b, c) {
          return jg(a, Zj.x.toString(), b, c);
        }
        function wg(a, b, c) {
          return jg(a, Zj.X.toString(), b, c);
        }
        function xg(a, b, c) {
          _j.lastIndex = 0;
          var d = _j.exec(b.substring(c, c + 4));
          return d ? (a.y = +d[0], c + d[0].length) : -1;
        }
        function yg(a, b, c) {
          _j.lastIndex = 0;
          var d = _j.exec(b.substring(c, c + 2));
          return d ? (a.y = Ag(+d[0]), c + d[0].length) : -1;
        }
        function zg(a, b, c) {
          return /^[+-]\d{4}$/.test(b = b.substring(c, c + 5)) ? (a.Z = +b, c + 5) : -1;
        }
        function Ag(a) {
          return a + (a > 68 ? 1900 : 2000);
        }
        function Bg(a, b, c) {
          _j.lastIndex = 0;
          var d = _j.exec(b.substring(c, c + 2));
          return d ? (a.m = d[0] - 1, c + d[0].length) : -1;
        }
        function Cg(a, b, c) {
          _j.lastIndex = 0;
          var d = _j.exec(b.substring(c, c + 2));
          return d ? (a.d = +d[0], c + d[0].length) : -1;
        }
        function Dg(a, b, c) {
          _j.lastIndex = 0;
          var d = _j.exec(b.substring(c, c + 3));
          return d ? (a.j = +d[0], c + d[0].length) : -1;
        }
        function Eg(a, b, c) {
          _j.lastIndex = 0;
          var d = _j.exec(b.substring(c, c + 2));
          return d ? (a.H = +d[0], c + d[0].length) : -1;
        }
        function Fg(a, b, c) {
          _j.lastIndex = 0;
          var d = _j.exec(b.substring(c, c + 2));
          return d ? (a.M = +d[0], c + d[0].length) : -1;
        }
        function Gg(a, b, c) {
          _j.lastIndex = 0;
          var d = _j.exec(b.substring(c, c + 2));
          return d ? (a.S = +d[0], c + d[0].length) : -1;
        }
        function Hg(a, b, c) {
          _j.lastIndex = 0;
          var d = _j.exec(b.substring(c, c + 3));
          return d ? (a.L = +d[0], c + d[0].length) : -1;
        }
        function Ig(a, b, c) {
          var d = ak.get(b.substring(c, c += 2).toLowerCase());
          return null == d ? -1 : (a.p = d, c);
        }
        function Jg(a) {
          var b = a.getTimezoneOffset(), c = b > 0 ? '-' : '+', d = ~~(eh(b) / 60), e = eh(b) % 60;
          return c + mg(d, '0', 2) + mg(e, '0', 2);
        }
        function Kg(a, b, c) {
          Xj.lastIndex = 0;
          var d = Xj.exec(b.substring(c, c + 1));
          return d ? c + d[0].length : -1;
        }
        function Lg(a) {
          function b(a) {
            try {
              Fj = fg;
              var b = new Fj();
              return b._ = a, c(b);
            } finally {
              Fj = Date;
            }
          }
          var c = ig(a);
          return b.parse = function (a) {
            try {
              Fj = fg;
              var b = c.parse(a);
              return b && b._;
            } finally {
              Fj = Date;
            }
          }, b.toString = c.toString, b;
        }
        function Mg(a) {
          return a.toISOString();
        }
        function Ng(a, b, c) {
          function d(b) {
            return a(b);
          }
          function e(a, c) {
            var d = a[1] - a[0], e = d / c, f = Sg.bisect(ck, e);
            return f == ck.length ? [
              b.year,
              jf(a.map(function (a) {
                return a / 31536000000;
              }), c)[2]
            ] : f ? b[e / ck[f - 1] < ck[f] / e ? f - 1 : f] : [
              gk,
              jf(a, c)[2]
            ];
          }
          return d.invert = function (b) {
            return Og(a.invert(b));
          }, d.domain = function (b) {
            return arguments.length ? (a.domain(b), d) : a.domain().map(Og);
          }, d.nice = function (a, b) {
            function c(c) {
              return !isNaN(c) && !a.range(c, Og(+c + 1), b).length;
            }
            var f = d.domain(), g = _e(f), h = null == a ? e(g, 10) : 'number' == typeof a && e(g, a);
            return h && (a = h[0], b = h[1]), d.domain(cf(f, b > 1 ? {
              floor: function (b) {
                for (; c(b = a.floor(b));)
                  b = Og(b - 1);
                return b;
              },
              ceil: function (b) {
                for (; c(b = a.ceil(b));)
                  b = Og(+b + 1);
                return b;
              }
            } : a));
          }, d.ticks = function (a, b) {
            var c = _e(d.domain()), f = null == a ? e(c, 10) : 'number' == typeof a ? e(c, a) : !a.range && [
                { range: a },
                b
              ];
            return f && (a = f[0], b = f[1]), a.range(c[0], Og(+c[1] + 1), 1 > b ? 1 : b);
          }, d.tickFormat = function () {
            return c;
          }, d.copy = function () {
            return Ng(a.copy(), b, c);
          }, gf(d, a);
        }
        function Og(a) {
          return new Date(a);
        }
        function Pg(a) {
          return function (b) {
            for (var c = a.length - 1, d = a[c]; !d[1](b);)
              d = a[--c];
            return d[0](b);
          };
        }
        function Qg(a) {
          return JSON.parse(a.responseText);
        }
        function Rg(a) {
          var b = Vg.createRange();
          return b.selectNode(Vg.body), b.createContextualFragment(a.responseText);
        }
        var Sg = { version: '3.3.8' };
        Date.now || (Date.now = function () {
          return +new Date();
        });
        var Tg = [].slice, Ug = function (a) {
            return Tg.call(a);
          }, Vg = document, Wg = Vg.documentElement, Xg = window;
        try {
          Ug(Wg.childNodes)[0].nodeType;
        } catch (Yg) {
          Ug = function (a) {
            for (var b = a.length, c = new Array(b); b--;)
              c[b] = a[b];
            return c;
          };
        }
        try {
          Vg.createElement('div').style.setProperty('opacity', 0, '');
        } catch (Zg) {
          var $g = Xg.Element.prototype, _g = $g.setAttribute, ah = $g.setAttributeNS, bh = Xg.CSSStyleDeclaration.prototype, ch = bh.setProperty;
          $g.setAttribute = function (a, b) {
            _g.call(this, a, b + '');
          }, $g.setAttributeNS = function (a, b, c) {
            ah.call(this, a, b, c + '');
          }, bh.setProperty = function (a, b, c) {
            ch.call(this, a, b + '', c);
          };
        }
        Sg.ascending = function (a, b) {
          return b > a ? -1 : a > b ? 1 : a >= b ? 0 : 0 / 0;
        }, Sg.descending = function (a, b) {
          return a > b ? -1 : b > a ? 1 : b >= a ? 0 : 0 / 0;
        }, Sg.min = function (a, b) {
          var c, d, e = -1, f = a.length;
          if (1 === arguments.length) {
            for (; ++e < f && !(null != (c = a[e]) && c >= c);)
              c = void 0;
            for (; ++e < f;)
              null != (d = a[e]) && c > d && (c = d);
          } else {
            for (; ++e < f && !(null != (c = b.call(a, a[e], e)) && c >= c);)
              c = void 0;
            for (; ++e < f;)
              null != (d = b.call(a, a[e], e)) && c > d && (c = d);
          }
          return c;
        }, Sg.max = function (a, b) {
          var c, d, e = -1, f = a.length;
          if (1 === arguments.length) {
            for (; ++e < f && !(null != (c = a[e]) && c >= c);)
              c = void 0;
            for (; ++e < f;)
              null != (d = a[e]) && d > c && (c = d);
          } else {
            for (; ++e < f && !(null != (c = b.call(a, a[e], e)) && c >= c);)
              c = void 0;
            for (; ++e < f;)
              null != (d = b.call(a, a[e], e)) && d > c && (c = d);
          }
          return c;
        }, Sg.extent = function (a, b) {
          var c, d, e, f = -1, g = a.length;
          if (1 === arguments.length) {
            for (; ++f < g && !(null != (c = e = a[f]) && c >= c);)
              c = e = void 0;
            for (; ++f < g;)
              null != (d = a[f]) && (c > d && (c = d), d > e && (e = d));
          } else {
            for (; ++f < g && !(null != (c = e = b.call(a, a[f], f)) && c >= c);)
              c = void 0;
            for (; ++f < g;)
              null != (d = b.call(a, a[f], f)) && (c > d && (c = d), d > e && (e = d));
          }
          return [
            c,
            e
          ];
        }, Sg.sum = function (a, b) {
          var c, d = 0, e = a.length, f = -1;
          if (1 === arguments.length)
            for (; ++f < e;)
              isNaN(c = +a[f]) || (d += c);
          else
            for (; ++f < e;)
              isNaN(c = +b.call(a, a[f], f)) || (d += c);
          return d;
        }, Sg.mean = function (b, c) {
          var d, e = b.length, f = 0, g = -1, h = 0;
          if (1 === arguments.length)
            for (; ++g < e;)
              a(d = b[g]) && (f += (d - f) / ++h);
          else
            for (; ++g < e;)
              a(d = c.call(b, b[g], g)) && (f += (d - f) / ++h);
          return h ? f : void 0;
        }, Sg.quantile = function (a, b) {
          var c = (a.length - 1) * b + 1, d = Math.floor(c), e = +a[d - 1], f = c - d;
          return f ? e + f * (a[d] - e) : e;
        }, Sg.median = function (b, c) {
          return arguments.length > 1 && (b = b.map(c)), b = b.filter(a), b.length ? Sg.quantile(b.sort(Sg.ascending), 0.5) : void 0;
        }, Sg.bisector = function (a) {
          return {
            left: function (b, c, d, e) {
              for (arguments.length < 3 && (d = 0), arguments.length < 4 && (e = b.length); e > d;) {
                var f = d + e >>> 1;
                a.call(b, b[f], f) < c ? d = f + 1 : e = f;
              }
              return d;
            },
            right: function (b, c, d, e) {
              for (arguments.length < 3 && (d = 0), arguments.length < 4 && (e = b.length); e > d;) {
                var f = d + e >>> 1;
                c < a.call(b, b[f], f) ? e = f : d = f + 1;
              }
              return d;
            }
          };
        };
        var dh = Sg.bisector(function (a) {
            return a;
          });
        Sg.bisectLeft = dh.left, Sg.bisect = Sg.bisectRight = dh.right, Sg.shuffle = function (a) {
          for (var b, c, d = a.length; d;)
            c = 0 | Math.random() * d--, b = a[d], a[d] = a[c], a[c] = b;
          return a;
        }, Sg.permute = function (a, b) {
          for (var c = b.length, d = new Array(c); c--;)
            d[c] = a[b[c]];
          return d;
        }, Sg.pairs = function (a) {
          for (var b, c = 0, d = a.length - 1, e = a[0], f = new Array(0 > d ? 0 : d); d > c;)
            f[c] = [
              b = e,
              e = a[++c]
            ];
          return f;
        }, Sg.zip = function () {
          if (!(e = arguments.length))
            return [];
          for (var a = -1, c = Sg.min(arguments, b), d = new Array(c); ++a < c;)
            for (var e, f = -1, g = d[a] = new Array(e); ++f < e;)
              g[f] = arguments[f][a];
          return d;
        }, Sg.transpose = function (a) {
          return Sg.zip.apply(Sg, a);
        }, Sg.keys = function (a) {
          var b = [];
          for (var c in a)
            b.push(c);
          return b;
        }, Sg.values = function (a) {
          var b = [];
          for (var c in a)
            b.push(a[c]);
          return b;
        }, Sg.entries = function (a) {
          var b = [];
          for (var c in a)
            b.push({
              key: c,
              value: a[c]
            });
          return b;
        }, Sg.merge = function (a) {
          for (var b, c, d, e = a.length, f = -1, g = 0; ++f < e;)
            g += a[f].length;
          for (c = new Array(g); --e >= 0;)
            for (d = a[e], b = d.length; --b >= 0;)
              c[--g] = d[b];
          return c;
        };
        var eh = Math.abs;
        Sg.range = function (a, b, d) {
          if (arguments.length < 3 && (d = 1, arguments.length < 2 && (b = a, a = 0)), 1 / 0 === (b - a) / d)
            throw new Error('infinite range');
          var e, f = [], g = c(eh(d)), h = -1;
          if (a *= g, b *= g, d *= g, 0 > d)
            for (; (e = a + d * ++h) > b;)
              f.push(e / g);
          else
            for (; (e = a + d * ++h) < b;)
              f.push(e / g);
          return f;
        }, Sg.map = function (a) {
          var b = new e();
          if (a instanceof e)
            a.forEach(function (a, c) {
              b.set(a, c);
            });
          else
            for (var c in a)
              b.set(c, a[c]);
          return b;
        }, d(e, {
          has: function (a) {
            return fh + a in this;
          },
          get: function (a) {
            return this[fh + a];
          },
          set: function (a, b) {
            return this[fh + a] = b;
          },
          remove: function (a) {
            return a = fh + a, a in this && delete this[a];
          },
          keys: function () {
            var a = [];
            return this.forEach(function (b) {
              a.push(b);
            }), a;
          },
          values: function () {
            var a = [];
            return this.forEach(function (b, c) {
              a.push(c);
            }), a;
          },
          entries: function () {
            var a = [];
            return this.forEach(function (b, c) {
              a.push({
                key: b,
                value: c
              });
            }), a;
          },
          forEach: function (a) {
            for (var b in this)
              b.charCodeAt(0) === gh && a.call(this, b.substring(1), this[b]);
          }
        });
        var fh = '\0', gh = fh.charCodeAt(0);
        Sg.nest = function () {
          function a(b, h, i) {
            if (i >= g.length)
              return d ? d.call(f, h) : c ? h.sort(c) : h;
            for (var j, k, l, m, n = -1, o = h.length, p = g[i++], q = new e(); ++n < o;)
              (m = q.get(j = p(k = h[n]))) ? m.push(k) : q.set(j, [k]);
            return b ? (k = b(), l = function (c, d) {
              k.set(c, a(b, d, i));
            }) : (k = {}, l = function (c, d) {
              k[c] = a(b, d, i);
            }), q.forEach(l), k;
          }
          function b(a, c) {
            if (c >= g.length)
              return a;
            var d = [], e = h[c++];
            return a.forEach(function (a, e) {
              d.push({
                key: a,
                values: b(e, c)
              });
            }), e ? d.sort(function (a, b) {
              return e(a.key, b.key);
            }) : d;
          }
          var c, d, f = {}, g = [], h = [];
          return f.map = function (b, c) {
            return a(c, b, 0);
          }, f.entries = function (c) {
            return b(a(Sg.map, c, 0), 0);
          }, f.key = function (a) {
            return g.push(a), f;
          }, f.sortKeys = function (a) {
            return h[g.length - 1] = a, f;
          }, f.sortValues = function (a) {
            return c = a, f;
          }, f.rollup = function (a) {
            return d = a, f;
          }, f;
        }, Sg.set = function (a) {
          var b = new f();
          if (a)
            for (var c = 0, d = a.length; d > c; ++c)
              b.add(a[c]);
          return b;
        }, d(f, {
          has: function (a) {
            return fh + a in this;
          },
          add: function (a) {
            return this[fh + a] = !0, a;
          },
          remove: function (a) {
            return a = fh + a, a in this && delete this[a];
          },
          values: function () {
            var a = [];
            return this.forEach(function (b) {
              a.push(b);
            }), a;
          },
          forEach: function (a) {
            for (var b in this)
              b.charCodeAt(0) === gh && a.call(this, b.substring(1));
          }
        }), Sg.behavior = {}, Sg.rebind = function (a, b) {
          for (var c, d = 1, e = arguments.length; ++d < e;)
            a[c = arguments[d]] = g(a, b, b[c]);
          return a;
        };
        var hh = [
            'webkit',
            'ms',
            'moz',
            'Moz',
            'o',
            'O'
          ];
        Sg.dispatch = function () {
          for (var a = new j(), b = -1, c = arguments.length; ++b < c;)
            a[arguments[b]] = k(a);
          return a;
        }, j.prototype.on = function (a, b) {
          var c = a.indexOf('.'), d = '';
          if (c >= 0 && (d = a.substring(c + 1), a = a.substring(0, c)), a)
            return arguments.length < 2 ? this[a].on(d) : this[a].on(d, b);
          if (2 === arguments.length) {
            if (null == b)
              for (a in this)
                this.hasOwnProperty(a) && this[a].on(d, null);
            return this;
          }
        }, Sg.event = null, Sg.requote = function (a) {
          return a.replace(ih, '\\$&');
        };
        var ih = /[\\\^\$\*\+\?\|\[\]\(\)\.\{\}]/g, jh = {}.__proto__ ? function (a, b) {
            a.__proto__ = b;
          } : function (a, b) {
            for (var c in b)
              a[c] = b[c];
          }, kh = function (a, b) {
            return b.querySelector(a);
          }, lh = function (a, b) {
            return b.querySelectorAll(a);
          }, mh = Wg[h(Wg, 'matchesSelector')], nh = function (a, b) {
            return mh.call(a, b);
          };
        'function' == typeof Sizzle && (kh = function (a, b) {
          return Sizzle(a, b)[0] || null;
        }, lh = function (a, b) {
          return Sizzle.uniqueSort(Sizzle(a, b));
        }, nh = Sizzle.matchesSelector), Sg.selection = function () {
          return rh;
        };
        var oh = Sg.selection.prototype = [];
        oh.select = function (a) {
          var b, c, d, e, f = [];
          a = p(a);
          for (var g = -1, h = this.length; ++g < h;) {
            f.push(b = []), b.parentNode = (d = this[g]).parentNode;
            for (var i = -1, j = d.length; ++i < j;)
              (e = d[i]) ? (b.push(c = a.call(e, e.__data__, i, g)), c && '__data__' in e && (c.__data__ = e.__data__)) : b.push(null);
          }
          return o(f);
        }, oh.selectAll = function (a) {
          var b, c, d = [];
          a = q(a);
          for (var e = -1, f = this.length; ++e < f;)
            for (var g = this[e], h = -1, i = g.length; ++h < i;)
              (c = g[h]) && (d.push(b = Ug(a.call(c, c.__data__, h, e))), b.parentNode = c);
          return o(d);
        };
        var ph = {
            svg: 'http://www.w3.org/2000/svg',
            xhtml: 'http://www.w3.org/1999/xhtml',
            xlink: 'http://www.w3.org/1999/xlink',
            xml: 'http://www.w3.org/XML/1998/namespace',
            xmlns: 'http://www.w3.org/2000/xmlns/'
          };
        Sg.ns = {
          prefix: ph,
          qualify: function (a) {
            var b = a.indexOf(':'), c = a;
            return b >= 0 && (c = a.substring(0, b), a = a.substring(b + 1)), ph.hasOwnProperty(c) ? {
              space: ph[c],
              local: a
            } : a;
          }
        }, oh.attr = function (a, b) {
          if (arguments.length < 2) {
            if ('string' == typeof a) {
              var c = this.node();
              return a = Sg.ns.qualify(a), a.local ? c.getAttributeNS(a.space, a.local) : c.getAttribute(a);
            }
            for (b in a)
              this.each(r(b, a[b]));
            return this;
          }
          return this.each(r(a, b));
        }, oh.classed = function (a, b) {
          if (arguments.length < 2) {
            if ('string' == typeof a) {
              var c = this.node(), d = (a = a.trim().split(/^|\s+/g)).length, e = -1;
              if (b = c.classList) {
                for (; ++e < d;)
                  if (!b.contains(a[e]))
                    return !1;
              } else
                for (b = c.getAttribute('class'); ++e < d;)
                  if (!t(a[e]).test(b))
                    return !1;
              return !0;
            }
            for (b in a)
              this.each(u(b, a[b]));
            return this;
          }
          return this.each(u(a, b));
        }, oh.style = function (a, b, c) {
          var d = arguments.length;
          if (3 > d) {
            if ('string' != typeof a) {
              2 > d && (b = '');
              for (c in a)
                this.each(w(c, a[c], b));
              return this;
            }
            if (2 > d)
              return Xg.getComputedStyle(this.node(), null).getPropertyValue(a);
            c = '';
          }
          return this.each(w(a, b, c));
        }, oh.property = function (a, b) {
          if (arguments.length < 2) {
            if ('string' == typeof a)
              return this.node()[a];
            for (b in a)
              this.each(x(b, a[b]));
            return this;
          }
          return this.each(x(a, b));
        }, oh.text = function (a) {
          return arguments.length ? this.each('function' == typeof a ? function () {
            var b = a.apply(this, arguments);
            this.textContent = null == b ? '' : b;
          } : null == a ? function () {
            this.textContent = '';
          } : function () {
            this.textContent = a;
          }) : this.node().textContent;
        }, oh.html = function (a) {
          return arguments.length ? this.each('function' == typeof a ? function () {
            var b = a.apply(this, arguments);
            this.innerHTML = null == b ? '' : b;
          } : null == a ? function () {
            this.innerHTML = '';
          } : function () {
            this.innerHTML = a;
          }) : this.node().innerHTML;
        }, oh.append = function (a) {
          return a = y(a), this.select(function () {
            return this.appendChild(a.apply(this, arguments));
          });
        }, oh.insert = function (a, b) {
          return a = y(a), b = p(b), this.select(function () {
            return this.insertBefore(a.apply(this, arguments), b.apply(this, arguments) || null);
          });
        }, oh.remove = function () {
          return this.each(function () {
            var a = this.parentNode;
            a && a.removeChild(this);
          });
        }, oh.data = function (a, b) {
          function c(a, c) {
            var d, f, g, h = a.length, l = c.length, m = Math.min(h, l), n = new Array(l), o = new Array(l), p = new Array(h);
            if (b) {
              var q, r = new e(), s = new e(), t = [];
              for (d = -1; ++d < h;)
                q = b.call(f = a[d], f.__data__, d), r.has(q) ? p[d] = f : r.set(q, f), t.push(q);
              for (d = -1; ++d < l;)
                q = b.call(c, g = c[d], d), (f = r.get(q)) ? (n[d] = f, f.__data__ = g) : s.has(q) || (o[d] = z(g)), s.set(q, g), r.remove(q);
              for (d = -1; ++d < h;)
                r.has(t[d]) && (p[d] = a[d]);
            } else {
              for (d = -1; ++d < m;)
                f = a[d], g = c[d], f ? (f.__data__ = g, n[d] = f) : o[d] = z(g);
              for (; l > d; ++d)
                o[d] = z(c[d]);
              for (; h > d; ++d)
                p[d] = a[d];
            }
            o.update = n, o.parentNode = n.parentNode = p.parentNode = a.parentNode, i.push(o), j.push(n), k.push(p);
          }
          var d, f, g = -1, h = this.length;
          if (!arguments.length) {
            for (a = new Array(h = (d = this[0]).length); ++g < h;)
              (f = d[g]) && (a[g] = f.__data__);
            return a;
          }
          var i = D([]), j = o([]), k = o([]);
          if ('function' == typeof a)
            for (; ++g < h;)
              c(d = this[g], a.call(d, d.parentNode.__data__, g));
          else
            for (; ++g < h;)
              c(d = this[g], a);
          return j.enter = function () {
            return i;
          }, j.exit = function () {
            return k;
          }, j;
        }, oh.datum = function (a) {
          return arguments.length ? this.property('__data__', a) : this.property('__data__');
        }, oh.filter = function (a) {
          var b, c, d, e = [];
          'function' != typeof a && (a = A(a));
          for (var f = 0, g = this.length; g > f; f++) {
            e.push(b = []), b.parentNode = (c = this[f]).parentNode;
            for (var h = 0, i = c.length; i > h; h++)
              (d = c[h]) && a.call(d, d.__data__, h) && b.push(d);
          }
          return o(e);
        }, oh.order = function () {
          for (var a = -1, b = this.length; ++a < b;)
            for (var c, d = this[a], e = d.length - 1, f = d[e]; --e >= 0;)
              (c = d[e]) && (f && f !== c.nextSibling && f.parentNode.insertBefore(c, f), f = c);
          return this;
        }, oh.sort = function (a) {
          a = B.apply(this, arguments);
          for (var b = -1, c = this.length; ++b < c;)
            this[b].sort(a);
          return this.order();
        }, oh.each = function (a) {
          return C(this, function (b, c, d) {
            a.call(b, b.__data__, c, d);
          });
        }, oh.call = function (a) {
          var b = Ug(arguments);
          return a.apply(b[0] = this, b), this;
        }, oh.empty = function () {
          return !this.node();
        }, oh.node = function () {
          for (var a = 0, b = this.length; b > a; a++)
            for (var c = this[a], d = 0, e = c.length; e > d; d++) {
              var f = c[d];
              if (f)
                return f;
            }
          return null;
        }, oh.size = function () {
          var a = 0;
          return this.each(function () {
            ++a;
          }), a;
        };
        var qh = [];
        Sg.selection.enter = D, Sg.selection.enter.prototype = qh, qh.append = oh.append, qh.empty = oh.empty, qh.node = oh.node, qh.call = oh.call, qh.size = oh.size, qh.select = function (a) {
          for (var b, c, d, e, f, g = [], h = -1, i = this.length; ++h < i;) {
            d = (e = this[h]).update, g.push(b = []), b.parentNode = e.parentNode;
            for (var j = -1, k = e.length; ++j < k;)
              (f = e[j]) ? (b.push(d[j] = c = a.call(e.parentNode, f.__data__, j, h)), c.__data__ = f.__data__) : b.push(null);
          }
          return o(g);
        }, qh.insert = function (a, b) {
          return arguments.length < 2 && (b = E(this)), oh.insert.call(this, a, b);
        }, oh.transition = function () {
          for (var a, b, c = uj || ++zj, d = [], e = vj || {
                time: Date.now(),
                ease: Md,
                delay: 0,
                duration: 250
              }, f = -1, g = this.length; ++f < g;) {
            d.push(a = []);
            for (var h = this[f], i = -1, j = h.length; ++i < j;)
              (b = h[i]) && cg(b, i, c, e), a.push(b);
          }
          return _f(d, c);
        }, oh.interrupt = function () {
          return this.each(F);
        }, Sg.select = function (a) {
          var b = ['string' == typeof a ? kh(a, Vg) : a];
          return b.parentNode = Wg, o([b]);
        }, Sg.selectAll = function (a) {
          var b = Ug('string' == typeof a ? lh(a, Vg) : a);
          return b.parentNode = Wg, o([b]);
        };
        var rh = Sg.select(Wg);
        oh.on = function (a, b, c) {
          var d = arguments.length;
          if (3 > d) {
            if ('string' != typeof a) {
              2 > d && (b = !1);
              for (c in a)
                this.each(G(c, a[c], b));
              return this;
            }
            if (2 > d)
              return (d = this.node()['__on' + a]) && d._;
            c = !1;
          }
          return this.each(G(a, b, c));
        };
        var sh = Sg.map({
            mouseenter: 'mouseover',
            mouseleave: 'mouseout'
          });
        sh.forEach(function (a) {
          'on' + a in Vg && sh.remove(a);
        });
        var th = h(Wg.style, 'userSelect'), uh = 0;
        Sg.mouse = function (a) {
          return K(a, m());
        };
        var vh = /WebKit/.test(Xg.navigator.userAgent) ? -1 : 0;
        Sg.touches = function (a, b) {
          return arguments.length < 2 && (b = m().touches), b ? Ug(b).map(function (b) {
            var c = K(a, b);
            return c.identifier = b.identifier, c;
          }) : [];
        }, Sg.behavior.drag = function () {
          function a() {
            this.on('mousedown.drag', g).on('touchstart.drag', h);
          }
          function b() {
            return Sg.event.changedTouches[0].identifier;
          }
          function c(a, b) {
            return Sg.touches(a).filter(function (a) {
              return a.identifier === b;
            })[0];
          }
          function d(a, b, c, d) {
            return function () {
              function g() {
                var a = b(k, n), c = a[0] - p[0], d = a[1] - p[1];
                q |= c | d, p = a, l({
                  type: 'drag',
                  x: a[0] + i[0],
                  y: a[1] + i[1],
                  dx: c,
                  dy: d
                });
              }
              function h() {
                r.on(c + '.' + o, null).on(d + '.' + o, null), s(q && Sg.event.target === m), l({ type: 'dragend' });
              }
              var i, j = this, k = j.parentNode, l = e.of(j, arguments), m = Sg.event.target, n = a(), o = null == n ? 'drag' : 'drag-' + n, p = b(k, n), q = 0, r = Sg.select(Xg).on(c + '.' + o, g).on(d + '.' + o, h), s = J();
              f ? (i = f.apply(j, arguments), i = [
                i.x - p[0],
                i.y - p[1]
              ]) : i = [
                0,
                0
              ], l({ type: 'dragstart' });
            };
          }
          var e = n(a, 'drag', 'dragstart', 'dragend'), f = null, g = d(i, Sg.mouse, 'mousemove', 'mouseup'), h = d(b, c, 'touchmove', 'touchend');
          return a.origin = function (b) {
            return arguments.length ? (f = b, a) : f;
          }, Sg.rebind(a, e, 'on');
        };
        var wh = Math.PI, xh = 2 * wh, yh = wh / 2, zh = 0.000001, Ah = zh * zh, Bh = wh / 180, Ch = 180 / wh, Dh = Math.SQRT2, Eh = 2, Fh = 4;
        Sg.interpolateZoom = function (a, b) {
          function c(a) {
            var b = a * s;
            if (r) {
              var c = P(p), g = f / (Eh * m) * (c * Q(Dh * b + p) - O(p));
              return [
                d + g * j,
                e + g * k,
                f * c / P(Dh * b + p)
              ];
            }
            return [
              d + a * j,
              e + a * k,
              f * Math.exp(Dh * b)
            ];
          }
          var d = a[0], e = a[1], f = a[2], g = b[0], h = b[1], i = b[2], j = g - d, k = h - e, l = j * j + k * k, m = Math.sqrt(l), n = (i * i - f * f + Fh * l) / (2 * f * Eh * m), o = (i * i - f * f - Fh * l) / (2 * i * Eh * m), p = Math.log(Math.sqrt(n * n + 1) - n), q = Math.log(Math.sqrt(o * o + 1) - o), r = q - p, s = (r || Math.log(i / f)) / Dh;
          return c.duration = 1000 * s, c;
        }, Sg.behavior.zoom = function () {
          function a(a) {
            a.on(B, j).on(Ih + '.zoom', m).on(C, o).on('dblclick.zoom', p).on(E, k);
          }
          function b(a) {
            return [
              (a[0] - y.x) / y.k,
              (a[1] - y.y) / y.k
            ];
          }
          function c(a) {
            return [
              a[0] * y.k + y.x,
              a[1] * y.k + y.y
            ];
          }
          function d(a) {
            y.k = Math.max(A[0], Math.min(A[1], a));
          }
          function e(a, b) {
            b = c(b), y.x += a[0] - b[0], y.y += a[1] - b[1];
          }
          function f() {
            v && v.domain(u.range().map(function (a) {
              return (a - y.x) / y.k;
            }).map(u.invert)), x && x.domain(w.range().map(function (a) {
              return (a - y.y) / y.k;
            }).map(w.invert));
          }
          function g(a) {
            a({ type: 'zoomstart' });
          }
          function h(a) {
            f(), a({
              type: 'zoom',
              scale: y.k,
              translate: [
                y.x,
                y.y
              ]
            });
          }
          function i(a) {
            a({ type: 'zoomend' });
          }
          function j() {
            function a() {
              k = 1, e(Sg.mouse(d), m), h(f);
            }
            function c() {
              l.on(C, Xg === d ? o : null).on(D, null), n(k && Sg.event.target === j), i(f);
            }
            var d = this, f = G.of(d, arguments), j = Sg.event.target, k = 0, l = Sg.select(Xg).on(C, a).on(D, c), m = b(Sg.mouse(d)), n = J();
            F.call(d), g(f);
          }
          function k() {
            function a() {
              var a = Sg.touches(o);
              return n = y.k, a.forEach(function (a) {
                a.identifier in q && (q[a.identifier] = b(a));
              }), a;
            }
            function c() {
              for (var b = Sg.event.changedTouches, c = 0, f = b.length; f > c; ++c)
                q[b[c].identifier] = null;
              var g = a(), i = Date.now();
              if (1 === g.length) {
                if (500 > i - t) {
                  var j = g[0], k = q[j.identifier];
                  d(2 * y.k), e(j, k), l(), h(p);
                }
                t = i;
              } else if (g.length > 1) {
                var j = g[0], m = g[1], n = j[0] - m[0], o = j[1] - m[1];
                r = n * n + o * o;
              }
            }
            function f() {
              for (var a, b, c, f, g = Sg.touches(o), i = 0, j = g.length; j > i; ++i, f = null)
                if (c = g[i], f = q[c.identifier]) {
                  if (b)
                    break;
                  a = c, b = f;
                }
              if (f) {
                var k = (k = c[0] - a[0]) * k + (k = c[1] - a[1]) * k, l = r && Math.sqrt(k / r);
                a = [
                  (a[0] + c[0]) / 2,
                  (a[1] + c[1]) / 2
                ], b = [
                  (b[0] + f[0]) / 2,
                  (b[1] + f[1]) / 2
                ], d(l * n);
              }
              t = null, e(a, b), h(p);
            }
            function m() {
              if (Sg.event.touches.length) {
                for (var b = Sg.event.changedTouches, c = 0, d = b.length; d > c; ++c)
                  delete q[b[c].identifier];
                for (var e in q)
                  return void a();
              }
              w.on(u, null).on(v, null), x.on(B, j).on(E, k), z(), i(p);
            }
            var n, o = this, p = G.of(o, arguments), q = {}, r = 0, s = Sg.event.changedTouches[0].identifier, u = 'touchmove.zoom-' + s, v = 'touchend.zoom-' + s, w = Sg.select(Xg).on(u, f).on(v, m), x = Sg.select(o).on(B, null).on(E, c), z = J();
            F.call(o), c(), g(p);
          }
          function m() {
            var a = G.of(this, arguments);
            s ? clearTimeout(s) : (F.call(this), g(a)), s = setTimeout(function () {
              s = null, i(a);
            }, 50), l();
            var c = r || Sg.mouse(this);
            q || (q = b(c)), d(Math.pow(2, 0.002 * Gh()) * y.k), e(c, q), h(a);
          }
          function o() {
            q = null;
          }
          function p() {
            var a = G.of(this, arguments), c = Sg.mouse(this), f = b(c), j = Math.log(y.k) / Math.LN2;
            g(a), d(Math.pow(2, Sg.event.shiftKey ? Math.ceil(j) - 1 : Math.floor(j) + 1)), e(c, f), h(a), i(a);
          }
          var q, r, s, t, u, v, w, x, y = {
              x: 0,
              y: 0,
              k: 1
            }, z = [
              960,
              500
            ], A = Hh, B = 'mousedown.zoom', C = 'mousemove.zoom', D = 'mouseup.zoom', E = 'touchstart.zoom', G = n(a, 'zoomstart', 'zoom', 'zoomend');
          return a.event = function (a) {
            a.each(function () {
              var a = G.of(this, arguments), b = y;
              uj ? Sg.select(this).transition().each('start.zoom', function () {
                y = this.__chart__ || {
                  x: 0,
                  y: 0,
                  k: 1
                }, g(a);
              }).tween('zoom:zoom', function () {
                var c = z[0], d = z[1], e = c / 2, f = d / 2, g = Sg.interpolateZoom([
                    (e - y.x) / y.k,
                    (f - y.y) / y.k,
                    c / y.k
                  ], [
                    (e - b.x) / b.k,
                    (f - b.y) / b.k,
                    c / b.k
                  ]);
                return function (b) {
                  var d = g(b), i = c / d[2];
                  this.__chart__ = y = {
                    x: e - d[0] * i,
                    y: f - d[1] * i,
                    k: i
                  }, h(a);
                };
              }).each('end.zoom', function () {
                i(a);
              }) : (this.__chart__ = y, g(a), h(a), i(a));
            });
          }, a.translate = function (b) {
            return arguments.length ? (y = {
              x: +b[0],
              y: +b[1],
              k: y.k
            }, f(), a) : [
              y.x,
              y.y
            ];
          }, a.scale = function (b) {
            return arguments.length ? (y = {
              x: y.x,
              y: y.y,
              k: +b
            }, f(), a) : y.k;
          }, a.scaleExtent = function (b) {
            return arguments.length ? (A = null == b ? Hh : [
              +b[0],
              +b[1]
            ], a) : A;
          }, a.center = function (b) {
            return arguments.length ? (r = b && [
              +b[0],
              +b[1]
            ], a) : r;
          }, a.size = function (b) {
            return arguments.length ? (z = b && [
              +b[0],
              +b[1]
            ], a) : z;
          }, a.x = function (b) {
            return arguments.length ? (v = b, u = b.copy(), y = {
              x: 0,
              y: 0,
              k: 1
            }, a) : v;
          }, a.y = function (b) {
            return arguments.length ? (x = b, w = b.copy(), y = {
              x: 0,
              y: 0,
              k: 1
            }, a) : x;
          }, Sg.rebind(a, G, 'on');
        };
        var Gh, Hh = [
            0,
            1 / 0
          ], Ih = 'onwheel' in Vg ? (Gh = function () {
            return -Sg.event.deltaY * (Sg.event.deltaMode ? 120 : 1);
          }, 'wheel') : 'onmousewheel' in Vg ? (Gh = function () {
            return Sg.event.wheelDelta;
          }, 'mousewheel') : (Gh = function () {
            return -Sg.event.detail;
          }, 'MozMousePixelScroll');
        S.prototype.toString = function () {
          return this.rgb() + '';
        }, Sg.hsl = function (a, b, c) {
          return 1 === arguments.length ? a instanceof U ? T(a.h, a.s, a.l) : jb('' + a, kb, T) : T(+a, +b, +c);
        };
        var Jh = U.prototype = new S();
        Jh.brighter = function (a) {
          return a = Math.pow(0.7, arguments.length ? a : 1), T(this.h, this.s, this.l / a);
        }, Jh.darker = function (a) {
          return a = Math.pow(0.7, arguments.length ? a : 1), T(this.h, this.s, a * this.l);
        }, Jh.rgb = function () {
          return V(this.h, this.s, this.l);
        }, Sg.hcl = function (a, b, c) {
          return 1 === arguments.length ? a instanceof X ? W(a.h, a.c, a.l) : a instanceof $ ? ab(a.l, a.a, a.b) : ab((a = lb((a = Sg.rgb(a)).r, a.g, a.b)).l, a.a, a.b) : W(+a, +b, +c);
        };
        var Kh = X.prototype = new S();
        Kh.brighter = function (a) {
          return W(this.h, this.c, Math.min(100, this.l + Lh * (arguments.length ? a : 1)));
        }, Kh.darker = function (a) {
          return W(this.h, this.c, Math.max(0, this.l - Lh * (arguments.length ? a : 1)));
        }, Kh.rgb = function () {
          return Y(this.h, this.c, this.l).rgb();
        }, Sg.lab = function (a, b, c) {
          return 1 === arguments.length ? a instanceof $ ? Z(a.l, a.a, a.b) : a instanceof X ? Y(a.l, a.c, a.h) : lb((a = Sg.rgb(a)).r, a.g, a.b) : Z(+a, +b, +c);
        };
        var Lh = 18, Mh = 0.95047, Nh = 1, Oh = 1.08883, Ph = $.prototype = new S();
        Ph.brighter = function (a) {
          return Z(Math.min(100, this.l + Lh * (arguments.length ? a : 1)), this.a, this.b);
        }, Ph.darker = function (a) {
          return Z(Math.max(0, this.l - Lh * (arguments.length ? a : 1)), this.a, this.b);
        }, Ph.rgb = function () {
          return _(this.l, this.a, this.b);
        }, Sg.rgb = function (a, b, c) {
          return 1 === arguments.length ? a instanceof hb ? gb(a.r, a.g, a.b) : jb('' + a, gb, V) : gb(~~a, ~~b, ~~c);
        };
        var Qh = hb.prototype = new S();
        Qh.brighter = function (a) {
          a = Math.pow(0.7, arguments.length ? a : 1);
          var b = this.r, c = this.g, d = this.b, e = 30;
          return b || c || d ? (b && e > b && (b = e), c && e > c && (c = e), d && e > d && (d = e), gb(Math.min(255, ~~(b / a)), Math.min(255, ~~(c / a)), Math.min(255, ~~(d / a)))) : gb(e, e, e);
        }, Qh.darker = function (a) {
          return a = Math.pow(0.7, arguments.length ? a : 1), gb(~~(a * this.r), ~~(a * this.g), ~~(a * this.b));
        }, Qh.hsl = function () {
          return kb(this.r, this.g, this.b);
        }, Qh.toString = function () {
          return '#' + ib(this.r) + ib(this.g) + ib(this.b);
        };
        var Rh = Sg.map({
            aliceblue: 15792383,
            antiquewhite: 16444375,
            aqua: 65535,
            aquamarine: 8388564,
            azure: 15794175,
            beige: 16119260,
            bisque: 16770244,
            black: 0,
            blanchedalmond: 16772045,
            blue: 255,
            blueviolet: 9055202,
            brown: 10824234,
            burlywood: 14596231,
            cadetblue: 6266528,
            chartreuse: 8388352,
            chocolate: 13789470,
            coral: 16744272,
            cornflowerblue: 6591981,
            cornsilk: 16775388,
            crimson: 14423100,
            cyan: 65535,
            darkblue: 139,
            darkcyan: 35723,
            darkgoldenrod: 12092939,
            darkgray: 11119017,
            darkgreen: 25600,
            darkgrey: 11119017,
            darkkhaki: 12433259,
            darkmagenta: 9109643,
            darkolivegreen: 5597999,
            darkorange: 16747520,
            darkorchid: 10040012,
            darkred: 9109504,
            darksalmon: 15308410,
            darkseagreen: 9419919,
            darkslateblue: 4734347,
            darkslategray: 3100495,
            darkslategrey: 3100495,
            darkturquoise: 52945,
            darkviolet: 9699539,
            deeppink: 16716947,
            deepskyblue: 49151,
            dimgray: 6908265,
            dimgrey: 6908265,
            dodgerblue: 2003199,
            firebrick: 11674146,
            floralwhite: 16775920,
            forestgreen: 2263842,
            fuchsia: 16711935,
            gainsboro: 14474460,
            ghostwhite: 16316671,
            gold: 16766720,
            goldenrod: 14329120,
            gray: 8421504,
            green: 32768,
            greenyellow: 11403055,
            grey: 8421504,
            honeydew: 15794160,
            hotpink: 16738740,
            indianred: 13458524,
            indigo: 4915330,
            ivory: 16777200,
            khaki: 15787660,
            lavender: 15132410,
            lavenderblush: 16773365,
            lawngreen: 8190976,
            lemonchiffon: 16775885,
            lightblue: 11393254,
            lightcoral: 15761536,
            lightcyan: 14745599,
            lightgoldenrodyellow: 16448210,
            lightgray: 13882323,
            lightgreen: 9498256,
            lightgrey: 13882323,
            lightpink: 16758465,
            lightsalmon: 16752762,
            lightseagreen: 2142890,
            lightskyblue: 8900346,
            lightslategray: 7833753,
            lightslategrey: 7833753,
            lightsteelblue: 11584734,
            lightyellow: 16777184,
            lime: 65280,
            limegreen: 3329330,
            linen: 16445670,
            magenta: 16711935,
            maroon: 8388608,
            mediumaquamarine: 6737322,
            mediumblue: 205,
            mediumorchid: 12211667,
            mediumpurple: 9662683,
            mediumseagreen: 3978097,
            mediumslateblue: 8087790,
            mediumspringgreen: 64154,
            mediumturquoise: 4772300,
            mediumvioletred: 13047173,
            midnightblue: 1644912,
            mintcream: 16121850,
            mistyrose: 16770273,
            moccasin: 16770229,
            navajowhite: 16768685,
            navy: 128,
            oldlace: 16643558,
            olive: 8421376,
            olivedrab: 7048739,
            orange: 16753920,
            orangered: 16729344,
            orchid: 14315734,
            palegoldenrod: 15657130,
            palegreen: 10025880,
            paleturquoise: 11529966,
            palevioletred: 14381203,
            papayawhip: 16773077,
            peachpuff: 16767673,
            peru: 13468991,
            pink: 16761035,
            plum: 14524637,
            powderblue: 11591910,
            purple: 8388736,
            red: 16711680,
            rosybrown: 12357519,
            royalblue: 4286945,
            saddlebrown: 9127187,
            salmon: 16416882,
            sandybrown: 16032864,
            seagreen: 3050327,
            seashell: 16774638,
            sienna: 10506797,
            silver: 12632256,
            skyblue: 8900331,
            slateblue: 6970061,
            slategray: 7372944,
            slategrey: 7372944,
            snow: 16775930,
            springgreen: 65407,
            steelblue: 4620980,
            tan: 13808780,
            teal: 32896,
            thistle: 14204888,
            tomato: 16737095,
            turquoise: 4251856,
            violet: 15631086,
            wheat: 16113331,
            white: 16777215,
            whitesmoke: 16119285,
            yellow: 16776960,
            yellowgreen: 10145074
          });
        Rh.forEach(function (a, b) {
          Rh.set(a, eb(b));
        }), Sg.functor = ob, Sg.xhr = qb(pb), Sg.dsv = function (a, b) {
          function c(a, c, f) {
            arguments.length < 3 && (f = c, c = null);
            var g = Sg.xhr(a, b, f);
            return g.row = function (a) {
              return arguments.length ? g.response(null == (c = a) ? d : e(a)) : c;
            }, g.row(c);
          }
          function d(a) {
            return c.parse(a.responseText);
          }
          function e(a) {
            return function (b) {
              return c.parse(b.responseText, a);
            };
          }
          function g(b) {
            return b.map(h).join(a);
          }
          function h(a) {
            return i.test(a) ? '"' + a.replace(/\"/g, '""') + '"' : a;
          }
          var i = new RegExp('["' + a + '\n]'), j = a.charCodeAt(0);
          return c.parse = function (a, b) {
            var d;
            return c.parseRows(a, function (a, c) {
              if (d)
                return d(a, c - 1);
              var e = new Function('d', 'return {' + a.map(function (a, b) {
                  return JSON.stringify(a) + ': d[' + b + ']';
                }).join(',') + '}');
              d = b ? function (a, c) {
                return b(e(a), c);
              } : e;
            });
          }, c.parseRows = function (a, b) {
            function c() {
              if (k >= i)
                return g;
              if (e)
                return e = !1, f;
              var b = k;
              if (34 === a.charCodeAt(b)) {
                for (var c = b; c++ < i;)
                  if (34 === a.charCodeAt(c)) {
                    if (34 !== a.charCodeAt(c + 1))
                      break;
                    ++c;
                  }
                k = c + 2;
                var d = a.charCodeAt(c + 1);
                return 13 === d ? (e = !0, 10 === a.charCodeAt(c + 2) && ++k) : 10 === d && (e = !0), a.substring(b + 1, c).replace(/""/g, '"');
              }
              for (; i > k;) {
                var d = a.charCodeAt(k++), h = 1;
                if (10 === d)
                  e = !0;
                else if (13 === d)
                  e = !0, 10 === a.charCodeAt(k) && (++k, ++h);
                else if (d !== j)
                  continue;
                return a.substring(b, k - h);
              }
              return a.substring(b);
            }
            for (var d, e, f = {}, g = {}, h = [], i = a.length, k = 0, l = 0; (d = c()) !== g;) {
              for (var m = []; d !== f && d !== g;)
                m.push(d), d = c();
              (!b || (m = b(m, l++))) && h.push(m);
            }
            return h;
          }, c.format = function (b) {
            if (Array.isArray(b[0]))
              return c.formatRows(b);
            var d = new f(), e = [];
            return b.forEach(function (a) {
              for (var b in a)
                d.has(b) || e.push(d.add(b));
            }), [e.map(h).join(a)].concat(b.map(function (b) {
              return e.map(function (a) {
                return h(b[a]);
              }).join(a);
            })).join('\n');
          }, c.formatRows = function (a) {
            return a.map(g).join('\n');
          }, c;
        }, Sg.csv = Sg.dsv(',', 'text/csv'), Sg.tsv = Sg.dsv(' ', 'text/tab-separated-values');
        var Sh, Th, Uh, Vh, Wh, Xh = Xg[h(Xg, 'requestAnimationFrame')] || function (a) {
            setTimeout(a, 17);
          };
        Sg.timer = function (a, b, c) {
          var d = arguments.length;
          2 > d && (b = 0), 3 > d && (c = Date.now());
          var e = c + b, f = {
              c: a,
              t: e,
              f: !1,
              n: null
            };
          Th ? Th.n = f : Sh = f, Th = f, Uh || (Vh = clearTimeout(Vh), Uh = 1, Xh(tb));
        }, Sg.timer.flush = function () {
          ub(), vb();
        };
        var Yh = '.', Zh = ',', $h = [
            3,
            3
          ], _h = '$', ai = [
            'y',
            'z',
            'a',
            'f',
            'p',
            'n',
            '\xb5',
            'm',
            '',
            'k',
            'M',
            'G',
            'T',
            'P',
            'E',
            'Z',
            'Y'
          ].map(wb);
        Sg.formatPrefix = function (a, b) {
          var c = 0;
          return a && (0 > a && (a *= -1), b && (a = Sg.round(a, xb(a, b))), c = 1 + Math.floor(1e-12 + Math.log(a) / Math.LN10), c = Math.max(-24, Math.min(24, 3 * Math.floor((0 >= c ? c + 1 : c - 1) / 3)))), ai[8 + c / 3];
        }, Sg.round = function (a, b) {
          return b ? Math.round(a * (b = Math.pow(10, b))) / b : Math.round(a);
        }, Sg.format = function (a) {
          var b = bi.exec(a), c = b[1] || ' ', d = b[2] || '>', e = b[3] || '', f = b[4] || '', g = b[5], h = +b[6], i = b[7], j = b[8], k = b[9], l = 1, m = '', n = !1;
          switch (j && (j = +j.substring(1)), (g || '0' === c && '=' === d) && (g = c = '0', d = '=', i && (h -= Math.floor((h - 1) / 4))), k) {
          case 'n':
            i = !0, k = 'g';
            break;
          case '%':
            l = 100, m = '%', k = 'f';
            break;
          case 'p':
            l = 100, m = '%', k = 'r';
            break;
          case 'b':
          case 'o':
          case 'x':
          case 'X':
            '#' === f && (f = '0' + k.toLowerCase());
          case 'c':
          case 'd':
            n = !0, j = 0;
            break;
          case 's':
            l = -1, k = 'r';
          }
          '#' === f ? f = '' : '$' === f && (f = _h), 'r' != k || j || (k = 'g'), null != j && ('g' == k ? j = Math.max(1, Math.min(21, j)) : ('e' == k || 'f' == k) && (j = Math.max(0, Math.min(20, j)))), k = ci.get(k) || yb;
          var o = g && i;
          return function (a) {
            if (n && a % 1)
              return '';
            var b = 0 > a || 0 === a && 0 > 1 / a ? (a = -a, '-') : e;
            if (0 > l) {
              var p = Sg.formatPrefix(a, j);
              a = p.scale(a), m = p.symbol;
            } else
              a *= l;
            a = k(a, j);
            var q = a.lastIndexOf('.'), r = 0 > q ? a : a.substring(0, q), s = 0 > q ? '' : Yh + a.substring(q + 1);
            !g && i && (r = di(r));
            var t = f.length + r.length + s.length + (o ? 0 : b.length), u = h > t ? new Array(t = h - t + 1).join(c) : '';
            return o && (r = di(u + r)), b += f, a = r + s, ('<' === d ? b + a + u : '>' === d ? u + b + a : '^' === d ? u.substring(0, t >>= 1) + b + a + u.substring(t) : b + (o ? a : u + a)) + m;
          };
        };
        var bi = /(?:([^{])?([<>=^]))?([+\- ])?([$#])?(0)?(\d+)?(,)?(\.-?\d+)?([a-z%])?/i, ci = Sg.map({
            b: function (a) {
              return a.toString(2);
            },
            c: function (a) {
              return String.fromCharCode(a);
            },
            o: function (a) {
              return a.toString(8);
            },
            x: function (a) {
              return a.toString(16);
            },
            X: function (a) {
              return a.toString(16).toUpperCase();
            },
            g: function (a, b) {
              return a.toPrecision(b);
            },
            e: function (a, b) {
              return a.toExponential(b);
            },
            f: function (a, b) {
              return a.toFixed(b);
            },
            r: function (a, b) {
              return (a = Sg.round(a, xb(a, b))).toFixed(Math.max(0, Math.min(20, xb(a * (1 + 1e-15), b))));
            }
          }), di = pb;
        if ($h) {
          var ei = $h.length;
          di = function (a) {
            for (var b = a.length, c = [], d = 0, e = $h[0]; b > 0 && e > 0;)
              c.push(a.substring(b -= e, b + e)), e = $h[d = (d + 1) % ei];
            return c.reverse().join(Zh);
          };
        }
        Sg.geo = {}, zb.prototype = {
          s: 0,
          t: 0,
          add: function (a) {
            Ab(a, this.t, fi), Ab(fi.s, this.s, this), this.s ? this.t += fi.t : this.s = fi.t;
          },
          reset: function () {
            this.s = this.t = 0;
          },
          valueOf: function () {
            return this.s;
          }
        };
        var fi = new zb();
        Sg.geo.stream = function (a, b) {
          a && gi.hasOwnProperty(a.type) ? gi[a.type](a, b) : Bb(a, b);
        };
        var gi = {
            Feature: function (a, b) {
              Bb(a.geometry, b);
            },
            FeatureCollection: function (a, b) {
              for (var c = a.features, d = -1, e = c.length; ++d < e;)
                Bb(c[d].geometry, b);
            }
          }, hi = {
            Sphere: function (a, b) {
              b.sphere();
            },
            Point: function (a, b) {
              a = a.coordinates, b.point(a[0], a[1], a[2]);
            },
            MultiPoint: function (a, b) {
              for (var c = a.coordinates, d = -1, e = c.length; ++d < e;)
                a = c[d], b.point(a[0], a[1], a[2]);
            },
            LineString: function (a, b) {
              Cb(a.coordinates, b, 0);
            },
            MultiLineString: function (a, b) {
              for (var c = a.coordinates, d = -1, e = c.length; ++d < e;)
                Cb(c[d], b, 0);
            },
            Polygon: function (a, b) {
              Db(a.coordinates, b);
            },
            MultiPolygon: function (a, b) {
              for (var c = a.coordinates, d = -1, e = c.length; ++d < e;)
                Db(c[d], b);
            },
            GeometryCollection: function (a, b) {
              for (var c = a.geometries, d = -1, e = c.length; ++d < e;)
                Bb(c[d], b);
            }
          };
        Sg.geo.area = function (a) {
          return ii = 0, Sg.geo.stream(a, ki), ii;
        };
        var ii, ji = new zb(), ki = {
            sphere: function () {
              ii += 4 * wh;
            },
            point: i,
            lineStart: i,
            lineEnd: i,
            polygonStart: function () {
              ji.reset(), ki.lineStart = Eb;
            },
            polygonEnd: function () {
              var a = 2 * ji;
              ii += 0 > a ? 4 * wh + a : a, ki.lineStart = ki.lineEnd = ki.point = i;
            }
          };
        Sg.geo.bounds = function () {
          function a(a, b) {
            t.push(u = [
              k = a,
              m = a
            ]), l > b && (l = b), b > n && (n = b);
          }
          function b(b, c) {
            var d = Fb([
                b * Bh,
                c * Bh
              ]);
            if (r) {
              var e = Hb(r, d), f = [
                  e[1],
                  -e[0],
                  0
                ], g = Hb(f, e);
              Kb(g), g = Lb(g);
              var i = b - o, j = i > 0 ? 1 : -1, p = g[0] * Ch * j, q = eh(i) > 180;
              if (q ^ (p > j * o && j * b > p)) {
                var s = g[1] * Ch;
                s > n && (n = s);
              } else if (p = (p + 360) % 360 - 180, q ^ (p > j * o && j * b > p)) {
                var s = -g[1] * Ch;
                l > s && (l = s);
              } else
                l > c && (l = c), c > n && (n = c);
              q ? o > b ? h(k, b) > h(k, m) && (m = b) : h(b, m) > h(k, m) && (k = b) : m >= k ? (k > b && (k = b), b > m && (m = b)) : b > o ? h(k, b) > h(k, m) && (m = b) : h(b, m) > h(k, m) && (k = b);
            } else
              a(b, c);
            r = d, o = b;
          }
          function c() {
            v.point = b;
          }
          function d() {
            u[0] = k, u[1] = m, v.point = a, r = null;
          }
          function e(a, c) {
            if (r) {
              var d = a - o;
              s += eh(d) > 180 ? d + (d > 0 ? 360 : -360) : d;
            } else
              p = a, q = c;
            ki.point(a, c), b(a, c);
          }
          function f() {
            ki.lineStart();
          }
          function g() {
            e(p, q), ki.lineEnd(), eh(s) > zh && (k = -(m = 180)), u[0] = k, u[1] = m, r = null;
          }
          function h(a, b) {
            return (b -= a) < 0 ? b + 360 : b;
          }
          function i(a, b) {
            return a[0] - b[0];
          }
          function j(a, b) {
            return b[0] <= b[1] ? b[0] <= a && a <= b[1] : a < b[0] || b[1] < a;
          }
          var k, l, m, n, o, p, q, r, s, t, u, v = {
              point: a,
              lineStart: c,
              lineEnd: d,
              polygonStart: function () {
                v.point = e, v.lineStart = f, v.lineEnd = g, s = 0, ki.polygonStart();
              },
              polygonEnd: function () {
                ki.polygonEnd(), v.point = a, v.lineStart = c, v.lineEnd = d, 0 > ji ? (k = -(m = 180), l = -(n = 90)) : s > zh ? n = 90 : -zh > s && (l = -90), u[0] = k, u[1] = m;
              }
            };
          return function (a) {
            n = m = -(k = l = 1 / 0), t = [], Sg.geo.stream(a, v);
            var b = t.length;
            if (b) {
              t.sort(i);
              for (var c, d = 1, e = t[0], f = [e]; b > d; ++d)
                c = t[d], j(c[0], e) || j(c[1], e) ? (h(e[0], c[1]) > h(e[0], e[1]) && (e[1] = c[1]), h(c[0], e[1]) > h(e[0], e[1]) && (e[0] = c[0])) : f.push(e = c);
              for (var g, c, o = -1 / 0, b = f.length - 1, d = 0, e = f[b]; b >= d; e = c, ++d)
                c = f[d], (g = h(e[1], c[0])) > o && (o = g, k = c[0], m = e[1]);
            }
            return t = u = null, 1 / 0 === k || 1 / 0 === l ? [
              [
                0 / 0,
                0 / 0
              ],
              [
                0 / 0,
                0 / 0
              ]
            ] : [
              [
                k,
                l
              ],
              [
                m,
                n
              ]
            ];
          };
        }(), Sg.geo.centroid = function (a) {
          li = mi = ni = oi = pi = qi = ri = si = ti = ui = vi = 0, Sg.geo.stream(a, wi);
          var b = ti, c = ui, d = vi, e = b * b + c * c + d * d;
          return Ah > e && (b = qi, c = ri, d = si, zh > mi && (b = ni, c = oi, d = pi), e = b * b + c * c + d * d, Ah > e) ? [
            0 / 0,
            0 / 0
          ] : [
            Math.atan2(c, b) * Ch,
            N(d / Math.sqrt(e)) * Ch
          ];
        };
        var li, mi, ni, oi, pi, qi, ri, si, ti, ui, vi, wi = {
            sphere: i,
            point: Nb,
            lineStart: Pb,
            lineEnd: Qb,
            polygonStart: function () {
              wi.lineStart = Rb;
            },
            polygonEnd: function () {
              wi.lineStart = Pb;
            }
          }, xi = Wb(Sb, _b, bc, [
            -wh,
            -wh / 2
          ]), yi = 1000000000;
        Sg.geo.clipExtent = function () {
          var a, b, c, d, e, f, g = {
              stream: function (a) {
                return e && (e.valid = !1), e = f(a), e.valid = !0, e;
              },
              extent: function (h) {
                return arguments.length ? (f = ec(a = +h[0][0], b = +h[0][1], c = +h[1][0], d = +h[1][1]), e && (e.valid = !1, e = null), g) : [
                  [
                    a,
                    b
                  ],
                  [
                    c,
                    d
                  ]
                ];
              }
            };
          return g.extent([
            [
              0,
              0
            ],
            [
              960,
              500
            ]
          ]);
        }, (Sg.geo.conicEqualArea = function () {
          return gc(hc);
        }).raw = hc, Sg.geo.albers = function () {
          return Sg.geo.conicEqualArea().rotate([
            96,
            0
          ]).center([
            -0.6,
            38.7
          ]).parallels([
            29.5,
            45.5
          ]).scale(1070);
        }, Sg.geo.albersUsa = function () {
          function a(a) {
            var f = a[0], g = a[1];
            return b = null, c(f, g), b || (d(f, g), b) || e(f, g), b;
          }
          var b, c, d, e, f = Sg.geo.albers(), g = Sg.geo.conicEqualArea().rotate([
              154,
              0
            ]).center([
              -2,
              58.5
            ]).parallels([
              55,
              65
            ]), h = Sg.geo.conicEqualArea().rotate([
              157,
              0
            ]).center([
              -3,
              19.9
            ]).parallels([
              8,
              18
            ]), i = {
              point: function (a, c) {
                b = [
                  a,
                  c
                ];
              }
            };
          return a.invert = function (a) {
            var b = f.scale(), c = f.translate(), d = (a[0] - c[0]) / b, e = (a[1] - c[1]) / b;
            return (e >= 0.12 && 0.234 > e && d >= -0.425 && -0.214 > d ? g : e >= 0.166 && 0.234 > e && d >= -0.214 && -0.115 > d ? h : f).invert(a);
          }, a.stream = function (a) {
            var b = f.stream(a), c = g.stream(a), d = h.stream(a);
            return {
              point: function (a, e) {
                b.point(a, e), c.point(a, e), d.point(a, e);
              },
              sphere: function () {
                b.sphere(), c.sphere(), d.sphere();
              },
              lineStart: function () {
                b.lineStart(), c.lineStart(), d.lineStart();
              },
              lineEnd: function () {
                b.lineEnd(), c.lineEnd(), d.lineEnd();
              },
              polygonStart: function () {
                b.polygonStart(), c.polygonStart(), d.polygonStart();
              },
              polygonEnd: function () {
                b.polygonEnd(), c.polygonEnd(), d.polygonEnd();
              }
            };
          }, a.precision = function (b) {
            return arguments.length ? (f.precision(b), g.precision(b), h.precision(b), a) : f.precision();
          }, a.scale = function (b) {
            return arguments.length ? (f.scale(b), g.scale(0.35 * b), h.scale(b), a.translate(f.translate())) : f.scale();
          }, a.translate = function (b) {
            if (!arguments.length)
              return f.translate();
            var j = f.scale(), k = +b[0], l = +b[1];
            return c = f.translate(b).clipExtent([
              [
                k - 0.455 * j,
                l - 0.238 * j
              ],
              [
                k + 0.455 * j,
                l + 0.238 * j
              ]
            ]).stream(i).point, d = g.translate([
              k - 0.307 * j,
              l + 0.201 * j
            ]).clipExtent([
              [
                k - 0.425 * j + zh,
                l + 0.12 * j + zh
              ],
              [
                k - 0.214 * j - zh,
                l + 0.234 * j - zh
              ]
            ]).stream(i).point, e = h.translate([
              k - 0.205 * j,
              l + 0.212 * j
            ]).clipExtent([
              [
                k - 0.214 * j + zh,
                l + 0.166 * j + zh
              ],
              [
                k - 0.115 * j - zh,
                l + 0.234 * j - zh
              ]
            ]).stream(i).point, a;
          }, a.scale(1070);
        };
        var zi, Ai, Bi, Ci, Di, Ei, Fi = {
            point: i,
            lineStart: i,
            lineEnd: i,
            polygonStart: function () {
              Ai = 0, Fi.lineStart = ic;
            },
            polygonEnd: function () {
              Fi.lineStart = Fi.lineEnd = Fi.point = i, zi += eh(Ai / 2);
            }
          }, Gi = {
            point: jc,
            lineStart: i,
            lineEnd: i,
            polygonStart: i,
            polygonEnd: i
          }, Hi = {
            point: mc,
            lineStart: nc,
            lineEnd: oc,
            polygonStart: function () {
              Hi.lineStart = pc;
            },
            polygonEnd: function () {
              Hi.point = mc, Hi.lineStart = nc, Hi.lineEnd = oc;
            }
          };
        Sg.geo.transform = function (a) {
          return {
            stream: function (b) {
              var c = new sc(b);
              for (var d in a)
                c[d] = a[d];
              return c;
            }
          };
        }, sc.prototype = {
          point: function (a, b) {
            this.stream.point(a, b);
          },
          sphere: function () {
            this.stream.sphere();
          },
          lineStart: function () {
            this.stream.lineStart();
          },
          lineEnd: function () {
            this.stream.lineEnd();
          },
          polygonStart: function () {
            this.stream.polygonStart();
          },
          polygonEnd: function () {
            this.stream.polygonEnd();
          }
        }, Sg.geo.path = function () {
          function a(a) {
            return a && ('function' == typeof h && f.pointRadius(+h.apply(this, arguments)), g && g.valid || (g = e(f)), Sg.geo.stream(a, g)), f.result();
          }
          function b() {
            return g = null, a;
          }
          var c, d, e, f, g, h = 4.5;
          return a.area = function (a) {
            return zi = 0, Sg.geo.stream(a, e(Fi)), zi;
          }, a.centroid = function (a) {
            return ni = oi = pi = qi = ri = si = ti = ui = vi = 0, Sg.geo.stream(a, e(Hi)), vi ? [
              ti / vi,
              ui / vi
            ] : si ? [
              qi / si,
              ri / si
            ] : pi ? [
              ni / pi,
              oi / pi
            ] : [
              0 / 0,
              0 / 0
            ];
          }, a.bounds = function (a) {
            return Di = Ei = -(Bi = Ci = 1 / 0), Sg.geo.stream(a, e(Gi)), [
              [
                Bi,
                Ci
              ],
              [
                Di,
                Ei
              ]
            ];
          }, a.projection = function (a) {
            return arguments.length ? (e = (c = a) ? a.stream || tc(a) : pb, b()) : c;
          }, a.context = function (a) {
            return arguments.length ? (f = null == (d = a) ? new kc() : new qc(a), 'function' != typeof h && f.pointRadius(h), b()) : d;
          }, a.pointRadius = function (b) {
            return arguments.length ? (h = 'function' == typeof b ? b : (f.pointRadius(+b), +b), a) : h;
          }, a.projection(Sg.geo.albersUsa()).context(null);
        }, Sg.geo.projection = uc, Sg.geo.projectionMutator = vc, (Sg.geo.equirectangular = function () {
          return uc(xc);
        }).raw = xc.invert = xc, Sg.geo.rotation = function (a) {
          function b(b) {
            return b = a(b[0] * Bh, b[1] * Bh), b[0] *= Ch, b[1] *= Ch, b;
          }
          return a = zc(a[0] % 360 * Bh, a[1] * Bh, a.length > 2 ? a[2] * Bh : 0), b.invert = function (b) {
            return b = a.invert(b[0] * Bh, b[1] * Bh), b[0] *= Ch, b[1] *= Ch, b;
          }, b;
        }, yc.invert = xc, Sg.geo.circle = function () {
          function a() {
            var a = 'function' == typeof d ? d.apply(this, arguments) : d, b = zc(-a[0] * Bh, -a[1] * Bh, 0).invert, e = [];
            return c(null, null, 1, {
              point: function (a, c) {
                e.push(a = b(a, c)), a[0] *= Ch, a[1] *= Ch;
              }
            }), {
              type: 'Polygon',
              coordinates: [e]
            };
          }
          var b, c, d = [
              0,
              0
            ], e = 6;
          return a.origin = function (b) {
            return arguments.length ? (d = b, a) : d;
          }, a.angle = function (d) {
            return arguments.length ? (c = Dc((b = +d) * Bh, e * Bh), a) : b;
          }, a.precision = function (d) {
            return arguments.length ? (c = Dc(b * Bh, (e = +d) * Bh), a) : e;
          }, a.angle(90);
        }, Sg.geo.distance = function (a, b) {
          var c, d = (b[0] - a[0]) * Bh, e = a[1] * Bh, f = b[1] * Bh, g = Math.sin(d), h = Math.cos(d), i = Math.sin(e), j = Math.cos(e), k = Math.sin(f), l = Math.cos(f);
          return Math.atan2(Math.sqrt((c = l * g) * c + (c = j * k - i * l * h) * c), i * k + j * l * h);
        }, Sg.geo.graticule = function () {
          function a() {
            return {
              type: 'MultiLineString',
              coordinates: b()
            };
          }
          function b() {
            return Sg.range(Math.ceil(f / q) * q, e, q).map(m).concat(Sg.range(Math.ceil(j / r) * r, i, r).map(n)).concat(Sg.range(Math.ceil(d / o) * o, c, o).filter(function (a) {
              return eh(a % q) > zh;
            }).map(k)).concat(Sg.range(Math.ceil(h / p) * p, g, p).filter(function (a) {
              return eh(a % r) > zh;
            }).map(l));
          }
          var c, d, e, f, g, h, i, j, k, l, m, n, o = 10, p = o, q = 90, r = 360, s = 2.5;
          return a.lines = function () {
            return b().map(function (a) {
              return {
                type: 'LineString',
                coordinates: a
              };
            });
          }, a.outline = function () {
            return {
              type: 'Polygon',
              coordinates: [m(f).concat(n(i).slice(1), m(e).reverse().slice(1), n(j).reverse().slice(1))]
            };
          }, a.extent = function (b) {
            return arguments.length ? a.majorExtent(b).minorExtent(b) : a.minorExtent();
          }, a.majorExtent = function (b) {
            return arguments.length ? (f = +b[0][0], e = +b[1][0], j = +b[0][1], i = +b[1][1], f > e && (b = f, f = e, e = b), j > i && (b = j, j = i, i = b), a.precision(s)) : [
              [
                f,
                j
              ],
              [
                e,
                i
              ]
            ];
          }, a.minorExtent = function (b) {
            return arguments.length ? (d = +b[0][0], c = +b[1][0], h = +b[0][1], g = +b[1][1], d > c && (b = d, d = c, c = b), h > g && (b = h, h = g, g = b), a.precision(s)) : [
              [
                d,
                h
              ],
              [
                c,
                g
              ]
            ];
          }, a.step = function (b) {
            return arguments.length ? a.majorStep(b).minorStep(b) : a.minorStep();
          }, a.majorStep = function (b) {
            return arguments.length ? (q = +b[0], r = +b[1], a) : [
              q,
              r
            ];
          }, a.minorStep = function (b) {
            return arguments.length ? (o = +b[0], p = +b[1], a) : [
              o,
              p
            ];
          }, a.precision = function (b) {
            return arguments.length ? (s = +b, k = Fc(h, g, 90), l = Gc(d, c, s), m = Fc(j, i, 90), n = Gc(f, e, s), a) : s;
          }, a.majorExtent([
            [
              -180,
              -90 + zh
            ],
            [
              180,
              90 - zh
            ]
          ]).minorExtent([
            [
              -180,
              -80 - zh
            ],
            [
              180,
              80 + zh
            ]
          ]);
        }, Sg.geo.greatArc = function () {
          function a() {
            return {
              type: 'LineString',
              coordinates: [
                b || d.apply(this, arguments),
                c || e.apply(this, arguments)
              ]
            };
          }
          var b, c, d = Hc, e = Ic;
          return a.distance = function () {
            return Sg.geo.distance(b || d.apply(this, arguments), c || e.apply(this, arguments));
          }, a.source = function (c) {
            return arguments.length ? (d = c, b = 'function' == typeof c ? null : c, a) : d;
          }, a.target = function (b) {
            return arguments.length ? (e = b, c = 'function' == typeof b ? null : b, a) : e;
          }, a.precision = function () {
            return arguments.length ? a : 0;
          }, a;
        }, Sg.geo.interpolate = function (a, b) {
          return Jc(a[0] * Bh, a[1] * Bh, b[0] * Bh, b[1] * Bh);
        }, Sg.geo.length = function (a) {
          return Ii = 0, Sg.geo.stream(a, Ji), Ii;
        };
        var Ii, Ji = {
            sphere: i,
            point: i,
            lineStart: Kc,
            lineEnd: i,
            polygonStart: i,
            polygonEnd: i
          }, Ki = Lc(function (a) {
            return Math.sqrt(2 / (1 + a));
          }, function (a) {
            return 2 * Math.asin(a / 2);
          });
        (Sg.geo.azimuthalEqualArea = function () {
          return uc(Ki);
        }).raw = Ki;
        var Li = Lc(function (a) {
            var b = Math.acos(a);
            return b && b / Math.sin(b);
          }, pb);
        (Sg.geo.azimuthalEquidistant = function () {
          return uc(Li);
        }).raw = Li, (Sg.geo.conicConformal = function () {
          return gc(Mc);
        }).raw = Mc, (Sg.geo.conicEquidistant = function () {
          return gc(Nc);
        }).raw = Nc;
        var Mi = Lc(function (a) {
            return 1 / a;
          }, Math.atan);
        (Sg.geo.gnomonic = function () {
          return uc(Mi);
        }).raw = Mi, Oc.invert = function (a, b) {
          return [
            a,
            2 * Math.atan(Math.exp(b)) - yh
          ];
        }, (Sg.geo.mercator = function () {
          return Pc(Oc);
        }).raw = Oc;
        var Ni = Lc(function () {
            return 1;
          }, Math.asin);
        (Sg.geo.orthographic = function () {
          return uc(Ni);
        }).raw = Ni;
        var Oi = Lc(function (a) {
            return 1 / (1 + a);
          }, function (a) {
            return 2 * Math.atan(a);
          });
        (Sg.geo.stereographic = function () {
          return uc(Oi);
        }).raw = Oi, Qc.invert = function (a, b) {
          return [
            Math.atan2(O(a), Math.cos(b)),
            N(Math.sin(b) / P(a))
          ];
        }, (Sg.geo.transverseMercator = function () {
          return Pc(Qc);
        }).raw = Qc, Sg.geom = {}, Sg.geom.hull = function (a) {
          function b(a) {
            if (a.length < 3)
              return [];
            var b, e, f, g, h, i, j, k, l, m, n, o, p = ob(c), q = ob(d), r = a.length, s = r - 1, t = [], u = [], v = 0;
            if (p === Rc && d === Sc)
              b = a;
            else
              for (f = 0, b = []; r > f; ++f)
                b.push([
                  +p.call(this, e = a[f], f),
                  +q.call(this, e, f)
                ]);
            for (f = 1; r > f; ++f)
              (b[f][1] < b[v][1] || b[f][1] == b[v][1] && b[f][0] < b[v][0]) && (v = f);
            for (f = 0; r > f; ++f)
              f !== v && (i = b[f][1] - b[v][1], h = b[f][0] - b[v][0], t.push({
                angle: Math.atan2(i, h),
                index: f
              }));
            for (t.sort(function (a, b) {
                return a.angle - b.angle;
              }), n = t[0].angle, m = t[0].index, l = 0, f = 1; s > f; ++f) {
              if (g = t[f].index, n == t[f].angle) {
                if (h = b[m][0] - b[v][0], i = b[m][1] - b[v][1], j = b[g][0] - b[v][0], k = b[g][1] - b[v][1], h * h + i * i >= j * j + k * k) {
                  t[f].index = -1;
                  continue;
                }
                t[l].index = -1;
              }
              n = t[f].angle, l = f, m = g;
            }
            for (u.push(v), f = 0, g = 0; 2 > f; ++g)
              t[g].index > -1 && (u.push(t[g].index), f++);
            for (o = u.length; s > g; ++g)
              if (!(t[g].index < 0)) {
                for (; !Tc(u[o - 2], u[o - 1], t[g].index, b);)
                  --o;
                u[o++] = t[g].index;
              }
            var w = [];
            for (f = o - 1; f >= 0; --f)
              w.push(a[u[f]]);
            return w;
          }
          var c = Rc, d = Sc;
          return arguments.length ? b(a) : (b.x = function (a) {
            return arguments.length ? (c = a, b) : c;
          }, b.y = function (a) {
            return arguments.length ? (d = a, b) : d;
          }, b);
        }, Sg.geom.polygon = function (a) {
          return jh(a, Pi), a;
        };
        var Pi = Sg.geom.polygon.prototype = [];
        Pi.area = function () {
          for (var a, b = -1, c = this.length, d = this[c - 1], e = 0; ++b < c;)
            a = d, d = this[b], e += a[1] * d[0] - a[0] * d[1];
          return 0.5 * e;
        }, Pi.centroid = function (a) {
          var b, c, d = -1, e = this.length, f = 0, g = 0, h = this[e - 1];
          for (arguments.length || (a = -1 / (6 * this.area())); ++d < e;)
            b = h, h = this[d], c = b[0] * h[1] - h[0] * b[1], f += (b[0] + h[0]) * c, g += (b[1] + h[1]) * c;
          return [
            f * a,
            g * a
          ];
        }, Pi.clip = function (a) {
          for (var b, c, d, e, f, g, h = Wc(a), i = -1, j = this.length - Wc(this), k = this[j - 1]; ++i < j;) {
            for (b = a.slice(), a.length = 0, e = this[i], f = b[(d = b.length - h) - 1], c = -1; ++c < d;)
              g = b[c], Uc(g, k, e) ? (Uc(f, k, e) || a.push(Vc(f, g, k, e)), a.push(g)) : Uc(f, k, e) && a.push(Vc(f, g, k, e)), f = g;
            h && a.push(a[0]), k = e;
          }
          return a;
        };
        var Qi, Ri, Si, Ti, Ui, Vi = [], Wi = [];
        cd.prototype.prepare = function () {
          for (var a, b = this.edges, c = b.length; c--;)
            a = b[c].edge, a.b && a.a || b.splice(c, 1);
          return b.sort(ed), b.length;
        }, od.prototype = {
          start: function () {
            return this.edge.l === this.site ? this.edge.a : this.edge.b;
          },
          end: function () {
            return this.edge.l === this.site ? this.edge.b : this.edge.a;
          }
        }, pd.prototype = {
          insert: function (a, b) {
            var c, d, e;
            if (a) {
              if (b.P = a, b.N = a.N, a.N && (a.N.P = b), a.N = b, a.R) {
                for (a = a.R; a.L;)
                  a = a.L;
                a.L = b;
              } else
                a.R = b;
              c = a;
            } else
              this._ ? (a = td(this._), b.P = null, b.N = a, a.P = a.L = b, c = a) : (b.P = b.N = null, this._ = b, c = null);
            for (b.L = b.R = null, b.U = c, b.C = !0, a = b; c && c.C;)
              d = c.U, c === d.L ? (e = d.R, e && e.C ? (c.C = e.C = !1, d.C = !0, a = d) : (a === c.R && (rd(this, c), a = c, c = a.U), c.C = !1, d.C = !0, sd(this, d))) : (e = d.L, e && e.C ? (c.C = e.C = !1, d.C = !0, a = d) : (a === c.L && (sd(this, c), a = c, c = a.U), c.C = !1, d.C = !0, rd(this, d))), c = a.U;
            this._.C = !1;
          },
          remove: function (a) {
            a.N && (a.N.P = a.P), a.P && (a.P.N = a.N), a.N = a.P = null;
            var b, c, d, e = a.U, f = a.L, g = a.R;
            if (c = f ? g ? td(g) : f : g, e ? e.L === a ? e.L = c : e.R = c : this._ = c, f && g ? (d = c.C, c.C = a.C, c.L = f, f.U = c, c !== g ? (e = c.U, c.U = a.U, a = c.R, e.L = a, c.R = g, g.U = c) : (c.U = e, e = c, a = c.R)) : (d = a.C, a = c), a && (a.U = e), !d) {
              if (a && a.C)
                return a.C = !1, void 0;
              do {
                if (a === this._)
                  break;
                if (a === e.L) {
                  if (b = e.R, b.C && (b.C = !1, e.C = !0, rd(this, e), b = e.R), b.L && b.L.C || b.R && b.R.C) {
                    b.R && b.R.C || (b.L.C = !1, b.C = !0, sd(this, b), b = e.R), b.C = e.C, e.C = b.R.C = !1, rd(this, e), a = this._;
                    break;
                  }
                } else if (b = e.L, b.C && (b.C = !1, e.C = !0, sd(this, e), b = e.L), b.L && b.L.C || b.R && b.R.C) {
                  b.L && b.L.C || (b.R.C = !1, b.C = !0, rd(this, b), b = e.L), b.C = e.C, e.C = b.L.C = !1, sd(this, e), a = this._;
                  break;
                }
                b.C = !0, a = e, e = e.U;
              } while (!a.C);
              a && (a.C = !1);
            }
          }
        }, Sg.geom.voronoi = function (a) {
          function b(a) {
            var b = new Array(a.length), d = h[0][0], e = h[0][1], f = h[1][0], g = h[1][1];
            return ud(c(a), h).cells.forEach(function (c, h) {
              var i = c.edges, j = c.site, k = b[h] = i.length ? i.map(function (a) {
                  var b = a.start();
                  return [
                    b.x,
                    b.y
                  ];
                }) : j.x >= d && j.x <= f && j.y >= e && j.y <= g ? [
                  [
                    d,
                    g
                  ],
                  [
                    f,
                    g
                  ],
                  [
                    f,
                    e
                  ],
                  [
                    d,
                    e
                  ]
                ] : [];
              k.point = a[h];
            }), b;
          }
          function c(a) {
            return a.map(function (a, b) {
              return {
                x: Math.round(f(a, b) / zh) * zh,
                y: Math.round(g(a, b) / zh) * zh,
                i: b
              };
            });
          }
          var d = Rc, e = Sc, f = d, g = e, h = Xi;
          return a ? b(a) : (b.links = function (a) {
            return ud(c(a)).edges.filter(function (a) {
              return a.l && a.r;
            }).map(function (b) {
              return {
                source: a[b.l.i],
                target: a[b.r.i]
              };
            });
          }, b.triangles = function (a) {
            var b = [];
            return ud(c(a)).cells.forEach(function (c, d) {
              for (var e, f, g = c.site, h = c.edges.sort(ed), i = -1, j = h.length, k = h[j - 1].edge, l = k.l === g ? k.r : k.l; ++i < j;)
                e = k, f = l, k = h[i].edge, l = k.l === g ? k.r : k.l, d < f.i && d < l.i && wd(g, f, l) < 0 && b.push([
                  a[d],
                  a[f.i],
                  a[l.i]
                ]);
            }), b;
          }, b.x = function (a) {
            return arguments.length ? (f = ob(d = a), b) : d;
          }, b.y = function (a) {
            return arguments.length ? (g = ob(e = a), b) : e;
          }, b.clipExtent = function (a) {
            return arguments.length ? (h = null == a ? Xi : a, b) : h === Xi ? null : h;
          }, b.size = function (a) {
            return arguments.length ? b.clipExtent(a && [
              [
                0,
                0
              ],
              a
            ]) : h === Xi ? null : h && h[1];
          }, b);
        };
        var Xi = [
            [
              -1000000,
              -1000000
            ],
            [
              1000000,
              1000000
            ]
          ];
        Sg.geom.delaunay = function (a) {
          return Sg.geom.voronoi().triangles(a);
        }, Sg.geom.quadtree = function (a, b, c, d, e) {
          function f(a) {
            function f(a, b, c, d, e, f, g, h) {
              if (!isNaN(c) && !isNaN(d))
                if (a.leaf) {
                  var i = a.x, k = a.y;
                  if (null != i)
                    if (eh(i - c) + eh(k - d) < 0.01)
                      j(a, b, c, d, e, f, g, h);
                    else {
                      var l = a.point;
                      a.x = a.y = a.point = null, j(a, l, i, k, e, f, g, h), j(a, b, c, d, e, f, g, h);
                    }
                  else
                    a.x = c, a.y = d, a.point = b;
                } else
                  j(a, b, c, d, e, f, g, h);
            }
            function j(a, b, c, d, e, g, h, i) {
              var j = 0.5 * (e + h), k = 0.5 * (g + i), l = c >= j, m = d >= k, n = (m << 1) + l;
              a.leaf = !1, a = a.nodes[n] || (a.nodes[n] = zd()), l ? e = j : h = j, m ? g = k : i = k, f(a, b, c, d, e, g, h, i);
            }
            var k, l, m, n, o, p, q, r, s, t = ob(h), u = ob(i);
            if (null != b)
              p = b, q = c, r = d, s = e;
            else if (r = s = -(p = q = 1 / 0), l = [], m = [], o = a.length, g)
              for (n = 0; o > n; ++n)
                k = a[n], k.x < p && (p = k.x), k.y < q && (q = k.y), k.x > r && (r = k.x), k.y > s && (s = k.y), l.push(k.x), m.push(k.y);
            else
              for (n = 0; o > n; ++n) {
                var v = +t(k = a[n], n), w = +u(k, n);
                p > v && (p = v), q > w && (q = w), v > r && (r = v), w > s && (s = w), l.push(v), m.push(w);
              }
            var x = r - p, y = s - q;
            x > y ? s = q + x : r = p + y;
            var z = zd();
            if (z.add = function (a) {
                f(z, a, +t(a, ++n), +u(a, n), p, q, r, s);
              }, z.visit = function (a) {
                Ad(a, z, p, q, r, s);
              }, n = -1, null == b) {
              for (; ++n < o;)
                f(z, a[n], l[n], m[n], p, q, r, s);
              --n;
            } else
              a.forEach(z.add);
            return l = m = a = k = null, z;
          }
          var g, h = Rc, i = Sc;
          return (g = arguments.length) ? (h = xd, i = yd, 3 === g && (e = c, d = b, c = b = 0), f(a)) : (f.x = function (a) {
            return arguments.length ? (h = a, f) : h;
          }, f.y = function (a) {
            return arguments.length ? (i = a, f) : i;
          }, f.extent = function (a) {
            return arguments.length ? (null == a ? b = c = d = e = null : (b = +a[0][0], c = +a[0][1], d = +a[1][0], e = +a[1][1]), f) : null == b ? null : [
              [
                b,
                c
              ],
              [
                d,
                e
              ]
            ];
          }, f.size = function (a) {
            return arguments.length ? (null == a ? b = c = d = e = null : (b = c = 0, d = +a[0], e = +a[1]), f) : null == b ? null : [
              d - b,
              e - c
            ];
          }, f);
        }, Sg.interpolateRgb = Bd, Sg.interpolateObject = Cd, Sg.interpolateNumber = Dd, Sg.interpolateString = Ed;
        var Yi = /[-+]?(?:\d+\.?\d*|\.?\d+)(?:[eE][-+]?\d+)?/g;
        Sg.interpolate = Fd, Sg.interpolators = [function (a, b) {
            var c = typeof b;
            return ('string' === c ? Rh.has(b) || /^(#|rgb\(|hsl\()/.test(b) ? Bd : Ed : b instanceof S ? Bd : 'object' === c ? Array.isArray(b) ? Gd : Cd : Dd)(a, b);
          }], Sg.interpolateArray = Gd;
        var Zi = function () {
            return pb;
          }, $i = Sg.map({
            linear: Zi,
            poly: Nd,
            quad: function () {
              return Kd;
            },
            cubic: function () {
              return Ld;
            },
            sin: function () {
              return Od;
            },
            exp: function () {
              return Pd;
            },
            circle: function () {
              return Qd;
            },
            elastic: Rd,
            back: Sd,
            bounce: function () {
              return Td;
            }
          }), _i = Sg.map({
            'in': pb,
            out: Id,
            'in-out': Jd,
            'out-in': function (a) {
              return Jd(Id(a));
            }
          });
        Sg.ease = function (a) {
          var b = a.indexOf('-'), c = b >= 0 ? a.substring(0, b) : a, d = b >= 0 ? a.substring(b + 1) : 'in';
          return c = $i.get(c) || Zi, d = _i.get(d) || pb, Hd(d(c.apply(null, Tg.call(arguments, 1))));
        }, Sg.interpolateHcl = Ud, Sg.interpolateHsl = Vd, Sg.interpolateLab = Wd, Sg.interpolateRound = Xd, Sg.transform = function (a) {
          var b = Vg.createElementNS(Sg.ns.prefix.svg, 'g');
          return (Sg.transform = function (a) {
            if (null != a) {
              b.setAttribute('transform', a);
              var c = b.transform.baseVal.consolidate();
            }
            return new Yd(c ? c.matrix : aj);
          })(a);
        }, Yd.prototype.toString = function () {
          return 'translate(' + this.translate + ')rotate(' + this.rotate + ')skewX(' + this.skew + ')scale(' + this.scale + ')';
        };
        var aj = {
            a: 1,
            b: 0,
            c: 0,
            d: 1,
            e: 0,
            f: 0
          };
        Sg.interpolateTransform = ae, Sg.layout = {}, Sg.layout.bundle = function () {
          return function (a) {
            for (var b = [], c = -1, d = a.length; ++c < d;)
              b.push(de(a[c]));
            return b;
          };
        }, Sg.layout.chord = function () {
          function a() {
            var a, j, l, m, n, o = {}, p = [], q = Sg.range(f), r = [];
            for (c = [], d = [], a = 0, m = -1; ++m < f;) {
              for (j = 0, n = -1; ++n < f;)
                j += e[m][n];
              p.push(j), r.push(Sg.range(f)), a += j;
            }
            for (g && q.sort(function (a, b) {
                return g(p[a], p[b]);
              }), h && r.forEach(function (a, b) {
                a.sort(function (a, c) {
                  return h(e[b][a], e[b][c]);
                });
              }), a = (xh - k * f) / a, j = 0, m = -1; ++m < f;) {
              for (l = j, n = -1; ++n < f;) {
                var s = q[m], t = r[s][n], u = e[s][t], v = j, w = j += u * a;
                o[s + '-' + t] = {
                  index: s,
                  subindex: t,
                  startAngle: v,
                  endAngle: w,
                  value: u
                };
              }
              d[s] = {
                index: s,
                startAngle: l,
                endAngle: j,
                value: (j - l) / a
              }, j += k;
            }
            for (m = -1; ++m < f;)
              for (n = m - 1; ++n < f;) {
                var x = o[m + '-' + n], y = o[n + '-' + m];
                (x.value || y.value) && c.push(x.value < y.value ? {
                  source: y,
                  target: x
                } : {
                  source: x,
                  target: y
                });
              }
            i && b();
          }
          function b() {
            c.sort(function (a, b) {
              return i((a.source.value + a.target.value) / 2, (b.source.value + b.target.value) / 2);
            });
          }
          var c, d, e, f, g, h, i, j = {}, k = 0;
          return j.matrix = function (a) {
            return arguments.length ? (f = (e = a) && e.length, c = d = null, j) : e;
          }, j.padding = function (a) {
            return arguments.length ? (k = a, c = d = null, j) : k;
          }, j.sortGroups = function (a) {
            return arguments.length ? (g = a, c = d = null, j) : g;
          }, j.sortSubgroups = function (a) {
            return arguments.length ? (h = a, c = null, j) : h;
          }, j.sortChords = function (a) {
            return arguments.length ? (i = a, c && b(), j) : i;
          }, j.chords = function () {
            return c || a(), c;
          }, j.groups = function () {
            return d || a(), d;
          }, j;
        }, Sg.layout.force = function () {
          function a(a) {
            return function (b, c, d, e) {
              if (b.point !== a) {
                var f = b.cx - a.x, g = b.cy - a.y, h = 1 / Math.sqrt(f * f + g * g);
                if (p > (e - c) * h) {
                  var i = b.charge * h * h;
                  return a.px -= f * i, a.py -= g * i, !0;
                }
                if (b.point && isFinite(h)) {
                  var i = b.pointCharge * h * h;
                  a.px -= f * i, a.py -= g * i;
                }
              }
              return !b.charge;
            };
          }
          function b(a) {
            a.px = Sg.event.x, a.py = Sg.event.y, h.resume();
          }
          var c, d, e, f, g, h = {}, i = Sg.dispatch('start', 'tick', 'end'), j = [
              1,
              1
            ], k = 0.9, l = bj, m = cj, n = -30, o = 0.1, p = 0.8, q = [], r = [];
          return h.tick = function () {
            if ((d *= 0.99) < 0.005)
              return i.end({
                type: 'end',
                alpha: d = 0
              }), !0;
            var b, c, h, l, m, p, s, t, u, v = q.length, w = r.length;
            for (c = 0; w > c; ++c)
              h = r[c], l = h.source, m = h.target, t = m.x - l.x, u = m.y - l.y, (p = t * t + u * u) && (p = d * f[c] * ((p = Math.sqrt(p)) - e[c]) / p, t *= p, u *= p, m.x -= t * (s = l.weight / (m.weight + l.weight)), m.y -= u * s, l.x += t * (s = 1 - s), l.y += u * s);
            if ((s = d * o) && (t = j[0] / 2, u = j[1] / 2, c = -1, s))
              for (; ++c < v;)
                h = q[c], h.x += (t - h.x) * s, h.y += (u - h.y) * s;
            if (n)
              for (ke(b = Sg.geom.quadtree(q), d, g), c = -1; ++c < v;)
                (h = q[c]).fixed || b.visit(a(h));
            for (c = -1; ++c < v;)
              h = q[c], h.fixed ? (h.x = h.px, h.y = h.py) : (h.x -= (h.px - (h.px = h.x)) * k, h.y -= (h.py - (h.py = h.y)) * k);
            i.tick({
              type: 'tick',
              alpha: d
            });
          }, h.nodes = function (a) {
            return arguments.length ? (q = a, h) : q;
          }, h.links = function (a) {
            return arguments.length ? (r = a, h) : r;
          }, h.size = function (a) {
            return arguments.length ? (j = a, h) : j;
          }, h.linkDistance = function (a) {
            return arguments.length ? (l = 'function' == typeof a ? a : +a, h) : l;
          }, h.distance = h.linkDistance, h.linkStrength = function (a) {
            return arguments.length ? (m = 'function' == typeof a ? a : +a, h) : m;
          }, h.friction = function (a) {
            return arguments.length ? (k = +a, h) : k;
          }, h.charge = function (a) {
            return arguments.length ? (n = 'function' == typeof a ? a : +a, h) : n;
          }, h.gravity = function (a) {
            return arguments.length ? (o = +a, h) : o;
          }, h.theta = function (a) {
            return arguments.length ? (p = +a, h) : p;
          }, h.alpha = function (a) {
            return arguments.length ? (a = +a, d ? d = a > 0 ? a : 0 : a > 0 && (i.start({
              type: 'start',
              alpha: d = a
            }), Sg.timer(h.tick)), h) : d;
          }, h.start = function () {
            function a(a, d) {
              if (!c) {
                for (c = new Array(i), h = 0; i > h; ++h)
                  c[h] = [];
                for (h = 0; j > h; ++h) {
                  var e = r[h];
                  c[e.source.index].push(e.target), c[e.target.index].push(e.source);
                }
              }
              for (var f, g = c[b], h = -1, j = g.length; ++h < j;)
                if (!isNaN(f = g[h][a]))
                  return f;
              return Math.random() * d;
            }
            var b, c, d, i = q.length, k = r.length, o = j[0], p = j[1];
            for (b = 0; i > b; ++b)
              (d = q[b]).index = b, d.weight = 0;
            for (b = 0; k > b; ++b)
              d = r[b], 'number' == typeof d.source && (d.source = q[d.source]), 'number' == typeof d.target && (d.target = q[d.target]), ++d.source.weight, ++d.target.weight;
            for (b = 0; i > b; ++b)
              d = q[b], isNaN(d.x) && (d.x = a('x', o)), isNaN(d.y) && (d.y = a('y', p)), isNaN(d.px) && (d.px = d.x), isNaN(d.py) && (d.py = d.y);
            if (e = [], 'function' == typeof l)
              for (b = 0; k > b; ++b)
                e[b] = +l.call(this, r[b], b);
            else
              for (b = 0; k > b; ++b)
                e[b] = l;
            if (f = [], 'function' == typeof m)
              for (b = 0; k > b; ++b)
                f[b] = +m.call(this, r[b], b);
            else
              for (b = 0; k > b; ++b)
                f[b] = m;
            if (g = [], 'function' == typeof n)
              for (b = 0; i > b; ++b)
                g[b] = +n.call(this, q[b], b);
            else
              for (b = 0; i > b; ++b)
                g[b] = n;
            return h.resume();
          }, h.resume = function () {
            return h.alpha(0.1);
          }, h.stop = function () {
            return h.alpha(0);
          }, h.drag = function () {
            return c || (c = Sg.behavior.drag().origin(pb).on('dragstart.force', ge).on('drag.force', b).on('dragend.force', he)), arguments.length ? (this.on('mouseover.force', ie).on('mouseout.force', je).call(c), void 0) : c;
          }, Sg.rebind(h, i, 'on');
        };
        var bj = 20, cj = 1;
        Sg.layout.hierarchy = function () {
          function a(b, g, h) {
            var i = e.call(c, b, g);
            if (b.depth = g, h.push(b), i && (j = i.length)) {
              for (var j, k, l = -1, m = b.children = new Array(j), n = 0, o = g + 1; ++l < j;)
                k = m[l] = a(i[l], o, h), k.parent = b, n += k.value;
              d && m.sort(d), f && (b.value = n);
            } else
              delete b.children, f && (b.value = +f.call(c, b, g) || 0);
            return b;
          }
          function b(a, d) {
            var e = a.children, g = 0;
            if (e && (h = e.length))
              for (var h, i = -1, j = d + 1; ++i < h;)
                g += b(e[i], j);
            else
              f && (g = +f.call(c, a, d) || 0);
            return f && (a.value = g), g;
          }
          function c(b) {
            var c = [];
            return a(b, 0, c), c;
          }
          var d = oe, e = me, f = ne;
          return c.sort = function (a) {
            return arguments.length ? (d = a, c) : d;
          }, c.children = function (a) {
            return arguments.length ? (e = a, c) : e;
          }, c.value = function (a) {
            return arguments.length ? (f = a, c) : f;
          }, c.revalue = function (a) {
            return b(a, 0), a;
          }, c;
        }, Sg.layout.partition = function () {
          function a(b, c, d, e) {
            var f = b.children;
            if (b.x = c, b.y = b.depth * e, b.dx = d, b.dy = e, f && (g = f.length)) {
              var g, h, i, j = -1;
              for (d = b.value ? d / b.value : 0; ++j < g;)
                a(h = f[j], c, i = h.value * d, e), c += i;
            }
          }
          function b(a) {
            var c = a.children, d = 0;
            if (c && (e = c.length))
              for (var e, f = -1; ++f < e;)
                d = Math.max(d, b(c[f]));
            return 1 + d;
          }
          function c(c, f) {
            var g = d.call(this, c, f);
            return a(g[0], 0, e[0], e[1] / b(g[0])), g;
          }
          var d = Sg.layout.hierarchy(), e = [
              1,
              1
            ];
          return c.size = function (a) {
            return arguments.length ? (e = a, c) : e;
          }, le(c, d);
        }, Sg.layout.pie = function () {
          function a(f) {
            var g = f.map(function (c, d) {
                return +b.call(a, c, d);
              }), h = +('function' == typeof d ? d.apply(this, arguments) : d), i = (('function' == typeof e ? e.apply(this, arguments) : e) - h) / Sg.sum(g), j = Sg.range(f.length);
            null != c && j.sort(c === dj ? function (a, b) {
              return g[b] - g[a];
            } : function (a, b) {
              return c(f[a], f[b]);
            });
            var k = [];
            return j.forEach(function (a) {
              var b;
              k[a] = {
                data: f[a],
                value: b = g[a],
                startAngle: h,
                endAngle: h += b * i
              };
            }), k;
          }
          var b = Number, c = dj, d = 0, e = xh;
          return a.value = function (c) {
            return arguments.length ? (b = c, a) : b;
          }, a.sort = function (b) {
            return arguments.length ? (c = b, a) : c;
          }, a.startAngle = function (b) {
            return arguments.length ? (d = b, a) : d;
          }, a.endAngle = function (b) {
            return arguments.length ? (e = b, a) : e;
          }, a;
        };
        var dj = {};
        Sg.layout.stack = function () {
          function a(h, i) {
            var j = h.map(function (c, d) {
                return b.call(a, c, d);
              }), k = j.map(function (b) {
                return b.map(function (b, c) {
                  return [
                    f.call(a, b, c),
                    g.call(a, b, c)
                  ];
                });
              }), l = c.call(a, k, i);
            j = Sg.permute(j, l), k = Sg.permute(k, l);
            var m, n, o, p = d.call(a, k, i), q = j.length, r = j[0].length;
            for (n = 0; r > n; ++n)
              for (e.call(a, j[0][n], o = p[n], k[0][n][1]), m = 1; q > m; ++m)
                e.call(a, j[m][n], o += k[m - 1][n][1], k[m][n][1]);
            return h;
          }
          var b = pb, c = te, d = ue, e = se, f = qe, g = re;
          return a.values = function (c) {
            return arguments.length ? (b = c, a) : b;
          }, a.order = function (b) {
            return arguments.length ? (c = 'function' == typeof b ? b : ej.get(b) || te, a) : c;
          }, a.offset = function (b) {
            return arguments.length ? (d = 'function' == typeof b ? b : fj.get(b) || ue, a) : d;
          }, a.x = function (b) {
            return arguments.length ? (f = b, a) : f;
          }, a.y = function (b) {
            return arguments.length ? (g = b, a) : g;
          }, a.out = function (b) {
            return arguments.length ? (e = b, a) : e;
          }, a;
        };
        var ej = Sg.map({
            'inside-out': function (a) {
              var b, c, d = a.length, e = a.map(ve), f = a.map(we), g = Sg.range(d).sort(function (a, b) {
                  return e[a] - e[b];
                }), h = 0, i = 0, j = [], k = [];
              for (b = 0; d > b; ++b)
                c = g[b], i > h ? (h += f[c], j.push(c)) : (i += f[c], k.push(c));
              return k.reverse().concat(j);
            },
            reverse: function (a) {
              return Sg.range(a.length).reverse();
            },
            'default': te
          }), fj = Sg.map({
            silhouette: function (a) {
              var b, c, d, e = a.length, f = a[0].length, g = [], h = 0, i = [];
              for (c = 0; f > c; ++c) {
                for (b = 0, d = 0; e > b; b++)
                  d += a[b][c][1];
                d > h && (h = d), g.push(d);
              }
              for (c = 0; f > c; ++c)
                i[c] = (h - g[c]) / 2;
              return i;
            },
            wiggle: function (a) {
              var b, c, d, e, f, g, h, i, j, k = a.length, l = a[0], m = l.length, n = [];
              for (n[0] = i = j = 0, c = 1; m > c; ++c) {
                for (b = 0, e = 0; k > b; ++b)
                  e += a[b][c][1];
                for (b = 0, f = 0, h = l[c][0] - l[c - 1][0]; k > b; ++b) {
                  for (d = 0, g = (a[b][c][1] - a[b][c - 1][1]) / (2 * h); b > d; ++d)
                    g += (a[d][c][1] - a[d][c - 1][1]) / h;
                  f += g * a[b][c][1];
                }
                n[c] = i -= e ? f / e * h : 0, j > i && (j = i);
              }
              for (c = 0; m > c; ++c)
                n[c] -= j;
              return n;
            },
            expand: function (a) {
              var b, c, d, e = a.length, f = a[0].length, g = 1 / e, h = [];
              for (c = 0; f > c; ++c) {
                for (b = 0, d = 0; e > b; b++)
                  d += a[b][c][1];
                if (d)
                  for (b = 0; e > b; b++)
                    a[b][c][1] /= d;
                else
                  for (b = 0; e > b; b++)
                    a[b][c][1] = g;
              }
              for (c = 0; f > c; ++c)
                h[c] = 0;
              return h;
            },
            zero: ue
          });
        Sg.layout.histogram = function () {
          function a(a, f) {
            for (var g, h, i = [], j = a.map(c, this), k = d.call(this, j, f), l = e.call(this, k, j, f), f = -1, m = j.length, n = l.length - 1, o = b ? 1 : 1 / m; ++f < n;)
              g = i[f] = [], g.dx = l[f + 1] - (g.x = l[f]), g.y = 0;
            if (n > 0)
              for (f = -1; ++f < m;)
                h = j[f], h >= k[0] && h <= k[1] && (g = i[Sg.bisect(l, h, 1, n) - 1], g.y += o, g.push(a[f]));
            return i;
          }
          var b = !0, c = Number, d = Ae, e = ye;
          return a.value = function (b) {
            return arguments.length ? (c = b, a) : c;
          }, a.range = function (b) {
            return arguments.length ? (d = ob(b), a) : d;
          }, a.bins = function (b) {
            return arguments.length ? (e = 'number' == typeof b ? function (a) {
              return ze(a, b);
            } : ob(b), a) : e;
          }, a.frequency = function (c) {
            return arguments.length ? (b = !!c, a) : b;
          }, a;
        }, Sg.layout.tree = function () {
          function a(a, f) {
            function g(a, b) {
              var d = a.children, e = a._tree;
              if (d && (f = d.length)) {
                for (var f, h, j, k = d[0], l = k, m = -1; ++m < f;)
                  j = d[m], g(j, h), l = i(j, h, l), h = j;
                Je(a);
                var n = 0.5 * (k._tree.prelim + j._tree.prelim);
                b ? (e.prelim = b._tree.prelim + c(a, b), e.mod = e.prelim - n) : e.prelim = n;
              } else
                b && (e.prelim = b._tree.prelim + c(a, b));
            }
            function h(a, b) {
              a.x = a._tree.prelim + b;
              var c = a.children;
              if (c && (d = c.length)) {
                var d, e = -1;
                for (b += a._tree.mod; ++e < d;)
                  h(c[e], b);
              }
            }
            function i(a, b, d) {
              if (b) {
                for (var e, f = a, g = a, h = b, i = a.parent.children[0], j = f._tree.mod, k = g._tree.mod, l = h._tree.mod, m = i._tree.mod; h = De(h), f = Ce(f), h && f;)
                  i = Ce(i), g = De(g), g._tree.ancestor = a, e = h._tree.prelim + l - f._tree.prelim - j + c(h, f), e > 0 && (Ke(Le(h, a, d), a, e), j += e, k += e), l += h._tree.mod, j += f._tree.mod, m += i._tree.mod, k += g._tree.mod;
                h && !De(g) && (g._tree.thread = h, g._tree.mod += l - k), f && !Ce(i) && (i._tree.thread = f, i._tree.mod += j - m, d = a);
              }
              return d;
            }
            var j = b.call(this, a, f), k = j[0];
            Ie(k, function (a, b) {
              a._tree = {
                ancestor: a,
                prelim: 0,
                mod: 0,
                change: 0,
                shift: 0,
                number: b ? b._tree.number + 1 : 0
              };
            }), g(k), h(k, -k._tree.prelim);
            var l = Ee(k, Ge), m = Ee(k, Fe), n = Ee(k, He), o = l.x - c(l, m) / 2, p = m.x + c(m, l) / 2, q = n.depth || 1;
            return Ie(k, e ? function (a) {
              a.x *= d[0], a.y = a.depth * d[1], delete a._tree;
            } : function (a) {
              a.x = (a.x - o) / (p - o) * d[0], a.y = a.depth / q * d[1], delete a._tree;
            }), j;
          }
          var b = Sg.layout.hierarchy().sort(null).value(null), c = Be, d = [
              1,
              1
            ], e = !1;
          return a.separation = function (b) {
            return arguments.length ? (c = b, a) : c;
          }, a.size = function (b) {
            return arguments.length ? (e = null == (d = b), a) : e ? null : d;
          }, a.nodeSize = function (b) {
            return arguments.length ? (e = null != (d = b), a) : e ? d : null;
          }, le(a, b);
        }, Sg.layout.pack = function () {
          function a(a, f) {
            var g = c.call(this, a, f), h = g[0], i = e[0], j = e[1], k = null == b ? Math.sqrt : 'function' == typeof b ? b : function () {
                return b;
              };
            if (h.x = h.y = 0, Ie(h, function (a) {
                a.r = +k(a.value);
              }), Ie(h, Qe), d) {
              var l = d * (b ? 1 : Math.max(2 * h.r / i, 2 * h.r / j)) / 2;
              Ie(h, function (a) {
                a.r += l;
              }), Ie(h, Qe), Ie(h, function (a) {
                a.r -= l;
              });
            }
            return Te(h, i / 2, j / 2, b ? 1 : 1 / Math.max(2 * h.r / i, 2 * h.r / j)), g;
          }
          var b, c = Sg.layout.hierarchy().sort(Me), d = 0, e = [
              1,
              1
            ];
          return a.size = function (b) {
            return arguments.length ? (e = b, a) : e;
          }, a.radius = function (c) {
            return arguments.length ? (b = null == c || 'function' == typeof c ? c : +c, a) : b;
          }, a.padding = function (b) {
            return arguments.length ? (d = +b, a) : d;
          }, le(a, c);
        }, Sg.layout.cluster = function () {
          function a(a, f) {
            var g, h = b.call(this, a, f), i = h[0], j = 0;
            Ie(i, function (a) {
              var b = a.children;
              b && b.length ? (a.x = We(b), a.y = Ve(b)) : (a.x = g ? j += c(a, g) : 0, a.y = 0, g = a);
            });
            var k = Xe(i), l = Ye(i), m = k.x - c(k, l) / 2, n = l.x + c(l, k) / 2;
            return Ie(i, e ? function (a) {
              a.x = (a.x - i.x) * d[0], a.y = (i.y - a.y) * d[1];
            } : function (a) {
              a.x = (a.x - m) / (n - m) * d[0], a.y = (1 - (i.y ? a.y / i.y : 1)) * d[1];
            }), h;
          }
          var b = Sg.layout.hierarchy().sort(null).value(null), c = Be, d = [
              1,
              1
            ], e = !1;
          return a.separation = function (b) {
            return arguments.length ? (c = b, a) : c;
          }, a.size = function (b) {
            return arguments.length ? (e = null == (d = b), a) : e ? null : d;
          }, a.nodeSize = function (b) {
            return arguments.length ? (e = null != (d = b), a) : e ? d : null;
          }, le(a, b);
        }, Sg.layout.treemap = function () {
          function a(a, b) {
            for (var c, d, e = -1, f = a.length; ++e < f;)
              d = (c = a[e]).value * (0 > b ? 0 : b), c.area = isNaN(d) || 0 >= d ? 0 : d;
          }
          function b(c) {
            var f = c.children;
            if (f && f.length) {
              var g, h, i, j = l(c), k = [], m = f.slice(), o = 1 / 0, p = 'slice' === n ? j.dx : 'dice' === n ? j.dy : 'slice-dice' === n ? 1 & c.depth ? j.dy : j.dx : Math.min(j.dx, j.dy);
              for (a(m, j.dx * j.dy / c.value), k.area = 0; (i = m.length) > 0;)
                k.push(g = m[i - 1]), k.area += g.area, 'squarify' !== n || (h = d(k, p)) <= o ? (m.pop(), o = h) : (k.area -= k.pop().area, e(k, p, j, !1), p = Math.min(j.dx, j.dy), k.length = k.area = 0, o = 1 / 0);
              k.length && (e(k, p, j, !0), k.length = k.area = 0), f.forEach(b);
            }
          }
          function c(b) {
            var d = b.children;
            if (d && d.length) {
              var f, g = l(b), h = d.slice(), i = [];
              for (a(h, g.dx * g.dy / b.value), i.area = 0; f = h.pop();)
                i.push(f), i.area += f.area, null != f.z && (e(i, f.z ? g.dx : g.dy, g, !h.length), i.length = i.area = 0);
              d.forEach(c);
            }
          }
          function d(a, b) {
            for (var c, d = a.area, e = 0, f = 1 / 0, g = -1, h = a.length; ++g < h;)
              (c = a[g].area) && (f > c && (f = c), c > e && (e = c));
            return d *= d, b *= b, d ? Math.max(b * e * o / d, d / (b * f * o)) : 1 / 0;
          }
          function e(a, b, c, d) {
            var e, f = -1, g = a.length, h = c.x, j = c.y, k = b ? i(a.area / b) : 0;
            if (b == c.dx) {
              for ((d || k > c.dy) && (k = c.dy); ++f < g;)
                e = a[f], e.x = h, e.y = j, e.dy = k, h += e.dx = Math.min(c.x + c.dx - h, k ? i(e.area / k) : 0);
              e.z = !0, e.dx += c.x + c.dx - h, c.y += k, c.dy -= k;
            } else {
              for ((d || k > c.dx) && (k = c.dx); ++f < g;)
                e = a[f], e.x = h, e.y = j, e.dx = k, j += e.dy = Math.min(c.y + c.dy - j, k ? i(e.area / k) : 0);
              e.z = !1, e.dy += c.y + c.dy - j, c.x += k, c.dx -= k;
            }
          }
          function f(d) {
            var e = g || h(d), f = e[0];
            return f.x = 0, f.y = 0, f.dx = j[0], f.dy = j[1], g && h.revalue(f), a([f], f.dx * f.dy / f.value), (g ? c : b)(f), m && (g = e), e;
          }
          var g, h = Sg.layout.hierarchy(), i = Math.round, j = [
              1,
              1
            ], k = null, l = Ze, m = !1, n = 'squarify', o = 0.5 * (1 + Math.sqrt(5));
          return f.size = function (a) {
            return arguments.length ? (j = a, f) : j;
          }, f.padding = function (a) {
            function b(b) {
              var c = a.call(f, b, b.depth);
              return null == c ? Ze(b) : $e(b, 'number' == typeof c ? [
                c,
                c,
                c,
                c
              ] : c);
            }
            function c(b) {
              return $e(b, a);
            }
            if (!arguments.length)
              return k;
            var d;
            return l = null == (k = a) ? Ze : 'function' == (d = typeof a) ? b : 'number' === d ? (a = [
              a,
              a,
              a,
              a
            ], c) : c, f;
          }, f.round = function (a) {
            return arguments.length ? (i = a ? Math.round : Number, f) : i != Number;
          }, f.sticky = function (a) {
            return arguments.length ? (m = a, g = null, f) : m;
          }, f.ratio = function (a) {
            return arguments.length ? (o = a, f) : o;
          }, f.mode = function (a) {
            return arguments.length ? (n = a + '', f) : n;
          }, le(f, h);
        }, Sg.random = {
          normal: function (a, b) {
            var c = arguments.length;
            return 2 > c && (b = 1), 1 > c && (a = 0), function () {
              var c, d, e;
              do
                c = 2 * Math.random() - 1, d = 2 * Math.random() - 1, e = c * c + d * d;
              while (!e || e > 1);
              return a + b * c * Math.sqrt(-2 * Math.log(e) / e);
            };
          },
          logNormal: function () {
            var a = Sg.random.normal.apply(Sg, arguments);
            return function () {
              return Math.exp(a());
            };
          },
          irwinHall: function (a) {
            return function () {
              for (var b = 0, c = 0; a > c; c++)
                b += Math.random();
              return b / a;
            };
          }
        }, Sg.scale = {};
        var gj = {
            floor: pb,
            ceil: pb
          };
        Sg.scale.linear = function () {
          return ff([
            0,
            1
          ], [
            0,
            1
          ], Fd, !1);
        }, Sg.scale.log = function () {
          return mf(Sg.scale.linear().domain([
            0,
            1
          ]), 10, !0, [
            1,
            10
          ]);
        };
        var hj = Sg.format('.0e'), ij = {
            floor: function (a) {
              return -Math.ceil(-a);
            },
            ceil: function (a) {
              return -Math.floor(-a);
            }
          };
        Sg.scale.pow = function () {
          return nf(Sg.scale.linear(), 1, [
            0,
            1
          ]);
        }, Sg.scale.sqrt = function () {
          return Sg.scale.pow().exponent(0.5);
        }, Sg.scale.ordinal = function () {
          return pf([], {
            t: 'range',
            a: [[]]
          });
        }, Sg.scale.category10 = function () {
          return Sg.scale.ordinal().range(jj);
        }, Sg.scale.category20 = function () {
          return Sg.scale.ordinal().range(kj);
        }, Sg.scale.category20b = function () {
          return Sg.scale.ordinal().range(lj);
        }, Sg.scale.category20c = function () {
          return Sg.scale.ordinal().range(mj);
        };
        var jj = [
            2062260,
            16744206,
            2924588,
            14034728,
            9725885,
            9197131,
            14907330,
            8355711,
            12369186,
            1556175
          ].map(fb), kj = [
            2062260,
            11454440,
            16744206,
            16759672,
            2924588,
            10018698,
            14034728,
            16750742,
            9725885,
            12955861,
            9197131,
            12885140,
            14907330,
            16234194,
            8355711,
            13092807,
            12369186,
            14408589,
            1556175,
            10410725
          ].map(fb), lj = [
            3750777,
            5395619,
            7040719,
            10264286,
            6519097,
            9216594,
            11915115,
            13556636,
            9202993,
            12426809,
            15186514,
            15190932,
            8666169,
            11356490,
            14049643,
            15177372,
            8077683,
            10834324,
            13528509,
            14589654
          ].map(fb), mj = [
            3244733,
            7057110,
            10406625,
            13032431,
            15095053,
            16616764,
            16625259,
            16634018,
            3253076,
            7652470,
            10607003,
            13101504,
            7695281,
            10394312,
            12369372,
            14342891,
            6513507,
            9868950,
            12434877,
            14277081
          ].map(fb);
        Sg.scale.quantile = function () {
          return qf([], []);
        }, Sg.scale.quantize = function () {
          return rf(0, 1, [
            0,
            1
          ]);
        }, Sg.scale.threshold = function () {
          return sf([0.5], [
            0,
            1
          ]);
        }, Sg.scale.identity = function () {
          return tf([
            0,
            1
          ]);
        }, Sg.svg = {}, Sg.svg.arc = function () {
          function a() {
            var a = b.apply(this, arguments), f = c.apply(this, arguments), g = d.apply(this, arguments) + nj, h = e.apply(this, arguments) + nj, i = (g > h && (i = g, g = h, h = i), h - g), j = wh > i ? '0' : '1', k = Math.cos(g), l = Math.sin(g), m = Math.cos(h), n = Math.sin(h);
            return i >= oj ? a ? 'M0,' + f + 'A' + f + ',' + f + ' 0 1,1 0,' + -f + 'A' + f + ',' + f + ' 0 1,1 0,' + f + 'M0,' + a + 'A' + a + ',' + a + ' 0 1,0 0,' + -a + 'A' + a + ',' + a + ' 0 1,0 0,' + a + 'Z' : 'M0,' + f + 'A' + f + ',' + f + ' 0 1,1 0,' + -f + 'A' + f + ',' + f + ' 0 1,1 0,' + f + 'Z' : a ? 'M' + f * k + ',' + f * l + 'A' + f + ',' + f + ' 0 ' + j + ',1 ' + f * m + ',' + f * n + 'L' + a * m + ',' + a * n + 'A' + a + ',' + a + ' 0 ' + j + ',0 ' + a * k + ',' + a * l + 'Z' : 'M' + f * k + ',' + f * l + 'A' + f + ',' + f + ' 0 ' + j + ',1 ' + f * m + ',' + f * n + 'L0,0' + 'Z';
          }
          var b = uf, c = vf, d = wf, e = xf;
          return a.innerRadius = function (c) {
            return arguments.length ? (b = ob(c), a) : b;
          }, a.outerRadius = function (b) {
            return arguments.length ? (c = ob(b), a) : c;
          }, a.startAngle = function (b) {
            return arguments.length ? (d = ob(b), a) : d;
          }, a.endAngle = function (b) {
            return arguments.length ? (e = ob(b), a) : e;
          }, a.centroid = function () {
            var a = (b.apply(this, arguments) + c.apply(this, arguments)) / 2, f = (d.apply(this, arguments) + e.apply(this, arguments)) / 2 + nj;
            return [
              Math.cos(f) * a,
              Math.sin(f) * a
            ];
          }, a;
        };
        var nj = -yh, oj = xh - zh;
        Sg.svg.line = function () {
          return yf(pb);
        };
        var pj = Sg.map({
            linear: zf,
            'linear-closed': Af,
            step: Bf,
            'step-before': Cf,
            'step-after': Df,
            basis: Jf,
            'basis-open': Kf,
            'basis-closed': Lf,
            bundle: Mf,
            cardinal: Gf,
            'cardinal-open': Ef,
            'cardinal-closed': Ff,
            monotone: Sf
          });
        pj.forEach(function (a, b) {
          b.key = a, b.closed = /-closed$/.test(a);
        });
        var qj = [
            0,
            2 / 3,
            1 / 3,
            0
          ], rj = [
            0,
            1 / 3,
            2 / 3,
            0
          ], sj = [
            0,
            1 / 6,
            2 / 3,
            1 / 6
          ];
        Sg.svg.line.radial = function () {
          var a = yf(Tf);
          return a.radius = a.x, delete a.x, a.angle = a.y, delete a.y, a;
        }, Cf.reverse = Df, Df.reverse = Cf, Sg.svg.area = function () {
          return Uf(pb);
        }, Sg.svg.area.radial = function () {
          var a = Uf(Tf);
          return a.radius = a.x, delete a.x, a.innerRadius = a.x0, delete a.x0, a.outerRadius = a.x1, delete a.x1, a.angle = a.y, delete a.y, a.startAngle = a.y0, delete a.y0, a.endAngle = a.y1, delete a.y1, a;
        }, Sg.svg.chord = function () {
          function a(a, h) {
            var i = b(this, f, a, h), j = b(this, g, a, h);
            return 'M' + i.p0 + d(i.r, i.p1, i.a1 - i.a0) + (c(i, j) ? e(i.r, i.p1, i.r, i.p0) : e(i.r, i.p1, j.r, j.p0) + d(j.r, j.p1, j.a1 - j.a0) + e(j.r, j.p1, i.r, i.p0)) + 'Z';
          }
          function b(a, b, c, d) {
            var e = b.call(a, c, d), f = h.call(a, e, d), g = i.call(a, e, d) + nj, k = j.call(a, e, d) + nj;
            return {
              r: f,
              a0: g,
              a1: k,
              p0: [
                f * Math.cos(g),
                f * Math.sin(g)
              ],
              p1: [
                f * Math.cos(k),
                f * Math.sin(k)
              ]
            };
          }
          function c(a, b) {
            return a.a0 == b.a0 && a.a1 == b.a1;
          }
          function d(a, b, c) {
            return 'A' + a + ',' + a + ' 0 ' + +(c > wh) + ',1 ' + b;
          }
          function e(a, b, c, d) {
            return 'Q 0,0 ' + d;
          }
          var f = Hc, g = Ic, h = Vf, i = wf, j = xf;
          return a.radius = function (b) {
            return arguments.length ? (h = ob(b), a) : h;
          }, a.source = function (b) {
            return arguments.length ? (f = ob(b), a) : f;
          }, a.target = function (b) {
            return arguments.length ? (g = ob(b), a) : g;
          }, a.startAngle = function (b) {
            return arguments.length ? (i = ob(b), a) : i;
          }, a.endAngle = function (b) {
            return arguments.length ? (j = ob(b), a) : j;
          }, a;
        }, Sg.svg.diagonal = function () {
          function a(a, e) {
            var f = b.call(this, a, e), g = c.call(this, a, e), h = (f.y + g.y) / 2, i = [
                f,
                {
                  x: f.x,
                  y: h
                },
                {
                  x: g.x,
                  y: h
                },
                g
              ];
            return i = i.map(d), 'M' + i[0] + 'C' + i[1] + ' ' + i[2] + ' ' + i[3];
          }
          var b = Hc, c = Ic, d = Wf;
          return a.source = function (c) {
            return arguments.length ? (b = ob(c), a) : b;
          }, a.target = function (b) {
            return arguments.length ? (c = ob(b), a) : c;
          }, a.projection = function (b) {
            return arguments.length ? (d = b, a) : d;
          }, a;
        }, Sg.svg.diagonal.radial = function () {
          var a = Sg.svg.diagonal(), b = Wf, c = a.projection;
          return a.projection = function (a) {
            return arguments.length ? c(Xf(b = a)) : b;
          }, a;
        }, Sg.svg.symbol = function () {
          function a(a, d) {
            return (tj.get(b.call(this, a, d)) || $f)(c.call(this, a, d));
          }
          var b = Zf, c = Yf;
          return a.type = function (c) {
            return arguments.length ? (b = ob(c), a) : b;
          }, a.size = function (b) {
            return arguments.length ? (c = ob(b), a) : c;
          }, a;
        };
        var tj = Sg.map({
            circle: $f,
            cross: function (a) {
              var b = Math.sqrt(a / 5) / 2;
              return 'M' + -3 * b + ',' + -b + 'H' + -b + 'V' + -3 * b + 'H' + b + 'V' + -b + 'H' + 3 * b + 'V' + b + 'H' + b + 'V' + 3 * b + 'H' + -b + 'V' + b + 'H' + -3 * b + 'Z';
            },
            diamond: function (a) {
              var b = Math.sqrt(a / (2 * xj)), c = b * xj;
              return 'M0,' + -b + 'L' + c + ',0' + ' 0,' + b + ' ' + -c + ',0' + 'Z';
            },
            square: function (a) {
              var b = Math.sqrt(a) / 2;
              return 'M' + -b + ',' + -b + 'L' + b + ',' + -b + ' ' + b + ',' + b + ' ' + -b + ',' + b + 'Z';
            },
            'triangle-down': function (a) {
              var b = Math.sqrt(a / wj), c = b * wj / 2;
              return 'M0,' + c + 'L' + b + ',' + -c + ' ' + -b + ',' + -c + 'Z';
            },
            'triangle-up': function (a) {
              var b = Math.sqrt(a / wj), c = b * wj / 2;
              return 'M0,' + -c + 'L' + b + ',' + c + ' ' + -b + ',' + c + 'Z';
            }
          });
        Sg.svg.symbolTypes = tj.keys();
        var uj, vj, wj = Math.sqrt(3), xj = Math.tan(30 * Bh), yj = [], zj = 0;
        yj.call = oh.call, yj.empty = oh.empty, yj.node = oh.node, yj.size = oh.size, Sg.transition = function (a) {
          return arguments.length ? uj ? a.transition() : a : rh.transition();
        }, Sg.transition.prototype = yj, yj.select = function (a) {
          var b, c, d, e = this.id, f = [];
          a = p(a);
          for (var g = -1, h = this.length; ++g < h;) {
            f.push(b = []);
            for (var i = this[g], j = -1, k = i.length; ++j < k;)
              (d = i[j]) && (c = a.call(d, d.__data__, j, g)) ? ('__data__' in d && (c.__data__ = d.__data__), cg(c, j, e, d.__transition__[e]), b.push(c)) : b.push(null);
          }
          return _f(f, e);
        }, yj.selectAll = function (a) {
          var b, c, d, e, f, g = this.id, h = [];
          a = q(a);
          for (var i = -1, j = this.length; ++i < j;)
            for (var k = this[i], l = -1, m = k.length; ++l < m;)
              if (d = k[l]) {
                f = d.__transition__[g], c = a.call(d, d.__data__, l, i), h.push(b = []);
                for (var n = -1, o = c.length; ++n < o;)
                  (e = c[n]) && cg(e, n, g, f), b.push(e);
              }
          return _f(h, g);
        }, yj.filter = function (a) {
          var b, c, d, e = [];
          'function' != typeof a && (a = A(a));
          for (var f = 0, g = this.length; g > f; f++) {
            e.push(b = []);
            for (var c = this[f], h = 0, i = c.length; i > h; h++)
              (d = c[h]) && a.call(d, d.__data__, h) && b.push(d);
          }
          return _f(e, this.id);
        }, yj.tween = function (a, b) {
          var c = this.id;
          return arguments.length < 2 ? this.node().__transition__[c].tween.get(a) : C(this, null == b ? function (b) {
            b.__transition__[c].tween.remove(a);
          } : function (d) {
            d.__transition__[c].tween.set(a, b);
          });
        }, yj.attr = function (a, b) {
          function c() {
            this.removeAttribute(h);
          }
          function d() {
            this.removeAttributeNS(h.space, h.local);
          }
          function e(a) {
            return null == a ? c : (a += '', function () {
              var b, c = this.getAttribute(h);
              return c !== a && (b = g(c, a), function (a) {
                this.setAttribute(h, b(a));
              });
            });
          }
          function f(a) {
            return null == a ? d : (a += '', function () {
              var b, c = this.getAttributeNS(h.space, h.local);
              return c !== a && (b = g(c, a), function (a) {
                this.setAttributeNS(h.space, h.local, b(a));
              });
            });
          }
          if (arguments.length < 2) {
            for (b in a)
              this.attr(b, a[b]);
            return this;
          }
          var g = 'transform' == a ? ae : Fd, h = Sg.ns.qualify(a);
          return ag(this, 'attr.' + a, b, h.local ? f : e);
        }, yj.attrTween = function (a, b) {
          function c(a, c) {
            var d = b.call(this, a, c, this.getAttribute(e));
            return d && function (a) {
              this.setAttribute(e, d(a));
            };
          }
          function d(a, c) {
            var d = b.call(this, a, c, this.getAttributeNS(e.space, e.local));
            return d && function (a) {
              this.setAttributeNS(e.space, e.local, d(a));
            };
          }
          var e = Sg.ns.qualify(a);
          return this.tween('attr.' + a, e.local ? d : c);
        }, yj.style = function (a, b, c) {
          function d() {
            this.style.removeProperty(a);
          }
          function e(b) {
            return null == b ? d : (b += '', function () {
              var d, e = Xg.getComputedStyle(this, null).getPropertyValue(a);
              return e !== b && (d = Fd(e, b), function (b) {
                this.style.setProperty(a, d(b), c);
              });
            });
          }
          var f = arguments.length;
          if (3 > f) {
            if ('string' != typeof a) {
              2 > f && (b = '');
              for (c in a)
                this.style(c, a[c], b);
              return this;
            }
            c = '';
          }
          return ag(this, 'style.' + a, b, e);
        }, yj.styleTween = function (a, b, c) {
          function d(d, e) {
            var f = b.call(this, d, e, Xg.getComputedStyle(this, null).getPropertyValue(a));
            return f && function (b) {
              this.style.setProperty(a, f(b), c);
            };
          }
          return arguments.length < 3 && (c = ''), this.tween('style.' + a, d);
        }, yj.text = function (a) {
          return ag(this, 'text', a, bg);
        }, yj.remove = function () {
          return this.each('end.transition', function () {
            var a;
            this.__transition__.count < 2 && (a = this.parentNode) && a.removeChild(this);
          });
        }, yj.ease = function (a) {
          var b = this.id;
          return arguments.length < 1 ? this.node().__transition__[b].ease : ('function' != typeof a && (a = Sg.ease.apply(Sg, arguments)), C(this, function (c) {
            c.__transition__[b].ease = a;
          }));
        }, yj.delay = function (a) {
          var b = this.id;
          return C(this, 'function' == typeof a ? function (c, d, e) {
            c.__transition__[b].delay = +a.call(c, c.__data__, d, e);
          } : (a = +a, function (c) {
            c.__transition__[b].delay = a;
          }));
        }, yj.duration = function (a) {
          var b = this.id;
          return C(this, 'function' == typeof a ? function (c, d, e) {
            c.__transition__[b].duration = Math.max(1, a.call(c, c.__data__, d, e));
          } : (a = Math.max(1, a), function (c) {
            c.__transition__[b].duration = a;
          }));
        }, yj.each = function (a, b) {
          var c = this.id;
          if (arguments.length < 2) {
            var d = vj, e = uj;
            uj = c, C(this, function (b, d, e) {
              vj = b.__transition__[c], a.call(b, b.__data__, d, e);
            }), vj = d, uj = e;
          } else
            C(this, function (d) {
              var e = d.__transition__[c];
              (e.event || (e.event = Sg.dispatch('start', 'end'))).on(a, b);
            });
          return this;
        }, yj.transition = function () {
          for (var a, b, c, d, e = this.id, f = ++zj, g = [], h = 0, i = this.length; i > h; h++) {
            g.push(a = []);
            for (var b = this[h], j = 0, k = b.length; k > j; j++)
              (c = b[j]) && (d = Object.create(c.__transition__[e]), d.delay += d.duration, cg(c, j, f, d)), a.push(c);
          }
          return _f(g, f);
        }, Sg.svg.axis = function () {
          function a(a) {
            a.each(function () {
              var a, j = Sg.select(this), k = this.__chart__ || c, l = this.__chart__ = c.copy(), m = null == i ? l.ticks ? l.ticks.apply(l, h) : l.domain() : i, n = null == b ? l.tickFormat ? l.tickFormat.apply(l, h) : pb : b, o = j.selectAll('.tick').data(m, l), p = o.enter().insert('g', '.domain').attr('class', 'tick').style('opacity', zh), q = Sg.transition(o.exit()).style('opacity', zh).remove(), r = Sg.transition(o).style('opacity', 1), s = af(l), t = j.selectAll('.domain').data([0]), u = (t.enter().append('path').attr('class', 'domain'), Sg.transition(t));
              p.append('line'), p.append('text');
              var v = p.select('line'), w = r.select('line'), x = o.select('text').text(n), y = p.select('text'), z = r.select('text');
              switch (d) {
              case 'bottom':
                a = dg, v.attr('y2', e), y.attr('y', Math.max(e, 0) + g), w.attr('x2', 0).attr('y2', e), z.attr('x', 0).attr('y', Math.max(e, 0) + g), x.attr('dy', '.71em').style('text-anchor', 'middle'), u.attr('d', 'M' + s[0] + ',' + f + 'V0H' + s[1] + 'V' + f);
                break;
              case 'top':
                a = dg, v.attr('y2', -e), y.attr('y', -(Math.max(e, 0) + g)), w.attr('x2', 0).attr('y2', -e), z.attr('x', 0).attr('y', -(Math.max(e, 0) + g)), x.attr('dy', '0em').style('text-anchor', 'middle'), u.attr('d', 'M' + s[0] + ',' + -f + 'V0H' + s[1] + 'V' + -f);
                break;
              case 'left':
                a = eg, v.attr('x2', -e), y.attr('x', -(Math.max(e, 0) + g)), w.attr('x2', -e).attr('y2', 0), z.attr('x', -(Math.max(e, 0) + g)).attr('y', 0), x.attr('dy', '.32em').style('text-anchor', 'end'), u.attr('d', 'M' + -f + ',' + s[0] + 'H0V' + s[1] + 'H' + -f);
                break;
              case 'right':
                a = eg, v.attr('x2', e), y.attr('x', Math.max(e, 0) + g), w.attr('x2', e).attr('y2', 0), z.attr('x', Math.max(e, 0) + g).attr('y', 0), x.attr('dy', '.32em').style('text-anchor', 'start'), u.attr('d', 'M' + f + ',' + s[0] + 'H0V' + s[1] + 'H' + f);
              }
              if (l.rangeBand) {
                var A = l.rangeBand() / 2, B = function (a) {
                    return l(a) + A;
                  };
                p.call(a, B), r.call(a, B);
              } else
                p.call(a, k), r.call(a, l), q.call(a, l);
            });
          }
          var b, c = Sg.scale.linear(), d = Aj, e = 6, f = 6, g = 3, h = [10], i = null;
          return a.scale = function (b) {
            return arguments.length ? (c = b, a) : c;
          }, a.orient = function (b) {
            return arguments.length ? (d = b in Bj ? b + '' : Aj, a) : d;
          }, a.ticks = function () {
            return arguments.length ? (h = arguments, a) : h;
          }, a.tickValues = function (b) {
            return arguments.length ? (i = b, a) : i;
          }, a.tickFormat = function (c) {
            return arguments.length ? (b = c, a) : b;
          }, a.tickSize = function (b) {
            var c = arguments.length;
            return c ? (e = +b, f = +arguments[c - 1], a) : e;
          }, a.innerTickSize = function (b) {
            return arguments.length ? (e = +b, a) : e;
          }, a.outerTickSize = function (b) {
            return arguments.length ? (f = +b, a) : f;
          }, a.tickPadding = function (b) {
            return arguments.length ? (g = +b, a) : g;
          }, a.tickSubdivide = function () {
            return arguments.length && a;
          }, a;
        };
        var Aj = 'bottom', Bj = {
            top: 1,
            right: 1,
            bottom: 1,
            left: 1
          };
        Sg.svg.brush = function () {
          function a(f) {
            f.each(function () {
              var f = Sg.select(this).style('pointer-events', 'all').style('-webkit-tap-highlight-color', 'rgba(0,0,0,0)').on('mousedown.brush', e).on('touchstart.brush', e), g = f.selectAll('.background').data([0]);
              g.enter().append('rect').attr('class', 'background').style('visibility', 'hidden').style('cursor', 'crosshair'), f.selectAll('.extent').data([0]).enter().append('rect').attr('class', 'extent').style('cursor', 'move');
              var h = f.selectAll('.resize').data(q, pb);
              h.exit().remove(), h.enter().append('g').attr('class', function (a) {
                return 'resize ' + a;
              }).style('cursor', function (a) {
                return Cj[a];
              }).append('rect').attr('x', function (a) {
                return /[ew]$/.test(a) ? -3 : null;
              }).attr('y', function (a) {
                return /^[ns]/.test(a) ? -3 : null;
              }).attr('width', 6).attr('height', 6).style('visibility', 'hidden'), h.style('display', a.empty() ? 'none' : null);
              var k, l = Sg.transition(f), m = Sg.transition(g);
              i && (k = af(i), m.attr('x', k[0]).attr('width', k[1] - k[0]), c(l)), j && (k = af(j), m.attr('y', k[0]).attr('height', k[1] - k[0]), d(l)), b(l);
            });
          }
          function b(a) {
            a.selectAll('.resize').attr('transform', function (a) {
              return 'translate(' + k[+/e$/.test(a)] + ',' + m[+/^s/.test(a)] + ')';
            });
          }
          function c(a) {
            a.select('.extent').attr('x', k[0]), a.selectAll('.extent,.n>rect,.s>rect').attr('width', k[1] - k[0]);
          }
          function d(a) {
            a.select('.extent').attr('y', m[0]), a.selectAll('.extent,.e>rect,.w>rect').attr('height', m[1] - m[0]);
          }
          function e() {
            function e() {
              32 == Sg.event.keyCode && (C || (t = null, E[0] -= k[1], E[1] -= m[1], C = 2), l());
            }
            function n() {
              32 == Sg.event.keyCode && 2 == C && (E[0] += k[1], E[1] += m[1], C = 0, l());
            }
            function q() {
              var a = Sg.mouse(v), e = !1;
              u && (a[0] += u[0], a[1] += u[1]), C || (Sg.event.altKey ? (t || (t = [
                (k[0] + k[1]) / 2,
                (m[0] + m[1]) / 2
              ]), E[0] = k[+(a[0] < t[0])], E[1] = m[+(a[1] < t[1])]) : t = null), A && r(a, i, 0) && (c(y), e = !0), B && r(a, j, 1) && (d(y), e = !0), e && (b(y), x({
                type: 'brush',
                mode: C ? 'move' : 'resize'
              }));
            }
            function r(a, b, c) {
              var d, e, h = af(b), i = h[0], j = h[1], l = E[c], n = c ? m : k, q = n[1] - n[0];
              return C && (i -= l, j -= q + l), d = (c ? p : o) ? Math.max(i, Math.min(j, a[c])) : a[c], C ? e = (d += l) + q : (t && (l = Math.max(i, Math.min(j, 2 * t[c] - d))), d > l ? (e = d, d = l) : e = l), n[0] != d || n[1] != e ? (c ? g = null : f = null, n[0] = d, n[1] = e, !0) : void 0;
            }
            function s() {
              q(), y.style('pointer-events', 'all').selectAll('.resize').style('display', a.empty() ? 'none' : null), Sg.select('body').style('cursor', null), F.on('mousemove.brush', null).on('mouseup.brush', null).on('touchmove.brush', null).on('touchend.brush', null).on('keydown.brush', null).on('keyup.brush', null), D(), x({ type: 'brushend' });
            }
            var t, u, v = this, w = Sg.select(Sg.event.target), x = h.of(v, arguments), y = Sg.select(v), z = w.datum(), A = !/^(n|s)$/.test(z) && i, B = !/^(e|w)$/.test(z) && j, C = w.classed('extent'), D = J(), E = Sg.mouse(v), F = Sg.select(Xg).on('keydown.brush', e).on('keyup.brush', n);
            if (Sg.event.changedTouches ? F.on('touchmove.brush', q).on('touchend.brush', s) : F.on('mousemove.brush', q).on('mouseup.brush', s), y.interrupt().selectAll('*').interrupt(), C)
              E[0] = k[0] - E[0], E[1] = m[0] - E[1];
            else if (z) {
              var G = +/w$/.test(z), H = +/^n/.test(z);
              u = [
                k[1 - G] - E[0],
                m[1 - H] - E[1]
              ], E[0] = k[G], E[1] = m[H];
            } else
              Sg.event.altKey && (t = E.slice());
            y.style('pointer-events', 'none').selectAll('.resize').style('display', null), Sg.select('body').style('cursor', w.style('cursor')), x({ type: 'brushstart' }), q();
          }
          var f, g, h = n(a, 'brushstart', 'brush', 'brushend'), i = null, j = null, k = [
              0,
              0
            ], m = [
              0,
              0
            ], o = !0, p = !0, q = Dj[0];
          return a.event = function (a) {
            a.each(function () {
              var a = h.of(this, arguments), b = {
                  x: k,
                  y: m,
                  i: f,
                  j: g
                }, c = this.__chart__ || b;
              this.__chart__ = b, uj ? Sg.select(this).transition().each('start.brush', function () {
                f = c.i, g = c.j, k = c.x, m = c.y, a({ type: 'brushstart' });
              }).tween('brush:brush', function () {
                var c = Gd(k, b.x), d = Gd(m, b.y);
                return f = g = null, function (e) {
                  k = b.x = c(e), m = b.y = d(e), a({
                    type: 'brush',
                    mode: 'resize'
                  });
                };
              }).each('end.brush', function () {
                f = b.i, g = b.j, a({
                  type: 'brush',
                  mode: 'resize'
                }), a({ type: 'brushend' });
              }) : (a({ type: 'brushstart' }), a({
                type: 'brush',
                mode: 'resize'
              }), a({ type: 'brushend' }));
            });
          }, a.x = function (b) {
            return arguments.length ? (i = b, q = Dj[!i << 1 | !j], a) : i;
          }, a.y = function (b) {
            return arguments.length ? (j = b, q = Dj[!i << 1 | !j], a) : j;
          }, a.clamp = function (b) {
            return arguments.length ? (i && j ? (o = !!b[0], p = !!b[1]) : i ? o = !!b : j && (p = !!b), a) : i && j ? [
              o,
              p
            ] : i ? o : j ? p : null;
          }, a.extent = function (b) {
            var c, d, e, h, l;
            return arguments.length ? (i && (c = b[0], d = b[1], j && (c = c[0], d = d[0]), f = [
              c,
              d
            ], i.invert && (c = i(c), d = i(d)), c > d && (l = c, c = d, d = l), (c != k[0] || d != k[1]) && (k = [
              c,
              d
            ])), j && (e = b[0], h = b[1], i && (e = e[1], h = h[1]), g = [
              e,
              h
            ], j.invert && (e = j(e), h = j(h)), e > h && (l = e, e = h, h = l), (e != m[0] || h != m[1]) && (m = [
              e,
              h
            ])), a) : (i && (f ? (c = f[0], d = f[1]) : (c = k[0], d = k[1], i.invert && (c = i.invert(c), d = i.invert(d)), c > d && (l = c, c = d, d = l))), j && (g ? (e = g[0], h = g[1]) : (e = m[0], h = m[1], j.invert && (e = j.invert(e), h = j.invert(h)), e > h && (l = e, e = h, h = l))), i && j ? [
              [
                c,
                e
              ],
              [
                d,
                h
              ]
            ] : i ? [
              c,
              d
            ] : j && [
              e,
              h
            ]);
          }, a.clear = function () {
            return a.empty() || (k = [
              0,
              0
            ], m = [
              0,
              0
            ], f = g = null), a;
          }, a.empty = function () {
            return !!i && k[0] == k[1] || !!j && m[0] == m[1];
          }, Sg.rebind(a, h, 'on');
        };
        var Cj = {
            n: 'ns-resize',
            e: 'ew-resize',
            s: 'ns-resize',
            w: 'ew-resize',
            nw: 'nwse-resize',
            ne: 'nesw-resize',
            se: 'nwse-resize',
            sw: 'nesw-resize'
          }, Dj = [
            [
              'n',
              'e',
              's',
              'w',
              'nw',
              'ne',
              'se',
              'sw'
            ],
            [
              'e',
              'w'
            ],
            [
              'n',
              's'
            ],
            []
          ], Ej = Sg.time = {}, Fj = Date, Gj = [
            'Sunday',
            'Monday',
            'Tuesday',
            'Wednesday',
            'Thursday',
            'Friday',
            'Saturday'
          ];
        fg.prototype = {
          getDate: function () {
            return this._.getUTCDate();
          },
          getDay: function () {
            return this._.getUTCDay();
          },
          getFullYear: function () {
            return this._.getUTCFullYear();
          },
          getHours: function () {
            return this._.getUTCHours();
          },
          getMilliseconds: function () {
            return this._.getUTCMilliseconds();
          },
          getMinutes: function () {
            return this._.getUTCMinutes();
          },
          getMonth: function () {
            return this._.getUTCMonth();
          },
          getSeconds: function () {
            return this._.getUTCSeconds();
          },
          getTime: function () {
            return this._.getTime();
          },
          getTimezoneOffset: function () {
            return 0;
          },
          valueOf: function () {
            return this._.valueOf();
          },
          setDate: function () {
            Hj.setUTCDate.apply(this._, arguments);
          },
          setDay: function () {
            Hj.setUTCDay.apply(this._, arguments);
          },
          setFullYear: function () {
            Hj.setUTCFullYear.apply(this._, arguments);
          },
          setHours: function () {
            Hj.setUTCHours.apply(this._, arguments);
          },
          setMilliseconds: function () {
            Hj.setUTCMilliseconds.apply(this._, arguments);
          },
          setMinutes: function () {
            Hj.setUTCMinutes.apply(this._, arguments);
          },
          setMonth: function () {
            Hj.setUTCMonth.apply(this._, arguments);
          },
          setSeconds: function () {
            Hj.setUTCSeconds.apply(this._, arguments);
          },
          setTime: function () {
            Hj.setTime.apply(this._, arguments);
          }
        };
        var Hj = Date.prototype, Ij = '%a %b %e %X %Y', Jj = '%m/%d/%Y', Kj = '%H:%M:%S', Lj = [
            'Sunday',
            'Monday',
            'Tuesday',
            'Wednesday',
            'Thursday',
            'Friday',
            'Saturday'
          ], Mj = [
            'Sun',
            'Mon',
            'Tue',
            'Wed',
            'Thu',
            'Fri',
            'Sat'
          ], Nj = [
            'January',
            'February',
            'March',
            'April',
            'May',
            'June',
            'July',
            'August',
            'September',
            'October',
            'November',
            'December'
          ], Oj = [
            'Jan',
            'Feb',
            'Mar',
            'Apr',
            'May',
            'Jun',
            'Jul',
            'Aug',
            'Sep',
            'Oct',
            'Nov',
            'Dec'
          ];
        Ej.year = gg(function (a) {
          return a = Ej.day(a), a.setMonth(0, 1), a;
        }, function (a, b) {
          a.setFullYear(a.getFullYear() + b);
        }, function (a) {
          return a.getFullYear();
        }), Ej.years = Ej.year.range, Ej.years.utc = Ej.year.utc.range, Ej.day = gg(function (a) {
          var b = new Fj(2000, 0);
          return b.setFullYear(a.getFullYear(), a.getMonth(), a.getDate()), b;
        }, function (a, b) {
          a.setDate(a.getDate() + b);
        }, function (a) {
          return a.getDate() - 1;
        }), Ej.days = Ej.day.range, Ej.days.utc = Ej.day.utc.range, Ej.dayOfYear = function (a) {
          var b = Ej.year(a);
          return Math.floor((a - b - 60000 * (a.getTimezoneOffset() - b.getTimezoneOffset())) / 86400000);
        }, Gj.forEach(function (a, b) {
          a = a.toLowerCase(), b = 7 - b;
          var c = Ej[a] = gg(function (a) {
              return (a = Ej.day(a)).setDate(a.getDate() - (a.getDay() + b) % 7), a;
            }, function (a, b) {
              a.setDate(a.getDate() + 7 * Math.floor(b));
            }, function (a) {
              var c = Ej.year(a).getDay();
              return Math.floor((Ej.dayOfYear(a) + (c + b) % 7) / 7) - (c !== b);
            });
          Ej[a + 's'] = c.range, Ej[a + 's'].utc = c.utc.range, Ej[a + 'OfYear'] = function (a) {
            var c = Ej.year(a).getDay();
            return Math.floor((Ej.dayOfYear(a) + (c + b) % 7) / 7);
          };
        }), Ej.week = Ej.sunday, Ej.weeks = Ej.sunday.range, Ej.weeks.utc = Ej.sunday.utc.range, Ej.weekOfYear = Ej.sundayOfYear, Ej.format = ig;
        var Pj = kg(Lj), Qj = lg(Lj), Rj = kg(Mj), Sj = lg(Mj), Tj = kg(Nj), Uj = lg(Nj), Vj = kg(Oj), Wj = lg(Oj), Xj = /^%/, Yj = {
            '-': '',
            _: ' ',
            0: '0'
          }, Zj = {
            a: function (a) {
              return Mj[a.getDay()];
            },
            A: function (a) {
              return Lj[a.getDay()];
            },
            b: function (a) {
              return Oj[a.getMonth()];
            },
            B: function (a) {
              return Nj[a.getMonth()];
            },
            c: ig(Ij),
            d: function (a, b) {
              return mg(a.getDate(), b, 2);
            },
            e: function (a, b) {
              return mg(a.getDate(), b, 2);
            },
            H: function (a, b) {
              return mg(a.getHours(), b, 2);
            },
            I: function (a, b) {
              return mg(a.getHours() % 12 || 12, b, 2);
            },
            j: function (a, b) {
              return mg(1 + Ej.dayOfYear(a), b, 3);
            },
            L: function (a, b) {
              return mg(a.getMilliseconds(), b, 3);
            },
            m: function (a, b) {
              return mg(a.getMonth() + 1, b, 2);
            },
            M: function (a, b) {
              return mg(a.getMinutes(), b, 2);
            },
            p: function (a) {
              return a.getHours() >= 12 ? 'PM' : 'AM';
            },
            S: function (a, b) {
              return mg(a.getSeconds(), b, 2);
            },
            U: function (a, b) {
              return mg(Ej.sundayOfYear(a), b, 2);
            },
            w: function (a) {
              return a.getDay();
            },
            W: function (a, b) {
              return mg(Ej.mondayOfYear(a), b, 2);
            },
            x: ig(Jj),
            X: ig(Kj),
            y: function (a, b) {
              return mg(a.getFullYear() % 100, b, 2);
            },
            Y: function (a, b) {
              return mg(a.getFullYear() % 10000, b, 4);
            },
            Z: Jg,
            '%': function () {
              return '%';
            }
          }, $j = {
            a: ng,
            A: og,
            b: sg,
            B: tg,
            c: ug,
            d: Cg,
            e: Cg,
            H: Eg,
            I: Eg,
            j: Dg,
            L: Hg,
            m: Bg,
            M: Fg,
            p: Ig,
            S: Gg,
            U: qg,
            w: pg,
            W: rg,
            x: vg,
            X: wg,
            y: yg,
            Y: xg,
            Z: zg,
            '%': Kg
          }, _j = /^\s*\d+/, ak = Sg.map({
            am: 0,
            pm: 1
          });
        ig.utc = Lg;
        var bk = Lg('%Y-%m-%dT%H:%M:%S.%LZ');
        ig.iso = Date.prototype.toISOString && +new Date('2000-01-01T00:00:00.000Z') ? Mg : bk, Mg.parse = function (a) {
          var b = new Date(a);
          return isNaN(b) ? null : b;
        }, Mg.toString = bk.toString, Ej.second = gg(function (a) {
          return new Fj(1000 * Math.floor(a / 1000));
        }, function (a, b) {
          a.setTime(a.getTime() + 1000 * Math.floor(b));
        }, function (a) {
          return a.getSeconds();
        }), Ej.seconds = Ej.second.range, Ej.seconds.utc = Ej.second.utc.range, Ej.minute = gg(function (a) {
          return new Fj(60000 * Math.floor(a / 60000));
        }, function (a, b) {
          a.setTime(a.getTime() + 60000 * Math.floor(b));
        }, function (a) {
          return a.getMinutes();
        }), Ej.minutes = Ej.minute.range, Ej.minutes.utc = Ej.minute.utc.range, Ej.hour = gg(function (a) {
          var b = a.getTimezoneOffset() / 60;
          return new Fj(3600000 * (Math.floor(a / 3600000 - b) + b));
        }, function (a, b) {
          a.setTime(a.getTime() + 3600000 * Math.floor(b));
        }, function (a) {
          return a.getHours();
        }), Ej.hours = Ej.hour.range, Ej.hours.utc = Ej.hour.utc.range, Ej.month = gg(function (a) {
          return a = Ej.day(a), a.setDate(1), a;
        }, function (a, b) {
          a.setMonth(a.getMonth() + b);
        }, function (a) {
          return a.getMonth();
        }), Ej.months = Ej.month.range, Ej.months.utc = Ej.month.utc.range;
        var ck = [
            1000,
            5000,
            15000,
            30000,
            60000,
            300000,
            900000,
            1800000,
            3600000,
            10800000,
            21600000,
            43200000,
            86400000,
            172800000,
            604800000,
            2592000000,
            7776000000,
            31536000000
          ], dk = [
            [
              Ej.second,
              1
            ],
            [
              Ej.second,
              5
            ],
            [
              Ej.second,
              15
            ],
            [
              Ej.second,
              30
            ],
            [
              Ej.minute,
              1
            ],
            [
              Ej.minute,
              5
            ],
            [
              Ej.minute,
              15
            ],
            [
              Ej.minute,
              30
            ],
            [
              Ej.hour,
              1
            ],
            [
              Ej.hour,
              3
            ],
            [
              Ej.hour,
              6
            ],
            [
              Ej.hour,
              12
            ],
            [
              Ej.day,
              1
            ],
            [
              Ej.day,
              2
            ],
            [
              Ej.week,
              1
            ],
            [
              Ej.month,
              1
            ],
            [
              Ej.month,
              3
            ],
            [
              Ej.year,
              1
            ]
          ], ek = [
            [
              ig('%Y'),
              Sb
            ],
            [
              ig('%B'),
              function (a) {
                return a.getMonth();
              }
            ],
            [
              ig('%b %d'),
              function (a) {
                return 1 != a.getDate();
              }
            ],
            [
              ig('%a %d'),
              function (a) {
                return a.getDay() && 1 != a.getDate();
              }
            ],
            [
              ig('%I %p'),
              function (a) {
                return a.getHours();
              }
            ],
            [
              ig('%I:%M'),
              function (a) {
                return a.getMinutes();
              }
            ],
            [
              ig(':%S'),
              function (a) {
                return a.getSeconds();
              }
            ],
            [
              ig('.%L'),
              function (a) {
                return a.getMilliseconds();
              }
            ]
          ], fk = Pg(ek);
        dk.year = Ej.year, Ej.scale = function () {
          return Ng(Sg.scale.linear(), dk, fk);
        };
        var gk = {
            range: function (a, b, c) {
              return Sg.range(+a, +b, c).map(Og);
            }
          }, hk = dk.map(function (a) {
            return [
              a[0].utc,
              a[1]
            ];
          }), ik = [
            [
              Lg('%Y'),
              Sb
            ],
            [
              Lg('%B'),
              function (a) {
                return a.getUTCMonth();
              }
            ],
            [
              Lg('%b %d'),
              function (a) {
                return 1 != a.getUTCDate();
              }
            ],
            [
              Lg('%a %d'),
              function (a) {
                return a.getUTCDay() && 1 != a.getUTCDate();
              }
            ],
            [
              Lg('%I %p'),
              function (a) {
                return a.getUTCHours();
              }
            ],
            [
              Lg('%I:%M'),
              function (a) {
                return a.getUTCMinutes();
              }
            ],
            [
              Lg(':%S'),
              function (a) {
                return a.getUTCSeconds();
              }
            ],
            [
              Lg('.%L'),
              function (a) {
                return a.getUTCMilliseconds();
              }
            ]
          ], jk = Pg(ik);
        return hk.year = Ej.year.utc, Ej.scale.utc = function () {
          return Ng(Sg.scale.linear(), hk, jk);
        }, Sg.text = qb(function (a) {
          return a.responseText;
        }), Sg.json = function (a, b) {
          return rb(a, 'application/json', Qg, b);
        }, Sg.html = function (a, b) {
          return rb(a, 'text/html', Rg, b);
        }, Sg.xml = qb(function (a) {
          return a.responseXML;
        }), Sg;
      }(), {
        d3: function () {
          return a;
        }
      };
    }
  ]);
}.call(this), function () {
  angular.module('wwwsplit-timer.charts', ['d3']).directive('lineChart', [
    'd3Service',
    '$window',
    '$timeout',
    function (a, b, c) {
      return {
        scope: { data: '=' },
        restrict: 'C',
        link: function (d, e) {
          var f, g, h, i, j, k, l, m, n, o, p, q, r, s, t, u, v, w, x;
          return h = a.d3(), t = function (a) {
            return a.x;
          }, q = function (a) {
            return a.y;
          }, j = function (a) {
            return a.id;
          }, p = 0, o = 0, u = 750, k = !0, m = {
            left: 10,
            right: 10,
            top: 10,
            bottom: 10
          }, g = window.getComputedStyle(e[0]).width.substring(0, window.getComputedStyle(e[0]).width.length - 2) - (m.left + m.right), f = window.getComputedStyle(e[0]).height.substring(0, window.getComputedStyle(e[0]).height.length - 2) - (m.bottom + m.top), w = h.scale.linear(), x = h.scale.linear(), s = h.select(e[0]).append('svg').attr('width', g + m.left + m.right).attr('height', f + m.top + m.bottom), i = s.append('g').attr('transform', 'translate(' + m.left + ', ' + m.top + ')'), l = h.svg.line().x(function (a) {
            return w(t(a));
          }).y(function (a) {
            return x(q(a));
          }).interpolate('linear'), n = h.svg.line().x(function (a) {
            return a[0];
          }).y(function (a) {
            return x(a[1]);
          }).interpolate('linear'), i.append('svg:path').attr('class', 'origin_line'), i.append('svg:path').attr('class', 'timer_line'), v = function () {
            var a, b, c, k;
            return g = window.getComputedStyle(e[0]).width.substring(0, window.getComputedStyle(e[0]).width.length - 2) - (m.left + m.right), f = window.getComputedStyle(e[0]).height.substring(0, window.getComputedStyle(e[0]).height.length - 2) - (m.bottom + m.top), p = g, o = f, s.attr('width', g + m.left + m.right), s.attr('height', f + m.top + m.bottom), w.domain(h.extent(d.data, t)).range([
              0,
              g
            ]), k = h.extent(d.data, q), c = Math.max(Math.abs(k[0]), Math.abs(k[1])), a = [
              -c,
              c
            ], x.domain(a).range([
              f,
              0
            ]), i.selectAll('path.origin_line').data([[
                [
                  0,
                  0
                ],
                [
                  g,
                  0
                ]
              ]]).attr('d', n), i.selectAll('path.timer_line').data([d.data]).transition().duration(u).attr('d', l), b = i.selectAll('circle').data(d.data, j), b.transition().duration(u).attr('cx', function (a) {
              return w(t(a));
            }).attr('cy', function (a) {
              return x(q(a));
            }), b.enter().append('circle').attr('cx', function (a) {
              return w(t(a));
            }).attr('cy', function (a) {
              return x(q(a));
            }).attr('r', 4).attr('class', 'circle'), b.exit().remove();
          }, r = void 0, b.onresize = function () {
            return null != r && c.cancel(r), r = c(function () {
              return v(k);
            }, 100);
          }, d.$watch('data', function (a, b) {
            return b ? v(k) : void 0;
          }, !0);
        }
      };
    }
  ]);
}.call(this), function () {
  angular.module('wwwsplit-timer', [
    'wwwsplit-timer.templates',
    'wwwsplit-timer.charts'
  ]).directive('timer', [
    '$timeout',
    function (a) {
      return {
        restrict: 'C',
        scope: {
          current_run: '=ngModel',
          running: '=isRunning'
        },
        templateUrl: 'timer.tmpl',
        link: function (b) {
          var c, d, e, f;
          return b.running = !1, b.chart_data = [], c = function (a, c) {
            var d, e, f;
            if (null == a.split_time)
              a.live_data.relative_time = null, a.live_data.segment_diff = null, 0 === c ? (a.live_data.live_segment_time = a.live_data.live_time, a.live_data.segment_diff = null) : a.live_data.live_segment_time = a.live_data.live_time - b.current_run.splits[c - 1].live_data.live_time;
            else if (a.live_data.relative_time = a.live_data.live_time - a.split_time, 0 === c)
              a.live_data.live_segment_time = a.live_data.live_time, a.live_data.segment_diff = a.live_data.relative_time;
            else
              for (a.live_data.live_segment_time = a.live_data.live_time - b.current_run.splits[c - 1].live_data.live_time, d = e = f = c - 1; 0 >= f ? 0 >= e : e >= 0; d = 0 >= f ? ++e : --e)
                if (null != b.current_run.splits[d].live_data.relative_time) {
                  a.live_data.segment_diff = a.live_data.relative_time - b.current_run.splits[d].live_data.relative_time;
                  break;
                }
            return a.live_data.best_segment = null == a.best_segment || a.best_segment > a.live_data.live_segment_time ? !0 : !1;
          }, d = function () {
            return b.elapsed_time = Date.now() - b.start_time;
          }, f = function () {
            return d(), b.timer_timeout_promise = a(f, 25);
          }, b.start_timer = function () {
            var c, d, e, g;
            if (b.current_run.splits.length) {
              for (g = b.current_run.splits, d = 0, e = g.length; e > d; d++)
                c = g[d], c.live_data = {};
              return b.current_split = b.current_run.splits[0], a.cancel(b.timer_timeout_promise), b.start_time = Date.now(), b.chart_data = [], b.timer_timeout_promise = a(f, 25), b.current_run.attempts++, b.running = !0, b.is_finished = !1, b.is_editing = !1;
            }
          }, e = function () {
            var a, c, d, e, f;
            if (b.current_run.splits) {
              for (e = b.current_run.splits, f = [], c = 0, d = e.length; d > c; c++)
                a = e[c], f.push(a.live_data = {});
              return f;
            }
          }, b.reset_timer = function () {
            return a.cancel(b.timer_timeout_promise), e(), b.current_split = null, b.chart_data = [], b.running = !1, b.is_finished = !1, b.elapsed_time = null, b.start_time = null;
          }, b.split = function () {
            var a;
            return b.current_split.live_data = {}, b.current_split.live_data.live_time = b.elapsed_time, c(b.current_split, b.current_run.splits.indexOf(b.current_split)), null != b.current_split.split_time && (a = (1000000 * Math.random()).toString(16), b.chart_data.push({
              x: b.current_split.live_data.live_time / 1000,
              y: b.current_split.live_data.relative_time / 1000,
              name: b.current_split.title,
              id: a
            }), b.current_split.live_data.data_point_id = a), b.current_split === b.current_run.splits[b.current_run.splits.length - 1] ? (b.finish_run(), void 0) : b.current_split = b.current_run.splits[b.current_run.splits.indexOf(b.current_split) + 1];
          }, b.unsplit = function () {
            var a, c, d, e, f;
            for (b.current_split = b.current_run.splits[b.current_run.splits.indexOf(b.current_split) - 1], f = b.chart_data, c = d = 0, e = f.length; e > d; c = ++d)
              a = f[c], a.id === b.current_split.live_data.data_point_id && b.chart_data.splice(c, 1);
            return b.current_split.live_data = {};
          }, b.finish_run = function () {
            return a.cancel(b.timer_timeout_promise), b.current_split = null, b.running = !1, b.is_finished = !0;
          };
        }
      };
    }
  ]).filter('milliseconds_to_HMS', function () {
    return function (a) {
      var b, c, d, e, f;
      return null == a ? '-' : (a || (a = 0), 0 > a && (c = !0, a *= -1), f = a / 1000, b = Math.floor(f / 3600), d = Math.floor(f % 3600 / 60), e = (f % 3600 % 60).toFixed(2), (c ? '-' : '') + (b > 0 ? b + ':' : '') + (d > 0 || b > 0 ? (b > 0 && 10 > d ? '0' : '') + d + ':' : '0:') + (10 > e ? '0' : '') + e);
    };
  });
}.call(this);