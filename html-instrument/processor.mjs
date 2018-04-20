import jsdom from "jsdom";
import fs from "fs";
import path from "path";
const { JSDOM } = jsdom;

//Utilities mybe not here or use alibrary for this
const compose = (...fns) => x => fns.reduceRight((v, f) => f(v), x);

const _pipe = (f, g) => (...args) => g(f(...args));
const pipe = (...fns) => fns.reduce(_pipe);

//just for testing
const loadFile = file => fs.readFileSync(path.join("/Users/soft/repos/guardia/html-instrument", file));

// The meat
const buildDOM = html => new JSDOM(html);

const getTags = selector => dom => {
  let list = dom.window.document.querySelectorAll(selector);
  return list;
};

const deleteTags = selector => dom => {
  Array.from(dom.window.document.querySelectorAll(selector)).forEach(node => node.parentNode.removeChild(node));
  return dom;
};

const buildBundleStringScript = nodeList => {
  return Array.from(nodeList).reduce((str, el) => {
    return str + el.innerHTML + "\n";
  }, "");
};

const createTag = name => domx => domx.window.document.createElement(name);

const appendElementTo = domx => selector => el => {
  domx.window.document.querySelector(selector).appendChild(el);
  return domx;
};

const appendElementToBody = domx => el => {
  domx.window.document.body.appendChild(el);
  return domx;
};

//fill id on missing elements with eventHandlers
let counter = 0;

const createListenerFnString = (elemId, evtName, strCode) => {
  return `document.getElementById('${elemId}')
                  .addEventListener('${evtName.substring(2)}',
                   function(){${strCode}});\n`;
};

const deattachEventEventHandlers = elemList => {
  let res = [];
  Array.from(elemList).forEach(node => {
    let events = node.getAttributeNames().filter(attr => attr.startsWith("on"));
    events.forEach(evtName => {
      res.push(createListenerFnString(node.id, evtName, node.getAttribute(evtName)));
    });
  });
  return res;
};

const fillElementId = el => {
  if (!el.id) {
    el.id = "elgen_" + counter++;
  }
};

const processTagsEvents = selector => domx => {
  let elems = getTags(selector)(domx);
  elems.forEach(el => fillElementId(el));
  let evtHandlers = deattachEventEventHandlers(elems);
  elems.forEach(elem => {
    let events = elem.getAttributeNames().filter(attr => attr.startsWith("on"));

    events.forEach(evt => {
      elem.removeAttribute(evt);
    });
  });

  evtHandlers.forEach(handlerCode => {
    addCodeToBundleString(handlerCode)(domx);
  });

  return domx;
};

const bundleScriptTagClass = "__BUNDLED_PROGRAM";

const createBundleScript = domx => str => {
  const el = createTag("script")(domx);
  el.className = bundleScriptTagClass;
  el.innerHTML = str;
  return el;
};

const addCodeToBundleString = code => domx => {
  const bundleScript = domx.window.document.querySelector(`.${bundleScriptTagClass}`);
  bundleScript.innerHTML += "\n" + code;
};

//const dom = pipe(loadFile, buildDOM)("1.html");

const processPage = dom => {
  return pipe(
    getTags("script:not([src])"),
    buildBundleStringScript,
    createBundleScript(dom),
    appendElementTo(dom)("body"),
    deleteTags(`script:not([src]):not(.${bundleScriptTagClass})`),
    processTagsEvents("button")
    //put here the rest of tags that have
  )(dom);
};

export const convertPage = html => {
  const dom = buildDOM(html);
  return processPage(dom).serialize();
};

//console.log(convertPage(loadFile("1.html")))
  