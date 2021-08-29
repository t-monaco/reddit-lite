import React from 'react'
import { withUrqlClient } from 'next-urql'
import { createUrqlClient } from '../../utils/createUrqlClient'
import { useRouter } from 'next/router'
import { usePostQuery } from '../../generated/graphql'
import Layout from '../../components/Layout'
import { Box, Heading, Text } from '@chakra-ui/react'

interface PostProps { }

const Post: React.FC<PostProps> = () => {
    const router = useRouter()
    const intId = typeof router.query.id === 'string' ? parseInt(router.query.id) : -1
    const [{ data, error, fetching }] = usePostQuery({
        pause: intId === -1,
        variables: {
            id: intId
        }
    })

    if (fetching) {
        return (
            <Text>Loading...</Text>
        )
    }

    if (error) {
        return (
            <>
                Errrror
            </>
        )
    }

    if (!data?.post) {
        return (<Layout>
            <Box>Sorry, we could not find your post...</Box>
        </Layout>)
    }
 

    return (
        <Layout>
            <Heading mb={4}>
                {data.post.title}
            </Heading>
            {data.post.text}
        </Layout>
    )
}

export default withUrqlClient(createUrqlClient, { ssr: true })(Post)
