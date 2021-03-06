(function() {
  'use strict';

  describe('navigator', function() {
    var path = '/test/e2e/navigator/index.html';
    var EC = protractor.ExpectedConditions;

    beforeEach(function () {
      browser.get(path);
      browser.waitForAngular();
    });

    it('should exist', function() {
      var navi = element(by.css('ons-navigator'));
      browser.wait(EC.presenceOf(navi));
      expect(navi.isDisplayed()).toBeTruthy();
    });

    describe('page pushing', function () {
      it('should switch page when a button is clicked', function() {
        var page1 = element(by.id('page1'));
        var page2 = element(by.id('page2'));

        element(by.id('btn1')).click();
        browser.wait(EC.visibilityOf(page2));
        browser.wait(EC.invisibilityOf(page1));

        // Check that page2 was created and that it's displayed.
        expect((page2).isDisplayed()).toBeTruthy();
        expect((page1).isDisplayed()).not.toBeTruthy();
        expect((page1).isPresent()).toBeTruthy();

        element(by.id('btn2')).click();
        browser.wait(EC.stalenessOf(page2));

        // Check that page2 was destroyed.
        expect((page1).isDisplayed()).toBeTruthy();
        expect((page2).isPresent()).not.toBeTruthy();
      });
    });

    describe('page replacing', function () {
      it('should replace current page when a button is clicked', function () {
        var page1 = element(by.id('page1'));
        var page2 = element(by.id('page2'));
        var page3 = element(by.id('page3'));

        element(by.id('btn1')).click();
        browser.wait(EC.visibilityOf(page2));
        browser.wait(EC.invisibilityOf(page1));

        element(by.id('btn3')).click();
        browser.wait(EC.stalenessOf(page2));

        expect(page3.isDisplayed()).toBeTruthy();
        expect(page2.isPresent()).not.toBeTruthy();
        expect(page1.isPresent()).toBeTruthy();

        element(by.id('btn4')).click();
        browser.wait(EC.stalenessOf(page3));

        expect(page1.isDisplayed()).toBeTruthy();
        expect(page3.isPresent()).not.toBeTruthy();
      });
    });

    it('should emit events', function() {
      var pops = element(by.id('pops')),
        pushes = element(by.id('pushes'));

      expect(pops.getText()).toBe('0');
      expect(pushes.getText()).toBe('1');

      element(by.id('btn1')).click();
      browser.wait(EC.visibilityOf(element(by.id('btn2'))));
      element(by.id('btn2')).click();
      browser.wait(EC.textToBePresentInElement(pops, '1'));

      expect(pops.getText()).toBe('1');
      expect(pushes.getText()).toBe('2');
    });
  });
})();
