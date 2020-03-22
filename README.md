# Use Drawing Canvas


I use canvases a lot for drawing shapes etc. with and the initial setup is often
the same. This hook makes setting up a canvas with a drawing context much more
simple.

## Installation

```bash
yarn add react-hooks-use-drawing-context
```

## Usage

For static drawings

```jsx
import React from 'react'
import useDrawingCanvas from 'react-hooks-use-drawing-canvas'

const drawRedCircle = (ctx, width, height) => {
  ctx.save()
  ctx.beginPath()
  ctx.arc(width / 2, height / 2, Math.min(width, height) / 2, 0, Math.PI)
  ctx.closePath()
  ctx.fillStyle = 'rgb(255, 0, 0)'
  ctx.fill()
  ctx.restore()
}

const RedCircle = () => {
  const canvasRef = useDrawingCanvas(drawRedCircle)

  return <canvas ref={canvasRef} />
}
```

For animated drawings

```jsx
import React from 'react'
import useDrawingCanvas from 'react-hooks-use-drawing-canvas'

const drawScanLine = (context, width, height) => {
  let offset = 0
  let frame

  const drawFrame = () => {
    frame = requestAnimationFrame(drawFrame)
    context.clearRect(0, 0, width, height)

    context.beginPath()
    context.moveTo(0, offset)
    context.lineTo(width, offset)
    context.closePath()

    context.stroke()
    offset = (offset + 1) % height
  }

  drawFrame()
  
  // return a cleanup method
  return () => {
    cancelAnimationFrame(frame)
  }
}

const ScanLine = () => {
  const canvasRef = useDrawingCanvas(drawScanLine)

  return <canvas ref={canvasRef}>
}
```

## Types

The module is written in typescript so the typescript goodness should come
through.

```tsx
import { DrawingMethod } from 'react-hooks-use-drawing-canvas'

const draw: DrawingMethod = ctx => ctx.fillRect(0, 0, 10, 10)
```
