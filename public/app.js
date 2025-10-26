// Tile Diagrams Application
class TileDiagram {
    constructor() {
        this.gridWidth = 8;
        this.gridHeight = 8;
        this.squareSize = 50;
        this.tiles = []; // Array of placed tiles
        this.xMarkers = []; // Array of X markers
        this.selectedSquare = null; // First square selected for tile placement
        this.mode = 'tile'; // Current mode: 'tile' or 'x'
        this.currentObjectColor = '#4CAF50'; // Current color for new objects
        this.svg = document.getElementById('canvas');
        this.colors = {
            stroke: '#2E7D32',
            checkerLight: '#F0D9B5',
            checkerDark: '#B58863'
        };
        
        this.initializeEventListeners();
        this.renderGrid();
    }
    
    initializeEventListeners() {
        // Mode change
        document.querySelectorAll('input[name="mode"]').forEach(radio => {
            radio.addEventListener('change', (e) => {
                this.mode = e.target.value;
                // Clear selection when switching modes
                if (this.selectedSquare) {
                    this.highlightSquare(this.selectedSquare.row, this.selectedSquare.col, false);
                    this.selectedSquare = null;
                }
            });
        });
        
        // Grid width change
        document.getElementById('gridWidth').addEventListener('change', (e) => {
            this.gridWidth = parseInt(e.target.value);
            this.resetGrid();
        });
        
        // Grid height change
        document.getElementById('gridHeight').addEventListener('change', (e) => {
            this.gridHeight = parseInt(e.target.value);
            this.resetGrid();
        });
        
        // Reset button
        document.getElementById('resetBtn').addEventListener('click', () => {
            this.resetGrid();
        });
        
        // Object color picker
        document.getElementById('objectColor').addEventListener('input', (e) => {
            this.currentObjectColor = e.target.value;
        });
        
        document.getElementById('strokeColor').addEventListener('input', (e) => {
            this.colors.stroke = e.target.value;
            this.renderTiles();
        });
        
        document.getElementById('checkerLight').addEventListener('input', (e) => {
            this.colors.checkerLight = e.target.value;
            this.renderGrid();
        });
        
        document.getElementById('checkerDark').addEventListener('input', (e) => {
            this.colors.checkerDark = e.target.value;
            this.renderGrid();
        });
        
        // Clear tiles button
        document.getElementById('clearTilesBtn').addEventListener('click', () => {
            this.clearTiles();
        });
        
        // Save button
        document.getElementById('saveBtn').addEventListener('click', () => {
            this.saveSVG();
        });
        
        // Copy to clipboard button
        document.getElementById('copyBtn').addEventListener('click', () => {
            this.copyToClipboard();
        });
    }
    
    resetGrid() {
        this.tiles = [];
        this.xMarkers = [];
        this.selectedSquare = null;
        this.renderGrid();
    }
    
    clearTiles() {
        this.tiles = [];
        this.xMarkers = [];
        this.selectedSquare = null;
        this.renderTiles();
        this.renderXMarkers();
    }
    
    renderGrid() {
        // Clear SVG
        this.svg.innerHTML = '';
        
        // Set SVG size
        const totalWidth = this.gridWidth * this.squareSize;
        const totalHeight = this.gridHeight * this.squareSize;
        this.svg.setAttribute('width', totalWidth);
        this.svg.setAttribute('height', totalHeight);
        this.svg.setAttribute('viewBox', `0 0 ${totalWidth} ${totalHeight}`);
        
        // Create checkerboard
        for (let row = 0; row < this.gridHeight; row++) {
            for (let col = 0; col < this.gridWidth; col++) {
                const square = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
                const x = col * this.squareSize;
                const y = row * this.squareSize;
                
                // Checkerboard pattern
                const isLight = (row + col) % 2 === 0;
                const color = isLight ? this.colors.checkerLight : this.colors.checkerDark;
                
                square.setAttribute('x', x);
                square.setAttribute('y', y);
                square.setAttribute('width', this.squareSize);
                square.setAttribute('height', this.squareSize);
                square.setAttribute('fill', color);
                square.setAttribute('class', 'square');
                square.setAttribute('data-row', row);
                square.setAttribute('data-col', col);
                square.setAttribute('tabindex', '0');
                square.setAttribute('role', 'button');
                square.setAttribute('aria-label', `Square at row ${row + 1}, column ${col + 1}`);
                
                // Click event for tile placement
                square.addEventListener('click', () => this.handleSquareClick(row, col));
                
                // Keyboard event for accessibility
                square.addEventListener('keydown', (e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        this.handleSquareClick(row, col);
                    }
                });
                
                this.svg.appendChild(square);
            }
        }
        
