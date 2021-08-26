import React from 'react'
import { Box, Flex, Link } from '@chakra-ui/layout'
import NextLink from "next/link";
import { useLogoutMutation, useMeQuery } from '../generated/graphql';
import { Button } from '@chakra-ui/button';
import { isServer } from '../utils/isServer';

interface NavBarProps { }

const NavBar: React.FC<NavBarProps> = () => {
    const [{ data, fetching }] = useMeQuery({
        pause: isServer()
    })
    const [{ fetching: logoutFetching }, logout] = useLogoutMutation()

    let body = null

    if (fetching) {
        // user not logged in
    } else if (!data?.me) {
        body = (
            <>
                <NextLink href='/login'>
                    <Link mr={2}>Login</Link>
                </NextLink>
                <NextLink href='/register'>
                    <Link>Register</Link>
                </NextLink>
            </>
        )
    } else {
        body = (
            <Flex>
                <Box mr={2}>{data.me.username}</Box>
                <Button colorScheme='link' isLoading={logoutFetching} onClick={() => logout()}>Logout</Button>
            </Flex>
        )
    }

    return (
        <Flex zIndex={1} position='sticky' top={0} bg='tomato' p={4}>
            <Box ml={'auto'}>
                {body}
            </Box>
        </Flex>
    )
}

export default NavBar
