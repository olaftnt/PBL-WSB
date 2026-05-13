import { signOut } from '@/app/logout/actions';

export function LogoutButton() {
    return (
        <form action={signOut}>
            <button
                type="submit"
                className="px-3 py-2 rounded-lg bg-[#121B2D] text-[#CBD5E1] hover:text-white"
            >
                Wyloguj
            </button>
        </form>
    );
}