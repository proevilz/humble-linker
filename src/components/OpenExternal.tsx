import { memo } from 'react'

const SVGComponent = (props: any) => (
    <svg
        fill='none'
        xmlns='http://www.w3.org/2000/svg'
        width='24'
        height='24'
        viewBox='0 0 24 24'
        stroke='black'
        strokeWidth={0.3}
        strokeOpacity={0.5}
        {...props}
    >
        <path
            d='M15.64 7.025h-3.622v-2h7v7h-2v-3.55l-4.914 4.914-1.414-1.414 4.95-4.95Z'
            fill='currentColor'
        />
        <path
            d='M10.982 6.975h-6v12h12v-6h-2v4h-8v-8h4v-2Z'
            fill='currentColor'
        />
    </svg>
)
export const OpenExternal = memo(SVGComponent)
