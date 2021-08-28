import { ChevronDownIcon, ChevronUpIcon } from '@chakra-ui/icons'
import { Flex, IconButton } from '@chakra-ui/react'
import React, { useState } from 'react'
import { PostSnippetFragment, useVoteMutation } from '../generated/graphql'

interface UpdootSectionProps {
    post: PostSnippetFragment
}

const UpdootSection: React.FC<UpdootSectionProps> = ({ post }) => {
    const [loadingState, setLoadingState] = useState<'loading-updoot' | 'loading-downdoot' | 'not-loading'>('not-loading')
    const [, vote] = useVoteMutation()
    return (
        <Flex direction='column' align='center' justifyContent='center' mr={4}>
            <IconButton
                onClick={async () => {
                    setLoadingState('loading-updoot')
                    await vote({ postId: post.id, value: 1 })
                    setLoadingState('not-loading')
                }}
                aria-label='updoot'
                icon={<ChevronUpIcon />}
                isLoading={loadingState === 'loading-updoot'}
            />
            {post.points}
            <IconButton
                onClick={async () => {
                    setLoadingState('loading-downdoot')
                    await vote({ postId: post.id, value: -1 })
                    setLoadingState('not-loading')
                }}
                aria-label='updoot'
                icon={<ChevronDownIcon />}
                isLoading={loadingState === 'loading-downdoot'}
            />
        </Flex>
    )
}

export default UpdootSection
