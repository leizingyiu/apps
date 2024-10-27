
let init = false;
[...document.querySelectorAll('input')].forEach(i => {
    i
        .addEventListener('input', function () {
            const allInputsValid = [...document.querySelectorAll('input')].map(input => input.value) // 获取所有输入框的值
                .filter(value => value !== '' && !isNaN(value))
                .length === 3;

            if (allInputsValid) {
                drawFrustum(); // 如果输入都是有效数字，调用 drawFrustum
            }
        });
});

let isDragging = false;
let lastX = 0,
    lastY = 0;
let translateX = 0,
    translateY = 0;
let scale = 1;
let radianAngle = 0,
    rotate = 0;

let lastTransformStr = '';

const svg = document.getElementById('svgCanvas');
const contentGroup = document.getElementById('contentGroup');

// 添加拖拽和缩放功能
svg.addEventListener('mousedown', (e) => {
    // 如果鼠标在输入框上，不执行拖拽
    if (e.target.closest('.input-container'))
        return;

    isDragging = true;
    lastX = e.clientX;
    lastY = e.clientY;
    svg.style.cursor = 'grabbing';
});

svg.addEventListener('mousemove', (e) => {
    if (isDragging) {
        const dx = e.clientX - lastX;
        const dy = e.clientY - lastY;
        translateX += dx;
        translateY += dy;
        lastX = e.clientX;
        lastY = e.clientY;
        updateTransform();
    }
});

svg.addEventListener('mouseup', () => {
    isDragging = false;
    svg.style.cursor = 'grab';
});

svg.addEventListener('mouseleave', () => {
    isDragging = false;
    svg.style.cursor = 'grab';
});

svg.addEventListener('wheel', (e) => {
    e.preventDefault();
    const zoomFactor = 0.1;
    const direction = e.deltaY > 0
        ? -1
        : 1; // 滚轮向上：放大；滚轮向下：缩小
    scale *= 1 + direction * zoomFactor;
    updateTransform();
});

// 添加拖拽和缩放功能
svg.addEventListener('mousedown', (e) => {
    // 如果鼠标在输入框上，不执行拖拽
    if (e.target.closest('.input-container'))
        return;

    isDragging = true;
    lastX = e.clientX;
    lastY = e.clientY;
    svg.style.cursor = 'grabbing';
});

svg.addEventListener('mousemove', (e) => {
    if (isDragging) {
        const dx = e.clientX - lastX;
        const dy = e.clientY - lastY;
        translateX += dx;
        translateY += dy;
        lastX = e.clientX;
        lastY = e.clientY;
        updateTransform();
    }
});

svg.addEventListener('mouseup', () => {
    isDragging = false;
    svg.style.cursor = 'grab';
});

svg.addEventListener('mouseleave', () => {
    isDragging = false;
    svg.style.cursor = 'grab';
});

// 缩放功能
svg.addEventListener('wheel', (e) => {
    e.preventDefault();
    const zoomFactor = 0.1;
    const direction = e.deltaY > 0
        ? -1
        : 1; // 滚轮向上：放大；滚轮向下：缩小
    scale *= 1 + direction * zoomFactor;
    updateTransform();
});

let lastTouches = [];
let lastScale = 1;
let lastRotation = 0;
let startDistance = 0;
let startAngle = 0;

function touchStart(event) {
    // console.log(e);

    if (event.touches.length === 1) {
        // 单点触摸，记录初始位置
        lastTouches = [{ x: event.touches[0].clientX, y: event.touches[0].clientY }];
    } else if (event.touches.length >= 2) {
        // 多点触摸，记录初始位置、距离和角度
        lastTouches = [
            { x: event.touches[0].clientX, y: event.touches[0].clientY },
            { x: event.touches[1].clientX, y: event.touches[1].clientY }
        ];
        startDistance = getDistance(lastTouches[0], lastTouches[1]);
        startAngle = getAngle(lastTouches[0], lastTouches[1]);
    }

    animateID = requestAnimationFrame(updateTransform);

}

function touchMove(event) {
    // console.log(e);
    event.preventDefault();
    if (event.touches.length === 1) {
        // 单点触摸
        const dx = event.touches[0].clientX - lastTouches[0].x;
        const dy = event.touches[0].clientY - lastTouches[0].y;
        translateX += dx;
        translateY += dy;
        lastTouches = [{ x: event.touches[0].clientX, y: event.touches[0].clientY }];
    } else if (event.touches.length >= 2) {
        // 多点触摸
        const newTouches = [
            { x: event.touches[0].clientX, y: event.touches[0].clientY },
            { x: event.touches[1].clientX, y: event.touches[1].clientY }
        ];

        // 平移
        const newCenter = getCenter(newTouches[0], newTouches[1]);
        const oldCenter = getCenter(lastTouches[0], lastTouches[1]);
        translateX += newCenter.x - oldCenter.x;
        translateY += newCenter.y - oldCenter.y;

        // 缩放
        const newDistance = getDistance(newTouches[0], newTouches[1]);
        scale *= newDistance / startDistance;
        startDistance = newDistance;

        // 旋转
        const newAngle = getAngle(newTouches[0], newTouches[1]);

        rotate -= newAngle - startAngle;
        startAngle = newAngle;

        lastTouches = newTouches;
    }

    animateID = requestAnimationFrame(updateTransform);

}


