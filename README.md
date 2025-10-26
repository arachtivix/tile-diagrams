# Tile Diagrams

Interactive web tool for creating SVG diagrams of 2x1 tiles as rounded rectangles on a checkerboard.

## Features

- **Interactive Tile Placement**: Click on adjacent squares to place 2x1 tiles
- **Customizable Colors**: Change tile colors, stroke colors, and checkerboard colors
- **Adjustable Grid Size**: Configure grid dimensions from 4x4 to 20x20
- **Export Options**: 
  - Save diagram as SVG file
  - Copy SVG to clipboard
- **Clean Interface**: Easy-to-use web interface with real-time updates

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/arachtivix/tile-diagrams.git
   cd tile-diagrams
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

## Usage

1. Start the server:
   ```bash
   npm start
   ```

2. Open your browser and navigate to:
   ```
   http://localhost:3000
   ```

3. Use the application:
   - Click on a square to select it (it will be highlighted)
   - Click on an adjacent square to create a 2x1 tile
   - Customize colors using the color pickers
   - Adjust grid size as needed
   - Save your diagram or copy to clipboard

## How It Works

- **2x1 Tiles**: Each tile covers exactly two adjacent squares (horizontal or vertical)
- **Rounded Rectangles**: Tiles are rendered as SVG rounded rectangles
- **Checkerboard Pattern**: Background shows a traditional checkerboard pattern
- **Adjacent Detection**: System automatically validates that tiles only span adjacent squares

## Development

The project structure:
- `server.js` - Express server
- `public/` - Static assets
  - `index.html` - Main HTML structure
  - `app.js` - Application logic
  - `styles.css` - Styling

## License

MIT
