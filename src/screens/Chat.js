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
import Switch from "react-switch";
import {
  generateEssaySystemPrompt,
  generateEssayUserPrompt,
} from "../prompts/essay";
import {
  generateCodeSystemPrompt,
  generateCodeUserPrompt,
  generateKarelSystemPrompt,
} from "../prompts/code";
import { constructingTranscript } from "../utils/general";

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

  const [voiceMode, setVoiceMode] = useState(true);
  const [details, setDetails] = useState(null);
  const [markers, setMarkers] = useState([]);
  const [promptText, setPromptText] = useState("");
  const [AIState, setAIState] = useState("thinking");
  // thinking -> gpt generation...
  // speaking -> liz is talking (typewriter animation!)
  // waiting -> liz waits for the user to press enter
  // listening -> user is speaking to the AI
  // editing -> user can edit the text!

  const [currentText, setCurrentText] = useState("");
  const [allText, setAllText] = useState("");
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
    temperature: 0,
  });

  const update = async () => {
    const essaysRef = doc(db, "assns", id);

    await updateDoc(essaysRef, {
      transcript: messages,
    });
  };

  useEffect(() => {
    if (messages?.length > 1) {
      if (data.type === "code" || data.type === "karel") {
        if (messages[messages.length - 1].content.includes("@")) {
          setAIState("speaking");
          setCurrentText(messages[messages.length - 1].content.split("@")[1]);
        } else {
          setAllText(messages[messages.length - 1].content);
        }
      } else {
        if (messages[messages.length - 1].content) {
          setAIState("speaking");
          setCurrentText(messages[messages.length - 1].content);
        }
      }
      update();
    }
  }, [messages]);

  const isLoading = messages[messages.length - 1]?.meta?.loading; //GPT loading
  useEffect(() => {
    if (textInput.current) {
      if (!isLoading) {
        if (voiceMode) {
          setAIState("waiting");
        } else {
          setAIState("editing");
        }

        if (data.type === "code" || data.type === "karel") {
          // console.log(allText.split("@")[1]);
          console.log("EVERYTHING: ", allText);

          try {
            const details = JSON.parse(
              allText.split("@")[0].replaceAll("\n", "").trim()
            );
            setDetails(details);
            console.log("DETAILS: ", details);
            if (details.type !== "none") {
              setMarkers([
                {
                  startRow: details.lineNo - 1,
                  startCol: 1,
                  endRow: details.lineNo - 1,
                  endCol: 10,
                  className: "marker-yellow",
                  type: "fullLine",
                },
              ]);
            }
          } catch (e) {
            console.error(e);
          }
        }
        // setTextToVoice(messages[messages.length - 1].content);
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
    if (data.type === "code" || data.type === "karel") {
      submitQuery([
        {
          content:
            promptText +
            `\n<span>
            Remember, for every question you ask, if you are specifically referring to a code snippet in the student's code, output the following structure:
            {
              "type": "baseQuestion",
              "lineNo": 10,
              "code": "while count < 0",
              "question": "What would happen if you implemented a for loop?"
            }
            @
            <question>
            
            You must remember to include the '@' delimiter. The question should also include a friendly response to the studen's previous answer.
            </span>`,
          role: "user",
        },
      ]);
    } else if (data.type === "essay") {
      submitQuery([{ content: promptText, role: "user" }]);
    }
    setAIState("thinking");
    setDetails(null);
    setPromptText("");
  };

  useEffect(() => {
    if (data) {
      if (data.transcript) {
        if (data.transcript[data.transcript.length - 1].role === "assistant") {
          submitQuery(data.transcript.slice(0, -1));
        } else {
          submitQuery(data.transcript);
        }
      } else {
        if (data.type === "code") {
          submitQuery([
            {
              content: generateCodeSystemPrompt(data.codeAssignment, data.name),
              role: "system",
            },
            { content: generateCodeUserPrompt(data.code), role: "user" },
          ]);
        } else if (data.type === "karel") {
          submitQuery([
            {
              content: generateKarelSystemPrompt(
                data.codeAssignment,
                data.name
              ),
              role: "system",
            },
            { content: generateCodeUserPrompt(data.code), role: "user" },
          ]);
        } else if (data.type === "essay") {
          submitQuery([
            {
              content: generateEssaySystemPrompt(data.essayPrompt, data.name),
              role: "system",
            },
            { content: generateEssayUserPrompt(data.essay), role: "user" },
          ]);
        }
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

    if (AIState === "thinking") {
      setCurrentText("");
      setMarkers([]);
    }
  }, [AIState]);

  return data ? (
    <div className="flex flex-col gap-4 items-center pt-48 w-full px-48">
      <div className="bg-white rounded-lg drop-shadow-md p-4 self-end flex gap-4 items-center px-8">
        <span className="text-gray-400">Voice Mode</span>
        <Switch
          onChange={(checked) => {
            setVoiceMode(checked);
          }}
          disabled={AIState === "waiting" || AIState === "listening"}
          checked={voiceMode}
        />
      </div>
      <div className="flex flex-row gap-4 justify-center w-full">
        <div className="flex w-1/2 pt-8 flex-wrap flex-col relative bg-white rounded-lg drop-shadow-md px-8">
          <div className="flex flex-row justify-between items-center w-full">
            <div className="flex flex-col items-center">
              <span
                className={`text-center text-gray-600 fade-in mb-4 font-serif text-md`}
              >
                <b>Liz</b>
              </span>
              {AIState === "thinking" ? (
                <img src={Liz} className="rounded-lg w-36 mb-8" />
              ) : (
                <img src={LizStationary} className="rounded-lg w-36 mb-8" />
              )}
            </div>
            {AIState === "thinking" ? (
              <div className="p-4 w-1/2 fade-in fade-out text-gray-500 font-serif items-start">
                <ReactLoading
                  type={"bubbles"}
                  color={"purple"}
                  height={"5%"}
                  width={"20%"}
                />
              </div>
            ) : null}
            {details?.question ? (
              <div className="bg-yellow-300 rounded-lg p-4 fade-in w-1/2 text-right">
                {details.question}
              </div>
            ) : null}
          </div>
          <div>
            <div className="font-serif text-xl text-left" id="content">
              {currentText}
            </div>
            {/* {messages.length < 1
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
                  })} */}
          </div>
          {AIState === "listening" ? (
            <>
              <span className="text-purple-600 mt-2 text-gray-400 flex flex-row gap-2 items-center fade-in">
                <div class="dot dot--basic"></div>{" "}
                <div>
                  Liz is now <b>listening...</b> start speaking! Press 'enter'
                  to finish.
                </div>
              </span>
            </>
          ) : AIState === "waiting" ? (
            <>
              <span className="text-gray-600 mt-2 text-gray-400 flex flex-row gap-2 items-center fade-in">
                <div>
                  Take a few seconds to understand the question. Press{" "}
                  <b>enter</b> when you're ready to start speaking.
                </div>
              </span>
            </>
          ) : AIState === "editing" && voiceMode ? (
            <>
              <span className="text-gray-600 mt-2 text-gray-400 flex flex-row gap-2 items-center fade-in">
                <div>
                  If we transcribed your answer inaccurately, feel free to{" "}
                  <b>edit</b> it before clicking send.
                </div>
              </span>
            </>
          ) : null}
          {/* <div className="flex flex-col gap-4 items-end">
            <ContentEditable
              disabled={AIState !== "editing"} // use true to disable editing
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
          </div> */}
        </div>
        {data.type === "karel" || data.type === "code" ? (
          <AceEditor
            markers={markers}
            id="editor"
            mode="python"
            theme="monokai"
            onChange={() => {}}
            highlightActiveLine={false}
            showGutter={true}
            wrapEnabled={true}
            maxLines={null}
            name="editor"
            disabled={true}
            value={data.code}
            editorProps={{ $blockScrolling: true }}
            style={{
              width: "50%",
            }}
            fontSize={18}
            className="rounded-lg w-1/2"
          />
        ) : data.type === "essay" ? (
          <div className="w-1/2 elative bg-[#fffaed] h-[600px] rounded-lg drop-shadow-md px-8 overflow-scroll">
            <h2 className="text-[#725424] font-serif font-bold">
              For reference, here is your essay.{" "}
            </h2>
            <div className="text-[#725424] font-serif pt-8 r">
              {data.essay.split("\n").map((para) => {
                return <p className="mb-4">{para}</p>;
              })}
            </div>
          </div>
        ) : null}
      </div>
      <div className="flex bg-white rounded-lg drop-shadow-md p-8 w-full flex-row gap-4">
        <form
          className="w-full flex flex-row gap-4 items-start"
          onSubmit={(e) => {
            e.preventDefault();
            onSend();
          }}
        >
          <ContentEditable
            disabled={AIState !== "editing"} // use true to disable editing
            onChange={(e) => {
              setPromptText(e.target.value);
            }}
            style={{
              minHeight: "88px",
            }}
            ref={textInput}
            className="bg-gray-50 rounded-lg p-8 w-full outline-none text-gray-700"
            html={promptText ? promptText : null}
          />

          {AIState === "editing" && !transcribing && !recording && !speaking ? (
            <Button
              onClick={() => {
                onSend();
              }}
            >
              Send
            </Button>
          ) : null}
        </form>
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
