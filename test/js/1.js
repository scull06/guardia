require("browser-env")();
var assert = require("assert");
var ac = require("../../guardia");
var { mock1, mock2, mock3 } = require("./js");

/** DENY */
describe("Guardia Access Control", function() {
  describe("#Deny", function() {
    it("Should Allow myfunction1", function() {
      assert.equal(mock1.myfunction1(), true, "The proxy is not working");
    });

    it("Should block myfunction2", function() {
      assert.throws(() => {
        mock1.myfunction2();
      }, "The proxy is not working");
    });

    it("Should allow read myProp", function() {
      assert.equal(mock1.myProp, "foo", "The proxy is not working");
    });

    it("Should allow assign to myProp", function() {
      mock1.myProp = "Lorem";
      assert.equal(mock1.myProp, "Lorem", "The proxy is not working");
    });

    it("Should block assign to myProp2", function() {
      assert.throws(() => {
        mock1.myProp2 = "Lorem";
      }, "The proxy is not working");
    });
  });
});

/*  ALLOW */
describe("Guardia Access Control", function() {
  describe("#Allow", function() {
    it("Should Allow myfunction1", function() {
      assert.equal(mock2.myfunction1(), true, "The proxy is not working");
    });

    it("Should block myfunction2", function() {
      assert.throws(() => {
        mock2.myfunction2();
      }, "The proxy is not working");
    });
    it("Should allow read myProp", function() {
      assert.equal(mock2.myProp, "foo", "The proxy is not working");
    });

    it("Should allow assign to myProp", function() {
      mock2.myProp = "Lorem";
      assert.equal(mock2.myProp, "Lorem", "The proxy is not working");
    });

    it("Should block assign to myProp2", function() {
      assert.throws(() => {
        mock2.myProp2 = "Lorem";
      }, "The proxy is not working");
    });

    it("Should block assign to myfunction1", function() {
      assert.throws(() => {
        mock2.myfunction1 = function() {};
      }, "The proxy is not working");
    });
  });
});

/*  NOT */
describe("Guardia Access Control", function() {
  describe("#Not Allow", function() {
    it("Should Allow myfunction1", function() {
      assert.equal(mock3.myfunction1(), true, "The proxy is not working");
    });

    it("Should block myfunction2", function() {
      assert.throws(() => {
        mock3.myfunction2();
      }, "The proxy is not working");
    });

    it("Should allow read myProp", function() {
      assert.equal(mock3.myProp, "foo", "The proxy is not working");
    });

    it("Should block read myProp2", function() {
      assert.equal(mock3.myProp, "foo", "The proxy is not working");
    });
  });
});
