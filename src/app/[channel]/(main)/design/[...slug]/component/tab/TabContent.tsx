/* eslint-disable import/no-default-export */
/* eslint-disable import/no-cycle */


import React from 'react'
import DefaultTab from './DefaultTab'
import ColorTab from './ColorTab'
import UploadTab from './UploadTab'
import TextTab from './TextTab'

interface TabContentType {
    slug: string | null

}

const TabContent = ({ slug }: TabContentType) => {
    return (
        <React.Fragment>
            {slug === null && <DefaultTab />}

            {
                slug === "color" && <ColorTab />
            }
            {

                slug === "upload" && <UploadTab />
            }
            {

                slug === "add-text" && <TextTab />
            }

        </React.Fragment>
    )
}

export default TabContent
