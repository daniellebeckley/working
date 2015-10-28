const expressionTypes = [
  {
    type: "number",
    precedence: 0,
    associativity: undefined,
    test: function ( str ) {
      return /^\d+(\.\d+)?$/.test( str );
    },
    evaluate: null
  },
  {
    type: "op",
    precedence: 0,
    associativity: undefined,
    test: function ( str ) {
      return /^\($/.test( str );
    },
    evaluate: null
  },
  {
    type: "op",
    precedence: 0,
    associativity: undefined,
    test: function ( str ) {
      return /^\)$/.test( str );
    },
    evaluate: null
  },
  {
    type: "op",
    precedence: 2,
    associativity: "left",
    test: function ( str ) {
      return /^\+$/.test( str );
    },
    evaluate: function () {
      return arguments[0] + arguments[1];
    }
  },
  {
    type: "op",
    precedence: 2,
    associativity: "left",
    test: function ( str ) {
      return /^-$/.test( str );
    },
    evaluate: function () {
      return arguments[0] - arguments[1];
    }
  },
  {
    type: "op",
    precedence: 3,
    associativity: "left",
    test: function ( str ) {
      return /^\*$/.test( str );
    },
    evaluate: function () {
      return arguments[0] * arguments[1];
    }
  },
  {
    type: "op",
    precedence: 3,
    associativity: "left",
    test: function ( str ) {
      return /^\/$/.test( str );
    },
    evaluate: function () {
      return arguments[0] / arguments[1];
    }
  },
  {
    type: "op",
    precedence: 4,
    associativity: "right",
    test: function ( str ) {
      return /^\^$/.test( str );
    },
    evaluate: function () {
      return Math.pow( arguments[0], arguments[1] );
    }
  },
  {
    type: "op",
    precedence: 5,
    associativity: "right",
    test: function ( str ) {
      return /^-$/.test( str );
    },
    evaluate: function () {
      return -arguments[0];
    }
  },
  {
    type: "function",
    precedence: 5,
    associativity: undefined,
    test: function ( str ) {
      return /^sin$/i.test( str );
    },
    evaluate: Math.sin
  },
  {
    type: "function",
    precedence: 5,
    associativity: undefined,
    test: function ( str ) {
      return /^cos$/i.test( str );
    },
    evaluate: Math.cos
  },
  {
    type: "function",
    precedence: 5,
    associativity: undefined,
    test: function ( str ) {
      return /^tan$/i.test( str );
    },
    evaluate: Math.tan
  }
];

function Expression( type, lexeme ) {
  var expr = {};
  expr.lexeme = lexeme;
  expr.type = type.type;
  expr.precedence = type.precedence;
  expr.associativity = type.associativity;
  expr.evaluate = type.evaluate;
  return expr;
}

var lex = function( input ) {
  var input = input + "";

  var tokens = [];

  var lexeme;
  var lastType;
  var start, end;
  // Start from the beginning of the string and shrink the substring from the
  // end of the string until a match for a token is found.
  for ( start = 0; start < input.length; start++ ) {
    for ( end = input.length; end >= start; end-- ) {
      var t;
      for ( t = 0; t < expressionTypes.length; t++ ) {
        lexeme = input.substring( start, end );
        if ( expressionTypes[t].test( lexeme ) ) {
          tokens.push( new Expression( expressionTypes[t], lexeme ) );

          lastType = expressionTypes[t];
          start += lexeme.length - 1; // advance past the matched token
          break;
        }
      }
    }
  }
  return tokens;
}

var parse = function ( input ) {
  var RPNexpr = [];
  var operatorStack = [];
  var currentToken;

  while ( input.length > 0 ) {                                                  // While there are tokens to be read:
    currentToken = input.pop();                                                 // Read a token.
    switch ( currentToken.type ) {

    case "number":                                                              // If the token is a number, then add it to the output queue.
      RPNexpr.push( Number( currentToken.lexeme ) );
      break;

    case "op":                                                                  // If the token is an operator, o1, then:
      while ( operatorStack.length > 0 &&                                       // while there is an operator token, o2, at the top of the operator stack,
          operatorStack[operatorStack.length - 1].type == "op" &&               // and either o1 is left-associative and its precedence is less than or equal to that of o2,
          ( ( operatorStack[operatorStack.length - 1].associativity == "left" &&
            operatorStack[operatorStack.length - 1].precedence >=
              currentToken.precedence ) ||
          ( operatorStack[operatorStack.length - 1].associativity == "right" && // or o1 is right associative, and has precedence less than that of o2,
            operatorStack[operatorStack.length - 1].precedence >
              currentToken.precedence ) ) ) {
        RPNexpr.push( operatorStack.pop().evaluate );                           // then pop o2 off the operator stack, onto the output queue;
      }

    case "left":                                                                // If the token is a left parenthesis (i.e. "("), then push it onto the stack.
      operatorStack.push( currentToken );
      break;

    case "right":                                                               // If the token is a right parenthesis (i.e. ")"):
      while ( !operatorStack[operatorStack.length - 1].type == "left" ) {       // Until the token at the top of the stack is a left parenthesis, pop operators off the stack onto the output queue.
        RPNexpr.push( operatorStack.pop().evaluate );
      }
      operatorStack.pop();                                                      // Pop the left parenthesis from the stack, but not onto the output queue.
      break;                                                                    // If the stack runs out without finding a left parenthesis, then there are mismatched parentheses.
    }
  }

  while ( operatorStack.length > 0 ) {                                          // When there are no more tokens to read, and there are still operator tokens in the stack:
                                                                                // If the operator token on the top of the stack is a parenthesis, then there are mismatched parentheses.
    RPNexpr.push( operatorStack.pop().evaluate );                               // Pop the operator onto the output queue.
  }

  return RPNexpr.reverse();                                                     // Exit.
}

// ---------- main ----------

//var expr = "1 - 11 * 2.3 / 0.2342";
//Test driven development for parsing:
var expr = 1*2;
var expr = 2*44;
var expr = 2+99;
var expr = 2/99;
var expr = 3+2+1+77*2-123;
var expr = 3 + 2 + 1 + 77 * 2 - 123;
console.log( "Expression:\n" + expr + "\n");
var tokens = lex( expr );
var RPN = parse( tokens );
console.log( "RPN Expression:\n" + RPN );



