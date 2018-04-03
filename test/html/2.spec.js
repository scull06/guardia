describe("Testing popup windows", function() {
  it("It should prevent dynamic iframe creation", function(done) {
    page.on("pageerror", msg => {
      assert.isTrue(error.test(msg), "Error thrown");
      done();
    });
    page.goto("http://localhost:8080/2.html");
  });
});
