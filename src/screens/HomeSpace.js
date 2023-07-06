import React, { useEffect, useState, useRef } from "react";
import { Form, Input, Alert } from "antd";
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
      basicValues.task_prompt && basicValues.question_1 && basicValues.question_2 && basicValues.question_3 && basicValues.essay
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
                        We are Joe & Shaurya, two Stanford students researching at the <a href="https://piechlab.stanford.edu/">AI and Education lab</a>, really trying to re-imagine what education <b>should</b> look like in the age of AI. 
                    </p>
                    <img src={StanfordLogo} className="h-32" />
                </div>
                <p>We understand that AI is a little scary! Cheating is rampant, and ChatGPT is <i>everywhere</i></p>
                <p>However, we don't believe the solution is to <b>introduce more surveillance.</b> We don't believe in <b>banning</b> AI in classrooms, for ultimately, we have to <b>embrace</b> this technology.</p>
                <p>Instead, we believe that classrooms need to be more <b>process-oriented</b>, <b>conversational</b>, and fundamentally, we need to <b>rethink</b> the way we assess our students.</p>
                <p className="text-center text-4xl m-16 gap-4 leading-relaxed">
                    
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
                <p>
                    We have created this experimental platform as a way to <i>listen</i> to all of you. This will take around <b className="underline decoration-sky-500 decoration-2">
                    10-15 minutes
                  </b>. You are required to have a{" "}
                  <b className="underline decoration-sky-500 decoration-2">
                    microphone
                  </b>
                  , as you will be verbally explaining your thinking!
                </p><br/>
                
                <img src={Liz} className="rounded-lg w-36 mb-8" />
                <p>Meet Liz, your AI guide for this experience.</p><br/>
                <b>
                    Please be aware that this is an <b className="underline">experimental playground.</b> There <b>may</b> be hallucinations, bugs, and we are working on more guardrails to ensure this product is safe for the classroom.
                </b><br/><br />

                <p>Before we start, please watch a short recorded demo of our product. </p>
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
                style={{fontFamily: 'Nunito', fontSize: '30px'}}
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
                style={{fontFamily: 'Nunito', fontSize: '30px'}}
              >
                <div className="text-2xl py-4 flex flex-col gap-3">
                    <b>Step 1: Let's think of an existing task that you are most excited for students to Speak On It!</b>
                    <div className="my-4 flex flex-col w-full gap-2">
                        <p>1. Be as specific as possible: Is there a particular assignment, homework, essay, project, that you currently give to your students, that you think they would benefit from speaking on it? </p>
                        <p>2. Think creatively! We’re not restricted to JUST essays... think of anything that you could speak on: a coding problem, a problem sheet, a slide-deck, what works for you? You could even speak on videos or readings you assigned in class. </p>
                        <p>3. It just has to be a <b>task</b> that you assign to your students on a regular basis. </p>
                    </div>
                </div>
               
                <Form.Item
                  label="What is the specific task that you would want your students to speak on?"
                  name="task"
                  rules={[{ required: true, message: "This can't be empty!" }]}
                >
                  <Input.TextArea placeholder="I would use this tool to supplement a weekly writing exercise I get my students to do each week. The writing exercise is related to the chapter of the book we are reading throughout the semester." />
                </Form.Item>
                <Form.Item
                  label="How often do you assign this task to your students?"
                  name="frequency"
                  rules={[{ required: true, message: "This can't be empty!" }]}
                >
                  <Input.TextArea placeholder="Once every week" />
                </Form.Item>
                <Form.Item
                  label="How do you imagine incorporating Speak on It! into your existing teaching workflow? Would it be during or outside class time?"
                  name="existing_workflow"
                  rules={[{ required: true, message: "This can't be empty!" }]}
                >
                  <Input.TextArea placeholder="I would get my students to use this tool at home, after they spend class time writing about their experience." />
                </Form.Item>
                <Form.Item
                  label="What do you think the biggest bottleneck is in incorporating Speak on It! into your classroom practice?"
                  name="bottleneck"
                  rules={[{ required: true, message: "This can't be empty!" }]}
                >
                  <Input.TextArea placeholder="" />
                </Form.Item>
                <Form.Item
                  label="How do you think your students will react to this tool? "
                  name="student_reaction"
                  rules={[{ required: true, message: "This can't be empty!" }]}
                >
                  <Input.TextArea placeholder="" />
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
                    if (values.task && values.frequency && values.existing_workflow && values.bottleneck && values.student_reaction) {
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
                style={{fontFamily: 'Nunito', fontSize: '24px'}}
              >
                <div className="text-2xl py-4 flex flex-col gap-3">
                    <b>Step 2: Now, let's tune the AI to fit YOUR needs.</b>
                </div>
                
                <Form.Item
                  label="What is the prompt of the task you want your students to speak on?"
                  name="task_prompt"
                  rules={[
                    { required: true, message: "This can't be empty." },
                  ]}
                >
                  <Input placeholder="Write an rhetorical analysis on an article that you found interesting." />
                </Form.Item>
                
                <div className="mt-16">The AI-generated conversation will be <b>anchored</b> by the following 3 questions, while also dynamically probing, responding to, and engaging with the student. You can input <b>exact</b> questions you want the AI to ask, or, ask the AI to find something <b>specific</b> in your student's work.</div>
                <Form.Item
                    label="What are some questions you want the AI to ask your students?"
                    name="question_1"
                    rules={[
                        { required: true, message: "This can't be empty." },
                      ]}
                    >
                    <Input placeholder="Pick a phrase, idea, or figure of interest to you from the paper and ask them to flesh out the purpose of its mention. Try and understand how well the student understands their paper, and the concepts they choose" addonBefore={<div>Question 1</div>} />
                </Form.Item>
                <Form.Item name="question_2" rules={[
                        { required: true, message: "This can't be empty." },
                      ]}>
                    <Input placeholder="How did your drafts change over time? Tell me about some of the most specific changes you made to your essay over time." addonBefore={<div>Question 2</div>} />
                </Form.Item>
                <Form.Item name="question_3" rules={[
                        { required: true, message: "This can't be empty." },
                      ]}>
                    <Input placeholder="Propose a specific counter-argument to the student's main argument, and ask the student to respond to it. The goal is to enter a critical discussion about the paper, pushing their thinking." addonBefore={<div>Question 3</div>} />
                </Form.Item>
                <Form.Item
                  label="Paste a sample student response here to see what it's like to Speak On It!"
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
                    setStep(4);
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

