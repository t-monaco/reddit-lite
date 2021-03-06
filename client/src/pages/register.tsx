import React from 'react'
import { Formik, Form } from "formik";
import { FormControl, FormLabel, Input, FormErrorMessage, Box, Button } from '@chakra-ui/react';
import Wrapper from '../components/Wrapper';
import InputField from '../components/InputField';
import { useRegisterMutation } from '../generated/graphql';
import { toErrorMap } from '../utils/toErrorMap';
import { useRouter } from 'next/dist/client/router';
import { withUrqlClient } from 'next-urql';
import { createUrqlClient } from '../utils/createUrqlClient';

interface registerProps { }

const Register: React.FC<registerProps> = () => {
    const router = useRouter()
    const [, register] = useRegisterMutation()

    return (
        <Wrapper variant='small'>
            <Formik
                initialValues={{ username: "", password: "", email: "" }}
                onSubmit={async (values, { setErrors }) => {
                    const response = await register({ options: values })

                    if (response.data?.register.errors) {
                        setErrors(toErrorMap(response.data.register.errors))
                    } else if (response.data?.register.user) {
                        router.push('/')
                    }
                }}
            >
                {({ isSubmitting }) => (
                    <Form>
                        <InputField label='Username' placeholder='username' name='username' />
                        <Box mt={4}>
                            <InputField label='Email' placeholder='email' name='email' />
                        </Box>
                        <Box mt={4}>
                            <InputField label='Password' placeholder='password' name='password' type='password' />
                        </Box>
                        <Button mt={4} type='submit' isLoading={isSubmitting} colorScheme='teal'>
                            register
                        </Button>
                    </Form>
                )}
            </Formik>
        </Wrapper>
    )
}

export default withUrqlClient(createUrqlClient)(Register)
