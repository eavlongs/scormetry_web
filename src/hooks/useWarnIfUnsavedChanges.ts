import { NavigateOptions } from 'next/dist/shared/lib/app-router-context.shared-runtime'
import { useRouter } from 'next/navigation'
import { useCallback, useEffect } from 'react'

// https://github.com/vercel/next.js/discussions/50700
export const useWarnIfUnsavedChanges = (
    unsaved: boolean,
    currentPath: string
) => {
    const router = useRouter()

    const handleAnchorClick = (e: Event) => {
        if ((e as MouseEvent).button !== 0) return // only handle left-clicks
        const targetUrl = (e.currentTarget as HTMLAnchorElement).href
        const currentUrl = window.location.href
        if (targetUrl !== currentUrl && window.onbeforeunload) {
            // @ts-expect-error for some reason, onbeforeunload is not typed on window
            const res = window.onbeforeunload()
            if (!res) e.preventDefault()
        }
    }

    const addAnchorListeners = useCallback(() => {
        const anchorElements = document.querySelectorAll('a[href]')
        anchorElements.forEach((anchor) =>
            anchor.addEventListener('click', handleAnchorClick)
        )
    }, [])

    useEffect(() => {
        const mutationObserver = new MutationObserver(addAnchorListeners)
        mutationObserver.observe(document.body, {
            childList: true,
            subtree: true,
        })
        addAnchorListeners()

        return () => {
            mutationObserver.disconnect()
            const anchorElements = document.querySelectorAll('a[href]')
            anchorElements.forEach((anchor) =>
                anchor.removeEventListener('click', handleAnchorClick)
            )
        }
    }, [addAnchorListeners])

    useEffect(() => {
        const beforeUnloadHandler = (e: BeforeUnloadEvent) => {
            e.preventDefault()
            e.returnValue = '' // required for Chrome
        }

        const handlePopState = (e: PopStateEvent) => {
            if (unsaved) {
                const confirmLeave = window.confirm(
                    'You have unsaved changes. Are you sure you want to leave?'
                )

                if (!confirmLeave) {
                    e.preventDefault()
                    window.history.pushState(null, '', currentPath)
                }
            }
        }

        if (unsaved) {
            window.addEventListener('beforeunload', beforeUnloadHandler)
            window.addEventListener('popstate', handlePopState)
        } else {
            window.removeEventListener('beforeunload', beforeUnloadHandler)
            window.removeEventListener('popstate', handlePopState)
        }

        return () => {
            window.removeEventListener('beforeunload', beforeUnloadHandler)
            window.removeEventListener('popstate', handlePopState)
        }
    }, [unsaved, addAnchorListeners, currentPath])

    useEffect(() => {
        const originalPush = router.push

        router.push = (url: string, options?: NavigateOptions) => {
            if (unsaved) {
                const confirmLeave = window.confirm(
                    'You have unsaved changes. Are you sure you want to leave?'
                )
                if (confirmLeave) originalPush(url, options)
            } else {
                originalPush(url, options)
            }
        }

        return () => {
            router.push = originalPush
        }
    }, [router, unsaved])
}
