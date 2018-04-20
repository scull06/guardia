describe("Testing dynamic elements creation ", function() {
  const error = /Not allowed!/g;
  it("It should raise an error when the page is rendered", function(done) {
    page.on("pageerror", msg => {
      assert.isTrue(error.test(msg), "Error thrown");
      done();
    });
    page.goto("http://localhost:8080/1.html");
  });
});
