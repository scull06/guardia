/**
 * Polcies for test cases
 */
console.log("cargando policies...");
/**
 * Prevent dialog creation
 */
const noAlert = ac.Deny(["alert", "confirm", "prompt"]);
enfc.installPolicy({ whenRead: [noAlert] }).on(window);

/**
 * No dynamic iframe
 */
const ne = (a, b) => a !== b;
const noIframe = ac.Or(
  ac.And(ac.Allow(["createElement"]), ac.ParamAt(ne, ac.getVType(0, String), "iframe")),
  ac.Deny(["createElement"])
);



enfc.installPolicy({ whenRead: [noIframe] }).on(document);
