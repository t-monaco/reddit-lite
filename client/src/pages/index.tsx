import { DeleteIcon } from "@chakra-ui/icons"
import { Box, Button, Flex, Heading, IconButton, Link, Stack, Text } from "@chakra-ui/react"
import { withUrqlClient } from "next-urql"
import NextLink from 'next/link'
import React, { useState } from "react"
import Layout from "../components/Layout"
import UpdootSection from "../components/UpdootSection"
import { useDeletePostMutation, usePostsQuery } from "../generated/graphql"
import { createUrqlClient } from "../utils/createUrqlClient"

const Index = () => {
    const [variables, setVariables] = useState({ limit: 15, cursor: null as null | string })
    const [{ data, fetching }] = usePostsQuery({
        variables
    })

    const [, deletePost] = useDeletePostMutation()

    if (!data && !fetching) {
        return 'Sorry, nothing to show...'
    }

    return (
        <Layout>
            {!data && fetching ? (
                <div>Loading...</div>
            ) : (
                <Stack spacing={8}>
                    {data.posts.posts.map(p => !p ? null :  (
                        <Flex key={p.id} p={5} shadow="md" borderWidth="1px">
                            <UpdootSection post={p} />
                            <Box flex={1} position='relative'>
                                <NextLink href='/post/[id]' as={`/post/${p.id}`}>
                                    <Link>
                                        <Heading fontSize="xl">{p.title}</Heading>
                                    </Link>
                                </NextLink>
                                <Text>posted by {p.creator.username}</Text>
                                <Flex>
                                    <Text flex={1} mt={4} pr='50px'>{p.textSnippet}</Text>
                                    <IconButton
                                        position='absolute'
                                        right={0}
                                        bottom={0}
                                        onClick={() => {
                                            deletePost({ id: p.id })
                                        }}
                                        colorScheme='red'
                                        aria-label='updoot'
                                        icon={<DeleteIcon />}
                                    />
                                </Flex>
                            </Box>
                        </Flex>
                    ))}
                </Stack>
            )}
            {data && data.posts.hasMore &&
                (<Flex>
                    <Button onClick={() => {
                        console.log(data.posts.posts[data.posts.posts.length - 1].createdAt)
                        setVariables({
                            limit: variables.limit,
                            cursor: data.posts.posts[data.posts.posts.length - 1].createdAt
                        })
                    }} isLoading={fetching} m='auto' my={6} colorScheme='telegram'>Load more</Button>
                </Flex>)
            }
        </Layout >
    )
}

export default withUrqlClient(createUrqlClient, { ssr: true })(Index)
