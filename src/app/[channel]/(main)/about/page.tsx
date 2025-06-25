import React from 'react'
import OurStory from '@/ui/components/ui-migration/about/OurStory'
import Promotion from '@/ui/components/ui-migration/about/Promotion'
import WeDo from '@/ui/components/ui-migration/about/WeDo'
import Services from '@/ui/components/ui-migration/about/Services'

const About = ({ params }: { params: { channel: string } }) => {
    return (
        <div >
            <OurStory />
            <Promotion />
            <WeDo />

            <Services channel={params.channel} />
        </div >
    )
}

export default About
