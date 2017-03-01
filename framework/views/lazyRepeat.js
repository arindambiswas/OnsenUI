/*
Copyright 2013-2015 ASIAL CORPORATION

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

   http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.

*/

(function(){
  'use strict';
  var module = angular.module('onsen');

  module.factory('LazyRepeatView', function($onsen, $document, $compile) {

    var LazyRepeatView = Class.extend({

      /**
       * @param {Object} scope
       * @param {jqLite} element
       * @param {Object} attrs
       */
      init: function(scope, element, attrs, linker) {
        this._element = element;
        this._scope = scope;
        this._attrs = attrs;
        this._linker = linker;

        this._parentElement = element.parent();
        this._pageContent = this._findPageContent();

        if (!this._pageContent) {
          throw new Error('ons-lazy-repeat must be a descendant of an <ons-page> object.');
        }

        this._itemHeightSum = [];
        this._maxIndex = 0;

        this._delegate = this._getDelegate();

        this._renderedElements = {};
        this._addEventListeners();

        this._scope.$watch(this._countItems.bind(this), this._onChange.bind(this));

        this._scope.$on('$destroy', this._destroy.bind(this));
        this._onChange();
      },

      _getDelegate: function() {
        var delegate = this._scope.$eval(this._attrs.onsLazyRepeat);

        if (typeof delegate === 'undefined') {
          /*jshint evil:true */
          delegate = eval(this._attrs.onsLazyRepeat);
        }

        return delegate;
      },

      _countItems: function() {
        return this._delegate.countItems();
      },

      _getItemHeight: function(i) {
        return this._delegate.calculateItemHeight(i);
      },
      
      _getTopOffset: function() {
        return this._parentElement[0].getBoundingClientRect().top;
      },

      _render: function() {
        var items = this._getItemsInView(),
          keep = {};

        this._parentElement.css('height', this._itemHeightSum[this._maxIndex] + 'px');

        for (var i = 0, l = items.length; i < l; i ++) {
          var _item = items[i];
          this._renderElement(_item);
          keep[_item.index] = true;
        }

        for (var key in this._renderedElements) {
          if (this._renderedElements.hasOwnProperty(key) && !keep.hasOwnProperty(key)) {
            this._removeElement(key);
          }
        }
      },

      _isRendered: function(i) {
        return this._renderedElements.hasOwnProperty(i);
      },
      
      _renderElement: function(item) {
        if (this._isRendered(item.index)) {
          // Update content even if it's already added to DOM
          // to account for changes within the list.
          var currentItem = this._renderedElements[item.index];

          if (this._delegate.configureItemScope) {
            this._delegate.configureItemScope(item.index, currentItem.scope);
          }

          // Fix position.
          var element = this._renderedElements[item.index].element;
          element[0].style.top = item.top + 'px';

          return;
        }

        var childScope = this._scope.$new();
        this._addSpecialProperties(item.index, childScope);

        this._linker(childScope, function(clone) {
          if (this._delegate.configureItemScope) {
            this._delegate.configureItemScope(item.index, childScope);
          }
          else if (this._delegate.createItemContent) {
            clone.append(this._delegate.createItemContent(item.index));
            $compile(clone[0].firstChild)(childScope);
          }

          this._parentElement.append(clone);

          clone.css({
            position: 'absolute',
            top: item.top + 'px',
            left: '0px',
            right: '0px',
            display: 'none'
          });

          var element = {
            element: clone,
            scope: childScope
          };

          // Don't show elements before they are finished rendering.
          this._scope.$evalAsync(function() {
            clone.css('display', 'block');
          });

          this._renderedElements[item.index] = element;
        }.bind(this));
      },

      _removeElement: function(i) {
        if (!this._isRendered(i)) {
          return;
        }

        var element = this._renderedElements[i];

        if (this._delegate.destroyItemScope) {
          this._delegate.destroyItemScope(i, element.scope);
        }
        else if (this._delegate.destroyItemContent) {
          this._delegate.destroyItemContent(i, element.element.children()[0]);
        }

        element.element.remove();
        element.scope.$destroy();
        element.element = element.scope = null;

        delete this._renderedElements[i];
      },

      _removeAllElements: function() {
        for (var key in this._renderedElements) {
          if (this._removeElement.hasOwnProperty(key)) {
            this._removeElement(key);
          }
        }
      },

      _calculateStartIndex: function(current) {
        var start = 0,
          end = this._maxIndex;

        // Binary search for index at top of screen so
        // we can speed up rendering.
        while (true) {
          var middle = Math.floor((start + end) / 2),
            value = current + this._itemHeightSum[middle];

          if (end < start) {
            return 0;
          }
          else if (value >= 0 && value - this._getItemHeight(middle) < 0) {
            return middle;
          }
          else if (isNaN(value) || value >= 0) {
            end = middle - 1;
          }
          else {
            start = middle + 1;
          }

        }
      },

      _recalculateItemHeightSum: function() {
        var sums = this._itemHeightSum;

        for (var i = 0, sum = 0; i < Math.min(sums.length, this._countItems()); i++) {
          sum += this._getItemHeight(i);
          sums[i] = sum;
        }
      },

      _getItemsInView: function() {
        var topOffset = this._getTopOffset(),
          topPosition = topOffset,
          cnt = this._countItems();

        if (cnt !== this._itemCount){
          this._recalculateItemHeightSum();
          this._maxIndex = cnt - 1;
        }
        this._itemCount = cnt;

        var startIndex = this._calculateStartIndex(topPosition);
        startIndex = Math.max(startIndex - 30, 0);

        if (startIndex > 0) {
          topPosition += this._itemHeightSum[startIndex - 1];
        }

        var items = [];
        for (var i = startIndex; i < cnt && topPosition < 4 * window.innerHeight; i++) {
          var h = this._getItemHeight(i);

          if (i >= this._itemHeightSum.length) {
            this._itemHeightSum = this._itemHeightSum.concat(new Array(100));
          }

          if (i > 0) {
            this._itemHeightSum[i] = this._itemHeightSum[i - 1] + h;
          }
          else {
            this._itemHeightSum[i] = h;
          }

          this._maxIndex = Math.max(i, this._maxIndex);

          items.push({
            index: i,
            top: topPosition - topOffset
          });

          topPosition += h;
        }

        return items;
      },

      _addSpecialProperties: function(i, scope) {
        scope.$index = i;
        scope.$first = i === 0;
        scope.$last = i === this._countItems() - 1;
        scope.$middle = !scope.$first && !scope.$last;
        scope.$even = i % 2 === 0;
        scope.$odd = !scope.$even;
      },

      _onChange: function() {
        this._render();
      },

      _findPageContent: function() {
        var e = this._element[0];

        while(e.parentNode) {
          e = e.parentNode;

          if (e.className) {
            if (e.className.split(/\s+/).indexOf('page__content') >= 0) {
              break;
            }
          }
        }

        return e;
      },

      _debounce: function(func, wait, immediate) {
        var timeout;
        return function() {
          var context = this, args = arguments;
          var later = function() {
            timeout = null;
            if (!immediate) {
              func.apply(context, args);
            }
          };
          var callNow = immediate && !timeout;
          clearTimeout(timeout);
          timeout = setTimeout(later, wait);
          if (callNow) {
            func.apply(context, args);
          }
        };
      },

      _doubleFireOnTouchend: function(){
        this._render();
        this._debounce(this._render.bind(this), 100);
      },

      _addEventListeners: function() {
        if (ons.platform.isIOS()) {
          this._boundOnChange = this._debounce(this._onChange.bind(this), 30);
        } else {
          this._boundOnChange = this._onChange.bind(this);
        }

        this._pageContent.addEventListener('scroll', this._boundOnChange, true);

        if (ons.platform.isIOS()) {
          this._pageContent.addEventListener('touchmove', this._boundOnChange, true);
          this._pageContent.addEventListener('touchend', this._doubleFireOnTouchend, true);
        }

        $document[0].addEventListener('resize', this._boundOnChange, true);
      },

      _removeEventListeners: function() {
        this._pageContent.removeEventListener('scroll', this._boundOnChange, true);

        if (ons.platform.isIOS()) {
          this._pageContent.removeEventListener('touchmove', this._boundOnChange, true);
          this._pageContent.removeEventListener('touchend', this._doubleFireOnTouchend, true);
        }

        $document[0].removeEventListener('resize', this._boundOnChange, true);
      },

      _destroy: function() {
        this._removeEventListeners();
        this._removeAllElements();
        this._parentElement = this._renderedElements = this._element = this._scope = this._attrs = null;
      }
    });

    return LazyRepeatView;
  });
})();
