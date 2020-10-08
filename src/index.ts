import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import useCanvasSize from 'react-hooks-use-canvas-size'

export type DrawingMethod = (
  /** A 2d context on the referenced canvas */
  context: CanvasRenderingContext2D,
  /** Some properties about the canvas that may or may not be critical to the
   * way the method is used.
   */
  props: {
    /** The width of the context */
    width: number
    /** The height of the context */
    height: number
    /**
     * A flag that tells the drawing method about the user's motion preferences.
     * Perhaps a drawing method that has excessive movement would include a case
     * for users that prefer reduced motion. Defaults to reduced motion.
     */
    prefersReducedMotion: boolean
  }
) => void | (() => void)

/**
 * A wrapper that will debounce the drawing method and call the drawing method
 * asynchronously.
 *
 * @param draw A closure that calls the drawing method with the intended props.
 * @param time The time to debounce in milliseconds.
 */
const debounceDraw = (
  draw: () => void | (() => void),
  time: number
): (() => void) => {
  let canceled = false
  let cleanUp: void | (() => void)

  const timeout = setTimeout(async () => {
    if (!canceled) {
      cleanUp = draw()
    }
  }, time)

  return () => {
    // cancel the timeout
    clearTimeout(timeout)
    // set the canceled flag
    canceled = true
    if (cleanUp) {
      cleanUp
    }
  }
}

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
  const { width, height } = useCanvasSize(ref)

  useEffect(() => {
    if (!ref.current) return

    setContext(ref.current.getContext('2d'))
  }, [ref])

  useLayoutEffect(() => {
    if (context) {
      context.canvas.width = width
      context.canvas.height = height

      return debounceDraw(
        () =>
          draw(context, {
            width,
            height,
            prefersReducedMotion: !window.matchMedia(
              '(prefers-reduced-motion: no-preferece)'
            ).matches
          }),
        50
      )
    }
  }, [draw, context, width, height])

  return ref
}
