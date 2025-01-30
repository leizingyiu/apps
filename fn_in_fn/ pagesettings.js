
const defaultOptions = {
    beforeFunction: '// {name} function \\n',
    beforeBody: '\\n upper{[( var {ranID}=(function(){\\n',
    body: '\\t{body}',
    afterBody: '})(); )]} \\nreturn {ranID};',
    afterFunction: '\\n// {name} function ends here\\n',
    fnsIn: "function upper(text){return text.toUpperCase();}"
};

const inputBox = document.getElementById('input'),
    outputBox = document.getElementById('output'),
    fnsInBox = document.getElementById('fnsIn'),
    fnsOutBox = document.getElementById('fnsOut');
let fns = '';


function updateProcessedCode() {
    const code = plainText(inputBox);
    const options = {
        beforeFunction: document.getElementById('beforeFunction').value,
        afterFunction: document.getElementById('afterFunction').value,
        beforeBody: document.getElementById('beforeBody').value,
        afterBody: document.getElementById('afterBody').value,
        body: document.getElementById('body').value
    };
    const processedCode = processFunctions(code, options);
    outputBox.innerText = processedCode;
}

document.querySelectorAll('input').forEach(input => {
    input.addEventListener('input', updateProcessedCode);

    const dt = input.closest('dl').querySelector('dt');
    dt.innerText = input.id;

    input.addEventListener('input', saveToLocalStorage);

});

inputBox.addEventListener('input', () => {
    updateProcessedCode();
    saveToLocalStorage();
});

function updateOutFns() {
    var fns = getFnsFromTxt(plainText(fnsInBox));
    fnsOutBox.innerText = fns.join('\n');
    return fns;
}
fnsInBox.addEventListener('input', () => {
    updateOutFns();
});

fnsInBox.addEventListener('blur', () => {
    updateOutFns();

    fns = getFnsFromTxt(plainText(fnsInBox));
    fns.forEach(fn => {
        try {
            const fnName = fn.match(/function\s+([^(]+)/)[1];
            window[fnName] = new Function('return ' + fn + '')();
        } catch (e) {
            console.error(`Error evaluating function: ${fn}`, e);
        }
    });
    updateProcessedCode();
    saveToLocalStorage();
});



Object.keys(defaultOptions).forEach(key => {
    try {
        document.getElementById(key).placeholder = defaultOptions[key];
    } catch (err) {

        document.getElementById(key).innerText = defaultOptions[key];
    }
});

document.querySelectorAll('li dt').forEach(dt => {
    dt.addEventListener('click', () => {
        const input = dt.nextElementSibling.querySelector('input');
        if (input) {
            input.focus();
        }
    });
});

function saveToLocalStorage() {
    const inputs = document.querySelectorAll('input');
    inputs.forEach(input => {
        localStorage.setItem(input.id, input.value);
    });
    localStorage.setItem('textareaInput', plainText(inputBox));
    // localStorage.setItem('textareaOutput', outputBox.innerText);

    localStorage.setItem('textareaFns', plainText(fnsInBox));

    if (!localStorage.getItem('firstVisit')) {
        localStorage.setItem('firstVisit', 'true');
    }


}

function loadFromLocalStorage() {
    const inputs = document.querySelectorAll('input');

    if (!localStorage.getItem('firstVisit')) {
        Object.keys(defaultOptions).forEach(key => {
            const input = document.getElementById(key);
            if (input.localName == 'input') {
                input.value = defaultOptions[key];
            } else {
                input.innerText = defaultOptions[key];
            }
        });
        window.upper = function (text) { return text.toUpperCase(); };
        updateProcessedCode();
        updateOutFns();
        window.delete(upper)

    } else {
        inputs.forEach(input => {
            const value = localStorage.getItem(input.id);
            if (value !== null) {
                input.value = value;
            }
        });
        const textareaInputValue = localStorage.getItem('textareaInput');
        if (textareaInputValue !== null) {
            inputBox.innerText = textareaInputValue;
        }
        const textareaFns = localStorage.getItem('textareaFns');
        if (textareaFns !== null) {
            fnsInBox.innerText = textareaFns;
        }

        updateProcessedCode();
        updateOutFns();

    }
}

window.addEventListener('load', loadFromLocalStorage);



document.addEventListener("keydown", async (event) => {
    console.log(event);
    const modifierKeys = [event.ctrlKey, event.metaKey, event.altKey].filter(Boolean).length;
    console.log(modifierKeys, event.code.toLowerCase());
    console.log([modifierKeys === 1 && event.code.toLowerCase() === "keys",
    modifierKeys === 1 && event.code.toLowerCase() === "keyo",
    modifierKeys === 1 && event.code.toLowerCase() === "keyr" && event.altKey].join('\n'));

    if (modifierKeys === 1 && event.code.toLowerCase() === "keys") {
        saveLocalStorageAsJSON();
        event.preventDefault();
        return false
    } else if (modifierKeys === 1 && event.code.toLowerCase() === "keyo") {
        console.log('loadJSONToLocalStorage();');
        loadJSONToLocalStorage();
        console.log('loadJSONToLocalStorage();');
    } else if (modifierKeys === 1 && event.code.toLowerCase() === "keyr" && event.altKey) {
        localStorage.clear();
        location.reload();
    }
});

function saveLocalStorageAsJSON() {
    const data = { ...localStorage };
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "yiu_js_prePrefnSuSuFixer_settings.json";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
}

function loadJSONToLocalStorage() {
    console.log('loadJSONToLocalStorage');
    var j = 0;
    console.log('j: ', j++);
    const fInput = document.createElement("input");
    fInput.type = "file";
    fInput.accept = "application/json";
    console.log('j: ', j++);

    fInput.addEventListener("change", (event) => {
        console.log('j: ', j++);
        const file = event.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        console.log('j: ', j++);
        reader.onload = function (e) {
            console.log('j: ', j++);
            try {
                let i = 0;
                console.log(i++)
                const jsonData = JSON.parse(e.target.result);
                if ("#input" in jsonData) {
                    const confirmReplace = confirm("检测到 #input 数据，是否替换 input 值？");
                    if (!confirmReplace) {
                        delete jsonData["#input"];
                    }
                }
                console.log(i++)
                Object.keys(jsonData).forEach(key => {
                    localStorage.setItem(key, jsonData[key]);
                });
                console.log(i++)
                loadFromLocalStorage();
                console.log(i++)
            } catch (error) {
                alert("加载 JSON 失败，请检查文件格式。");
            }
        };
        reader.readAsText(file);
    });
    console.log('j: ', j++);
    fInput.click();
}

