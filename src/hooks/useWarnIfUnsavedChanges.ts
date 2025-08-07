import { NavigateOptions } from 'next/dist/shared/lib/app-router-context.shared-runtime'
import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useState } from 'react'

// https://github.com/vercel/next.js/discussions/50700
export const useWarnIfUnsavedChanges = (
    unsaved: boolean,
    currentPath: string
) => {
    const router = useRouter()
    const [handlerSet, setHandlerSet] = useState(new Set<Element>())

    console.log(
        '[useWarnIfUnsavedChanges] Initialized with unsaved:',
        unsaved,
        'currentPath:',
        currentPath
    )

    const handleAnchorClickPreventRouteChange = (e: Event) => {
        console.log('[useWarnIfUnsavedChanges] Anchor click detected', e)
        if ((e as MouseEvent).button !== 0) return // only handle left-clicks
        const targetUrl = (e.currentTarget as HTMLAnchorElement).href
        const currentUrl = window.location.href
        console.log(
            '[useWarnIfUnsavedChanges] Navigation attempt from',
            currentUrl,
            'to',
            targetUrl
        )

        if (targetUrl !== currentUrl) {
            const confirmLeave = window.confirm(
                'You have unsaved changes. Are you sure you want to leave?'
            )

            if (!confirmLeave) {
                e.preventDefault()
            }
        }
    }

    const addAnchorListeners = useCallback(() => {
        const anchorElements = document.querySelectorAll('a[href]')
        console.log(
            '[useWarnIfUnsavedChanges] Adding listeners to',
            anchorElements.length,
            'anchor elements'
        )

        if (unsaved) {
            anchorElements.forEach((anchor) => {
                if (!handlerSet.has(anchor)) {
                    setHandlerSet((prev) => new Set(prev).add(anchor))
                    anchor.addEventListener(
                        'click',
                        handleAnchorClickPreventRouteChange
                    )
                }
            })
        } else {
            anchorElements.forEach((anchor) => {
                if (handlerSet.has(anchor)) {
                    setHandlerSet((prev) => {
                        const newSet = new Set(prev)
                        newSet.delete(anchor)
                        return newSet
                    })
                    anchor.removeEventListener(
                        'click',
                        handleAnchorClickPreventRouteChange
                    )
                }
            })
        }
    }, [unsaved])

    useEffect(() => {
        console.log('[useWarnIfUnsavedChanges] Setting up mutation observer')
        const mutationObserver = new MutationObserver(addAnchorListeners)
        mutationObserver.observe(document.body, {
            childList: true,
            subtree: true,
        })
        // addAnchorListeners()

        return () => {
            console.log(
                '[useWarnIfUnsavedChanges] Cleaning up mutation observer'
            )
            mutationObserver.disconnect()
            const anchorElements = document.querySelectorAll('a[href]')
            anchorElements.forEach((anchor) =>
                anchor.removeEventListener(
                    'click',
                    handleAnchorClickPreventRouteChange
                )
            )
        }
    }, [addAnchorListeners])

    useEffect(() => {
        console.log(
            '[useWarnIfUnsavedChanges] Setting up beforeunload/popstate handlers, unsaved:',
            unsaved
        )

        const beforeUnloadHandler = (e: BeforeUnloadEvent) => {
            console.log(
                '[useWarnIfUnsavedChanges] beforeunload event triggered'
            )

            e.preventDefault()
            e.returnValue = '' // required for Chrome
        }

        const handlePopState = (e: PopStateEvent) => {
            console.log('[useWarnIfUnsavedChanges] popstate event triggered', e)
            if (unsaved) {
                console.log(
                    '[useWarnIfUnsavedChanges] Unsaved changes detected during popstate'
                )
                const confirmLeave = window.confirm(
                    'You have unsaved changes. Are you sure you want to leave?'
                )
                console.log(
                    '[useWarnIfUnsavedChanges] User response to navigation:',
                    confirmLeave
                )

                if (!confirmLeave) {
                    console.log(
                        '[useWarnIfUnsavedChanges] Preventing navigation, staying at:',
                        currentPath
                    )
                    e.preventDefault()
                    window.history.pushState(null, '', currentPath)
                } else {
                    console.log('[useWarnIfUnsavedChanges] Allowing navigation')
                }
            }
        }

        if (unsaved) {
            console.log(
                '[useWarnIfUnsavedChanges] Adding event listeners for unsaved changes'
            )
            window.addEventListener('beforeunload', beforeUnloadHandler)
            window.addEventListener('popstate', handlePopState)
        } else {
            console.log(
                '[useWarnIfUnsavedChanges] Removing event listeners as no unsaved changes'
            )
            window.removeEventListener('beforeunload', beforeUnloadHandler)
            window.removeEventListener('popstate', handlePopState)
        }

        return () => {
            console.log('[useWarnIfUnsavedChanges] Cleaning up event listeners')
            window.removeEventListener('beforeunload', beforeUnloadHandler)
            window.removeEventListener('popstate', handlePopState)
        }
    }, [unsaved, addAnchorListeners, currentPath])

    useEffect(() => {
        console.log('[useWarnIfUnsavedChanges] Setting up router.push override')
        const originalPush = router.push

        router.push = (url: string, options?: NavigateOptions) => {
            console.log(
                '[useWarnIfUnsavedChanges] router.push called with url:',
                url,
                'options:',
                options
            )
            if (unsaved) {
                console.log(
                    '[useWarnIfUnsavedChanges] Unsaved changes detected during router.push'
                )
                const confirmLeave = window.confirm(
                    'You have unsaved changes. Are you sure you want to leave?'
                )
                console.log(
                    '[useWarnIfUnsavedChanges] User response to navigation:',
                    confirmLeave
                )
                if (confirmLeave) {
                    console.log(
                        '[useWarnIfUnsavedChanges] Proceeding with navigation to:',
                        url
                    )
                    originalPush(url, options)
                } else {
                    console.log(
                        '[useWarnIfUnsavedChanges] Navigation cancelled'
                    )
                }
            } else {
                console.log(
                    '[useWarnIfUnsavedChanges] No unsaved changes, proceeding with navigation to:',
                    url
                )
                originalPush(url, options)
            }
        }

        return () => {
            console.log(
                '[useWarnIfUnsavedChanges] Restoring original router.push'
            )
            router.push = originalPush
        }
    }, [router, unsaved])
}
