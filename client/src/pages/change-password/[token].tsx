import { Box, Button } from '@chakra-ui/react';
import { Form, Formik } from 'formik';
import { NextPage } from 'next';
import { withUrqlClient } from 'next-urql';
import { useRouter } from 'next/router';
import React, { useState } from 'react';
import InputField from '../../components/InputField';
import Wrapper from '../../components/Wrapper';
import { useChangePasswordMutation } from '../../generated/graphql';
import { createUrqlClient } from '../../utils/createUrqlClient';
import { toErrorMap } from '../../utils/toErrorMap';

const ChangePassword: NextPage<{ token: string }> = () => {
    const router = useRouter()
    const [tokenError, setTokenError] = useState('')
    const [, changePassword] = useChangePasswordMutation()

    return (
        <Wrapper variant='small'>
            <Formik
                initialValues={{ newPassword: "" }}
                onSubmit={async (values, { setErrors }) => {
                    const response = await changePassword({
                        newPassword: values.newPassword,
                        token: typeof router.query.token[0] === 'string' ? router.query.token[0] : ''
                    })

                    console.log(response.data?.changePassword.errors)
                    if (response.data?.changePassword.errors) {
                        const errorMap = toErrorMap(response.data.changePassword.errors)
                        if ('token' in errorMap) {
                            setTokenError(errorMap.token)
                        }

                        setErrors(errorMap)
                    } else if (response.data?.changePassword.user) {
                        router.push('/')
                    }
                }}
            >
                {({ isSubmitting }) => (
                    <Form>
                        <InputField label='New Password' placeholder='New Password' name='newPassword' type='password' />
                        {tokenError ? <Box color='red'>{tokenError}</Box> : null}
                        <Button mt={4} type='submit' isLoading={isSubmitting} colorScheme='teal'>
                            Change Password
                        </Button>
                    </Form>
                )}
            </Formik>
        </Wrapper>
    )
}

// TODO: Fix this, probably I'll replace URQL with APOLLO that is why is ignored
// @ts-ignore
export default withUrqlClient(createUrqlClient)(ChangePassword)
