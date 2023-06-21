import react, { useEffect, useState } from "react";
import { Form, Input, Alert } from "antd";
import { addDoc, collection } from "firebase/firestore";
import { db, analytics } from "../utils/firebase";
import { Select, Slider } from "antd";
import Liz from "../img/liz.gif";
import { logEvent } from "firebase/analytics";

const { TextArea } = Input;

const assignment_items = [
  {
    label: "Hayden Kantor",
    value: "rba_hayden",
  },
  {
    label: "Cassie Wright",
    value: "rba_cassie",
  },
  {
    label: "Other",
    value: "rba_other",
  },
];

const HomeEssay = (props) => {
  const handleSubmit = async () => {
    const basicValues = basicInfoForm.getFieldsValue(true);
    console.log(basicValues);
    if (
      basicValues.name &&
      basicValues.email &&
      basicValues.essay &&
      basicValues.assignment &&
      basicValues.precondition
    ) {
      const assnRef = collection(db, "assns");
      const newDoc = await addDoc(assnRef, {
        name: basicValues.name,
        email: basicValues.email,
        essay: basicValues.essay,
        time: new Date().getTime(),
        codeAssignment: basicValues.assignment,
        precondition: basicValues.precondition,
      });

      props.history.push("/chat/" + newDoc.id);
    } else {
      setShowError(true);
    }
  };
  const [step, setStep] = useState(1);
  const [basicInfoForm] = Form.useForm();
  const [showError, setShowError] = useState(false);

  useEffect(() => {
    logEvent(analytics, "screen_view", {
      screen: "home_page",
    });
  }, []);

  return (
    <div className="flex w-full items-center h-screen flex-wrap flex-col flex-nowrap lg:p-48">
      <div className="flex flex-col gap-8 w-full py-8 items-center justify-center">
        <div className="mb-16 flex flex-col items-center text-xl bg-white rounded-lg shadow-md p-8 w-full">
          {step === 1 ? (
            <>
              <div className="w-full min-h-fit">
                <p>
                  Hello! We hoped you enjoyed <b>PWR 2</b>!
                </p>{" "}
                <br />
                <br />
                <p>
                  As a <b>celebration</b>, we want to give you the opportunity
                  to{" "}
                  <b className="underline decoration-pink-500 decoration-2">
                    talk about your RBA!
                  </b>
                </p>{" "}
                <p className="text-center text-4xl m-16 leading-relaxed">
                  We believe that if you <b>truly understand something</b>, you
                  should be able to <b>speak on it.</b>
                </p>
                <br />
                <p>
                  This experience will involve you talking to an AI agent called{" "}
                  <b>Liz</b> for around{" "}
                  <b className="underline decoration-sky-500 decoration-2">
                    10-15 minutes
                  </b>
                  . You are required to have a{" "}
                  <b className="underline decoration-sky-500 decoration-2">
                    microphone
                  </b>
                  , as you will be verbally explaining your thinking!
                </p>
                <br />
                <p>Do you want to take part in this experience?</p>
              </div>
              <div className="flex flex-row justify-end w-full mt-16">
                <div
                  className="rounded-lg text-white bg-blue-500 hover:bg-blue-600 cursor-pointer px-8 py-4 font-bold w-54 text-center self-end mb-4"
                  onClick={() => {
                    setStep(2);
                  }}
                >
                  Yes!
                </div>
              </div>
            </>
          ) : step === 2 ? (
            <>
              <div className="w-full min-h-fit">
                <img src={Liz} className="rounded-lg w-36 mb-8" />
                <p>Yay! We hope you're just as excited as we are!</p> <br />
                <p>Meet Liz, your AI guide for this experience.</p>
                <br />
                <p>
                  For context, we are Joe & Shaurya, two undergraduate
                  sophomores at Stanford working at the Piech Lab! We are using
                  generative AI to make this experience possible, and as a full
                  disclaimer, we are acutely aware of the potential biases, and
                  hallucinations that often occur with this technology.
                </p>
                <br />
                <p>
                  As such, please remember that this is an experimental tool!
                </p>
              </div>
              <div className="flex flex-row justify-between w-full mt-16">
                <div
                  className="rounded-lg text-blue-500 bg-white border-2 border-blue-500 hover:bg-gray-100 cursor-pointer px-8 py-4 font-bold w-54 text-center self-end mb-4"
                  onClick={() => {
                    setStep(1);
                  }}
                >
                  Back
                </div>
                <div
                  className="rounded-lg text-white bg-blue-500 hover:bg-blue-600 cursor-pointer px-8 py-4 font-bold w-54 text-center self-end mb-4"
                  onClick={() => {
                    setStep(3);
                  }}
                >
                  Next
                </div>
              </div>
            </>
          ) : step === 3 ? (
            <>
              <Form
                form={basicInfoForm}
                layout="vertical"
                autoComplete="off"
                className="w-full min-h-fit"
                size={"large"}
              >
                <Form.Item
                  label="What's your name?"
                  name="name"
                  rules={[
                    { required: true, message: "Your name can't be empty!" },
                  ]}
                >
                  <Input placeholder="e.g. Bob" />
                </Form.Item>
                <Form.Item
                  label="What is your email?"
                  name="email"
                  rules={[
                    { required: true, message: "Your email can't be empty!" },
                  ]}
                >
                  <Input placeholder="e.g. bob@gmail.com" />
                </Form.Item>
                <Form.Item
                  label="Which class are you in?"
                  name="assignment"
                  rules={[
                    {
                      required: true,
                      message: "Your chosen class can't be empty!",
                    },
                  ]}
                >
                  <Select>
                    {assignment_items.map((item) => {
                      return (
                        <Select.Option value={item.value}>
                          {item.label}
                        </Select.Option>
                      );
                    })}
                  </Select>
                </Form.Item>
                <Form.Item
                  label={
                    "Truthfully, how well do you think you understand your RBA on a scale of 1-10?"
                  }
                  name="precondition"
                  rules={[{ required: true, message: "This can't be empty!" }]}
                >
                  <Slider max={10} min={0} />
                </Form.Item>
              </Form>

              <div className="flex flex-row justify-between w-full">
                <div
                  className="rounded-lg text-blue-500 bg-white border-2 border-blue-500 hover:bg-gray-100 cursor-pointer px-8 py-4 font-bold w-54 text-center self-end mb-4"
                  onClick={() => {
                    setStep(2);
                  }}
                >
                  Back
                </div>
                <div
                  className="rounded-lg text-white bg-blue-500 hover:bg-blue-600 cursor-pointer px-8 py-4 font-bold w-54 text-center self-start mb-4"
                  onClick={() => {
                    setStep(4);
                  }}
                >
                  Next
                </div>
              </div>
            </>
          ) : (
            <>
              <Form
                form={basicInfoForm}
                layout="vertical"
                autoComplete="off"
                onFinish={async () => {
                  await handleSubmit();
                }}
                className="w-full min-h-fit"
                size={"large"}
              >
                <Form.Item
                  label="Paste your RBA here!"
                  name="essay"
                  rules={[
                    {
                      required: true,
                      message: "Your essay can't be empty!",
                    },
                  ]}
                >
                  <TextArea showCount rows={10} />
                </Form.Item>
              </Form>
              <div className="flex flex-row justify-between w-full">
                <div
                  className="rounded-lg text-blue-500 bg-white border-2 border-blue-500 hover:bg-gray-100 cursor-pointer px-8 py-4 font-bold w-54 text-center self-start mb-4"
                  onClick={() => {
                    setStep(3);
                  }}
                >
                  Back
                </div>
                <div
                  className="rounded-lg text-white bg-blue-500 hover:bg-blue-600 cursor-pointer px-8 py-4 font-bold w-54 text-center self-center mb-4"
                  onClick={() => {
                    handleSubmit();
                  }}
                  htmlType="submit"
                >
                  Speak on it!
                </div>
              </div>
            </>
          )}
        </div>
        {showError ? (
          <Alert
            message="Please fill out all the fields"
            type="error"
            closable
            onClose={() => {
              setShowError(false);
            }}
          />
        ) : null}
      </div>
    </div>
  );
};

export default HomeEssay;
