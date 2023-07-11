import react, { useEffect, useState } from "react";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../utils/firebase";
import { useParams } from "react-router";
import ReactLoading from "react-loading";
import { Form, Input, Select, Slider, Button } from "antd";

const Feedback = (props) => {
  const { id } = useParams();

  const [questions, setQuestions] = useState(null);
  const [data, setData] = useState(null);
  const [error, setError] = useState(false);
  const [form] = Form.useForm();

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const fields = Object.keys(values);
      const filteredValues = {};
      const assnRef = doc(db, "assns", id);

      for (let i = 0; i < fields.length; i++) {
        if (values[fields[i]]) {
          filteredValues[fields[i]] = values[fields[i]];
        } else {
          filteredValues[fields[i]] = "";
        }
      }
      await updateDoc(assnRef, {
        feedback: filteredValues,
      });

      props.history.push("/thankyou");
    } catch (e) {
      console.log(e);
    }
  };

  const autoSave = async () => {
    const values = await form.getFieldsValue(true);
    const fields = Object.keys(values);
    const filteredValues = {};
    const assnRef = doc(db, "assns", id);

    for (let i = 0; i < fields.length; i++) {
      if (values[fields[i]]) {
        filteredValues[fields[i]] = values[fields[i]];
      } else {
        filteredValues[fields[i]] = "";
      }
    }
    await updateDoc(assnRef, {
      feedback: filteredValues,
    });
  };

  useEffect(() => {
    const fetchData = async () => {
      const docRef = doc(db, "assns", id);
      const docSnap = await getDoc(docRef);
      const assn = docSnap.data();

      setData(assn);

      const transcript = assn.transcript;
      const finished =
        assn.transcript[transcript.length - 1].content.includes("closure");
      const questions = [];
      if (transcript && finished) {
        for (let i = 0; i < transcript.length; i++) {
          if (
            transcript[i].content.includes("@") &&
            transcript[i].role === "assistant"
          ) {
            try {
              const details = JSON.parse(
                transcript[i].content.split("@")[0].replaceAll("\n", "").trim()
              );
              const body = transcript[i].content
                .split("@")[1]
                .replaceAll("\n", "")
                .trim();
              if (
                details.type === "baseQuestion" ||
                details.type === "followup"
              ) {
                questions.push({
                  question: details.question,
                  details: body,
                });
              }
            } catch (e) {
              console.error(e);
            }
          }
        }
        setQuestions(questions);
      } else {
        setError(true);
      }
    };

    fetchData();
  }, []);

  return data && questions ? (
    <div className="flex w-full items-center h-screen flex-wrap flex-col flex-nowrap lg:p-48">
      <div className="flex flex-col gap-8 w-full pb-8 items-center justify-center">
        <span className="text-4xl font-bold text-center mb-8">
          Thanks so much for using Speak On It!
        </span>
        <div className="mb-16 flex flex-col items-center text-xl bg-white rounded-lg shadow-md p-8 w-full">
          <Form
            form={form}
            layout="vertical"
            autoComplete="off"
            className="w-full min-h-fit"
            size={"large"}
            onFieldsChange={() => {
              autoSave();
            }}
            initialValues={data.feedback}
          >

            <Form.Item
              label="We’d love to hear about your conversation. How did you feel? Do you have any thoughts about the experience?"
              name="feeling"
              rules={[{ required: true, message: "This can't be empty!" }]}
            >
              <Input.TextArea />
            </Form.Item>
            <Form.Item
              label="To what extent do you feel that Liz’ questions were an extension of you, and aligned with how you tuned it? Did it react differently than you expected?"
              name="extension"
              rules={[{ required: true, message: "This can't be empty!" }]}
            >
              <Input.TextArea />
            </Form.Item>
            <Form.Item
              label="Do you like having control over the questions that the AI asks, or do you want to let the AI decide what questions to ask?"
              name="control"
              rules={[{ required: true, message: "This can't be empty!" }]}
            >
              <Input.TextArea />
            </Form.Item>
            <Form.Item
              label="Reflecting back on your answers, as a teacher, what do you think distinguished your strong oral responses from your weaker ones?"
              name="distinguish"
              rules={[{ required: true, message: "This can't be empty!" }]}
            >
              <Input.TextArea />
            </Form.Item>
            <Form.Item
              label="Who is one other teacher who you think would be excited to try this tool? What is their email?"
              name="teacher_referral"
              rules={[{ required: true, message: "This can't be empty!" }]}
            >
              <Input />
            </Form.Item>
            <Button onClick={()=>{
              window.open("https://calendly.com/joetey/30min?back=1&month=2023-07", "_blank");                
            }}>
              Schedule a chat with us!
            </Button>
            {/* <Form.Item
              label="Pick the question you struggled the most with. (required)"
              name="struggle_q"
              rules={[
                {
                  required: true,
                  message: "This can't be empty!",
                },
              ]}
            >
              <Select>
                {questions.map((item, i) => {
                  return (
                    <Select.Option value={item.details}>
                      <b>Question {i + 1}: </b> {item.question}
                    </Select.Option>
                  );
                })}
              </Select>
            </Form.Item> */}
          </Form>
        </div>
        <div
          className="rounded-lg text-white bg-blue-500 hover:bg-blue-600 cursor-pointer px-16 py-8 text-3xl mb-32 font-bold w-54 text-center self-center mb-4"
          onClick={() => {
            handleSubmit();
          }}
          htmlType="submit"
        >
          Submit
        </div>
      </div>
    </div>
  ) : error ? (
    <div className="flex w-full justify-center content-center h-screen flex-wrap flex-col">
      <span className="text-2xl">
        An error has occurred. Have you already completed this form? Or, have
        you not finished the experience?
      </span>
    </div>
  ) : (
    <div className="flex w-full justify-center content-center h-screen flex-wrap flex-col">
      <ReactLoading
        className="mr-2"
        type={"spin"}
        color={"blue"}
        height={15}
        width={15}
      />
    </div>
  );
};

export default Feedback;
