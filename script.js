let selectedElement = null;
let copiedElement = null;
let gridEnabled = false;
let canvas = null;
let ctx = null;
let cellSize = 20;

$(document).ready(function() {
    $('#add-block-btn').click(function() {
        addBlock('block');
    });

    $('#add-empty-block-btn').click(function() {
        addBlock('empty-block');
    });

    $('#add-image-btn').click(function() {
        $('#image-upload').click();
    });

    $('#image-upload').change(handleImageUpload);

    $('#add-div-btn').click(function() {
        addElement('div');
    });

    $('#add-text-btn').click(function() {
        addText();
    });

    $('#save-block-btn').click(saveBlock);

    $('#load-block-btn').click(loadBlock);

    $('#delete-element-btn').click(deleteElement);

    $('#copy-element-btn').click(copyElement);

    $('#paste-element-btn').click(pasteElement);

    $('#apply-css-btn').click(applyCss);

    $('#toggle-grid-btn').click(function() {
        toggleGrid();
    });

    $('#cell-size').change(function() {
        cellSize = parseInt($(this).val());
        if (gridEnabled) {
            toggleGrid();
            toggleGrid();
        }
    });

    $('#page-background-color').change(function() {
        const color = $(this).val();
        $('#editor').css('background-color', color);
    });

    $('#grid-color').change(function() {
        if (gridEnabled) {
            clearGrid();
            drawGrid();
        }
    });

    $('#apply-page-background-btn').click(function() {
        const color = $('#page-background-color').val();
        $('#editor').css('background-color', color);
    });

    canvas = document.getElementById('grid-canvas');
    ctx = canvas.getContext('2d');

    $('#editor').on('mouseenter', '.block, .empty-block, .image, .div, .text', function() {
        showElementMenu($(this));
    });

    $('#editor').on('mouseleave', '.block, .empty-block, .image, .div, .text', function() {
        hideElementMenu();
    });

    $('#editor').on('click', '.element-menu button.copy-element', function() {
        copyElement($(this).parent().data('element'));
    });

    $('#editor').on('click', '.element-menu button.delete-element', function() {
        deleteElement($(this).parent().data('element'));
    });

    $('#editor').sortable({
        handle: '.drag-handle',
    });
});

function addBlock(type) {
    const editor = $('#editor');
    const block = $('<div></div>').addClass(type);
    block.text(type === 'block' ? 'Предустановленный блок' : 'Пустой блок');
    block.addClass('draggable');
    editor.append(block);
    addResizeHandles(block);
    block.draggable({
        containment: 'parent',
    });
}

function addElement(type) {
    const editor = $('#editor');
    const element = $('<div></div>').addClass(type);
    element.text(type);
    element.addClass('draggable');
    editor.append(element);
    addResizeHandles(element);
    element.draggable({
        containment: 'parent',
    });
}

function addText() {
    const editor = $('#editor');
    const textElement = $('<div contenteditable="true"></div>').addClass('text');
    textElement.text('Редактируемый текст');
    textElement.addClass('draggable');
    editor.append(textElement);
    addResizeHandles(textElement);
    textElement.draggable({
        containment: 'parent',
    });
}

function saveBlock() {
    const blocks = [];

    $('#editor').children().each(function() {
        const block = {};
        block.type = $(this).attr('class');
        block.content = $(this).html();
        block.css = {
            width: $(this).css('width'),
            height: $(this).css('height'),
            backgroundColor: $(this).css('backgroundColor'),
            color: $(this).css('color'),
            fontSize: $(this).css('fontSize'),
            padding: $(this).css('padding'),
            margin: $(this).css('margin'),
            border: $(this).css('border'),
        };
        blocks.push(block);
    });

    localStorage.setItem('savedBlocks', JSON.stringify(blocks));
    alert('Блоки сохранены!');
}

function loadBlock() {
    const blocks = JSON.parse(localStorage.getItem('savedBlocks'));
    if (!blocks || !blocks.length) return;

    $('#editor').empty();
    blocks.forEach(block => {
        const newBlock = $('<div></div>').addClass(block.type);
        newBlock.html(block.content);
        newBlock.css(block.css);
        newBlock.addClass('draggable');
        $('#editor').append(newBlock);
        addResizeHandles(newBlock);
        newBlock.draggable({
            containment: 'parent',
        });
    });

    alert('Блоки загружены!');
}

function deleteElement(element) {
    if (!element) return;

    element.remove();
}

function copyElement(element) {
    if (!element) return;

    copiedElement = element.clone();
}

function pasteElement() {
    if (!copiedElement) return;

    const editor = $('#editor');
    const newElement = copiedElement.clone();
    editor.append(newElement);
    addResizeHandles(newElement);
    newElement.draggable({
        containment: 'parent',
    });
}

function applyCss() {
    if (!selectedElement) return;

    const cssProperties = {
        width: $('#width').val(),
        height: $('#height').val(),
        backgroundColor: $('#background-color').val(),
        color: $('#color').val(),
        fontSize: $('#font-size').val(),
        padding: $('#padding').val(),
        margin: $('#margin').val(),
        border: $('#border').val(),
    };

    selectedElement.css(cssProperties);
}

function handleImageUpload(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            addImage(e.target.result);
        }
        reader.readAsDataURL(file);
    }
}

function addImage(src) {
    const editor = $('#editor');
    const image = $('<img>');
    image.addClass('image draggable');
    image.attr('src', src);
    editor.append(image);
    addResizeHandles(image);
    image.draggable({
        containment: 'parent',
    });
}

function addResizeHandles(element) {
    const handles = ['tl', 'tr', 'bl', 'br'];
    handles.forEach(handle => {
        const div = $('<div></div>').addClass(`resize-handle ${handle}`);
        element.append(div);
    });

    element.resizable({
        handles: 'ne, se, sw, nw',
    });
}

function toggleGrid() {
    if (!gridEnabled) {
        drawGrid();
        $('#toggle-grid-btn').text('Выключить сетку');
    } else {
        clearGrid();
        $('#toggle-grid-btn').text('Включить сетку');
    }
    gridEnabled = !gridEnabled;
}

function drawGrid() {
    const editor = $('#editor');
    const width = editor.width();
    const height = editor.height();
    
    canvas.width = width;
    canvas.height = height;

    ctx.strokeStyle = $('#grid-color').val();
    ctx.lineWidth = 1;

    for (let x = 0; x <= width; x += cellSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
    }

    for (let y = 0; y <= height; y += cellSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
    }
}

function clearGrid() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}

function showElementMenu(element) {
    const menu = $('<div></div>').addClass('element-menu');
    const copyBtn = $('<button>Копировать</button>').addClass('copy-element');
    const deleteBtn = $('<button>Удалить</button>').addClass('delete-element');
    menu.append(copyBtn).append(deleteBtn);
    menu.data('element', element);

    const position = element.position();
    menu.css({
        top: position.top,
        left: position.left + element.outerWidth(),
    });

    $('body').append(menu);
}

function hideElementMenu() {
    $('.element-menu').remove();
}
