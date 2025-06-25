/* eslint-disable import/no-default-export */
import React from 'react'

const NavListMobile = ({ navLinks }: { navLinks: { name: string; path: string }[] }) => {
    return (
        <div className="flex flex-col gap-2  py-2 ">
            {navLinks.map(link => (
                <a key={link.name} href={link.path} className="text-black text-sm px-4 border-b py-2 ">
                    {link.name}
                </a>
            ))}
        </div>
    )
}

export default NavListMobile
