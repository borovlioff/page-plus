document.addEventListener('DOMContentLoaded', function() {
    const editor = document.getElementById('editor');
    const canvas = document.getElementById('grid-canvas');
    const ctx = canvas.getContext('2d');
    let gridEnabled = false;
    let cellSize = 20;

    // Initialize Interact.js draggable and resizable
    interact('.draggable')
        .draggable({
            listeners: {
                start(event) {
                    console.log('Drag start', event);
                },
                move(event) {
                    const target = event.target;
                    const x = (parseFloat(target.getAttribute('data-x')) || 0) + event.dx;
                    const y = (parseFloat(target.getAttribute('data-y')) || 0) + event.dy;

                    target.style.transform = `translate(${x}px, ${y}px)`;

                    target.setAttribute('data-x', x);
                    target.setAttribute('data-y', y);
                },
                end(event) {
                    console.log('Drag end', event);
                }
            }
        })
        .resizable({
            edges: { left: true, right: true, bottom: true, top: true },
            listeners: {
                move(event) {
                    const target = event.target;
                    const x = (parseFloat(target.getAttribute('data-x')) || 0);
                    const y = (parseFloat(target.getAttribute('data-y')) || 0);

                    target.style.width = `${event.rect.width}px`;
                    target.style.height = `${event.rect.height}px`;

                    target.setAttribute('data-x', x);
                    target.setAttribute('data-y', y);
                }
            }
        });

    // Event listeners for UI controls
    document.getElementById('add-empty-block-btn').addEventListener('click', function() {
        addBlock('empty-block');
    });

    document.getElementById('add-text-btn').addEventListener('click', function() {
        addTextBlockToCenter();
    });
    
    document.getElementById('add-text-context').addEventListener('click', function() {
        addTextBlock(contextMenuX, contextMenuY);
        hideContextMenu();
    });
    
    document.addEventListener('click', function() {
        hideContextMenu();
    });

    document.getElementById('toggle-grid-btn').addEventListener('click', function() {
        toggleGrid();
    });

    document.getElementById('cell-size').addEventListener('change', function() {
        cellSize = parseInt(this.value);
        if (gridEnabled) {
            toggleGrid();
            toggleGrid();
        }
    });

    document.getElementById('page-background-color').addEventListener('change', function() {
        const color = this.value;
        editor.style.backgroundColor = color;
    });

    document.getElementById('grid-color').addEventListener('change', function() {
        if (gridEnabled) {
            clearGrid();
            drawGrid();
        }
    });

    document.getElementById('apply-page-background-btn').addEventListener('click', function() {
        const color = document.getElementById('page-background-color').value;
        editor.style.backgroundColor = color;
    });

    document.getElementById('apply-css-btn').addEventListener('click', applyCss);

    document.getElementById('export-btn').addEventListener('click', exportPage);

});
    // Function to add a block to the editor
    function addBlock(type) {
        const block = document.createElement('div');
        block.classList.add(type, 'draggable');
        block.textContent = type === 'block' ? 'Предустановленный блок' : 'Пустой блок';
        editor.appendChild(block);
        interact(block)
            .draggable({
                listeners: {
                    start(event) {
                        console.log('Drag start', event);
                    },
                    move(event) {
                        const target = event.target;
                        const x = (parseFloat(target.getAttribute('data-x')) || 0) + event.dx;
                        const y = (parseFloat(target.getAttribute('data-y')) || 0) + event.dy;

                        target.style.transform = `translate(${x}px, ${y}px)`;

                        target.setAttribute('data-x', x);
                        target.setAttribute('data-y', y);
                    },
                    end(event) {
                        console.log('Drag end', event);
                    }
                }
            })
            .resizable({
                edges: { left: true, right: true, bottom: true, top: true },
                listeners: {
                    move(event) {
                        const target = event.target;
                        const x = (parseFloat(target.getAttribute('data-x')) || 0);
                        const y = (parseFloat(target.getAttribute('data-y')) || 0);

                        target.style.width = `${event.rect.width}px`;
                        target.style.height = `${event.rect.height}px`;

                        target.setAttribute('data-x', x);
                        target.setAttribute('data-y', y);
                    }
                }
            });

        // Add click event listener to show CSS editor on click
        block.addEventListener('click', function(event) {
            showCssEditor(block);
        });
    }

    // Function to toggle grid visibility
    function toggleGrid() {
        gridEnabled = !gridEnabled;
        if (gridEnabled) {
            drawGrid();
            document.getElementById('toggle-grid-btn').textContent = 'Выключить сетку';
        } else {
            clearGrid();
            document.getElementById('toggle-grid-btn').textContent = 'Включить сетку';
        }
    }

    // Function to draw grid on canvas
    function drawGrid() {
        const width = editor.offsetWidth;
        const height = editor.offsetHeight;

        canvas.width = width;
        canvas.height = height;

        ctx.strokeStyle = document.getElementById('grid-color').value;
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

    // Function to clear grid
    function clearGrid() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    }

    // Function to apply CSS styles
    function applyCss() {
        const selectedElement = document.querySelector('.selected');
        if (!selectedElement) return;

        const cssProperties = {
            width: document.getElementById('width').value,
            height: document.getElementById('height').value,
            backgroundColor: document.getElementById('background-color').value,
            color: document.getElementById('color').value,
            fontSize: document.getElementById('font-size').value,
            padding: document.getElementById('padding').value,
            margin: document.getElementById('margin').value,
            border: document.getElementById('border').value
        };

        // Apply CSS properties
        for (let prop in cssProperties) {
            selectedElement.style[prop] = cssProperties[prop];
        }

        // Apply ID and classes
        const elementId = document.getElementById('element-id').value.trim();
        if (elementId) {
            selectedElement.id = elementId;
        } else {
            selectedElement.removeAttribute('id');
        }

        const elementClass = document.getElementById('element-class').value.trim();
        if (elementClass) {
            selectedElement.className = elementClass;
        } else {
            selectedElement.removeAttribute('class');
        }
    }

    // Function to show CSS editor for an element
    function showCssEditor(element) {
        // Hide all other CSS editors
        const cssEditors = document.querySelectorAll('#css-editor');
        cssEditors.forEach(editor => {
            editor.classList.add('hidden');
        });

        // Show CSS editor for the clicked element
        const cssEditor = document.getElementById('css-editor');
        cssEditor.classList.remove('hidden');

        // Populate CSS editor with current styles of the element
        document.getElementById('width').value = parseInt(element.style.width) || '';
        document.getElementById('height').value = parseInt(element.style.height) || '';
        document.getElementById('background-color').value = element.style.backgroundColor || '';
        document.getElementById('color').value = element.style.color || '';
        document.getElementById('font-size').value = element.style.fontSize || '';
        document.getElementById('padding').value = element.style.padding || '';
        document.getElementById('margin').value = element.style.margin || '';
        document.getElementById('border').value = element.style.border || '';

        // Mark the element as selected for applying CSS styles
        element.classList.add('selected');
    }

    
    function exportPage() {
       
        
    
        // Clone the editor content
        const editorClone = editor.cloneNode(true);
    
        // Remove the canvas from the clone
        const canvasClone = editorClone.querySelector('#grid-canvas');
        const contextMenuClone = editorClone.querySelector('#context-menu');

        if(contextMenuClone){
            contextMenuClone.remove();}

        if (canvasClone) {
            canvasClone.remove();
        }
    
        // Create a new HTML document
        const doc = document.implementation.createHTMLDocument('Export');
        doc.body.appendChild(editorClone);
    
        // Create a blob of the HTML content
        const htmlContent = new XMLSerializer().serializeToString(doc);
        const blob = new Blob([htmlContent], { type: 'text/html' });
    
        // Create a download link
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = 'export.html';
        a.click();
    
        // Re-show the grid canvas
        canvas.style.display = 'block';
    }
    
    let contextMenuX = 0;
    let contextMenuY = 0;
    
    function showContextMenu(event) {
        event.preventDefault();
        contextMenuX = event.pageX;
        contextMenuY = event.pageY;
        const contextMenu = document.getElementById('context-menu');
        contextMenu.style.top = `${event.pageY}px`;
        contextMenu.style.left = `${event.pageX}px`;
        contextMenu.classList.remove('hidden');
    }
    
    function hideContextMenu() {
        const contextMenu = document.getElementById('context-menu');
        contextMenu.classList.add('hidden');
    }
    
    function addTextBlock(x, y) {
        const textBlock = document.createElement('div');
        textBlock.classList.add('text-block', 'draggable');
        textBlock.contentEditable = true;
        textBlock.textContent = 'Новый текст';
        textBlock.style.position = 'absolute';
        textBlock.style.left = `${x}px`;
        textBlock.style.top = `${y}px`;
    
        editor.appendChild(textBlock);
        interact(textBlock)
            .draggable({
                listeners: {
                    start(event) {
                        console.log('Drag start', event);
                    },
                    move(event) {
                        const target = event.target;
                        const x = (parseFloat(target.getAttribute('data-x')) || 0) + event.dx;
                        const y = (parseFloat(target.getAttribute('data-y')) || 0) + event.dy;
    
                        target.style.transform = `translate(${x}px, ${y}px)`;
    
                        target.setAttribute('data-x', x);
                        target.setAttribute('data-y', y);
                    },
                    end(event) {
                        console.log('Drag end', event);
                    }
                }
            })
            .resizable({
                edges: { left: true, right: true, bottom: true, top: true },
                listeners: {
                    move(event) {
                        const target = event.target;
                        const x = (parseFloat(target.getAttribute('data-x')) || 0);
                        const y = (parseFloat(target.getAttribute('data-y')) || 0);
    
                        target.style.width = `${event.rect.width}px`;
                        target.style.height = `${event.rect.height}px`;
    
                        target.setAttribute('data-x', x);
                        target.setAttribute('data-y', y);
                    }
                }
            });
    
        // Add click event listener to show CSS editor on click
        textBlock.addEventListener('click', function(event) {
            event.stopPropagation();
            showCssEditor(textBlock);
        });
    }

    function addTextBlockToCenter() {
        const textBlock = document.createElement('div');
        textBlock.classList.add('text-block', 'draggable');
        textBlock.contentEditable = true;
        textBlock.textContent = 'Новый текст';
        textBlock.style.position = 'absolute';
    
        // Get dimensions of the editor and the current viewport
        const editorRect = editor.getBoundingClientRect();
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;
    
        // Calculate center positions
        const centerX = (viewportWidth / 2) - (textBlock.offsetWidth / 2);
        const centerY = (viewportHeight / 2) - (textBlock.offsetHeight / 2);
    
        // Set text block position to the center of the viewport
        textBlock.style.left = `${centerX}px`;
        textBlock.style.top = `${centerY}px`;
    
        editor.appendChild(textBlock);
        interact(textBlock)
            .draggable({
                listeners: {
                    start(event) {
                        console.log('Drag start', event);
                    },
                    move(event) {
                        const target = event.target;
                        const x = (parseFloat(target.getAttribute('data-x')) || 0) + event.dx;
                        const y = (parseFloat(target.getAttribute('data-y')) || 0) + event.dy;
    
                        target.style.transform = `translate(${x}px, ${y}px)`;
    
                        target.setAttribute('data-x', x);
                        target.setAttribute('data-y', y);
                    },
                    end(event) {
                        console.log('Drag end', event);
                    }
                }
            })
            .resizable({
                edges: { left: true, right: true, bottom: true, top: true },
                listeners: {
                    move(event) {
                        const target = event.target;
                        const x = (parseFloat(target.getAttribute('data-x')) || 0);
                        const y = (parseFloat(target.getAttribute('data-y')) || 0);
    
                        target.style.width = `${event.rect.width}px`;
                        target.style.height = `${event.rect.height}px`;
    
                        target.setAttribute('data-x', x);
                        target.setAttribute('data-y', y);
                    }
                }
            });
    
        // Add click event listener to show CSS editor on click
        textBlock.addEventListener('click', function(event) {
            event.stopPropagation();
            showCssEditor(textBlock);
        });
    }