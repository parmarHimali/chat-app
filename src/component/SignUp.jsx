import axios from "axios";
import React, { useState } from "react";
import { Button, Col, Container, Form, Row } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import { BASE_URL } from "../App";
import { useFormik } from "formik";
import { toast } from "react-toastify";

const Signup = () => {
  const navigateTo = useNavigate();
  const formik = useFormik({
    initialValues: {
      username: "",
      email: "",
      password: "",
    },
    onSubmit: async (values, { resetForm }) => {
      console.log(values);
      const device_token = `token_${new Date().getTime()}`;
      try {
        const { data } = await axios.post(`${BASE_URL}/v1/user/sign_up`, {
          full_name: values.username,
          email_address: values.email,
          password: values.password,
          device_token,
        });
        console.log(data);
        const d = new Date();
        d.setTime(d.getTime() + 5 * 24 * 60 * 60 * 1000);
        document.cookie = `user_token=${
          data.data.token
        }; expires=${d.toUTCString()}; path=/`;
        toast.success("User registered successfully!");
        resetForm();
      } catch (error) {
        console.log(error);
      }
    },
    validate: (values) => {
      const err = {};

      if (values.username.trim() == "") {
        err.username = "Username is required";
      }

      if (values.password.trim() == "") {
        err.password = "Password is required";
      } else if (values.password.length < 6) {
        err.password = "Password must contain atleast 6 characters";
      }

      if (values.email.trim() === "") {
        err.email = "Email is required!";
      } else if (
        !/^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/.test(values.email)
      ) {
        err.email = "please provide valid email format";
      }

      return err;
    },
  });

  return (
    <>
      <Container className="my-4">
        <Row>
          <Col
            lg={{ span: 6, offset: 3 }}
            className="form-container p-4 rounded"
          >
            <h3 className="text-primary text-center">Sign Up</h3>
            <Form onSubmit={formik.handleSubmit} noValidate={true}>
              <Form.Group className="mb-2">
                <Form.Label>Username:</Form.Label>
                <Form.Control
                  size="sm"
                  type="text"
                  value={formik.values.username}
                  onChange={(e) =>
                    formik.setFieldValue("username", e.target.value.trimStart())
                  }
                  onBlur={formik.handleBlur}
                  name="username"
                />
                {formik.errors.username && formik.touched.username && (
                  <Form.Text className="text-danger">
                    {formik.errors.username}
                  </Form.Text>
                )}
              </Form.Group>
              <Form.Group className="mb-2">
                <Form.Label>Email:</Form.Label>
                <Form.Control
                  size="sm"
                  type="email"
                  value={formik.values.email}
                  onChange={(e) =>
                    formik.setFieldValue("email", e.target.value.trimStart())
                  }
                  onBlur={formik.handleBlur}
                  name="email"
                />
                {formik.errors.email && formik.touched.email && (
                  <Form.Text className="text-danger">
                    {formik.errors.email}
                  </Form.Text>
                )}
              </Form.Group>

              <Form.Group className="mb-2">
                <Form.Label>Password:</Form.Label>
                <Form.Control
                  size="sm"
                  type="password"
                  value={formik.values.password}
                  onChange={(e) =>
                    formik.setFieldValue("password", e.target.value.trimStart())
                  }
                  onBlur={formik.handleBlur}
                  name="password"
                />
                {formik.errors.password && formik.touched.password && (
                  <Form.Text className="text-danger">
                    {formik.errors.password}
                  </Form.Text>
                )}
              </Form.Group>

              <div>
                Already have an account?
                <Link className="ms-2" to="/signin">
                  Sign In
                </Link>
              </div>
              <Button type="submit" className="mt-3">
                Sign Up
              </Button>
            </Form>
          </Col>
        </Row>
      </Container>
    </>
  );
};

export default Signup;
