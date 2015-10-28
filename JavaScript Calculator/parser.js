// A stack implementation

function Stack () {
  this.dataStore = [];
  this.top = 0;
}
Stack.prototype = {
  push: function (data) {
    this.dataStore[this.top++] = data;
  },

  pop: function () {
    if ( this.top - 1 > -1 ) {
      return this.dataStore[--this.top];
    }
  },

  peek: function () {
    if (this.top - 1 > -1) {
      return this.dataStore[this.top - 1];
    }
  },

  length: function () {
    return this.top;
  }
}

const expressionTypes = {
  "number": {
    type: "number",
    test: function (str) { return /^\d+(\.\d+)?$/.test( str ); }
  },
  "leftp": {
    type: "leftp",
    test: function (str) { return /^\($/.test( str ); }
  },
  "rightp": {
    type: "rightp",
    test: function (str) { return /^\)$/.test( str ); }
  },
  "addition": {
    type: "op",
    precedence: 2,
    associativity: "left",
    test: function (str) { return /^\+$/.test( str ); },
    func: function (op1, op2) { return op1 + op2; }
  },
  "subtraction": {
    type: "op",
    precedence: 2,
    associativity: "left",
    test: function (str) { this.toString = function () { return "-"; }; return /^-$/.test( str ); },
    func: function (op1, op2) { return op1 - op2; }
  },
  "multiplication": {
    type: "op",
    precedence: 3,
    associativity: "left",
    test: function (str) { return /^\*$/.test( str ); },
    func: function (op1, op2) { return op1 * op2; }
  },
  "division": {
    type: "op",
    precedence: 3,
    associativity: "left",
    test: function (str) { return /^\/$/.test( str ); },
    func: function (op1, op2) { return op1 / op2; }
  },
  "power": {
    type: "op",
    precedence: 4,
    associativity: "right",
    test: function (str) { return /^\^$/.test( str ); },
    func: function (op1, op2) { return op1 ^ op2; }
  },
  "negation": {
    type: "op",
    precedence: 5,
    associativity: "right",
    test: function (str) { return /^-$/.test( str ); },
    func: function (op) { return -op; }
  },
  "sin": {
    type: "function",
    test: function(str) { return /^sin$/i.test(str); },
    func: Math.sin
  },
  "cos": {
    type: "function",
    test: function (str) { return /^cos$/i.test( str ); },
    func: Math.cos
  },
  "tan": { type: "function",
    test: function (str) { return /^tan$/i.test( str ); },
    func: Math.tan
  }
}

function InvalidTokenError (message) {
  this.name = "InvalidTokenError";
  this.message = ("Unrecognized token: " + message);
}
InvalidTokenError.prototype = Error.prototype;
function MismatchedParenthesesError (message) {
  this.name = "MismatchedParenthesesError";
  this.message = (message || "Mismatched parentheses in expression.");
}
MismatchedParenthesesError.prototype = Error.prototype;

