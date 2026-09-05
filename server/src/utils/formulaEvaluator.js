class FormulaError extends Error {}

function tokenize(formula) {
  const tokens = [];
  const re = /\s*(?:([0-9]*\.?[0-9]+)|([A-Za-z_][A-Za-z0-9_]*)|([()+\-*/%]))/g;
  let match;
  let lastIndex = 0;

  while (lastIndex < formula.length) {
    re.lastIndex = lastIndex;
    match = re.exec(formula);
    if (!match || match.index !== lastIndex) {
      const bad = formula.slice(lastIndex).trim();
      if (!bad) break;
      throw new FormulaError(`Unexpected character in formula near "${bad[0]}"`);
    }
    if (match[1] !== undefined) tokens.push({ type: "NUMBER", value: parseFloat(match[1]) });
    else if (match[2] !== undefined) tokens.push({ type: "IDENT", value: match[2] });
    else if (match[3] !== undefined) tokens.push({ type: "OP", value: match[3] });
    lastIndex = re.lastIndex;
  }
  return tokens;
}

function parse(tokens, variables) {
  let pos = 0;

  function peek() {
    return tokens[pos];
  }
  function next() {
    return tokens[pos++];
  }

  function parseFactor() {
    const tok = peek();
    if (!tok) throw new FormulaError("Unexpected end of formula");

    if (tok.type === "OP" && (tok.value === "-" || tok.value === "+")) {
      next();
      const val = parseFactor();
      return tok.value === "-" ? -val : val;
    }
    if (tok.type === "NUMBER") {
      next();
      return tok.value;
    }
    if (tok.type === "IDENT") {
      next();
      const key = tok.value.toUpperCase();
      if (!(key in variables)) {
        throw new FormulaError(`Unknown variable "${tok.value}" in formula`);
      }
      const v = variables[key];
      return typeof v === "number" ? v : 0;
    }
    if (tok.type === "OP" && tok.value === "(") {
      next();
      const val = parseExpr();
      const close = next();
      if (!close || close.value !== ")") throw new FormulaError("Missing closing parenthesis");
      return val;
    }
    throw new FormulaError(`Unexpected token "${tok.value}" in formula`);
  }

  function parseTerm() {
    let val = parseFactor();
    while (peek() && peek().type === "OP" && (peek().value === "*" || peek().value === "/" || peek().value === "%")) {
      const op = next().value;
      const rhs = parseFactor();
      if (op === "*") val *= rhs;
      else if (op === "/") {
        if (rhs === 0) throw new FormulaError("Division by zero in formula");
        val /= rhs;
      } else val %= rhs;
    }
    return val;
  }

  function parseExpr() {
    let val = parseTerm();
    while (peek() && peek().type === "OP" && (peek().value === "+" || peek().value === "-")) {
      const op = next().value;
      const rhs = parseTerm();
      val = op === "+" ? val + rhs : val - rhs;
    }
    return val;
  }

  const result = parseExpr();
  if (pos !== tokens.length) {
    throw new FormulaError(`Unexpected trailing tokens in formula near "${tokens[pos].value}"`);
  }
  return result;
}

/**
 * @param {string} formula e.g. "(BASIC + HRA) * 0.1"
 * @param {Record<string, number>} variables uppercase keys -> numbers
 * @returns {number}
 */
function evaluateFormula(formula, variables = {}) {
  if (typeof formula !== "string" || !formula.trim()) {
    throw new FormulaError("Formula is empty");
  }
  const upperVars = {};
  for (const [k, v] of Object.entries(variables)) upperVars[k.toUpperCase()] = v;

  const tokens = tokenize(formula);
  if (tokens.length === 0) throw new FormulaError("Formula is empty");
  return parse(tokens, upperVars);
}

module.exports = { evaluateFormula, FormulaError };