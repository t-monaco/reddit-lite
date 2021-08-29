import React from 'react'
import { Box, Flex, Link } from '@chakra-ui/layout'
import NextLink from "next/link";
import { useLogoutMutation, useMeQuery } from '../generated/graphql';
import { Button } from '@chakra-ui/button';
import { isServer } from '../utils/isServer';
import { Heading } from '@chakra-ui/react';

interface NavBarProps { }

const NavBar: React.FC<NavBarProps> = () => {
    const [{ data, fetching }] = useMeQuery({
        pause: isServer()
    })
    const [{ fetching: logoutFetching }, logout] = useLogoutMutation()

    let body = (
        <>
            <NextLink href='/login'>
                <Link mr={2}>Login</Link>
            </NextLink>
            <NextLink href='/register'>
                <Link>Register</Link>
            </NextLink>
        </>
    )

    if (data?.me) {
        body = (
            <Flex alignItems='center'>
                <NextLink href='create-post'>
                    <Link mx={2}>Create Post</Link>
                </NextLink>
                <Flex mx={2}>{data.me.username}</Flex>
                <Button p={0} mx={2} colorScheme='link' isLoading={logoutFetching} onClick={() => logout()}>Logout</Button>
            </Flex>
        )
    }

    return (
        <Flex zIndex={1} position='sticky' top={0} bg='tomato' p={4}>
            <Flex maxW={800} flex={1} m='auto'>
                <NextLink href='/'>
                    <Link>
                        <Heading>MyReddit</Heading>
                    </Link>
                </NextLink>
                <Box ml={'auto'}>
                    {body}
                </Box>
            </Flex>
        </Flex>
    )
}

export default NavBar
