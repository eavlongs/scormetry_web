'use client'

import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { GetActivity } from '@/types/classroom'
import Image from 'next/image'

export default function ActivityCommentSection({
    activity,
}: {
    activity: GetActivity
}) {
    return (
        <div>
            <h2 className="text-lg font-semibold mb-3">Comments</h2>
            <div className="space-y-4">
                {/* Comment list - would be mapped from actual comments */}
                <div className="space-y-4 max-h-80 overflow-y-auto pr-2">
                    {/* Example comment from teacher */}
                    <div className="flex gap-3">
                        <div className="relative h-8 w-8 flex-shrink-0">
                            <Image
                                src="/user_placeholder.png"
                                alt="Teacher"
                                fill
                                className="rounded-full"
                            />
                        </div>
                        <div className="flex-1">
                            <div className="flex items-center gap-2">
                                <span className="font-medium text-sm">
                                    Dr. Jane Smith
                                </span>
                                <span className="text-xs text-muted-foreground">
                                    Apr 25
                                </span>
                            </div>
                            <p className="text-sm mt-1">
                                Great work on this assignment! Your analysis in
                                section 3 was particularly insightful.
                            </p>
                        </div>
                    </div>

                    {/* Example comment from student */}
                    <div className="flex gap-3">
                        <div className="relative h-8 w-8 flex-shrink-0">
                            <Image
                                src={
                                    activity.posted_by_user.profile_picture ??
                                    'user_placeholder.png'
                                }
                                alt="Student"
                                fill
                                className="rounded-full"
                            />
                        </div>
                        <div className="flex-1">
                            <div className="flex items-center gap-2">
                                <span className="font-medium text-sm">You</span>
                                <span className="text-xs text-muted-foreground">
                                    Apr 24
                                </span>
                            </div>
                            <p className="text-sm mt-1">
                                Thank you for the feedback! I spent extra time
                                on that section.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Comment input */}
                <div className="mt-4 flex items-start gap-3">
                    <div className="relative h-8 w-8 flex-shrink-0">
                        <Image
                            src={
                                activity.posted_by_user.profile_picture ??
                                'user_placeholder.png'
                            }
                            alt="You"
                            fill
                            className="rounded-full"
                        />
                    </div>
                    <div className="flex-1">
                        <Textarea
                            className="min-h-[80px] w-full rounded-md border border-input px-3 py-2 text-sm resize-none focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                            placeholder="Add a comment..."
                        />
                        <div className="flex justify-end mt-2">
                            <Button size="sm">Post</Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
