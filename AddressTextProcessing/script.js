const dict = {
    姓名: "name",
    电话: "phone",
    省名: "province",
    市名: "city",
    区名: "county",
    街名: "street",
    地址: "address",
    邮编: "zipCode",
    身份证: "idCard",
    省号: "provinceCode",
    市号: "cityCode",
    区号: "countyCode",
    街号: "streetCode"
};

main = document.querySelector("main");

let settingP = document.createElement("p");
settingP.innerHTML = `<b>行顺序设置</b>： 请填入 ${Object.keys(dict).join(
    ","
)}，使用英文逗号分隔。\n`;
main.insertBefore(settingP, document.getElementById("address"));

let settingInput = document.createElement("input");
settingInput.id = 'settingInput';
settingP.appendChild(settingInput);
// settingInput.value = Object.keys(dict).join(",");
settingInput.value = "姓名,电话,省名市名区名街名地址";
settingInput.style.display = "block";

let splitP = document.createElement("p");
splitP.innerHTML =
    "请选择输出分隔符，comma为英文逗号，tabs为制表符，选择input请在右侧填入<br>";

main.insertBefore(splitP, document.getElementById("address"));

let splitSelector = document.createElement("select"),
    splitDict = {
        comma: ",",
        tabs: "\t",
        input: "input"
    };
"comma,tabs,input".split(",").map((k) => {
    let o = document.createElement("option");
    (o.value = splitDict[k]), (o.innerText = k);
    splitSelector.appendChild(o);
    if (k == 'tabs') { o.selected = true; }
});

let splitInput = document.createElement("input");
splitInput.value = "，";
splitInput.setAttribute("disabled", "true");

splitP.appendChild(splitSelector);
splitP.appendChild(splitInput);

const emptyText = "-";

let emptyP = document.createElement("p");
emptyP.innerText = "请填入空内容项的占位符";
main.insertBefore(emptyP, document.getElementById("address"));

let emptyInput = document.createElement("input");
emptyInput.value = " ";
emptyP.appendChild(emptyInput);

let emptyCellP = document.createElement("p");
emptyCellP.innerText =
    "请填入空单元格的占位符。即上面设置的分隔符中，整段缺失才显示的字符";
main.insertBefore(emptyCellP, document.getElementById("address"));

let emptyCellInput = document.createElement("input");
emptyCellInput.value = "此格无内容";
emptyCellP.appendChild(emptyCellInput);


let copyBtn = document.createElement('button');
copyBtn.innerText = '复制结果';
copyBtn.setAttribute('disabled', 'true');
main.insertBefore(copyBtn, document.getElementById('result'));
copyBtn.onclick = function () {
    if (!this.hasAttribute('disabled')) {
        copyStr(document.getElementById('result').innerText);
    }
}

function mainFn() {
    const splitor =
        splitSelector.value == "input" ? splitInput.value : splitSelector.value;

    let input = document.querySelector("#address").value;
    let result = input.split(/\n/g).map((d) => smart(d));
    let format = settingInput.value;

    if (input.value != '') { copyBtn.removeAttribute('disabled'); } else { copyBtn.setAttribute('disabled', 'true'); }


    Object.keys(dict).map((k) => { format.replace(k, dict[k]); });

    resultText = result.map((line) => {
        let f = format;
        Object.keys(dict).map((k) => {
            let r = line[dict[k]];
            f = f.replace(
                k,
                typeof r == "undefined" || r == "undefined" ? emptyInput.value : r
            );
        });
        f = f
            .split(",")
            .map((_f) =>
                _f.replace(new RegExp(emptyInput.value, "g"), "") == "" ?
                    emptyCellInput.value :
                    _f
            )
            .join(splitor);
        return f;
    });

    document.getElementById("result").innerHTML = resultText.join("<br>");
}

emptyInput.oninput = mainFn;
emptyCellInput.oninput = mainFn;

splitSelector.oninput = function (e) {
    this.value = [...e.target.children].filter((o) => o.selected == true)[0].value;
    console.log(this.value);
    if (this.value == "input") {
        splitInput.removeAttribute("disabled");
    } else {
        splitInput.setAttribute("disabled", "true");
    }
    mainFn();
};

splitInput.oninput = mainFn;
settingInput.oninput = mainFn;

document.querySelector("#address").onblur = mainFn;

// function () {
//   main();
//   // let data = smart(document.querySelector("#address").value);
//   // document.querySelector("#value").innerHTML = creatHtml(data);

//   // let format = [...document.querySelectorAll("#sort>li>*")].map(
//   //   (dom) => dom.value
//   // );
//   // console.log(format);

//   //   result.map((line) => {
//   //     format
//   //       .filter((f) => f != "false")
//   //       .map((f, idx) => {
//   //         console.log(f, line[f]);
//   //         let resultitem =
//   //           idx % 2 == 0 ? (typeof line[f] == "undefined" ? "-" : line[f]) : f;

//   //         document.getElementById("result").value += resultitem;
//   //       });
//   //     document.getElementById("result").value += "\n";
//   //   });
// };

// let ol = document.createElement("ol");
// ol.id = "sort";
// document.body.insertBefore(ol, document.getElementById("address"));

// "name,phone,county,province,city,street,address,zipCode,idCard,countyCode,provinceCode,cityCode,streetCode"
//   .split(",")
//   .map((n, idx, arr) => {
//     let li = document.createElement("li"),
//       select = document.createElement("select");
//     let li2 = document.createElement("li"),
//       label = document.createElement("label"),
//       input = document.createElement("input");

//     select.id = "s" + idx;
//     arr.map((_n) => {
//       let opt = document.createElement("option");
//       opt.value = _n;
//       opt.innerText = _n;
//       select.appendChild(opt);
//       if (_n == n) {
//         opt.setAttribute("selected", "true");
//       }
//     });
//     select.oninput = function () {
//       let target = false;
//       [...document.querySelectorAll("#sort select")].map((s) => {
//         if (s.value == "false") {
//           target = true;
//         }
//         if (target == true) {
//           s.value = "false";
//           input.value = "false";
//         } else {
//           input.value = input.checked ? "/t" : " ";
//         }
//       });
//     };

//     let opt = document.createElement("option");
//     opt.value = "false";
//     opt.innerText = "-";
//     select.appendChild(opt);

//     li.appendChild(select);
//     ol.appendChild(li);

//     li2.classList.add("end");
//     input.type = "checkbox";
//     li2.innerText = "t";
//     li2.appendChild(input);
//     input.value = " ";
//     input.onclick = function () {
//       console.log(this.checked);
//       this.value = this.checked ? "/t" : " ";
//     };
//     ol.appendChild(li2);
//   });

// function creatHtml(data) {
//   let html = "";
//   for (let key in data) {
//     if (data[key]) {
//       html +=
//         `<p><span class="key">` +
//         key +
//         `</span>:<span class="value">` +
//         data[key] +
//         `</span></p>`;
//     }
//   }
//   return html;
// }

function copyStr(str) {
    var a = document.createElement("textarea");
    a.value = str;
    document.body.appendChild(a);
    a.select();
    document.execCommand("Copy");
    a.style.display = "none";
    window.alert(str + "内容已复制到剪贴板");
};
