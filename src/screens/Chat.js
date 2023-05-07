import react, { useEffect, useState, useRef } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../utils/firebase";
import { useParams } from "react-router";
import { useChatCompletion, GPT4 } from "openai-streaming-hooks";
import ReactLoading from "react-loading";
import { useWhisper } from "@chengsokdara/use-whisper";
import { RiVoiceprintFill } from "react-icons/ri";
import { CountdownCircleTimer } from "react-countdown-circle-timer";

const Chat = () => {
  const { id } = useParams();
  const { transcript, startRecording, stopRecording } = useWhisper({
    apiKey: "",
    streaming: true,
    timeSlice: 1_000, // 1 second
    whisperConfig: {
      language: "en",
    },
  });

  const [promptText, setPromptText] = useState("");
  const [isListening, setIsListening] = useState(false);
  const textInput = useRef();

  const [data, setData] = useState();
  useEffect(() => {
    const fetchData = async () => {
      const docRef = doc(db, "essays", id);
      const docSnap = await getDoc(docRef);
      setData(docSnap.data());
    };

    fetchData();
  }, []);

  const [messages, submitQuery] = useChatCompletion({
    model: GPT4.BASE,
    apiKey: "",
    temperature: 0.9,
  });
  const isLoading = messages[messages.length - 1]?.meta?.loading;
  useEffect(() => {
    if (textInput.current) {
      if (!isLoading) {
        setIsListening(true);
        startRecording();
      }
    }
  }, [isLoading]);

  useEffect(() => {
    const keyDownHandler = (event) => {
      if (event.key === "Enter") {
        setIsListening(false);
        stopRecording();
      }
    };

    document.addEventListener("keydown", keyDownHandler);

    return () => {
      document.removeEventListener("keydown", keyDownHandler);
    };
  }, []);

  const onSend = () => {
    submitQuery([{ content: promptText, role: "user" }]);
    setPromptText("");
  };

  useEffect(() => {
    submitQuery([{ content: "Hi!", role: "user" }]);
  }, []);

  useEffect(() => {
    setPromptText(transcript.text);
  }, [transcript]);

  return data ? (
    <>
      <div className="flex w-1/2 mx-96 my-96 justify-left flex-wrap flex-col">
        <div>
          {messages.length < 1 ? (
            <div className="empty">No messages</div>
          ) : (
            messages.map((msg, i) => {
              return i > messages.length - 2 ? (
                msg.role === "assistant" ? (
                  <div className="font-serif text-3xl text-left">
                    {msg.content}
                  </div>
                ) : (
                  <div className="font-serif text-2xl text-grey text-right mb-16 mt-4">
                    {msg.content}
                  </div>
                )
              ) : null;
            })
          )}
        </div>
        {isListening ? (
          <>
            <span className="text-purple-600 mt-2 opacity-70 flex flex-row gap-2 items-center">
              <div class="dot dot--basic"></div>{" "}
              <div>
                Liz is now <b>listening...</b> start speaking! Press 'enter' to
                finish.
              </div>
            </span>
          </>
        ) : null}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            onSend();
          }}
        >
          <div className="flex flex-row space-between">
            <input
              type="text"
              value={promptText}
              class="border-0 outline-none font-serif text-2xl text-gray w-full bg-white mt-16 text-right"
              ref={textInput}
              onChange={(e) => {
                setPromptText(e.target.value);
              }}
              disabled={isListening}
            />
          </div>
        </form>
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
