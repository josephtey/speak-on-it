import React, { useEffect, useState, useRef } from "react";
import { Form, Input, Alert, Select, Button } from "antd";
import { addDoc, collection } from "firebase/firestore";
import { db, analytics } from "../utils/firebase";
import Liz from "../img/liz.gif";
import { logEvent } from "firebase/analytics";
import JoeDP from '../img/joedp.jpeg'
import ShauryaDP from '../img/shauryadp.jpeg'
import StanfordLogo from '../img/stanfordlogo.png'

const { TextArea } = Input;

const HomeSpace = (props) => {
  
  const urlParams = new URLSearchParams(window.location.search);
  const name = urlParams.get('name');


  const handleSubmit = async () => {
    const basicValues = basicInfoForm.getFieldsValue(true);
    console.log(basicValues)
    if (
      basicValues.essay && basicValues.question_1 && basicValues.question_2 && basicValues.question_3
    ) {
      const assnRef = collection(db, "assns");
      const newDoc = await addDoc(assnRef, {
        ...basicValues,
        time: new Date().getTime(),
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
    <div className="flex w-full items-center h-screen flex-wrap flex-col flex-nowrap lg:p-36">
      <div className="flex flex-col gap-8 w-full items-center justify-center">
        <div className="mb-16 flex flex-col items-center text-2xl bg-white rounded-lg shadow-md p-8 w-full">
          {step === 1 ? (
            <>
              <div className="w-full min-h-fit flex flex-col gap-6">
                <p>
                  {name ? "Hi " + name + "!" : "Hi!"}
                </p>{" "}
                <p>
                  Thank you so much for expressing your interest in <b>Speak on It!</b> 
                </p>{" "}
                <div className="flex flex-row gap-4 py-8 items-center">
                    <img src={JoeDP} className="rounded-full h-32" />
                    <img src={ShauryaDP} className="rounded-full h-32" />
                    <p className="px-8">
                        We are Joe & Shaurya, two Stanford students researching at the <a href="https://piechlab.stanford.edu/">Piech Lab</a>, really trying to re-imagine what education <b>should</b> look like in the age of AI. 
                    </p>
                    <img src={StanfordLogo} className="h-32" />
                </div>
                <div
                  className="rounded-lg text-white bg-blue-500 hover:bg-blue-600 cursor-pointer px-8 py-4 font-bold w-54 text-center self-center text-lg mt-4 mb-10"
                  onClick={() => {
                    window.location.href =
                    "https://www.facebook.com/groups/293798259708045/";
                  }}
                >
                  To stay in touch with us, <b>click here</b> to join our Facebook Group! 
                  </div>

                <p>We understand that AI is a little scary! Cheating is rampant, and ChatGPT is <i>everywhere</i></p>
                <p>However, we don't believe the solution is to introduce more surveillance. We don't believe in banning AI in classrooms, for ultimately, we have to embrace this technology.</p>
                <p>Instead, we believe that classrooms need to be more process-oriented, conversational, and fundamentally, we need to rethink the way we assess our students.</p>

                <p className="text-center text-4xl m-12 gap-4 leading-relaxed">
                    
                    We believe that if you <b>truly understand something</b>, you
                    should be able to <b>Speak On It!</b>
                    {/* <img src={SpeakOnItLogo} className="h-32" /> */}
                </p>
              </div>
              <div className="flex flex-row justify-end w-full mt-16">
                <div
                  className="rounded-lg text-white bg-blue-500 hover:bg-blue-600 cursor-pointer px-8 py-4 font-bold w-54 text-center self-end mb-4"
                  onClick={() => {
                    setStep(2);
                  }}
                >
                  Next
                </div>
              </div>
            </>
          ) : step === 2 ? (
            <>
              <div className="w-full min-h-fit">
                <p>
                  We have developed a tool that enables you to allow your students to <b>speak</b> on their homework, assignment, essay, anything!
                </p><br/>
                <p>But, we are students, not teachers. So, we want to hear from you. We want to <b>build</b> this product with you.</p><br/>
                <p>Meet Liz, your AI guide for this experience.</p> <br/>
                <img src={Liz} className="rounded-lg w-36 mb-8" />
                <p>
                    We have created this experimental platform as a way to <i>listen</i> to all of you. This will take around <b className="underline decoration-sky-500 decoration-2">
                    10-15 minutes
                  </b>. You are required to have a{" "}
                  <b className="underline decoration-sky-500 decoration-2">
                    microphone
                  </b>
                  , as you will be verbally explaining your thinking!
                </p><br/>
                
                <b>
                    Please be aware that this is an <b className="underline">experimental playground.</b> There <b>may</b> be hallucinations, bugs, and we are working on more guardrails to ensure this product is safe for the classroom.
                </b><br/><br />

                <p>Before we start, please watch a short recorded demo of our product. </p><br/>
                <iframe width="560" height="315" src="https://www.youtube.com/embed/fQufkrlJOvY" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>
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
                    setStep(3)
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
                style={{fontFamily: 'Arial', fontSize: '30px'}}
            >
                <div className="text-2xl py-4 flex flex-col gap-3 mb-8">
                    <b>Before we get started, let's start with some basic information!</b>
                </div>
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
            </Form>
            <div className="flex flex-row justify-between w-full mt-16">
                <div
                  className="rounded-lg text-blue-500 bg-white border-2 border-blue-500 hover:bg-gray-100 cursor-pointer px-8 py-4 font-bold w-54 text-center self-end mb-4"
                  onClick={() => {
                    setStep(2);
                  }}
                >
                  Back
                </div>
                <div
                  className="rounded-lg text-white bg-blue-500 hover:bg-blue-600 cursor-pointer px-8 py-4 font-bold w-54 text-center self-end mb-4"
                  onClick={() => {
                    const values = basicInfoForm.getFieldsValue(true)
                    if (values.name && values.email) {
                        setShowError(false);
                        setStep(4);
                    } else {
                        setShowError(true);
                    }
                  }}
                >
                  Next
                </div>
              </div>
            </>
          ) : step === 4 ? (
            <>
              <Form
                form={basicInfoForm}
                layout="vertical"
                autoComplete="off"
                className="w-full min-h-fit"
                size={"large"}
                style={{fontFamily: 'Arial', fontSize: '30px'}}
              >
                <div className="text-2xl py-4 flex flex-col gap-3">
                    <b>Step 1: How do you think Speak on It! would work best in your class?</b>
                    <div>
                      In our conversations, we’ve learned that Speak On It! has two primary workflows that teachers can try with their students.
                    </div>
                    <div className="my-4 flex flex-col w-full gap-2">
                        <p><b>1. Student-based Assignments:</b> Have your students write an essay, lab-report, infographic on any topic of your choice, and we will simulate a conversation with them about their writing. </p>
                        <p><b>2. Reading Responses:</b> Submit any text-based digital media you assigned to your students, and we will simulate a conversation with them about what they read.</p>
                    </div>
                </div>
               
                <Form.Item
                  label="What is the specific task that you would want your students to speak on?"
                  name="task_type"
                  rules={[{ required: true, message: "This can't be empty!" }]}
                >
                  <Select>
                    <Select.Option value={"Student-Based Assignment"}>Student-Based Assignment</Select.Option>
                    <Select.Option value={"Reading Responses"}>Reading Responses</Select.Option>
                  </Select>
                </Form.Item>
              </Form>
              <br/>

              <div className="flex flex-row justify-between w-full">
                <div
                  className="rounded-lg text-blue-500 bg-white border-2 border-blue-500 hover:bg-gray-100 cursor-pointer px-8 py-4 font-bold w-54 text-center self-end mb-4"
                  onClick={() => {
                    setStep(3);
                  }}
                >
                  Back
                </div>
                <div
                  className="rounded-lg text-white bg-blue-500 hover:bg-blue-600 cursor-pointer px-8 py-4 font-bold w-54 text-center self-start mb-4"
                  onClick={() => {
                    const values = basicInfoForm.getFieldsValue(true)
                    if (values.task_type) {
                        setStep(5);
                        setShowError(false);
                    } else {
                        setShowError(true);
                    }
                  }}
                >
                  Next
                </div>
              </div>
            </>
          ) : step === 5 ? (
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
                style={{fontFamily: 'Arial', fontSize: '24px'}}
              >
                <div className="text-2xl py-4 flex flex-col gap-3">
                    <b>Step 2: Design Your Assignment</b>
                </div>
                
                <Form.Item
                  label="What is the prompt of the task you want your students to speak on?"
                  name="task_prompt"
                  rules={[
                    { required: true, message: "This can't be empty." },
                  ]}
                >
                  <Input placeholder={
                    basicInfoForm.getFieldsValue(true).task_type === "Student-Based Assignment" ? "Write a 3500 rhetorical based argument on the rise of the Mughal Empire in India" : "Read an article on the History of the Printing Press and answer the following questions"
                  } />
                </Form.Item>

                <Form.Item
                  label="What subject do you teach?"
                  name="subject"
                  rules={[
                    { required: true, message: "This can't be empty." },
                  ]}
                >
                  <Input placeholder={"e.g. English"} />
                </Form.Item>

                <Form.Item
                    label="What grade is this task for?"
                    name="grade"
                    rules={[
                        { required: true, message: "This can't be empty." },
                      ]}
                    >
                    <Select>
                      <Select.Option value={"6th Grade or Lower"}>6th grade or lower</Select.Option>
                      <Select.Option value={"7th Grade"}>7th Grade</Select.Option>
                      <Select.Option value={"8th Grade"}>8th Grade</Select.Option>
                      <Select.Option value={"9th Grade"}>9th Grade</Select.Option>
                      <Select.Option value={"10th Grade"}>10th Grade</Select.Option>
                      <Select.Option value={"11th Grade"}>11th Grade</Select.Option>
                      <Select.Option value={"12th Grade"}>12th Grade</Select.Option>
                      <Select.Option value={"College"}>College</Select.Option>
                      
                    </Select>
                </Form.Item>

                <Form.Item
                  label="How often would you assign this task to your students?"
                  name="frequency"
                  rules={[{ required: true, message: "This can't be empty!" }]}
                >
                  <Select>
                    <Select.Option value={"More than once a week"}>More than once a week</Select.Option>
                    <Select.Option value={"Once a week"}>Once a week</Select.Option>
                    <Select.Option value={"Once a month"}>Once a month</Select.Option>
                    <Select.Option value={"Once a semester"}>Once a semester</Select.Option>
                  </Select>
                </Form.Item>
                <br />
              </Form>
              <div className="flex flex-row justify-between w-full">
                <div
                  className="rounded-lg text-blue-500 bg-white border-2 border-blue-500 hover:bg-gray-100 cursor-pointer px-8 py-4 font-bold w-54 text-center self-start mb-4"
                  onClick={() => {
                    setStep(4);
                  }}
                >
                  Back
                </div>
                <div
                  className="rounded-lg text-white bg-blue-500 hover:bg-blue-600 cursor-pointer px-8 py-4 font-bold w-54 text-center self-center mb-4"
                  onClick={() => {
                    const values = basicInfoForm.getFieldsValue(true)
                    if (values.task_prompt && values.grade && values.frequency && values.subject) {
                        setStep(6);
                        setShowError(false);
                    } else {
                        setShowError(true);
                    }
                  }}
                >
                  Next
                </div>
              </div>
            </>
          ) : step === 6 ? (
            <>
            <div className="text-2xl w-full text-left">
                  <b>Step 3: Now, let's tune the AI to fit YOUR needs.</b>
              </div>
            <Form
                form={basicInfoForm}
                layout="vertical"
                autoComplete="off"
                className="w-full min-h-fit"
                size={"large"}
                style={{fontFamily: 'Arial', fontSize: '30px'}}
              >
            <Form.Item
                  label={basicInfoForm.getFieldsValue(true).task_type === "Student-Based Assignment" ? "Paste a sample student response for the assignment" : "Paste the reading that you want your students to speak on."}
                  name="essay"
                  rules={[
                    {
                      required: true,
                      message: "Your essay can't be empty!",
                    },
                  ]}
                >
                  <TextArea showCount maxLength={25000} rows={10} />
                </Form.Item>
                
                <div className="mt-16 text-2xl">
                Design 3 questions that you would want to give the AI to direct the flow of the conversation. <br/><br/>

                There are two types of questions you can design! <br/><br/>

                  1. You can provide the AI with a <b>specific question</b> you would ask your student. This approach creates a conversation that is more reliable and has little variance. However, it compromises on the personalisation and dynamic probing that we believe this AI is uniquely strong at doing. <br/><br/>For example, “What is a meaningful phrase you came across in the reading, and why did it stand out to you?”<br/> <br/>

                  2. You can provide the AI with an <b>intent</b> you would like to see your student respond to. This, presents the AI with the ability to choose the specific question based on a student’s response or writing. <br/><br/>For example, “Based on the student’s premise, present a counter argument to them, and ask them how they would respond.”<br/>
                </div>
                <Form.Item
                    label="What will your 3 questions be?"
                    name="question_1"
                    rules={[
                        { required: true, message: "This can't be empty." },
                      ]}
                    >
                    <Input addonBefore={<div>Question 1</div>} />
                </Form.Item>
                <Form.Item name="question_2" rules={[
                        { required: true, message: "This can't be empty." },
                      ]}>
                    <Input addonBefore={<div>Question 2</div>} />
                </Form.Item>
                <Form.Item name="question_3" rules={[
                        { required: true, message: "This can't be empty." },
                      ]}>
                    <Input addonBefore={<div>Question 3</div>} />
                </Form.Item>
                </Form>
                  <br />
                <div className="flex flex-row justify-between w-full">
                <div
                  className="rounded-lg text-blue-500 bg-white border-2 border-blue-500 hover:bg-gray-100 cursor-pointer px-8 py-4 font-bold w-54 text-center self-start mb-4"
                  onClick={() => {
                    setStep(5);
                  }}
                >
                  Back
                </div>
                <div
                  className="rounded-lg text-white bg-blue-500 hover:bg-blue-600 cursor-pointer px-8 py-4 font-bold w-54 text-center self-center mb-4"
                  onClick={() => {
                    handleSubmit()
                  }}
                  htmlType="submit"
                >
                  Speak On It!
                </div>
                </div>
                </>
          ) : null}
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
      
    </div>
  );
};

export default HomeSpace;

