import react, { useEffect, useState } from "react";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../utils/firebase";
import { useParams } from "react-router";
import ReactLoading from "react-loading";
import { Form, Input, Select, Slider } from "antd";

const Feedback = (props) => {
  const { id } = useParams();

  const [questions, setQuestions] = useState(null);
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

  useEffect(() => {
    const fetchData = async () => {
      const docRef = doc(db, "assns", id);
      const docSnap = await getDoc(docRef);
      const assn = docSnap.data();

      const transcript = assn.transcript;
      const finished =
        assn.transcript[transcript.length - 1].content.includes("closure");
      const feedbackDone = assn.feedback;
      const questions = [];
      if (transcript && finished && !feedbackDone) {
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

  return questions ? (
    <div className="flex w-full items-center h-screen flex-wrap flex-col flex-nowrap lg:p-48">
      <div className="flex flex-col gap-8 w-full py-8 items-center justify-center">
        <span className="text-4xl font-bold text-center mb-8">
          What are your thoughts?
        </span>
        <div className="mb-16 flex flex-col items-center text-xl bg-white rounded-lg shadow-md p-8 w-full">
          <Form
            form={form}
            layout="vertical"
            autoComplete="off"
            className="w-full min-h-fit"
            size={"large"}
          >
            <Form.Item
              label="How strong are your oral communication skills from 1-10?"
              name="oral_skills"
              rules={[{ required: true, message: "This can't be empty!" }]}
            >
              <Slider max={10} min={0} />
            </Form.Item>

            <Form.Item
              label="Pick the question you struggled the most with."
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
            </Form.Item>

            <Form.Item
              label="Why did you struggle with this question?"
              name="struggle_reason"
              rules={[{ required: true, message: "This can't be empty!" }]}
            >
              <Input />
            </Form.Item>

            <Form.Item
              label="Primarily, which of the following reasons caused you to struggle with this question?"
              name="struggle_specific_reason"
              rules={[
                {
                  required: true,
                  message: "This can't be empty!",
                },
              ]}
            >
              <Select>
                <Select.Option value={"oral"}>
                  Poor Oral Communication Skills
                </Select.Option>
                <Select.Option value={"understanding"}>
                  Lack of Understanding of Paper
                </Select.Option>
                <Select.Option value={"both"}>
                  Combination of Both
                </Select.Option>
              </Select>
            </Form.Item>

            <Form.Item
              label="On a scale of 1-10, to what extent do you feel like you better understood your assignment by speaking on it?"
              name="clarifying_extent"
              rules={[{ required: true, message: "This can't be empty!" }]}
            >
              <Slider max={10} min={0} />
            </Form.Item>

            <Form.Item
              label="If it helped, pick the question that helped clarify your understanding of your essay the most."
              name="clarify_q"
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
            </Form.Item>

            <Form.Item
              label="Why do you think this question helped clarify your understanding? ?"
              name="clarify_reason"
            >
              <Input />
            </Form.Item>

            <Form.Item
              label="Pick the question that you were most excited to answer."
              name="excited_q"
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
            </Form.Item>

            <Form.Item label="Why?" name="excited_reason">
              <Input />
            </Form.Item>

            <Form.Item
              label="Pick the question that you found was the most redundant to ask."
              name="redundant_q"
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
            </Form.Item>

            <Form.Item label="Why?" name="redundant_reason">
              <Input />
            </Form.Item>
            <Form.Item
              label="Reflecting on this experience, what is one thing you wished Liz could give you feedback on?"
              name="teachable"
            >
              <Input />
            </Form.Item>
            <Form.Item
              label="If you were to use this tool during class, at what point of your learning process would you find this to be most useful?"
              name="helpful_stage"
            >
              <Input />
            </Form.Item>
            <Form.Item
              label="Did Liz fail or stumble anywhere while replying or asking you questions?"
              name="any_errors"
            >
              <Input />
            </Form.Item>
            <Form.Item
              label="Do you have any other thoughs? How did you feel? Any general feedback?"
              name="general_feedback"
            >
              <Input />
            </Form.Item>
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
