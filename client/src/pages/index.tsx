import { withUrqlClient } from "next-urql"
import React from "react"
import Layout from "../components/Layout"
import NavBar from "../components/Navbar"
import { usePostsQuery } from "../generated/graphql"
import { createUrqlClient } from "../utils/createUrqlClient"
import NextLink from 'next/link'
import { Link } from "@chakra-ui/react"

const Index = () => {
    const [{data}] = usePostsQuery()

    return (
        <Layout>
            <NextLink href='create-post'>
                <Link>Create Post</Link>
            </NextLink>
            <h1>HELLO WOOLRD</h1>
            {!data ? null : data.posts.map(p => <h4>{p.title}</h4>)}
        </Layout >
    )
}

export default withUrqlClient(createUrqlClient, {ssr: true})(Index)
