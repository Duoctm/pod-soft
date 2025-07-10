import { useState, useCallback } from 'react';
import { getUser } from '@/actions/user';
import type { UserDetailsFragment } from '@/gql/graphql';

export const useUser = () => {
    const [user, setUser] = useState<UserDetailsFragment>();
    const [hasUser, setHasUser] = useState<boolean>(false);

    const fetchUser = useCallback(async () => {
        try {
            const userData = await getUser();
            if (userData) {
                setUser(userData as UserDetailsFragment);
                setHasUser(!!userData);
            }
            return userData;
        } catch (error) {
            console.error("Error fetching user data:", error);
            return null;
        }
    }, []);

    return {
        user,
        hasUser,
        fetchUser,
    };
};