var RPNCompiler = function () {

  function Expression(type, lexeme) {
    var expr = {};
    expr.lexeme = lexeme;
    expr.type = type.type;
    expr.precedence = type.precedence;
    expr.associativity = type.associativity;
    expr.func = type.func;
    expr.toString = function () {
      return "[" + this.type + ", \"" + this.lexeme + "\"]";
    }
    return expr;
  }

  var lex = function( input ) {
    var input = input + "";

    var tokens = [];

    var lexeme;
    var lastType;
    // Start from the beginning of the string and shrink the substring from the
    // end of the string until a match for a token is found.
    for ( var start = 0; start < input.length; start++ ) {
      for ( var end = input.length; end >= start; end-- ) {
        lexeme = input.substring( start, end );
        for ( var t in expressionTypes ) {
          if ( expressionTypes[t].test( lexeme ) ) {
            var token;
            if ( lexeme == "-" && ( !lastType || lastType.type == "op" ||
                lastType.type == "function" || lastType.type == "leftp" ||
                lastType.type == "rightp" ) ) {
              token = new Expression( expressionTypes["negation"], lexeme );
            } else {
              token = new Expression( expressionTypes[t], lexeme );
            }
            tokens.push( token );
            lastType = expressionTypes[t];
            start += lexeme.length - 1; // advance past the matched token
            break; // no need to shrink any further
          }
        }
      }
    }
    return tokens;
  }

  var parse = function( input ) {
    var RPNexpr = [];
    var operatorStack = new Stack();
    var currentToken;

    while ( input.length > 0 ) {                                                // While there are tokens to be read:
      currentToken = input.splice(0,1)[0];                                      // Read a token.
      switch ( currentToken.type ) {

      case "number":                                                            // If the token is a number, then add it to the output queue.
        RPNexpr.push( Number( currentToken.lexeme ) );
        break;

      case "op":                                                                // If the token is an operator, o1, then:
        while ( operatorStack.length() > 0 && ( (                               // while there is an operator token, o2, at the top of the operator stack,
            operatorStack.peek().type == "op" && ( (
              operatorStack.peek().associativity == "left" &&                   // and either o1 is left-associative and its precedence is greater than or equal to that of o2,
              operatorStack.peek().precedence >= currentToken.precedence ) || (
              operatorStack.peek().associativity == "right" &&                // or o1 is right associative, and has precedence greater than that of o2,
              operatorStack.peek().precedence > currentToken.precedence ) ) ) ||
            operatorStack.peek().type == "function" ) ) {
          RPNexpr.push( operatorStack.pop().func );                             // then pop o2 off the operator stack, onto the output queue;
        }
      case "function":
      case "leftp":                                                             // If the token is a left parenthesis (i.e. "("), then push it onto the stack.
        operatorStack.push( currentToken );
        break;

      case "rightp":                                                            // If the token is a right parenthesis (i.e. ")"):
        while ( operatorStack.length() > 0 &&
            operatorStack.peek().type != "leftp" ) {                            // Until the token at the top of the stack is a left parenthesis, pop operators off the stack onto the output queue.
          RPNexpr.push( operatorStack.pop().func );
        }
        if ( operatorStack.length() == 0 ) {                                    // If the stack runs out without finding a left parenthesis, then there are mismatched parentheses.
          throw new MismatchedParenthesesError();
        } else {
          operatorStack.pop();                                                  // Pop the left parenthesis from the stack, but not onto the output queue.
        }
        if ( operatorStack.length() > 0 &&
            operatorStack.peek().type == "op" ) {
          RPNexpr.push( operatorStack.pop().func );
        }
        break;

      default:
        throw new InvalidTokenError( currentToken.toString() );
      }
    }

    while ( operatorStack.length() > 0 ) {                                      // When there are no more tokens to read, and there are still operator tokens in the stack:
      var token = operatorStack.pop();
      if ( token.type == "leftp"){
        throw new MismatchedParenthesesError();                                 // If the operator token on the top of the stack is a parenthesis, then there are mismatched parentheses.
      } else {
        RPNexpr.push( token.func );                                             // Pop the operator onto the output queue.
      }
    }

    return RPNexpr;
  }

  // RPNCompiler object definition

  var obj = {};

  obj.compile = function (input) {
    var tokens = lex( input );
    return parse( tokens );
  }

  //Evaulation of the parsed tokens:
  obj.evaluate = function(input) {
    var finalNumber = 0;
    var currentStack = new Stack();                       //will be used for numbers and evaulations of said numbers by later functions

    var nextElement = rpn.shift();                        //get first value from parser array
    while(rpn.length >= 0 && nextElement != undefined){
      if(isNumeric(nextElement)){                         //if the element is a number, it is to be pushed onto the stack
        currentStack.push(nextElement);
      }else{            
      //TODO:: Send error if arguments is not correct
      var op2, op1;         
      if(nextElement.length ==1){                         //depending on the required arguments of the function, the arguments will be popped off 
        op1 = currentStack.pop();                         //the stack and used in the function stored in the element of the array
        currentStack.push(nextElement(op1));              //push the operation onto stack
      }else if(nextElement.length == 2){
        var op2 = currentStack.pop();
        var op1 = currentStack.pop();
        currentStack.push(nextElement(op1, op2));
      }
      
    }
    nextElement = rpn.shift();                              //get next element
  }
  //TODO: ERROR CHECKING FOR numbers of items left in stack
  finalNumber = currentStack.pop();   

  return finalNumber;                                         //returns the fully evaluated number 
}

//used to determine whether a given element if a number
function isNumeric(n){
  return !isNaN(parseFloat(n)) && isFinite(n);              
}

return obj;
}

// ---------- test ----------
/**
var expressions = [

// Singles tests

"1",
"0.23",
"1234",
"123.456",
"+",
"-",
"*",
"/",
"^",
"sin",
"cos",
"tan",

// Simple combination tests

"1 + 2",
"1 - 2",

// Parentheses tests

"( )",
"(",

// Negation tests

"- 2",
"- ( 23.5 )",
"- ( 1 + 2 )",

// Complex tests

"1 + 22.32 / ( 3 + sin( 4 / 7.2 ^ 2 ) * 3 ) + 4 / 0.45 - 6"

];

var expected = [

// Singles tests

[1],
[0.23],
[1234],
[123.456],
[expressionTypes["addition"].func],
[expressionTypes["negation"].func],
[expressionTypes["multiplication"].func],
[expressionTypes["division"].func],
[expressionTypes["power"].func],
[expressionTypes["sin"].func],
[expressionTypes["cos"].func],
[expressionTypes["tan"].func],

// Simple combination tests

[1, 2, expressionTypes["addition"].func],
[1, 2, expressionTypes["subtraction"].func],

// Parentheses tests

[],
[new MismatchedParenthesesError()],

// Negation tests

[2, expressionTypes["negation"].func],
[23.5, expressionTypes["negation"].func],
[1, 2, expressionTypes["addition"].func, expressionTypes["negation"].func],

// Complex tests

[1, 22.32, 3, 4, 7.2, 2, expressionTypes["power"].func,
  expressionTypes["division"].func, expressionTypes["sin"].func, 3,
  expressionTypes["multiplication"].func, expressionTypes["addition"].func,
  expressionTypes["division"].func, expressionTypes["addition"].func, 4, 0.45,
  expressionTypes["division"].func, expressionTypes["addition"].func, 6,
  expressionTypes["subtraction"].func]

];

function arraysEqual(a, b) {
  if (a === b) return true;
  if (a == null || b == null) return false;
  if (a.length != b.length) return false;
  for (var i = 0; i < a.length; ++i) {
    if (a[i] !== b[i]) return false;
  }
  return true;
}

console.log( expected[0] );

var compiler = new RPNCompiler(), rpn, psss;
for ( var i in expressions ) {
  console.log( "Expression: " + expressions[i] );
  try {
    rpn = compiler.compile( expressions[i] );
    console.log( "RPN Expression: [" +
                  String( rpn ).replace(/[\n\t\v\r ]+/gm," ) + "]" );
    pass = arraysEqual( expected[i], rpn );
  } catch ( e ) {
    console.log("Error: " + e );
    pass = typeof( e ) == typeof( expected[i][0] );
  }
  console.log( "Pass: " + pass );
  if ( !pass ) {
    console.log( "Expected: [" +
        String( expected[i] ).replace(/[\n\t\v\r ]+/gm," ) + "]" );
  }
  console.log();
}
*/


