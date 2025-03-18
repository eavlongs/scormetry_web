import { getSession } from "@/lib/session";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export async function ProfilePicture() {
    const session = await getSession();
    return (
        <Avatar className='h-8 w-8'>
            <AvatarImage
                src={session.user?.profile_picture ?? ""}
                alt={session.user?.first_name}
            />
            <AvatarFallback>
                <AvatarImage src='/user_placeholder.png' alt='User' />
            </AvatarFallback>
        </Avatar>
    );
}
