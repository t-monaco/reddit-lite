import { Box, Button } from '@chakra-ui/react';
import { Form, Formik } from "formik";
import { withUrqlClient } from 'next-urql';
import { useRouter } from 'next/dist/client/router';
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
                initialValues={{ username: "", password: "" }}
                onSubmit={async (values, { setErrors }) => {
                    const response = await login({ options: values })

                    if (response.data?.login.errors) {
                        setErrors(toErrorMap(response.data.login.errors))
                    } else if (response.data?.login.user) {
                        router.push('/')
                    }
                }}
            >
                {({ isSubmitting }) => (
                    <Form>
                        <InputField label='Username' placeholder='username' name='username' />
                        <Box mt={4}>
                            <InputField label='Password' placeholder='password' name='password' type='password' />
                        </Box>
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
