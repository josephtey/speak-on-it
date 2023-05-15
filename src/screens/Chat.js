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
import AceEditor from "react-ace";
import "ace-builds/src-noconflict/mode-python";
import "ace-builds/src-noconflict/theme-monokai";
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
        setAIState("waiting");
        // setTextToVoice(messages[messages.length - 1].content);
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
      // textToSpeech("21m00Tcm4TlvDq8ikWAM", textToVoice, elevenLabsAPI, {
      //   stability: 0.6,
      //   similarity_boost: 0.6,
      // });
    }
  }, [AIState]);

  return data ? (
    <div className="flex flex-col gap-4 items-center pt-48 w-full px-48">
      <div className="flex flex-row gap-4 justify-center w-full">
        <div className="flex w-1/2 items-center pt-8 flex-wrap flex-col relative bg-white rounded-lg drop-shadow-md">
          <span
            className={`w-48 text-center text-gray-600 fade-in mb-4 font-serif text-md`}
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
            {AIState}
          </span>
          {AIState === "thinking" ? (
            <img src={Liz} className="rounded-lg w-24 mb-8" />
          ) : (
            <img src={LizStationary} className="rounded-lg w-24 mb-8" />
          )}
          <div>
            {messages.length < 1
              ? null
              : messages.map((msg, i) => {
                  return i > messages.length - 2 ? (
                    msg.role === "assistant" ? (
                      <div
                        className="font-serif text-lg text-left px-8"
                        id="content"
                      >
                        {msg.content}
                      </div>
                    ) : (
                      <div className="font-serif text-lg text-right mb-16 mt-4 text-purple-600">
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
                  Liz is now <b>listening...</b> start speaking! Press 'enter'
                  to finish.
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

            {AIState === "editing" &&
            !transcribing &&
            !recording &&
            !speaking ? (
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
        </div>
        <AceEditor
          id="editor"
          mode="python"
          theme="monokai"
          onChange={() => {}}
          highlightActiveLine={false}
          showGutter={true}
          wrapEnabled={true}
          maxLines={null}
          name="editor"
          value={data.code}
          editorProps={{ $blockScrolling: true }}
          style={{
            width: "50%",
          }}
          className="rounded-lg w-1/2"
        />
      </div>
      <div className="flex bg-white rounded-lg drop-shadow-md h-32 p-8 w-full flex-row gap-4">
        <input className="bg-gray-50 rounded-lg p-8 w-full outline-none text-gray-700"></input>
        <Button>Send!</Button>
      </div>
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

export default Chat;
