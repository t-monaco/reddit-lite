import React from 'react'
import { Formik, Form } from "formik";
import { FormControl, FormLabel, Input, FormErrorMessage, Box, Button } from '@chakra-ui/react';
import Wrapper from '../components/Wrapper';
import InputField from '../components/InputField';

interface registerProps {

}

const Register: React.FC<registerProps> = () => {
    return (
        <Wrapper variant='small'>
            <Formik initialValues={{ username: "", password: "" }}
                onSubmit={(values) => console.log(values)}>
                {({ isSubmitting }) => (
                    <Form>
                        <InputField label='Username' placeholder='username' name='username' />
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

export default Register
