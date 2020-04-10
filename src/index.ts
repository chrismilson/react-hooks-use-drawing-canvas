import { useEffect, useLayoutEffect, useRef, useState } from 'react'

export type DrawingMethod = (
  /** A 2d context on the referenced canvas */
  context: CanvasRenderingContext2D,
  /** The width of the context */
  width: number,
  /** The height of the context */
  height: number
) => void | (() => void)

/**
 * Provides an api for getting a 2d context from a canvas element.
 *
 * The returned reference should be assigned to a canvas element. The drawing
 * method will then be called with a context on the referenced canvas.
 *
 * Be careful about defining the drawing method. If it is defined inline, then
 * it will be re-called on every render.
 *
 * ```ts
 * // defines a new drawing function on every render
 * const Component = () => {
 *   const canvasRef = useDrawingCanvas(ctx => ctx.fillRect(0, 0, 10, 10))
 *
 *   return <canvas ref={canvasRef} />
 * }
 *
 * // safer
 * const draw = ctx => ctx.fillRect(0, 0, 10, 10)
 *
 * const Component = () => {
 *   const canvasRef = useDrawingCanvas(draw)
 *
 *   return <canvas ref={canvasRef} />
 * }
 * ```
 *
 * @param draw The drawing method
 */
export default function useDrawingCanvas(draw: DrawingMethod) {
  const ref = useRef<HTMLCanvasElement>()
  const [context, setContext] = useState<CanvasRenderingContext2D>()
  const [{ width, height }, setSize] = useState({
    width: 0,
    height: 0
  })

  useEffect(() => {
    if (!ref.current) return
    const getSize = () => {
      const width = ref.current.offsetWidth
      const height = ref.current.offsetHeight
      setSize({ width, height })
    }
    getSize()
    window.addEventListener('resize', getSize)
    return () => window.removeEventListener('resize', getSize)
  }, [ref])

  useEffect(() => {
    if (!ref.current) return

    setContext(ref.current.getContext('2d'))
  }, [ref])

  useLayoutEffect(() => {
    if (context) {
      context.canvas.width = width
      context.canvas.height = height
      return draw(context, width, height)
    }
  }, [draw, context, width, height])

  return ref
}
