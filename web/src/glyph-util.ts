const enableHighDPICanvas = (
  canvas: HTMLCanvasElement,
  width: number,
  height: number
): void => {
  const pixelRatio = window.devicePixelRatio || 1

  if (pixelRatio === 1) {
    return
  }

  canvas.width = width * pixelRatio
  canvas.height = height * pixelRatio
  canvas.style.width = `${width}px`
  canvas.style.height = `${height}px`

  canvas.getContext('2d')?.scale(pixelRatio, pixelRatio)
}

// eslint-disable-next-line import/prefer-default-export
export { enableHighDPICanvas }
