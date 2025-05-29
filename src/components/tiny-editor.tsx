'use client'

import { Editor } from '@tinymce/tinymce-react'

interface TinyEditorProps {
    initialContent?: any
    readOnly?: boolean
    onContentChange?: (content: any) => void
    placeholder?: string
    onInit?: React.ComponentProps<typeof Editor>['onInit']
}

export default function TinyEditor({
    initialContent,
    readOnly = false,
    onContentChange,
    placeholder,
    onInit,
}: TinyEditorProps) {
    return (
        <Editor
            tinymceScriptSrc="/tinymce/tinymce.min.js"
            licenseKey="gpl"
            onInit={onInit}
            onEditorChange={(a, _) =>
                onContentChange ? onContentChange(a) : null
            }
            initialValue={initialContent}
            init={{
                placeholder: placeholder,
                disabled: readOnly,
                branding: false,
                height: readOnly ? undefined : 300,
                resize: false,
                menubar: false,
                elementpath: false,
                plugins: readOnly
                    ? [
                          'advlist',
                          'autolink',
                          'lists',
                          'link',
                          // 'image',
                          'charmap',
                          'anchor',
                          //   'searchreplace',
                          'visualblocks',
                          'code',
                          'fullscreen',
                          'insertdatetime',
                          'media',
                          'table',
                          'autoresize',
                          //   'preview',
                      ]
                    : [
                          'advlist',
                          'autolink',
                          'lists',
                          'link',
                          // 'image',
                          'charmap',
                          'anchor',
                          //   'searchreplace',
                          'visualblocks',
                          'code',
                          'fullscreen',
                          'insertdatetime',
                          'media',
                          'table',
                          //   'preview',
                          'help',
                          'wordcount',
                      ],
                statusbar: readOnly ? false : true,
                // toolbar:
                //     'undo redo | blocks | ' +
                //     'bold italic forecolor | alignleft aligncenter ' +
                //     'alignright alignjustify | bullist numlist outdent indent | ' +
                //     'removeformat | help',
                toolbar: readOnly
                    ? ''
                    : 'undo redo | blocks | ' +
                      'bold italic forecolor | alignleft aligncenter ' +
                      'alignright alignjustify | bullist numlist outdent indent | ' +
                      'removeformat | help',
                content_style:
                    'body { font-family:Helvetica,Arial,sans-serif; font-size:14px }',
            }}
        />
    )
}
