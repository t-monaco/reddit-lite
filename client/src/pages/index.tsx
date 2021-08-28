import { withUrqlClient } from "next-urql"
import React, { useState } from "react"
import Layout from "../components/Layout"
import NavBar from "../components/Navbar"
import { usePostsQuery } from "../generated/graphql"
import { createUrqlClient } from "../utils/createUrqlClient"
import NextLink from 'next/link'
import { Box, Button, Flex, Heading, Icon, IconButton, Link, Stack, Text } from "@chakra-ui/react"
import { ArrowDownIcon, ArrowUpIcon, ChevronDownIcon, ChevronUpIcon } from "@chakra-ui/icons"
import UpdootSection from "../components/UpdootSection"

const Index = () => {
    const [variables, setVariables] = useState({ limit: 15, cursor: null as null | string })
    const [{ data, fetching }] = usePostsQuery({
        variables
    })

    if (!data && !fetching) {
        return 'Sorry, nothing to show...'
    }

    return (
        <Layout>
            <Flex mb={6}>
                <Heading>My Reddit</Heading>
                <NextLink href='create-post'>
                    <Link ml='auto'>Create Post</Link>
                </NextLink>
            </Flex>
            {!data && fetching ? (
                <div>Loading...</div>
            ) : (
                <Stack spacing={8}>
                    {data.posts.posts.map(p => (
                        <Flex key={p.id} p={5} shadow="md" borderWidth="1px">
                            <UpdootSection post={p} />
                            <Box>
                                <Heading fontSize="xl">{p.title}</Heading>
                                <Text>posted by {p.creator.username}</Text>
                                <Text mt={4}>{p.textSnippet}</Text>
                            </Box>
                        </Flex>
                    ))}
                </Stack>
            )}
            {data && data.posts.hasMore &&
                (<Flex>
                    <Button onClick={() => {
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
