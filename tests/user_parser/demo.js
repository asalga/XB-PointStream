function start(){
  var ps = new PointStream();
  ps.setup(document.getElementById('canvas'));
  ps.registerParser("foo", FOO_Parser);
  ps.onRender = function render() {
    ps.translate(0, 0, -20);
    ps.render(acorn);
  };
  var acorn = ps.load("../../clouds/foo.foo");
}
