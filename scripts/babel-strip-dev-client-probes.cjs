/**
 * Expo Constants and Expo's devtools setup contain capability probes for the
 * optional EXDevLauncher native module even when expo-dev-client is absent.
 * Production builds cannot ever provide that module, so replace only those
 * member-expression probes at compile time. Development/QA bundles are not
 * transformed and retain Expo's normal behaviour.
 */
module.exports = function stripDevClientProbes({ types: t }) {
  return {
    name: "strip-absent-expo-dev-client-probes",
    visitor: {
      MemberExpression(path) {
        if (path.node.computed || !t.isIdentifier(path.node.property, { name: "EXDevLauncher" })) return;
        const readsNativeModules = t.isIdentifier(path.node.object, { name: "NativeModules" })
          || (t.isMemberExpression(path.node.object) && t.isIdentifier(path.node.object.property, { name: "NativeModules" }));
        if (!readsNativeModules) return;
        path.replaceWith(t.unaryExpression("void", t.numericLiteral(0)));
      },
    },
  };
};
