'use client'

import { cn } from '@/lib/utils'
// import { Delta } from 'quill'
import React, { useEffect, useRef, useState } from 'react'

interface QuillEditorProps {
    initialContent?: any
    readOnly?: boolean
    onContentChange?: (content: any) => void
    placeholder?: string
    className?: React.ComponentProps<'div'>['className']
    loadingClassName?: React.ComponentProps<'div'>['className']
    setQuillObject?: React.Dispatch<React.SetStateAction<any>>
}

const quillEditorElementId = 'quill-editor'
const quillToolbarQuerySelectorString = '[role="toolbar"].ql-toolbar.ql-snow'

export default function QuillEditor({
    initialContent,
    readOnly = false,
    onContentChange,
    placeholder,
    className,
    loadingClassName,
    setQuillObject, // this exposes the quill object to be used by parents
}: QuillEditorProps) {
    const containerRef = useRef<HTMLDivElement>(null)
    const toolbarRef = useRef<HTMLDivElement>(null)
    const [quill, setQuill] = useState<any>(null)
    const [isLoaded, setIsLoaded] = useState(false)
    const [containerElement, setContainerElement] =
        useState<HTMLDivElement | null>(null)

    useEffect(() => {
        if (
            window !== undefined &&
            document !== undefined &&
            // typeof window !== 'undefined' &&
            // typeof document !== 'undefined' &&
            !isLoaded
        ) {
            // Dynamically import Quill to avoid SSR issues
            import('quill').then((Quill) => {
                if (containerRef.current) {
                    setContainerElement(containerRef.current)
                    const toolbar = containerRef.current.querySelector(
                        quillToolbarQuerySelectorString
                    )

                    if (toolbar) {
                        toolbar.remove()
                    }
                }
                const quillInstance = new Quill.default('#quill-editor', {
                    theme: 'snow',
                    modules: {
                        toolbar: readOnly
                            ? false
                            : [
                                  ['bold', 'italic', 'underline', 'strike'],
                                  [{ color: [] }, { background: [] }],
                                  [
                                      { list: 'ordered' },
                                      { list: 'bullet' },
                                      { list: 'check' },
                                  ],
                                  ['link'],
                                  ['clean'],
                              ],
                    },
                    placeholder: placeholder,
                    readOnly: readOnly,
                })

                setQuill(quillInstance)
                if (setQuillObject) setQuillObject(quillInstance)

                if (initialContent) {
                    if (quillInstance.editor.isBlank()) {
                        // i think quilljs has a bug that renders that it doesn't properly cleanup the component during useEffect strict mode, so we need to check whether it is blank first, to insert initial content
                        quillInstance.setContents(initialContent)
                    }
                } else {
                    quillInstance.setContents([])
                }

                // Listen for text changes
                if (!readOnly) {
                    if (onContentChange) {
                        quillInstance.on('text-change', () => {
                            // console.log(quillInstance.editor.getDelta())
                            onContentChange(quillInstance.editor.getDelta())
                        })
                    }
                }

                setIsLoaded(true)
            })
        }

        return () => {
            if (quill) {
                if (containerElement && containerElement.parentNode) {
                    while (containerElement.firstChild) {
                        containerElement.removeChild(
                            containerElement.firstChild
                        )
                    }
                }
                // Remove event listeners
                if (!readOnly) {
                    quill.off('text-change')
                }
                // Clear the quill instance
                setQuill(null)
            }
        }
    }, [isLoaded])

    return (
        <>
            <div
                className={cn(
                    'flex items-center justify-center min-h-[100px] border',
                    isLoaded && 'hidden',
                    loadingClassName
                )}
            >
                Loading...
            </div>
            <div ref={containerRef}>
                <div
                    id={quillEditorElementId}
                    className={cn(
                        readOnly
                            ? 'read-only-editor'
                            : 'min-h-[100px] border flex flex-col',
                        !isLoaded && 'hidden',
                        className
                    )}
                ></div>
            </div>
        </>
    )
}
