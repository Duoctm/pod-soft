"use client";

import { useEffect } from "react";
import { checkTokenServerAction } from "../../app/actions";

export function RefreshTokenCaller() {
    useEffect(() => {
        checkTokenServerAction();
    }, []);

    return null;
}
