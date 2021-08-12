import {
    Box, Button, Link, Flex } from '@chakra-ui/react';
import { Form, Formik } from "formik";
import { withUrqlClient } from 'next-urql';
import { useRouter } from 'next/router';
import NextLink from "next/link";
import React from 'react';
import InputField from '../components/InputField';
import Wrapper from '../components/Wrapper';
import { useLoginMutation } from '../generated/graphql';
import { createUrqlClient } from '../utils/createUrqlClient';
import { toErrorMap } from '../utils/toErrorMap';

interface loginProps { }

const Login: React.FC<loginProps> = () => {
    const router = useRouter()
    const [, login] = useLoginMutation()

    return (
        <Wrapper variant='small'>
            <Formik
                initialValues={{ usernameOrEmail: "", password: "" }}
                onSubmit={async (values, { setErrors }) => {
                    const response = await login(values)

                    if (response.data?.login.errors) {
                        setErrors(toErrorMap(response.data.login.errors))
                    } else if (response.data?.login.user) {
                        router.push('/')
                    }
                }}
            >
                {({ isSubmitting }) => (
                    <Form>
                        <InputField label='Username or Email' placeholder='username or email' name='usernameOrEmail' />
                        <Box mt={4}>
                            <InputField label='Password' placeholder='password' name='password' type='password' />
                        </Box>
                        <Flex>
                            <NextLink href="/forgot-password">
                                <Link ml='auto'>forgot password?</Link>
                            </NextLink>
                        </Flex>
                        <Button mt={4} type='submit' isLoading={isSubmitting} colorScheme='teal'>
                            login
                        </Button>
                    </Form>
                )}
            </Formik>
        </Wrapper>
    )
}

export default withUrqlClient(createUrqlClient)(Login)
