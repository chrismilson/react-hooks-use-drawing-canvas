import { useEffect, useLayoutEffect, useRef, useState } from 'react'

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
export default function useDrawingCanvas(
  draw: (
    /** A 2d context on the referenced canvas */
    context: CanvasRenderingContext2D,
    /** The width of the context */
    width: number,
    /** The height of the context */
    height: number
  ) => void | (() => void)
) {
  const ref = useRef<HTMLCanvasElement>()
  const [context, setContext] = useState<CanvasRenderingContext2D>()

  useEffect(() => {
    if (!ref.current) return

    const context = ref.current.getContext('2d')
    context.canvas.width = ref.current.offsetWidth
    context.canvas.height = ref.current.offsetHeight

    setContext(context)
  }, [ref])

  useLayoutEffect(() => {
    if (context) {
      return draw(context, context.canvas.width, context.canvas.height)
    }
  }, [context, draw])

  return ref
}
