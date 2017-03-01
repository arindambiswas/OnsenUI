/**
 * @ngdoc directive
 * @id button
 * @name ons-button
 * @category form
 * @modifier outline
 *   [en]Button with outline and transparent background[/en]
 *   [ja]アウトラインを持ったボタンを表示します。[/ja]
 * @modifier light
 *   [en]Button that doesn't stand out.[/en]
 *   [ja]目立たないボタンを表示します。[/ja]
 * @modifier quiet
 *   [en]Button with no outline and or background..[/en]
 *   [ja]枠線や背景が無い文字だけのボタンを表示します。[/ja]
 * @modifier cta
 *   [en]Button that really stands out.[/en]
 *   [ja]目立つボタンを表示します。[/ja]
 * @modifier large
 *   [en]Large button that covers the width of the screen.[/en]
 *   [ja]横いっぱいに広がる大きなボタンを表示します。[/ja]
 * @modifier large--quiet
 *   [en]Large quiet button.[/en]
 *   [ja]横いっぱいに広がるquietボタンを表示します。[/ja]
 * @modifier large--cta
 *   [en]Large call to action button.[/en]
 *   [ja]横いっぱいに広がるctaボタンを表示します。[/ja]
 * @description
 *   [en]Button component. If you want to place a button in a toolbar, use ons-toolbar-button or ons-back-button instead.[/en]
 *   [ja]ボタン用コンポーネント。ツールバーにボタンを設置する場合は、ons-toolbar-buttonもしくはons-back-buttonコンポーネントを使用します。[/ja]
 * @codepen hLayx
 * @guide Button [en]Guide for ons-button[/en][ja]ons-buttonの使い方[/ja]
 * @guide OverridingCSSstyles [en]More details about modifier attribute[/en][ja]modifier属性の使い方[/ja]
 * @example
 * <ons-button modifier="large--cta">
 *   Tap Me
 * </ons-button>
 */

/**
 * @ngdoc attribute
 * @name modifier
 * @type {String}
 * @description
 *  [en]The appearance of the button.[/en]
 *  [ja]ボタンの表現を指定します。[/ja]
 */

/**
 * @ngdoc attribute
 * @name should-spin
 * @type {Boolean}
 * @description
 *  [en]Specify if the button should have a spinner. [/en]
 *  [ja]ボタンにスピナーを表示する場合に指定します。[/ja]
 */

/**
 * @ngdoc attribute
 * @name animation
 * @type {String}
 * @description
 *   [en]The animation when the button transitions to and from the spinner. Possible values are "slide-left" (default), "slide-right", "slide-up", "slide-down", "expand-left", "expand-right", "expand-up", "expand-down", "zoom-out", "zoom-in".[/en]
 *   [ja]スピナーを表示する場合のアニメーションを指定します。"slide-left" (デフォルト), "slide-right", "slide-up", "slide-down", "expand-left", "expand-right", "expand-up", "expand-down", "zoom-out", "zoom-in"のいずれかを指定します。[/ja]
 */

/**
 * @ngdoc attribute
 * @name disabled
 * @description
 *   [en]Specify if button should be disabled.[/en]
 *   [ja]ボタンを無効化する場合は指定します。[/ja]
 */

/**
 * @ngdoc method
 * @signature startSpin()
 * @description
 *   [en]Show spinner on the button.[/en]
 *   [ja]ボタンにスピナーを表示します。[/ja]
 */

/**
 * @ngdoc method
 * @signature stopSpin()
 * @description
 *   [en]Remove spinner from button.[/en]
 *   [ja]ボタンのスピナーを隠します。[/ja]
 */

/**
 * @ngdoc method
 * @signature isSpinning()
 * @return {Boolean}
 *   [en]true if the button is spinning.[/en]
 *   [ja]spinしているかどうかを返します。[/ja]
 * @description
 *   [en]Return whether the spinner is visible or not.[/en]
 *   [ja]ボタン内にスピナーが表示されているかどうかを返します。[/ja]
 */

/**
 * @ngdoc method
 * @signature setSpinAnimation(animation)
 * @description
 *   [en]Set spin animation. Possible values are "slide-left" (default), "slide-right", "slide-up", "slide-down", "expand-left", "expand-right", "expand-up", "expand-down", "zoom-out", "zoom-in".[/en]
 *   [ja]スピナーを表示する場合のアニメーションを指定します。"slide-left" (デフォルト), "slide-right", "slide-up", "slide-down", "expand-left", "expand-right", "expand-up", "expand-down", "zoom-out", "zoom-in"のいずれかを指定します。[/ja]
 * @param {String} animation
 *   [en]Animation name.[/en]
 *   [ja]アニメーション名を指定します。[/ja]
 */

/**
 * @ngdoc method
 * @signature setDisabled(disabled)
 * @description
 *   [en]Disable or enable the button.[/en]
 *   [ja]このボタンをdisabled状態にするかどうかを設定します。[/ja]
 * @param {String} disabled
 *   [en]If true the button will be disabled.[/en]
 *   [ja]disabled状態にするかどうかを真偽値で指定します。[/ja]
 */

/**
 * @ngdoc method
 * @signature isDisabled()
 * @return {Boolean}
 *   [en]true if the button is disabled.[/en]
 *   [ja]ボタンがdisabled状態になっているかどうかを返します。[/ja]
 * @description
 *   [en]Returns whether the button is disabled or enabled.[/en]
 *   [ja]このボタンがdisabled状態かどうかを返します。[/ja]
 */

(function(){
  'use strict';
  var module = angular.module('onsen');

  module.directive('onsButton', function($onsen, ButtonView) {
    return {
      restrict: 'E',
      replace: false,
      transclude: true,
      scope: {
        animation: '@',
      },
      templateUrl: $onsen.DIRECTIVE_TEMPLATE_URL + '/button.tpl',
      link: function(scope, element, attrs, _, transclude) {
        var button = new ButtonView(scope, element, attrs);

        $onsen.declareVarAttribute(attrs, button);
        element.data('ons-button', button);

        scope.$on('$destroy', function() {
          button._events = undefined;
          $onsen.removeModifierMethods(button);
          element.data('ons-button', undefined);
          element = null;
        });
        var initialAnimation = 'slide-left';

        scope.modifierTemplater = $onsen.generateModifierTemplater(attrs);
        element.addClass('button effeckt-button');
        element.addClass(scope.modifierTemplater('button--*'));
        element.addClass(initialAnimation);

        $onsen.addModifierMethods(button, 'button--*', element);

        transclude(scope.$parent, function(cloned) {
          angular.element(element[0].querySelector('.ons-button-inner')).append(cloned);
        });

        if (attrs.ngController) {
          throw new Error('This element can\'t accept ng-controller directive.');
        }

        scope.item = {};
        // if animation is not specified -> default is slide-left
        scope.item.animation = initialAnimation;

        scope.$watch('animation', function(newAnimation) {
          if (newAnimation) {
            if (scope.item.animation) {
              element.removeClass(scope.item.animation);
            }
            scope.item.animation = newAnimation;
            element.addClass(scope.item.animation);
          }
        });

        attrs.$observe('shouldSpin', function(shouldSpin) {
          if (shouldSpin === 'true') {
            element.attr('data-loading', true);
          } else {
            element.removeAttr('data-loading');
          }
        });

        $onsen.cleaner.onDestroy(scope, function() {
          $onsen.clearComponent({
            scope: scope,
            attrs: attrs,
            element: element
          });

          scope = element = attrs = null;
        });

        $onsen.fireComponentEvent(element[0], 'init');
      }
    };
  });
})();