/*
//---tests for evaluator ---- 
var evalExpressions = [
"1",
"2.2",
"0.02420",
"0.0002",
"1+2",
"2+4",
"53+10.33",
"0.23+10000.2",
"-2 + 3",
"-2 - 3",
"-3 - -2",
"2+-4",
"5*4",
"-04*8",
"-3*-2",
"2/2",
"-2/5",
"2/-4",
"4^3",
"-4^4",
"2^-3",
"sin(780)",
"sin(-380)",
"cos(320)",
"cos(-321.4)",
"tan(123)",
"tan(-123.21)",

//extra parenthesis testing 
"(1)",
"(2.2)",
"(0.02420)",
"(0.0002)",
"(1+2)",
"(2+4)",
"(53+10.33)",
"(0.23+10000.2)",
"(-2 + 3)",
"(-2 - 3)",
"(-3 - -2)",
"(2+-4)",
"(5*4)",
"(-04*8)",
"(-3*-2)",
"(2/2)",
"(-2/5)",
"(2/-4)",
"(4^3)",
"(-4^4)",
"(2^-3)",
"(sin(780))",
"(sin(-380))",
"(cos(320))",
"(cos(-321.4))",
"(tan(123))",
"(tan(-123.21))",
"( 4 / 7.2 ^ 2 )", 
"( 3 + ( 4 / 7.2 ^ 2 ) * 3 )",
"4 / 0.45 - 6", 
"1 + 22.32 / ( 3 + ( 4 / 7.2 ^ 2 ) * 3 )",
"1 + 22.32 / ( 3 + ( 4 / 7.2 ^ 2 ) * 3 ) + 4 / 0.45 - 6"
] //end of evalExpressions

var evalExpected = [
1,
2.2,
0.02420,
0.0002 ,
(1+2),
2+4,
 53+10.33,
 0.23+10000.2,
 -2 + 3,
 -2 - 3,
 -3 - -2,
 2+-4,
 5*4,
 -04*8,
 -3*-2,
 2/2,
 -2/5,
 2/-4,
 4^3,
 -4^4,
 2^-3,
 Math.sin(780),
 Math.sin(-380),
 Math.cos(320),
 Math.cos(-321.4),
 Math.tan(123),
 Math.tan(-123.21),
 1,
2.2,
0.02420,
0.0002,
1+2,
2+4,
 53+10.33,
 0.23+10000.2,
 -2 + 3,
 -2 - 3,
 -3 - -2,
 2+-4,
 5*4,
 -04*8,
 -3*-2,
 2/2,
 -2/5,
 2/-4,
 4^3,
 -4^4,
 2^-3,
 Math.sin(780),
 Math.sin(-380),
 Math.cos(320),
 Math.cos(-321.4),
 Math.tan(123),
 Math.tan(-123.21),
 ( 4 / 7.2 ^ 2 ), 
( 3 + ( 4 / 7.2 ^ 2 ) * 3 ),
4 / 0.45 - 6, 
1 + 22.32 / ( 3 + ( 4 / 7.2 ^ 2 ) * 3 ),
1 + 22.32 / ( 3 + ( 4 / 7.2 ^ 2 ) * 3 ) + 4 / 0.45 - 6
]

var compiler = new RPNCompiler(), rpn, psss;

for(var i = 0; i < evalExpressions.length; i++ ){
  rpn = compiler.compile(evalExpressions[i]);
  var output = compiler.evaluate(rpn);
  if(output == evalExpected[i]){
    console.log("GREAT");
  }
  else{
    console.log("SHITTTTTTTTTTTT:::::::::");
    console.log(evalExpressions[i]);
    console.log(output + " "+evalExpected[i]);
  }
}