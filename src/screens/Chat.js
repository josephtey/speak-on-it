import react, { useEffect, useState, useRef } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../utils/firebase";
import { useParams } from "react-router";
import { useChatCompletion, GPT4 } from "openai-streaming-hooks";
import ReactLoading from "react-loading";

const Chat = () => {
  const { id } = useParams();

  const [promptText, setPromptText] = useState("");
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
    apiKey: "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",
    temperature: 0.9,
  });
  const isLoading = messages[messages.length - 1]?.meta?.loading;
  useEffect(() => {
    if (isLoading && textInput.current) {
      textInput.current.focus();
    }
  }, [isLoading]);

  const onSend = () => {
    submitQuery([{ content: promptText, role: "user" }]);
    setPromptText("");
  };

  useEffect(() => {
    submitQuery([{ content: "Hi!", role: "user" }]);
  }, []);

  return data ? (
    <div className="flex w-1/2 mx-96 my-48 justify-left h-screen flex-wrap flex-col">
      <div>
        {messages.length < 1 ? (
          <div className="empty">No messages</div>
        ) : (
          messages.map((msg, i) => {
            return i > 0 ? (
              msg.role === "assistant" ? (
                <div className="font-serif text-3xl text-left">
                  {msg.content}
                </div>
              ) : (
                <pre className="font-serif text-xl text-grey text-left mb-16">
                  {msg.content}
                </pre>
              )
            ) : null;
          })
        )}
        <div></div>
      </div>

      {!isLoading ? (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            onSend();
          }}
        >
          <input
            type="text"
            value={promptText}
            class="border-0 outline-none font-serif text-xl text-gray w-full"
            ref={textInput}
            onChange={(e) => {
              setPromptText(e.target.value);
            }}
          />
        </form>
      ) : null}
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
