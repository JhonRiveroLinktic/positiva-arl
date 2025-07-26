export const scrollToError = (errors: any) => {
  const firstErrorField = Object.keys(errors)[0]
  if (firstErrorField) {
    const element =
      document.querySelector(`[name="${firstErrorField}"]`) ||
      document.querySelector(`#${firstErrorField}`) ||
      document.querySelector(`[id*="${firstErrorField}"]`)

    if (element) {
      element.scrollIntoView({
        behavior: "smooth",
        block: "center",
        inline: "nearest",
      })

      if (element instanceof HTMLElement && element.focus) {
        setTimeout(() => element.focus(), 100)
      }
    }
  }
}