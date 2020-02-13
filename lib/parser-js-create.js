const ts = require('typescript');

function _addMessage(addMessage, name, args) {
  if (name === '$gettext' && args.length > 0) {
    const arg0 = args[0];
    if (arg0.kind === ts.SyntaxKind.StringLiteral) {
      addMessage({
        text: arg0.text,
      });
    }
    return;
  }

  if (name === '$ngettext' && args.length > 1) {
    const arg0 = args[0];
    const arg1 = args[1];
    if (arg0.kind === ts.SyntaxKind.StringLiteral && arg1.kind === ts.SyntaxKind.StringLiteral) {
      addMessage({
        text: arg0.text,
        textPlural: arg1.text,
      });
    }
    return;
  }

  if (name === '$pgettext' && args.length > 1) {
    const arg0 = args[0];
    const arg1 = args[1];
    if (arg0.kind === ts.SyntaxKind.StringLiteral && arg1.kind === ts.SyntaxKind.StringLiteral) {
      addMessage({
        context: arg0.text,
        text: arg1.text,
      });
    }
    return;
  }

  if (name === '$npgettext' && args.length > 2) {
    const arg0 = args[0];
    const arg1 = args[1];
    const arg2 = args[2];
    if (arg0.kind === ts.SyntaxKind.StringLiteral &&
      arg1.kind === ts.SyntaxKind.StringLiteral &&
      arg2.kind === ts.SyntaxKind.StringLiteral
    ) {
      addMessage({
        context: arg0.text,
        text: arg1.text,
        textPlural: arg2.text,
      });
    }
  }
}

function parserJsCreate(extractor) {
  return extractor.createJsParser([
    (node, sourceFile, addMessage) => {
      const nodeKind = node.kind;
      if (nodeKind === ts.SyntaxKind.CallExpression) {
        const callExpression = node;

        const kind = callExpression.expression.kind;

        if (kind === ts.SyntaxKind.Identifier) {
          _addMessage(addMessage, callExpression.expression.escapedText, callExpression.arguments);
        } else if (kind === ts.SyntaxKind.PropertyAccessExpression) {
          const propertyAccessExpression = callExpression.expression;
          _addMessage(addMessage, propertyAccessExpression.name.text, callExpression.arguments);
        }
      }
    },
  ]);
}

module.exports = parserJsCreate;
