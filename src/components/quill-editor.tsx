'use client'

import { cn } from '@/lib/utils'
import { useEffect, useRef, useState } from 'react'

interface QuillEditorProps {
    initialContent?: string
    readOnly?: boolean
    onContentChange?: (content: string) => void
    placeholder?: string
}

const quillEditorElementId = 'quill-editor'
const quillToolbarQuerySelectorString = '[role="toolbar"].ql-toolbar.ql-snow'

export default function QuillEditor({
    initialContent = '',
    readOnly = false,
    onContentChange,
    placeholder,
}: QuillEditorProps) {
    const containerRef = useRef<HTMLDivElement>(null)
    const toolbarRef = useRef<HTMLDivElement>(null)
    const [quill, setQuill] = useState<any>(null)
    const [isLoaded, setIsLoaded] = useState(false)
    const [content, setContent] = useState('')

    useEffect(() => {
        if (typeof window !== 'undefined' && !isLoaded) {
            // Dynamically import Quill to avoid SSR issues
            import('quill').then((Quill) => {
                if (containerRef.current) {
                    const child = containerRef.current.querySelector(
                        quillToolbarQuerySelectorString
                    )

                    if (child) {
                        child.remove()
                    }
                }
                const quillInstance = new Quill.default('#quill-editor', {
                    theme: 'snow',
                    modules: {
                        toolbar: readOnly
                            ? false
                            : [
                                  [{ header: [1, 2, 3, 4, 5, 6, false] }],
                                  ['bold', 'italic', 'underline', 'strike'],
                                  [{ color: [] }, { background: [] }],
                                  [{ list: 'ordered' }, { list: 'bullet' }],
                                  [{ align: [] }],
                                  ['link', 'image'],
                                  ['clean'],
                              ],
                    },
                    placeholder: placeholder,
                    readOnly: readOnly,
                })

                setQuill(quillInstance)

                // Listen for text changes
                if (!readOnly) {
                    quillInstance.on('text-change', () => {
                        if (onContentChange) {
                            onContentChange(quillInstance.root.innerHTML)
                        }
                    })
                }

                setIsLoaded(true)
            })
        }

        return () => {
            if (quill) {
                const containerElement = containerRef.current as HTMLDivElement
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
        <div ref={containerRef}>
            <div
                id={quillEditorElementId}
                className={cn(readOnly ? 'read-only-editor' : 'min-h-[100px]')}
            />
        </div>
    )
}
