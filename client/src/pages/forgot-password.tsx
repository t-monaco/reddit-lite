import { Box, Flex, Link, Button } from '@chakra-ui/react'
import { Formik, Form } from 'formik'
import { withUrqlClient } from 'next-urql'
import router from 'next/router'
import React, { useState } from 'react'
import InputField from '../components/InputField'
import Wrapper from '../components/Wrapper'
import { useForgotPasswordMutation } from '../generated/graphql'
import { createUrqlClient } from '../utils/createUrqlClient'
import { toErrorMap } from '../utils/toErrorMap'
import login from './login'

interface forgotPasswordProps { }

const ForgotPassword: React.FC<forgotPasswordProps> = () => {
    const [complete, setComplete] = useState(false)
    const [, forgotPassword] = useForgotPasswordMutation()

    return (
        <Wrapper variant='small'>
            <Formik
                initialValues={{ email: "" }}
                onSubmit={async (values) => {
                    await forgotPassword(values);
                    setComplete(true)
                }}
            >
                {({ isSubmitting }) => complete ?
                    <Box>If an email account exist, we send you an email</Box> :
                    (
                        <Form>
                            <InputField label='Email' placeholder='email' name='email' type='email' />
                            <Button mt={4} type='submit' isLoading={isSubmitting} colorScheme='teal'>
                                Forgot Password
                            </Button>
                        </Form>
                    )}
            </Formik>
        </Wrapper>
    )
}

export default withUrqlClient(createUrqlClient)(ForgotPassword)
