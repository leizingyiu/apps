const resizer = document.querySelector('#resizer');
const dt = document.querySelector('dt');
const dd = document.querySelector('dd');

let isResizing = false;

resizer.addEventListener('mousedown', (e) => {
    isResizing = true;
    document.body.style.cursor = 'col-resize';
});

document.addEventListener('mousemove', (e) => {
    if (!isResizing) return;

    const containerWidth = dt.parentElement.offsetWidth;
    const dtWidth = e.clientX - dt.getBoundingClientRect().left;
    const ddWidth = containerWidth - dtWidth - resizer.offsetWidth;

    dt.style.flex = `0 0 ${dtWidth}px`;
    // dd.style.flex = `0 0 ${ddWidth}px`;
});

document.addEventListener('mouseup', () => {
    if (isResizing) {
        isResizing = false;
        document.body.style.cursor = 'default';
    }
});

