import react, { useEffect, useState, useRef } from "react";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "../utils/firebase";
import { useParams } from "react-router";
import { useChatCompletion, GPT4 } from "openai-streaming-hooks";
import ReactLoading from "react-loading";
import { Button } from "antd";
import LizStationary from "../img/liz_stationary.gif";
import Liz from "../img/liz.gif";
import AceEditor from "react-ace";
import "ace-builds/src-noconflict/mode-python";
import "ace-builds/src-noconflict/theme-monokai";
import { v4 as uuidv4 } from 'uuid';
import {
  generateEssaySystemPrompt,
  generateEssayUserPrompt,
} from "../prompts/essay";
import {
  generateCodeSystemPrompt,
  generateCodeUserPrompt,
  generateKarelSystemPrompt,
} from "../prompts/code";

const mimeType = "audio/webm";
const elevenLabsAPI = process.env.REACT_APP_ELEVEN_LABS_KEY;
const secretKey = process.env.REACT_APP_OPENAI_API_KEY;

const Chat = (props) => {
  const { id } = useParams();

  // const [startStopSequenceRecording, setStartStopSequenceRecording] =
  //   useState(false);
  // const {
  //   transcript,
  //   startRecording,
  //   stopRecording,
  //   transcribing,
  //   recording,
  //   speaking,
  // } = useWhisper({
  //   apiKey: secretKey,
  //   streaming: true,
  //   timeSlice: 1_000, // 1 second
  //   whisperConfig: {
  //     language: "en",
  //   },
  // });

  // useEffect(() => {
  //   if (startStopSequenceRecording) {
  //     if (!speaking) {
  //       stopRecording();
  //       setStartStopSequenceRecording(false);
  //     }
  //   }
  // }, [speaking, startStopSequenceRecording]);

  const [voiceMode, setVoiceMode] = useState(true);
  const [details, setDetails] = useState(null);
  const [markers, setMarkers] = useState([]);
  const [AIState, setAIState] = useState("thinking");
  // thinking -> gpt generation...
  // speaking -> liz is talking (typewriter animation!)
  // waiting -> liz waits for the user to press enter
  // listening -> user is speaking to the AI
  // editing -> user can edit the text!

  const [currentText, setCurrentText] = useState("");
  const [allText, setAllText] = useState("");
  const [textToVoice, setTextToVoice] = useState("");

  const [data, setData] = useState();
  const [assn, setAssn] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      const docRef = doc(db, "assns", id);
      const docSnap = await getDoc(docRef);
      setData(docSnap.data());
    };

    fetchData();
  }, []);

  useEffect(() => {
    const fetchAssnData = async (assnid) => {
      const docRef = doc(db, "cip", assnid);
      const docSnap = await getDoc(docRef);
      setAssn(docSnap.data());
    };
    if (data) {
      fetchAssnData(data.codeAssignment);
    }

    // set assignment data manually
    if (data && data.task_prompt) {
      setAssn({
        assignment: data.task_prompt,
        type: "essay"
      })
    }
  }, [data]);

  const [messages, submitQuery] = useChatCompletion({
    model: GPT4.BASE,
    apiKey: secretKey,
    temperature: 0.8,
  });

  const update = async () => {
    const essaysRef = doc(db, "assns", id);

    await updateDoc(essaysRef, {
      transcript: messages,
    });
  };

  const logError = async (error) => {
    const essaysRef = doc(db, "assns", id);

    if (data.errors && data.errors.length > 0) {
      await updateDoc(essaysRef, {
        errors: [...data.errors, error],
      });
    } else {
      await updateDoc(essaysRef, {
        errors: [error],
      });
    }
  };

  useEffect(() => {
    if (messages?.length > 1) {
      if (
        assn.type === "console" ||
        assn.type === "karel" ||
        assn.type === "graphics" ||
        assn.type === "essay"
      ) {
        if (messages[messages.length - 1].content.includes("@")) {
          setAIState("speaking");
          setCurrentText(messages[messages.length - 1].content.split("@")[1]);
        }
        setAllText(messages[messages.length - 1].content);
      } else {
        if (messages[messages.length - 1].content) {
          setAIState("speaking");
          setCurrentText(messages[messages.length - 1].content);
        }
      }
      update();
    }
  }, [messages]);

  const [permission, setPermission] = useState(false);

	const mediaRecorder = useRef(null);

	const [stream, setStream] = useState(null);

	const [audioChunks, setAudioChunks] = useState([]);

  const getMicrophonePermission = async () => {
		if ("MediaRecorder" in window) {
			try {
				const mediaStream = await navigator.mediaDevices.getUserMedia({
					audio: true,
					video: false,
				});
				setPermission(true);
				setStream(mediaStream);
			} catch (err) {
				alert(err.message);
			}
		} else {
			alert("The MediaRecorder API is not supported in your browser.");
		}
	};

  useEffect(()=>{
    getMicrophonePermission()
  }, [])

	const startRecording = async () => {
		const media = new MediaRecorder(stream, { type: mimeType });

		mediaRecorder.current = media;

		mediaRecorder.current.start();

		let localAudioChunks = [];

		mediaRecorder.current.ondataavailable = (event) => {
			if (typeof event.data === "undefined") return;
			if (event.data.size === 0) return;
			localAudioChunks.push(event.data);
		};

		setAudioChunks(localAudioChunks);
	};

	const stopRecording = () => {
		mediaRecorder.current.stop();

		mediaRecorder.current.onstop = () => {
			const audioBlob = new Blob(audioChunks, { type: mimeType });

      const storageRef = ref(storage, 'speakonit/' + uuidv4() + ".webm");
      uploadBytes(storageRef, audioBlob).then((snapshot) => {
        getDownloadURL(snapshot.ref).then((downloadURL) => {
          console.log('File available at', downloadURL);
          setMediaUrl(downloadURL)
        });
      });
			

			setAudioChunks([]);
		};
	};

  const [mediaURL, setMediaUrl] = useState(null)

  useEffect(()=>{
    const getTranscript = async (mediaUrl) => {
      const apiEndpoint = "https://api.deepgram.com/v1/listen";
      console.log(mediaUrl)
      const payload = { "url": mediaUrl };
      const headers = {
          "accept": "application/json",
          "content-type": "application/json",
          "Authorization": "Token 7a7661a6c249f4cd680d880eac9b74f267ae5585"
      };
  
      const response = await fetch(apiEndpoint, {
          method: 'POST',
          headers: headers,
          body: JSON.stringify(payload)
      });
      const data = await response.json();
      
      console.log(data)
      const transcript = data?.['results']?.['channels'][0]?.['alternatives']?.[0].transcript
      onSend(transcript)
      console.log(transcript)
      return transcript
  }
    if (mediaURL){
      // get transcript
      getTranscript(mediaURL)

    }
  }, [mediaURL])

  const isLoading = messages[messages.length - 1]?.meta?.loading; //GPT loading
  useEffect(() => {
      if (assn && !isLoading) {
        if (voiceMode) {
          setAIState("waiting");
        } else {
          setAIState("editing");
        }
        if (
          assn.type === "console" ||
          assn.type === "karel" ||
          assn.type === "graphics" ||
          assn.type === "essay"
        ) {
          console.log("EVERYTHING: ", allText);

          try {
            const details = JSON.parse(
              allText.split("@")[0].replaceAll("\n", "").trim()
            );

            setDetails(details);
            console.log("DETAILS: ", details);
            if (
              details.type !== "intro" &&
              details.type !== "closure" &&
              assn.type !== "essay"
            ) {
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
            if (details.type === "closure") {
              setAIState("closure");
            }
          } catch (e) {
            alert(
              "Error. Please refresh the page. If this doesn't work, try again!"
            );
            logError({
              errorMsg: e.message,
              output: messages,
            });
            console.error(e);
          }
        }
        // setTextToVoice(messages[messages.length - 1].content);
        // generate voices
        // show the animation of streaming ...
        // setIsListening(true);
        // startRecording();
      }
  }, [isLoading]);

  useEffect(() => {
    const keyDownHandler = (event) => {
      if (event.key === "Enter") {
        if (AIState === "waiting") {
          startRecording();
          setAIState("listening");
        } else if (AIState === "listening") {
          stopRecording()
          setAIState("thinking");
        }
      }
    };

    document.addEventListener("keydown", keyDownHandler);

    return () => {
      document.removeEventListener("keydown", keyDownHandler);
    };
  }, [AIState]);

  const countNumBaseQuestions = (messages) => {
    let count = 0;
    for (let i = 0; i < messages.length; i++) {
      if (
        messages[i].content.includes("@") &&
        messages[i].role === "assistant"
      ) {
        try {
          const details = JSON.parse(
            messages[i].content.split("@")[0].replaceAll("\n", "").trim()
          );
          if (details.type === "baseQuestion") {
            count++;
          }
        } catch (e) {
          console.error(e);
        }
      }
    }
    return count;
  };

  const onSend = (message) => {
    const numBaseQuestions = countNumBaseQuestions(messages);

    if (
      assn.type === "console" ||
      assn.type === "karel" ||
      assn.type === "graphics"
    ) {
      submitQuery([
        {
          content:
            message +
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
            
            You must start with the dictionary, remember to include the '@' delimiter, and it must end with a question. The question should also include a friendly response to the student's previous answer.

            You have asked ${numBaseQuestions} base question${
              numBaseQuestions !== 1 ? "s" : ""
            } so far. You need to ask ${
              2 - numBaseQuestions
            } more base question${2 - numBaseQuestions !== 1 ? "s" : ""}.
            </span>`,
          role: "user",
        },
      ]);
    } else if (assn.type === "essay") {
      submitQuery([
        {
          content:
            message +
            `\n<span>
      Remember, for every question you ask, output the following structure:
      {
        "type": "baseQuestion",
        "question": "What worked, and what didn't?"
      }
      @
      <question>
      
      Some rules to remmember: 
      1. You MUST start with the dictionary, remember to include the '@' delimiter, and it must end with a question that starts with friendly response to the student's previous answer.
      2. If the student asks for a hint, or asks a question, or asks for the answer, do NOT answer it. Bring it back to the structured flow pre-defined above. 
      3. You need to ask ${4 - numBaseQuestions} more base question${
              4 - numBaseQuestions !== 1 ? "s" : ""
            }.
      </span>`,
          role: "user",
        },
      ]);
    }
    setAIState("thinking");
    setDetails(null);
  };

  useEffect(() => {
    if (data && assn) {
      if (data.transcript) {
        // clean transcript
        let cleanedTranscript = [];
        for (let i = 0; i < data.transcript.length; i++) {
          if (
            data.transcript[i].role !== "" &&
            data.transcript[i].content !== ""
          ) {
            cleanedTranscript.push(data.transcript[i]);
          }
        }
        if (
          cleanedTranscript[cleanedTranscript.length - 1].role === "assistant"
        ) {
          submitQuery(cleanedTranscript.slice(0, -1));
        } else {
          submitQuery(cleanedTranscript);
        }
      } else {
        if (assn.type === "graphics" || assn.type === "console") {
          submitQuery([
            {
              content: generateCodeSystemPrompt(data.name),
              role: "system",
            },
            {
              content: generateCodeUserPrompt(assn.assignment, data.code),
              role: "user",
            },
          ]);
        } else if (assn.type === "karel") {
          submitQuery([
            {
              content: generateKarelSystemPrompt(data.name),
              role: "system",
            },
            {
              content: generateCodeUserPrompt(assn.assignment, data.code),
              role: "user",
            },
          ]);
        } else if (assn.type === "essay") {
          submitQuery([
            {
              content: generateEssaySystemPrompt(data.essayPrompt, data.question_1, data.question_2, data.question_3, data.name),
              role: "system",
            },
            { content: generateEssayUserPrompt(data.essay), role: "user" },
          ]);
        }
      }
    }
  }, [data, assn]);

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

  return data && assn ? (
    <div className="flex flex-col gap-4 items-center w-full lg:p-48 md:p-8">
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
                <img src={Liz} className="rounded-lg w-24 mb-8" />
              ) : (
                <img src={LizStationary} className="rounded-lg w-24 mb-8" />
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
            {details?.question && AIState !== "thinking" ? (
              <div className="bg-yellow-300 rounded-lg p-4 fade-in w-1/2 text-right">
                {details.question}
              </div>
            ) : null}
          </div>
          <div>
            <div className="font-serif text-lg text-left" id="content">
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
              <span className="text-purple-600 mt-2 text-gray-400 flex flex-col gap-2 fade-in">
                <div className="flex flex-row gap-2 items-center">
                  <div class="dot dot--basic"></div>{" "}
                  <div>
                    Liz is now <b>listening...</b> start speaking! Press 'enter'
                    to finish.
                  </div>
                </div>
                <Button
                  type="dashed"
                  className="self-start"
                  onClick={() => {
                    setAIState("editing");
                    stopRecording()
                  }}
                >
                  Stop Speaking
                </Button>
              </span>
            </>
          ) : AIState === "waiting" ? (
            <>
              <span className="text-gray-600 mt-2 text-gray-400 flex flex-col gap-2 fade-in">
                <div>
                  Take a few seconds to understand the question. Press{" "}
                  <b>enter</b> when you're ready to start speaking.
                </div>
                <Button
                  type="dashed"
                  className="self-start"
                  onClick={() => {
                    startRecording();
                    setAIState("listening");
                  }}
                >
                  Start Speaking
                </Button>
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
          ) : AIState === "closure" ? (
            <>
              <span className="text-gray-600 mt-2 text-gray-400 flex flex-col gap-2 fade-in">
                <div>
                  Thanks so much for participating in this experimental tool! We
                  hoped you enjoyed this experience.
                </div>
                <Button
                  type="dashed"
                  className="self-start"
                  onClick={() => {
                    if (assn.type === "essay") {
                      window.location.href = window.location.origin + "/feedback/" + id

                      props.history.push();
                    } else {
                      window.location.href =
                        "https://forms.gle/QZaAAWbfbc793vE66";
                    }
                  }}
                >
                  Finish
                </Button>
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
        {assn.type === "karel" ||
        assn.type === "console" ||
        assn.type === "graphics" ? (
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
        ) : assn.type === "essay" ? (
          <div className="w-1/2 elative bg-[#fffaed] h-[600px] rounded-lg drop-shadow-md px-8 overflow-scroll">
            <h2 className="text-[#725424] font-serif font-bold">
              For reference, here is your student's essay.{" "}
            </h2>
            <div className="text-[#725424] font-serif pt-8 r">
              {data.essay.split("\n").map((para) => {
                return <p className="mb-4">{para}</p>;
              })}
            </div>
          </div>
        ) : null}
      </div>
      {/* <div className="flex bg-white rounded-lg drop-shadow-md p-8 w-full flex-row gap-4">
        <form
          className="w-full flex flex-row gap-4 items-start"
          onSubmit={(e) => {
            e.preventDefault();
            onSend();
          }}
        >
          <ContentEditable
            disabled={AIState !== "editing" || speaking} // use true to disable editing
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
        </form>
      </div> */}
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
