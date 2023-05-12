import react, { useEffect, useState, useRef } from "react";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../utils/firebase";
import { useParams } from "react-router";
import { useChatCompletion, GPT4, GPT35 } from "openai-streaming-hooks";
import ReactLoading from "react-loading";
import { useWhisper } from "@chengsokdara/use-whisper";
import { Button, Modal } from "antd";
import ContentEditable from "react-contenteditable";
import { Typewriter } from "typewriting-react";
import LizStationary from "../img/liz_stationary.gif";
import Liz from "../img/liz.gif";
import textToSpeech from "../utils/elevenLabs";
import {
  generateEssaySystemPrompt,
  generateEssayUserPrompt,
} from "../prompts/essay";
import {
  generateCodeSystemPrompt,
  generateCodeUserPrompt,
} from "../prompts/code";

const elevenLabsAPI = process.env.REACT_APP_ELEVEN_LABS_KEY;
const secretKey = process.env.REACT_APP_OPENAI_API_KEY;

const Chat = () => {
  const { id } = useParams();

  const {
    transcript,
    startRecording,
    stopRecording,
    transcribing,
    recording,
    speaking,
  } = useWhisper({
    apiKey: secretKey,
    streaming: true,
    timeSlice: 1_000, // 1 second
    whisperConfig: {
      language: "en",
    },
  });

  const [promptText, setPromptText] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [AIState, setAIState] = useState("thinking");
  // thinking -> gpt generation...
  // speaking -> liz is talking (typewriter animation!)
  // waiting -> liz waits for the user to press enter
  // listening -> user is speaking to the AI
  // editing -> user can edit the text!

  const [textToVoice, setTextToVoice] = useState("");
  const textInput = useRef();

  const [data, setData] = useState();
  useEffect(() => {
    const fetchData = async () => {
      const docRef = doc(db, "assns", id);
      const docSnap = await getDoc(docRef);
      setData(docSnap.data());
    };

    fetchData();
  }, []);

  const [messages, submitQuery] = useChatCompletion({
    model: GPT4.BASE,
    apiKey: secretKey,
    temperature: 0.9,
    max_tokens: 300,
  });
  const isLoading = messages[messages.length - 1]?.meta?.loading; //GPT loading
  useEffect(() => {
    const update = async () => {
      const essaysRef = doc(db, "assns", id);

      await updateDoc(essaysRef, {
        transcript: messages,
      });
    };
    if (textInput.current) {
      if (!isLoading) {
        setAIState("speaking");
        setTextToVoice(messages[messages.length - 1].content);
        update();
        // generate voices
        // show the animation of streaming ...
        // setIsListening(true);
        // startRecording();
      }
    }
  }, [isLoading]);

  useEffect(() => {
    const keyDownHandler = (event) => {
      if (event.key === "Enter") {
        if (AIState === "waiting") {
          startRecording();
          setAIState("listening");
        } else if (AIState === "listening") {
          stopRecording();
          setAIState("editing");
        }
      }
    };

    document.addEventListener("keydown", keyDownHandler);

    return () => {
      document.removeEventListener("keydown", keyDownHandler);
    };
  }, [AIState]);

  const onSend = () => {
    submitQuery([{ content: promptText, role: "user" }]);
    setAIState("thinking");
    setPromptText("");
  };

  useEffect(() => {
    if (data) {
      if (data.type === "code") {
        submitQuery([
          {
            content: generateCodeSystemPrompt(data.codeAssignment, data.name),
            role: "system",
          },
          { content: generateCodeUserPrompt(data.code), role: "user" },
        ]);
      } else {
        submitQuery([
          {
            content: generateEssaySystemPrompt(data.essayPrompt, data.name),
            role: "system",
          },
          { content: generateEssayUserPrompt(data.essay), role: "user" },
        ]);
      }
    }
  }, [data]);

  useEffect(() => {
    if (AIState === "listening") {
      setPromptText(transcript.text);
    }
  }, [transcript]);

  useEffect(() => {
    if (AIState === "speaking") {
      textToSpeech("21m00Tcm4TlvDq8ikWAM", textToVoice, elevenLabsAPI, {
        stability: 0.75,
        similarity_boost: 0.6,
      });
    }
  }, [AIState]);

  return data ? (
    <>
      <div className="flex w-1/2 mx-96 my-48 justify-left flex-wrap flex-col relative">
        <span
          className={`w-48 text-center text-gray-600 fade-in mb-4 font-serif text-xl`}
        >
          {/* <AudioStream
            voiceId={"21m00Tcm4TlvDq8ikWAM"}
            text={textToVoice}
            apiKey={elevenLabsAPI}
            voiceSettings={{
              stability: 0.75,
              similarity_boost: 0.6,
            }}
            className="text-gray-100"
            triggerVariable={{ isLoading }}
          /> */}
          {AIState === "thinking" ? (
            <>
              <b>Liz</b> is thinking...
            </>
          ) : (
            <b>Liz</b>
          )}
        </span>
        {AIState === "thinking" ? (
          <img src={Liz} className="rounded-lg w-48 mb-16" />
        ) : (
          <img src={LizStationary} className="rounded-lg w-48 mb-16" />
        )}
        <div>
          {messages.length < 1
            ? null
            : !isLoading &&
              messages.map((msg, i) => {
                return i > messages.length - 2 ? (
                  msg.role === "assistant" ? (
                    <div className="font-serif text-3xl text-left" id="content">
                      <Typewriter
                        words={[msg.content]}
                        onWordFinishTyping={() => {
                          setAIState("waiting");
                        }}
                      />
                    </div>
                  ) : (
                    <div className="font-serif text-2xl text-right mb-16 mt-4 text-purple-600">
                      {msg.content.split("<br />").map((para) => {
                        return <p>{para}</p>;
                      })}
                    </div>
                  )
                ) : null;
              })}
        </div>
        {AIState === "listening" ? (
          <>
            <span className="text-purple-600 mt-2 opacity-70 flex flex-row gap-2 items-center fade-in">
              <div class="dot dot--basic"></div>{" "}
              <div>
                Liz is now <b>listening...</b> start speaking! Press 'enter' to
                finish.
              </div>
            </span>
          </>
        ) : AIState === "waiting" ? (
          <>
            <span className="text-gray-600 mt-2 opacity-70 flex flex-row gap-2 items-center fade-in">
              <div>
                Take a few seconds to understand the question. Press{" "}
                <b>enter</b> when you're ready to start speaking.
              </div>
            </span>
          </>
        ) : AIState === "editing" ? (
          <>
            <span className="text-gray-600 mt-2 opacity-70 flex flex-row gap-2 items-center fade-in">
              <div>
                If we transcribed your answer inaccurately, feel free to{" "}
                <b>edit</b> it before clicking send.
              </div>
            </span>
          </>
        ) : null}
        <div className="flex flex-col gap-4 items-end">
          <ContentEditable
            disabled={AIState !== "editing" || isLoading} // use true to disable editing
            onChange={(e) => {
              setPromptText(e.target.value);
            }}
            ref={textInput}
            class="border-0 outline-none font-serif text-2xl text-purple-600 w-full bg-white mt-16 text-right"
            html={promptText ? promptText : null}
          />

          {AIState === "editing" && !transcribing && !recording && !speaking ? (
            <Button
              type="dashed"
              className="align-right"
              onClick={() => {
                onSend();
              }}
            >
              Send
            </Button>
          ) : null}
        </div>
        <Modal
          title="Reference"
          open={isModalOpen}
          onOk={() => {
            setIsModalOpen(false);
          }}
          onCancel={() => {
            setIsModalOpen(false);
          }}
        >
          {data?.type === "code" ? (
            <div>
              {data.code.split("\n").map((para) => {
                return <p>{para}</p>;
              })}
            </div>
          ) : (
            <div>{data.essay}</div>
          )}
        </Modal>
        <Button
          className="absolute top-4 right-4"
          onClick={() => {
            setIsModalOpen(true);
          }}
        >
          See{" "}
          <span className="ml-1">
            {data?.type === "essay" ? <>Essay</> : <>Code</>}
          </span>
        </Button>
      </div>
    </>
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

export default Chat;
