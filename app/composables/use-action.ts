export function useAction() {
  const perform = (actionId: string) => {
    switch (actionId) {
      case 'OPEN_COOKIE_SETTINGS': {
        const isModalCookieSettingsOpen = useIsModalCookieSettingsOpen()
        isModalCookieSettingsOpen.value = true
        break
      }
    }
  }

  return { perform }
}
