import axios from "axios";
import { useFormik } from "formik";
import React, { useContext, useEffect } from "react";
import { Button, Col, Container, Form, Row } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import { BASE_URL, socket } from "../App";
import { toast } from "react-toastify";
import { UserContext } from "../context/UserContextWrapper";

const SignIn = () => {
  const navigateTo = useNavigate();
  const { setUser } = useContext(UserContext);

  useEffect(() => {
    socket.on("setSocketId", (data) => {
      console.log("server response(setSocketId): ", data);
    });
  }, [socket]);
  const formik = useFormik({
    initialValues: {
      email: "abc@gmail.com",
      password: "abc123",
      device_token: "jnfdsnfd",
    },
    validate: (values) => {
      const err = {};
      if (values.email.trim() === "") {
        err.email = "provide an email address";
      } else if (
        !/^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/.test(values.email)
      ) {
        err.email = "please provide valid email format";
      }

      if (values.password.trim() == "") {
        err.password = "Password is required";
      } else if (values.password.length < 6) {
        err.password = "Password must contain atleast 6 characters";
      }
      if (values.device_token.trim() == "") {
        err.device_token = "Device token is required";
      }
      return err;
    },
    onSubmit: async (values, { resetForm }) => {
      // const device_token = `token_${new Date().getTime()}`;
      // console.log(device_token);

      try {
        const { data } = await axios.post(`${BASE_URL}/v1/user/sign_in`, {
          email_address: values.email,
          password: values.password,
          device_token: values.device_token,
        });
        console.log(data);
        //setting up cookie
        const d = new Date();
        d.setTime(d.getTime() + 5 * 24 * 60 * 60 * 1000);
        document.cookie = `user_token=${
          data.data.token
        }; expires=${d.toUTCString()}; path=/`;

        socket.connect();
        //--
        socket.emit("setSocketId", {
          user_id: data.data._id,
          device_token: values.device_token,
        });

        //--
        setUser(data.data);
        toast.success(data.message);
        resetForm();
        navigateTo("/chatWith");
      } catch (error) {
        console.log(error);
        resetForm();
        toast.error(error?.response?.data?.message);
      }
    },
  });

  return (
    <>
      <Container className="mt-5">
        <Row>
          <Col
            lg={{ span: 6, offset: 3 }}
            className="form-container p-4 rounded"
          >
            <h3 className="text-primary text-center">Sign In</h3>
            <Form onSubmit={formik.handleSubmit} noValidate={true}>
              <Form.Group className="mb-2">
                <Form.Label>Email:</Form.Label>
                <Form.Control
                  type="text"
                  size="sm"
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
              <Form.Group className="mb-2">
                <Form.Label>Device Token:</Form.Label>
                <Form.Control
                  size="sm"
                  type="text"
                  value={formik.values.device_token}
                  onChange={(e) =>
                    formik.setFieldValue(
                      "device_token",
                      e.target.value.trimStart()
                    )
                  }
                  onBlur={formik.handleBlur}
                  name="device_token"
                />
                {formik.errors.device_token && formik.touched.device_token && (
                  <Form.Text className="text-danger">
                    {formik.errors.device_token}
                  </Form.Text>
                )}
              </Form.Group>
              <div>
                Don't have an account?
                <Link className="ms-2" to="/signup">
                  Sign Up
                </Link>
              </div>
              <Button type="submit" className="mt-3">
                Sign In
              </Button>
            </Form>
          </Col>
        </Row>
      </Container>
    </>
  );
};

export default SignIn;