function getDistance(point1, point2) {
    const dx = point2.x - point1.x;
    const dy = point2.y - point1.y;
    return Math.sqrt(dx * dx + dy * dy);
}

function getAngle(point1, point2) {
    // 计算两个点之间的角度
    const angle = Math.atan2(point2.y - point1.y, point2.x - point1.x) * (180 / Math.PI);

    // 通过计算新旧角度差值，保持角度的连续性
    let deltaAngle = angle - lastRotation;

    // 如果角度差超过180度，则进行调整
    if (deltaAngle > 180) {
        deltaAngle -= 360;
    } else if (deltaAngle < -180) {
        deltaAngle += 360;
    }

    // 更新上一个角度为当前角度
    lastRotation += deltaAngle;
    return lastRotation;
}

function getCenter(point1, point2) {
    return {
        x: (point1.x + point2.x) / 2,
        y: (point1.y + point2.y) / 2
    };
}


var animateID = '';

function updateTransform() {
    const transform = `translate(${translateX}, ${translateY}) scale(${scale}) rotate(${- rotate / 2 - 90})`;
    contentGroup.setAttribute('transform', transform); // 移动和缩放的是 g 标签，而不是整个 svg

    let transformStr = [translateX, translateY, scale, rotate].join(':');
    if (lastTransformStr != transformStr) {
        animateID = requestAnimationFrame(updateTransform);
        lastTransformStr = transformStr
    } else {
        cancelAnimationFrame(animateID);
    }
}


let r_large,
    r_small;

function drawFrustum(topDiameter, bottomDiameter, height) {
    // 获取输入的值
    topDiameter = topDiameter || parseFloat(document.getElementById('topDiameter').value);
    bottomDiameter = bottomDiameter || parseFloat(document.getElementById('bottomDiameter').value);
    height = height || parseFloat(document.getElementById('height').value);

    // 清空之前的 SVG 内容
    contentGroup.innerHTML = '';

    if (isNaN(topDiameter) || isNaN(bottomDiameter) || isNaN(height) || height <= 0) {
        alert("请输入有效的上直径、下直径和高度！");
        return;
    }

    // 计算大圆锥的高 h_cone

    let r = Math.min(topDiameter, bottomDiameter) / 2,
        R = Math.max(topDiameter, bottomDiameter) / 2;
    let h = height;
    let h_cone = h * R / (R - r);

    // 计算小圆锥的高 h_small_cone
    const h_small_cone = h_cone - height;

    // 计算大圆的半径 r_large 和小圆的半径 r_small
    r_large = Math.pow(Math.pow(h_cone, 2) + Math.pow(R, 2), 0.5);
    r_small = Math.pow(Math.pow(h_small_cone, 2) + Math.pow(r, 2), 0.5);

    // 计算展开的圆台在圆中的角度 angle
    rotate = (Math.max(bottomDiameter, topDiameter) / 2) / r_large * 360;

    // 定义圆心位置
    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;

    // 绘制大圆
    const largeCircle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    largeCircle.setAttribute('cx', centerX);
    largeCircle.setAttribute('cy', centerY);
    largeCircle.setAttribute('r', r_large);
    largeCircle.setAttribute('fill', 'none');
    largeCircle.setAttribute('stroke', 'black');
    largeCircle.setAttribute('stroke-width', '3');
    contentGroup.appendChild(largeCircle);

    // 绘制小圆
    const smallCircle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    smallCircle.setAttribute('cx', centerX);
    smallCircle.setAttribute('cy', centerY);
    smallCircle.setAttribute('r', r_small);
    smallCircle.setAttribute('fill', 'none');
    smallCircle.setAttribute('stroke', 'black');
    smallCircle.setAttribute('stroke-width', '3');
    contentGroup.appendChild(smallCircle);

    // 计算角度的弧度值
    radianAngle = rotate * (Math.PI / 180);

    // console.log("r, R, h_cone, h_small_cone, r_large, r_small, rotate, radianAngle".split(',').map(i => i + ':' + eval(i).toFixed(5)).join('; '));

    // 计算两条线的端点
    const X1 = centerX + r_large * Math.cos(0);
    const Y1 = centerY + r_large * Math.sin(0);

    const X2 = centerX + r_large * Math.cos(radianAngle);
    const Y2 = centerY + r_large * Math.sin(radianAngle);

    const x1 = centerX + r_small * Math.cos(0);
    const y1 = centerY + r_small * Math.sin(0);

    const x2 = centerX + r_small * Math.cos(radianAngle);
    const y2 = centerY + r_small * Math.sin(radianAngle);

    // 绘制第一条线
    const line1 = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    line1.setAttribute('x1', centerX);
    line1.setAttribute('y1', centerY);
    line1.setAttribute('x2', X1);
    line1.setAttribute('y2', Y1);
    line1.setAttribute('stroke', 'black');
    line1.setAttribute('stroke-width', '3');
    contentGroup.appendChild(line1);

    // 绘制第二条线
    const line2 = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    line2.setAttribute('x1', centerX);
    line2.setAttribute('y1', centerY);
    line2.setAttribute('x2', X2);
    line2.setAttribute('y2', Y2);
    line2.setAttribute('stroke', 'black');
    line2.setAttribute('stroke-width', '3');
    contentGroup.appendChild(line2);

    // 绘制圆台的填充部分
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    const arcFlag = rotate > 180
        ? 1
        : 0;
    const pathData = `
                M ${X1} ${Y1} 
                A ${r_large} ${r_large} 0 ${arcFlag} 1 ${X2} ${Y2}
                L ${x2} ${y2}
                A ${r_small} ${r_small} 0 ${arcFlag} 0 ${x1} ${y1}
                Z
            `;
    path.setAttribute('d', pathData);
    path.setAttribute('fill', 'blue');
    path.setAttribute('stroke', 'none');
    contentGroup.appendChild(path);

    if (init == false) {
        showInWindow();
        init = true;
    }

    updateInputValue(
        {
            "topDiameter": topDiameter,
            "bottomDiameter": bottomDiameter,
            "height": height
        }
    );

    updateUrlSearchParams({
        "topDiameter": topDiameter,
        "bottomDiameter": bottomDiameter,
        "height": height
    });

    requestAnimationFrame(updateTransform);

}

