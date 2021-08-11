import { withUrqlClient } from "next-urql"
import NavBar from "../components/Navbar"
import { usePostsQuery } from "../generated/graphql"
import { createUrqlClient } from "../utils/createUrqlClient"

const Index = () => {
    const [{data}] = usePostsQuery()

    return (
        <>
            <NavBar />
            <h1>HELLO WOOLRD</h1>
            {!data ? null : data.posts.map(p => <h4>{p.title}</h4>)}
        </>
    )
}

export default withUrqlClient(createUrqlClient, {ssr: true})(Index)
