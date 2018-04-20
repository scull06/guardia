tagAsSink(console.log);
let x = tagAsSource(42, 1);
let y = 42;
if (x) {
  console.log(y);
}

