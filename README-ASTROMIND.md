# Astro Mind - Space-Themed Mind Mapping App

A beautiful, interactive mind mapping application with a cosmic aesthetic. Create, connect, and explore your ideas in space.

## Features

### Visual Design
- **Space-themed background** with animated starfield using Three.js
- **Dark cosmic aesthetic** with purple/pink gradient accents
- **Smooth animations** powered by Framer Motion
- **Glowing effects** and shadows for a polished look

### Mind Map Functionality
- **Create nodes** by double-clicking the canvas or using the "New Node" button
- **Drag nodes** with momentum and inertia for natural movement
- **Pan and zoom** the canvas (Shift+drag to pan, mouse wheel to zoom)
- **Connect nodes** with curved edges and arrowheads
- **Edit nodes** by double-clicking them
- **Delete nodes/edges** by selecting and pressing Delete/Backspace

### Node Customization
- **Title** - Main heading for the node
- **Short Note** - Brief description shown on the node
- **Details** - Extended description (shown in modal)
- **Color Picker** - Choose from preset colors or use custom hex values
- **Style Variants** - Default, Rounded, Pill, or Outline styles

### Data Management
- **Auto-save** to localStorage (debounced 500ms)
- **Export** mind maps as JSON files
- **Import** mind maps from JSON files
- **Multiple maps** support (create and switch between maps)

### Keyboard Shortcuts
- **Delete/Backspace** - Remove selected node or edge
- **Escape** - Cancel connection mode or deselect
- **Ctrl+S / Cmd+S** - Manual save trigger (auto-save is always active)

## How to Use

### Getting Started
1. The app automatically creates "My First Mind Map" on first load
2. Use "New Map" to create additional mind maps
3. Double-click anywhere on the canvas to create a node

### Creating Nodes
- **Double-click** on empty canvas area
- **Or** click the "+ New Node" button in the toolbar

### Editing Nodes
- **Double-click** a node to open the edit modal
- Modify title, short note, and details
- Change node color and style variant
- Click "Save Changes" to apply

### Connecting Nodes
1. Click "Connect Nodes" button in toolbar
2. Click the **source node**
3. Click the **target node**
4. Connection is created automatically
5. Press Escape or click "Cancel Connection" to exit

### Moving Around
- **Drag nodes** directly to reposition them
- **Pan canvas** by holding Shift and dragging
- **Zoom** using mouse wheel or trackpad pinch
- Zoom level displayed in bottom-right corner

### Deleting
- **Select** a node or edge by clicking it
- Press **Delete** or **Backspace** to remove
- Deleting a node also removes all connected edges

### Import/Export
- **Export** - Downloads current mind map as JSON file
- **Import** - Upload a previously exported JSON file
- Data validation ensures imported files are valid

## Technical Stack

- **Framework** - Next.js 16 (App Router)
- **Language** - TypeScript
- **Styling** - Tailwind CSS v4
- **Animation** - Framer Motion
- **3D Graphics** - Three.js with react-three-fiber
- **State Management** - Zustand
- **Persistence** - localStorage with auto-save

## Project Structure

```
mind-mapper/
├── app/
│   ├── page.tsx          # Main application page
│   ├── layout.tsx        # Root layout with metadata
│   └── globals.css       # Global styles and theme
├── components/
│   ├── Canvas.tsx        # Main canvas with pan/zoom
│   ├── Node.tsx          # Draggable node component
│   ├── NodeModal.tsx     # Node editing modal
│   ├── EdgeRenderer.tsx  # SVG edge rendering
│   ├── SpaceBackground.tsx # Three.js starfield
│   ├── Toolbar.tsx       # Top toolbar
│   └── ui/
│       ├── Modal.tsx     # Reusable modal wrapper
│       ├── ColorPicker.tsx # Color selection
│       └── VariantSelector.tsx # Style variant picker
├── hooks/
│   ├── useKeyboardShortcuts.ts # Keyboard event handling
│   └── usePanZoom.ts     # Canvas pan/zoom logic
├── lib/
│   ├── types.ts          # TypeScript interfaces
│   ├── store.ts          # Zustand state management
│   ├── utils.ts          # Utility functions
│   └── persistence.ts    # localStorage & export/import
└── package.json
```

## Data Model

### Node
```typescript
interface MindMapNode {
  id: string;
  title: string;
  shortNote?: string;
  details?: string;
  color: string;
  variant: 'default' | 'rounded' | 'pill' | 'outline';
  position: { x: number; y: number };
  createdAt: number;
  updatedAt: number;
}
```

### Edge
```typescript
interface MindMapEdge {
  id: string;
  from: string; // source node id
  to: string;   // target node id
}
```

### Mind Map
```typescript
interface MindMap {
  id: string;
  name: string;
  nodes: MindMapNode[];
  edges: MindMapEdge[];
  createdAt: number;
  updatedAt: number;
}
```

## Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## Browser Support

- Modern browsers with ES2017+ support
- localStorage required for data persistence
- WebGL required for 3D starfield background

## Future Enhancements

Potential features to add:
- Node grouping/folders
- Search and filter nodes
- Multiple edge styles
- Export as image/PDF
- Collaborative editing
- Undo/redo functionality
- Node templates
- Keyboard navigation
- Accessibility improvements

## License

This project was built as a demonstration of modern web technologies and UI/UX design.

---

Built with Next.js, TypeScript, Framer Motion, and Three.js