        // Render existing tiles and X markers on top
        this.renderTiles();
        this.renderXMarkers();
    }
    
    handleSquareClick(row, col) {
        if (this.mode === 'x') {
            // X mode - toggle X marker
            this.toggleXMarker(row, col);
        } else {
            // Tile mode - check if this square is already part of a tile or has an X
            if (this.isSquareOccupied(row, col)) {
                this.showStatus('This square is already occupied!', false);
                return;
            }
            
            if (!this.selectedSquare) {
                // First square selected
                this.selectedSquare = { row, col };
                this.highlightSquare(row, col, true);
            } else {
                // Second square selected - check if adjacent
                if (this.areAdjacent(this.selectedSquare.row, this.selectedSquare.col, row, col)) {
                    // Create tile
                    this.createTile(this.selectedSquare.row, this.selectedSquare.col, row, col);
                    this.highlightSquare(this.selectedSquare.row, this.selectedSquare.col, false);
                    this.selectedSquare = null;
                    this.renderTiles();
                } else {
                    // Not adjacent, select this as new first square
                    this.highlightSquare(this.selectedSquare.row, this.selectedSquare.col, false);
                    this.selectedSquare = { row, col };
                    this.highlightSquare(row, col, true);
                }
            }
        }
    }
    
    toggleXMarker(row, col) {
        // Check if square is occupied by a tile
        const isTileHere = this.tiles.some(tile => 
            tile.squares.some(sq => sq.row === row && sq.col === col)
        );
        
        if (isTileHere) {
            this.showStatus('Cannot place X on a tile!', false);
            return;
        }
        
        // Check if X marker already exists at this position
        const existingIndex = this.xMarkers.findIndex(
            marker => marker.row === row && marker.col === col
        );
        
        if (existingIndex >= 0) {
            // Remove existing X marker
            this.xMarkers.splice(existingIndex, 1);
        } else {
            // Add new X marker with current color
            this.xMarkers.push({
                row: row,
                col: col,
                color: this.currentObjectColor
            });
        }
        
        this.renderXMarkers();
    }
    
    areAdjacent(row1, col1, row2, col2) {
        const rowDiff = Math.abs(row1 - row2);
        const colDiff = Math.abs(col1 - col2);
        
        // Adjacent if one dimension differs by 1 and the other is same
        return (rowDiff === 1 && colDiff === 0) || (rowDiff === 0 && colDiff === 1);
    }
    
    isSquareOccupied(row, col) {
        // Check if occupied by tile
        const isTile = this.tiles.some(tile => 
            tile.squares.some(sq => sq.row === row && sq.col === col)
        );
        
        // Check if occupied by X marker
        const isX = this.xMarkers.some(marker => 
            marker.row === row && marker.col === col
        );
        
        return isTile || isX;
    }
    
    createTile(row1, col1, row2, col2) {
        const tile = {
            squares: [
                { row: row1, col: col1 },
                { row: row2, col: col2 }
            ],
            color: this.currentObjectColor // Store color with the tile
        };
        this.tiles.push(tile);
    }
    
    highlightSquare(row, col, highlight) {
        const squares = this.svg.querySelectorAll('.square');
        squares.forEach(square => {
            const r = parseInt(square.getAttribute('data-row'));
            const c = parseInt(square.getAttribute('data-col'));
            if (r === row && c === col) {
                if (highlight) {
                    square.classList.add('selected');
                } else {
                    square.classList.remove('selected');
                }
            }
        });
    }
    
    renderTiles() {
        // Remove existing tile elements
        const existingTiles = this.svg.querySelectorAll('.tile');
        existingTiles.forEach(tile => tile.remove());
        
        // Draw each tile as a rounded rectangle
        this.tiles.forEach(tile => {
            const squares = tile.squares;
            
            // Determine orientation and position
            const minRow = Math.min(squares[0].row, squares[1].row);
            const maxRow = Math.max(squares[0].row, squares[1].row);
            const minCol = Math.min(squares[0].col, squares[1].col);
            const maxCol = Math.max(squares[0].col, squares[1].col);
            
            const isVertical = minCol === maxCol;
            
            let x, y, width, height;
            
            if (isVertical) {
                // Vertical tile
                x = minCol * this.squareSize;
                y = minRow * this.squareSize;
                width = this.squareSize;
                height = this.squareSize * 2;
            } else {
                // Horizontal tile
                x = minCol * this.squareSize;
                y = minRow * this.squareSize;
                width = this.squareSize * 2;
                height = this.squareSize;
            }
            
            // Create rounded rectangle
            const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
            rect.setAttribute('x', x);
            rect.setAttribute('y', y);
            rect.setAttribute('width', width);
            rect.setAttribute('height', height);
            rect.setAttribute('rx', 8);
            rect.setAttribute('ry', 8);
            rect.setAttribute('fill', tile.color); // Use tile's stored color
            rect.setAttribute('stroke', this.colors.stroke);
            rect.setAttribute('stroke-width', '3');
            rect.setAttribute('class', 'tile');
            
            this.svg.appendChild(rect);
        });
    }
    
    renderXMarkers() {
        // Remove existing X marker elements
        const existingMarkers = this.svg.querySelectorAll('.x-marker');
        existingMarkers.forEach(marker => marker.remove());
        
        // Draw each X marker
        this.xMarkers.forEach(marker => {
            const centerX = marker.col * this.squareSize + this.squareSize / 2;
            const centerY = marker.row * this.squareSize + this.squareSize / 2;
            const size = this.squareSize * 0.6; // X takes up 60% of square
            const offset = size / 2;
            
            // Create group for X
            const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
            g.setAttribute('class', 'x-marker');
            
            // First line of X (top-left to bottom-right)
            const line1 = document.createElementNS('http://www.w3.org/2000/svg', 'line');
            line1.setAttribute('x1', centerX - offset);
            line1.setAttribute('y1', centerY - offset);
            line1.setAttribute('x2', centerX + offset);
            line1.setAttribute('y2', centerY + offset);
            line1.setAttribute('stroke', marker.color); // Use marker's stored color
            line1.setAttribute('stroke-width', '4');
            line1.setAttribute('stroke-linecap', 'round');
            
            // Second line of X (top-right to bottom-left)
            const line2 = document.createElementNS('http://www.w3.org/2000/svg', 'line');
            line2.setAttribute('x1', centerX + offset);
            line2.setAttribute('y1', centerY - offset);
            line2.setAttribute('x2', centerX - offset);
            line2.setAttribute('y2', centerY + offset);
            line2.setAttribute('stroke', marker.color); // Use marker's stored color
            line2.setAttribute('stroke-width', '4');
            line2.setAttribute('stroke-linecap', 'round');
            
            g.appendChild(line1);
            g.appendChild(line2);
            this.svg.appendChild(g);
        });
    }
    
    saveSVG() {
        // Get SVG content
        const svgContent = this.svg.outerHTML;
        
        // Create blob
        const blob = new Blob([svgContent], { type: 'image/svg+xml' });
        
        // Create download link
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'tile-diagram.svg';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        this.showStatus('SVG saved successfully!', true);
    }
    
    async copyToClipboard() {
        try {
            const svgContent = this.svg.outerHTML;
            
            // Use modern Clipboard API
            if (navigator.clipboard && navigator.clipboard.writeText) {
                await navigator.clipboard.writeText(svgContent);
                this.showStatus('SVG copied to clipboard!', true);
            } else {
                // If clipboard API not available, show manual copy instructions
                this.showStatus('Please use browser "Copy" command to copy the SVG', false);
                console.warn('Clipboard API not available');
            }
        } catch (err) {
            this.showStatus('Copy failed. Please check browser permissions.', false);
            console.error('Copy failed:', err);
        }
    }
    
    showStatus(message, isSuccess) {
        const statusMsg = document.getElementById('statusMsg');
        statusMsg.textContent = message;
        statusMsg.style.color = isSuccess ? '#4CAF50' : '#f44336';
        
        // Clear message after 3 seconds
        setTimeout(() => {
            statusMsg.textContent = '';
        }, 3000);
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new TileDiagram();
});