function showInWindow() {
    const w = r_large * 2; // 图形的宽度（大圆的直径）
    const h = r_large * 2; // 图形的高度（大圆的直径）
    const W = window.innerWidth; // 窗口的宽度
    const H = window.innerHeight; // 窗口的高度

    // 计算出适应窗口的缩放比例
    scale = Math.min(W / w, H / h);

    // // 将图形居中显示的偏移量 offsetX = (w * (1 - scale)) * scale / 2; // 居中的X偏移量 offsetY =
    // (h * (1 - scale)) * scale / 2; // 居中的Y偏移量

    translateX = 0, translateY = 0;
    updateTransform();
}

// 下载 SVG 文件的功能
document
    .addEventListener('keydown', function (e) {
        if ((e.ctrlKey || e.metaKey) && e.key === 's') {
            e.preventDefault(); // 阻止默认的保存行为
            downloadSVG();
        }
    });

function downloadSVG(svg = document.querySelector('svg')) {
    const now = new Date();
    const formattedDate = now.toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false // 24小时制
    }).replace(/\//g, '-').replace(',', ' ');

    const comments = `
        <!--
        - URL:${window.location.href}
        - Date: ${formattedDate}
        - Website Author: Leizingyiu
        -->
    `;

    let svgData = comments + new XMLSerializer().serializeToString(svg);

    console.log(svgData);

    svgData = svgData.split('\n').map(str => {
        if (str.indexOf('contentGroup')) {
            return str.replace(/transform="[^"]+(rotate\([^\)]*\))"/, 'transform="$1"' + " style='transform-origin: center;'")
        } else { return str }
    }).join('\n');
    console.log(svgData);
    const blob = new Blob([svgData], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'yiu_frustum.svg';
    document
        .body
        .appendChild(link);
    link.click();
    document
        .body
        .removeChild(link);
}




window.addEventListener('load', function () {
    console.clear();
    try {


        const drawFrustumParams = 'topDiameter,bottomDiameter,height'.split(',');
        const urlParams = new URLSearchParams(window.location.search);
        const initDrawParams = filterAndSortParams(urlParams, drawFrustumParams);
        console.log(urlParams, initDrawParams);
        drawFrustum.apply(null, initDrawParams);
    } catch (e) {
        drawFrustum();
        console.error(e)
    }


}
)

function updateInputValue(id, value) {
    if (arguments.length == 1 && typeof arguments[0] == 'object') {
        try {
            Object.entries(arguments[0]).map(([key, value]) => {
                document.getElementById(key).value = value;
            })
        } catch (e) {
            console.log(e)
        }
    } else {
        document.getElementById(id).value = value;
    }
}

function filterAndSortParams(urlSearchParams, needParamsArr) {
    return needParamsArr.map(k => urlSearchParams.get(k) || undefined);;
}


function updateUrlSearchParams(newParams) {
    const url = new URL(window.location.href);
    const urlSearchParams = new URLSearchParams(url.search);
    for (const [key, value] of Object.entries(newParams)) {
        urlSearchParams.set(key, value);
    }
    url.search = urlSearchParams.toString();
    window.history.pushState({}, '', url);
}

