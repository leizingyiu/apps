
function plainText(dom) {
    return dom.innerText || dom.textContent
}
function getFnsFromTxt(txt) {
    let fns = [];

    txt.replace(
        /(\bfunction\s+(\w+)?\s*\([^)]*\)\s*{)|(((const)|(var)|(let))\s*(\w+)\s*=\s*\([^)]*\)\s*=>\s*{)/g,
        (match, p1, p2, p3, p4, p5, p6, p7, p8, offset, string) => {
            let endBracketIndex = findMatchingBracket(string, offset + match.length - 1);
            if (endBracketIndex === -1) {
                return match; // 如果没有找到匹配的括号，返回原字符串
            }
            // 获取整个函数的完整部分
            const fullFunction = string.substring(offset, endBracketIndex);
            fns.push(fullFunction);
        }
    );
    return fns;
}
function processFunctions(code, options) {
    let { beforeFunction = '', afterFunction = '', beforeBody = '', afterBody = '', body = '{body}' } = options,
        indentation = body.indexOf('\\t') == 0;
    // console.log(indentation);
    const replaceNewlines = (str) => str.replace(/\\n/g, '\n');
    beforeFunction = replaceNewlines(beforeFunction);
    afterFunction = replaceNewlines(afterFunction);
    beforeBody = replaceNewlines(beforeBody);
    afterBody = replaceNewlines(afterBody);
    body = replaceNewlines(body);

    if (!body.includes('{body}')) {
        body += '\n{body}';
    }

    let newcode = code;
    let fns = getFnsFromTxt(code);


    for (var i = 0; i < fns.length; i++) {
        var _fn = fns[i];
        var _newfn = _fn.replace(/((\bfunction\s+(\w+)?\s*\([^)]*\)\s*{)|(\s*((var)|(const)|(let))\s{1,}(\w+)\s*=\s*\([^)]*\)\s*=>\s*{?))([\n\s\S]+)/g,
            (match, p1, p2, p3, p4, p5, p6, p7, p8, p9, p10, offset, string) => {
                const isArrowFunction = !!p4;
                const functionName = isArrowFunction ? p9 : p3 || 'anonymous';

                // 获取整个函数的完整部分
                const functionBody = p10.trim().replace(/\}$/, '');

                var ranID = Math.random().toString(36).substring(2, 8);
                // 处理函数体
                const resolvedBeforeFunction = beforeFunction.
                    replace(/\{name\}/g, functionName)
                    .replace(/\{((randomID)|(ranID)|(randomName)|(ranName))\}/g, ranID);

                const resolvedBeforeBody = beforeBody.
                    replace(/\{name\}/g, functionName)
                    .replace(/\{((randomID)|(ranID)|(randomName)|(ranName))\}/g, ranID);

                let resolvedBody = body.
                    replace(/\{name\}/g, functionName)
                    .replace(/\{((randomID)|(ranID)|(randomName)|(ranName))\}/g, ranID)
                    .replace(/\{body\}/g, functionBody.trim());
                if (indentation) {
                    resolvedBody = resolvedBody.replace(/^\\t/, '').split(/[\n\r]/g).map(line => '\t' + line.trim()).join('\n');
                }

                const resolvedAfterBody = afterBody
                    .replace(/\{name\}/g, functionName)
                    .replace(/\{((randomID)|(ranID)|(randomName)|(ranName))\}/g, ranID);

                const resolvedAfterFunction = afterFunction
                    .replace(/\{name\}/g, functionName)
                    .replace(/\{((randomID)|(ranID)|(randomName)|(ranName))\}/g, ranID);


                var result = `${resolvedBeforeFunction}${p1}${resolvedBeforeBody}${resolvedBody}\n${resolvedAfterBody}\n}${resolvedAfterFunction}`;
                return result;
            });
        _newfn = runFnsInFnTxt(_newfn);
        newcode = newcode.replace(_fn, _newfn);
    }

    return newcode;
}

function findMatchingBracket(str, startIndex) {
    let stack = [];
    for (let i = startIndex; i < str.length; i++) {
        if (str[i] === '{') stack.push('{');
        else if (str[i] === '}') {
            stack.pop();
            if (stack.length === 0) return i + 1; // 包括闭合括号
        }
    }
    return -1;
}

function runFnsInFnTxt(text) {
    return text.replace(/(\S+)\{\[\(([\s\S\n\r]*)\)\]\}/g, function (match, p1, p2) {
        // console.log([...arguments].map((a, idx) => idx + ':' + a + '\n').join('\n'));
        if (typeof window[p1] == 'function') {
            return window[p1](p2);
        }
    });
}