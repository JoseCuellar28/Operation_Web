const jsdom = require("jsdom");
const { JSDOM } = jsdom;
const createDOMPurify = require("dompurify");

// Mock Browser Environment
const dom = new JSDOM(`<!DOCTYPE html><body></body>`);
const window = dom.window;
global.window = window;
global.document = window.document;

// Mock DOMPurify
const DOMPurify = createDOMPurify(window);

// Load UI Components (simulating script load)
const fs = require('fs');
const uiComponentsCode = fs.readFileSync('frontend/Modelo_Funcional/js/ui-components.js', 'utf8');
eval(uiComponentsCode);

// Test Suite
console.log("Running UI Verification Tests...");

let testsPassed = 0;
let testsFailed = 0;

function assert(condition, message) {
    if (condition) {
        console.log(`✅ PASS: ${message}`);
        testsPassed++;
    } else {
        console.error(`❌ FAIL: ${message}`);
        testsFailed++;
    }
}

// Test 1: UIComponents defined
assert(typeof window.UIComponents !== 'undefined', "UIComponents should be defined globally");

// Test 2: getConfiguracionContent exists
assert(typeof window.UIComponents.getConfiguracionContent === 'function', "getConfiguracionContent should be a function");

// Test 3: Returns string
const content = window.UIComponents.getConfiguracionContent();
assert(typeof content === 'string' && content.length > 0, "Should return a non-empty string");

// Test 4: Contains Tailwind Classes
assert(content.includes('max-w-4xl'), "Should contain 'max-w-4xl' class");
assert(content.includes('text-primary'), "Should contain 'text-primary' class");
assert(content.includes('bg-card'), "Should contain 'bg-card' class");

// Test 5: DOMPurify Sanitization
const config = { ADD_TAGS: ['style'], ADD_ATTR: ['onclick', 'onchange', 'onsubmit', 'class', 'id', 'style', 'target', 'placeholder', 'type', 'value', 'name'] };
const sanitized = DOMPurify.sanitize(content, config);

// Test 6: Sanitized content not empty
assert(sanitized.length > 0, "Sanitized content should not be empty");

// Test 7: Classes preserved after sanitization
assert(sanitized.includes('class="max-w-4xl'), "Classes should be preserved after sanitization");

// Test 8: Inputs preserved
assert(sanitized.includes('<input'), "Input tags should be preserved");

// Test 9: Placeholders preserved
assert(sanitized.includes('placeholder="smtp.gmail.com"'), "Placeholders should be preserved");

// Test 10: Onsubmit preserved
assert(sanitized.includes('onsubmit="event.preventDefault(); guardarConfiguracion();"'), "Onsubmit should be preserved");

// Test 11: Icons preserved
assert(sanitized.includes('class="fas fa-save mr-2"'), "FontAwesome icons should be preserved");

console.log(`\nSummary: ${testsPassed} Passed, ${testsFailed} Failed`);

if (testsFailed > 0) {
    process.exit(1);
}
